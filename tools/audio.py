"""Audio pipeline for the FixtureLabs videos.

    python tools/audio.py all              # lines -> music -> sfx -> manifest (verifies everything)
    python tools/audio.py lines [--force]  # TTS every line in src/script.ts, write levels.json
    python tools/audio.py music            # compose public/audio/music.wav
    python tools/audio.py sfx              # synthesise public/audio/sfx/<kind>.wav
    python tools/audio.py manifest         # verify + write public/audio/manifest.json
    EPISODE=zero-cpu SCRIPT_TS=src/scripts/zero-cpu.ts python tools/audio.py lines   # another episode's voices

Needs numpy, curl and ffmpeg ($FFMPEG, else imageio_ffmpeg, else PATH). The OpenAI key comes from
$OPENAI_API_KEY or ../../.env and is handed to curl on stdin only - never on argv, never in a file.
Raw TTS downloads are cached in $TTS_RAW_DIR (default: system temp) so re-trimming is free.
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "public" / "audio"
# An episode (--episode name) keeps its lines, levels and manifest in audio/<name>/ and shares music + sfx.
EPISODE = os.environ.get("EPISODE", "")
SCRIPT_TS = Path(os.environ.get("SCRIPT_TS") or ROOT / "src" / "script.ts")
EP_DIR = AUDIO / EPISODE if EPISODE else AUDIO
EP_REL = f"audio/{EPISODE}/" if EPISODE else "audio/"
LINES_DIR, SFX_DIR = EP_DIR / "lines", AUDIO / "sfx"
ENV_FILE = ROOT.parents[1] / ".env"
RAW_DIR = Path(os.environ.get("TTS_RAW_DIR") or Path(tempfile.gettempdir()) / "fixturelabs-tts")

SR = 48000
FPS = 30
BPM = 76
BEAT = 60 / BPM
BAR = 4 * BEAT
MUSIC_SECONDS = 132.0
N_BARS = int(round(MUSIC_SECONDS / BAR))  # 42 (the last one is partial)
TEMPO = float(os.environ.get("TEMPO", "1.08"))  # voice lines are time-stretched by this factor (pitch preserved) before trimming

VOICES = {"person": "ash", "bot": "sage"}
INSTRUCTIONS = {
    "person": "A final-year mechanical engineering student at their desk late at night. Dry, a little tired "
    "and skeptical, natural conversational pacing, small pauses at the ellipses. Not theatrical.",
    "bot": "A sharp, encouraging senior engineer who mentors students. Direct and warm, calm confidence, "
    "a little dry humour. Short lines land cleanly. Never a professor, never a recruiter.",
}
TTS_MODELS = [("gpt-4o-mini-tts", True), ("tts-1-hd", False)]  # (model, accepts `instructions`)

# Dm9 -> Bbmaj7 -> Fmaj7 -> Cadd9, two bars each. First note of each voicing is the bass root.
CHORDS = [
    [38, 50, 53, 57, 60, 64],  # D2  | D3 F3 A3 C4 E4
    [34, 46, 50, 53, 57],  # Bb1 | Bb2 D3 F3 A3
    [41, 53, 57, 60, 64],  # F2  | F3 A3 C4 E4
    [36, 52, 55, 60, 62],  # C2  | E3 G3 C4 D4
]
PENTA = [62, 65, 67, 69, 72, 74, 77, 79, 81]  # D minor pentatonic, D4..A5


# ---------------------------------------------------------------- wav io + dsp helpers


def write_wav(path, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    pcm = np.round(np.clip(x, -1, 1) * 32767).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(x.shape[1])
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def read_wav(path):
    with wave.open(str(path), "rb") as w:
        assert w.getsampwidth() == 2 and w.getframerate() == SR, f"{path}: expected 16-bit {SR} Hz"
        x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float64) / 32768
        return x.reshape(-1, w.getnchannels()) if w.getnchannels() > 1 else x


def duration(path):
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / w.getframerate()


def db(x):
    return 10 ** (x / 20)


def to_db(x):
    return 20 * np.log10(max(x, 1e-12))


def peak(x):
    return float(np.max(np.abs(x)))


def rms(x):
    return float(np.sqrt(np.mean(np.square(x))))


def set_peak(x, level_db):
    return x * (db(level_db) / max(peak(x), 1e-12))


def set_rms(x, level_db):
    return x * (db(level_db) / max(rms(x), 1e-12))


def t_axis(n):
    return np.arange(n) / SR


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def pan_gains(p):
    """p in [-1, 1] -> constant-power (left, right) gains."""
    a = (np.asarray(p) + 1) * np.pi / 4
    return np.cos(a), np.sin(a)


def ramp(n, up=True):
    r = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n))
    return r if up else r[::-1]


def fade(x, head=0.0, tail=0.0):
    """Raised-cosine fades in place (seconds); works on (n,) and (n, ch)."""
    col = (lambda r: r[:, None]) if x.ndim == 2 else (lambda r: r)
    if head:
        k = int(head * SR)
        x[:k] *= col(ramp(k))
    if tail:
        k = int(tail * SR)
        x[-k:] *= col(ramp(k, up=False))
    return x


def _filt(x, response):
    """Apply an analog-style frequency response in the FFT domain, along axis 0."""
    X = np.fft.rfft(x, axis=0)
    H = response(np.fft.rfftfreq(len(x), 1 / SR))
    return np.fft.irfft(X * (H[:, None] if x.ndim == 2 else H), n=len(x), axis=0)


def lpf(x, fc, order=1):
    return _filt(x, lambda f: (1 / (1 + 1j * f / fc)) ** order)


def hpf(x, fc, order=1):
    return _filt(x, lambda f: ((1j * f / fc) / (1 + 1j * f / fc)) ** order)


def svf_bandpass(x, fc, q=0.5):
    """Chamberlin state-variable band-pass with a per-sample centre frequency (q = 1/Q)."""
    f = (2 * np.sin(np.pi * np.minimum(np.broadcast_to(fc, x.shape), SR / 6) / SR)).tolist()
    xs, out, low, band = x.tolist(), np.empty_like(x), 0.0, 0.0
    for n in range(len(xs)):
        low += f[n] * band
        high = xs[n] - low - q * band
        band += f[n] * high
        out[n] = band
    return out


def saw(ph):
    return 2 * (ph % 1.0) - 1


def tri(ph):
    return 2 * np.abs(saw(ph)) - 1


def place(bus, x, at, gain=1.0, pan=0.0):
    """Add mono one-shot `x` into stereo `bus` at `at` seconds."""
    i = int(round(at * SR))
    if i < 0 or i >= len(bus):
        return
    m = min(len(x), len(bus) - i)
    gl, gr = pan_gains(pan)
    bus[i : i + m, 0] += x[:m] * gain * gl
    bus[i : i + m, 1] += x[:m] * gain * gr


# ---------------------------------------------------------------- script.ts / types.ts

LINE_RE = re.compile(r'id:\s*"([^"]+)"\s*,\s*speaker:\s*"(person|bot)"\s*,\s*text:\s*"([^"]*)"')


def parse_lines():
    src = SCRIPT_TS.read_text()
    lines = [{"id": i, "speaker": s, "text": t} for i, s, t in LINE_RE.findall(src)]
    assert len(lines) == len(re.findall(r'speaker:\s*"', src)), "script.ts has a line LINE_RE did not parse"
    assert len({ln["id"] for ln in lines}) == len(lines), "duplicate line ids in script.ts"
    return lines


def parse_sfx_kinds():
    src = (ROOT / "src" / "types.ts").read_text()
    return re.findall(r'"(\w+)"', re.search(r"type SfxKind\s*=\s*([^;]+);", src).group(1))


# ---------------------------------------------------------------- lines (TTS)


def api_key():
    key = os.environ.get("OPENAI_API_KEY")
    if not key and ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip().removeprefix("export ").strip()
            if line.startswith("OPENAI_API_KEY="):
                key = line.split("=", 1)[1].strip().strip("'\"")
    if not key:
        sys.exit(f"OPENAI_API_KEY is not set and not found in {ENV_FILE}")
    return key


def ffmpeg_bin():
    if os.environ.get("FFMPEG"):
        return os.environ["FFMPEG"]
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


SECRET_RE = re.compile(r"sk-[A-Za-z0-9_\-]{8,}")


def tts_request(body, key, out):
    cmd = ["curl", "-sS", "--max-time", "180", "-H", "@-", "https://api.openai.com/v1/audio/speech",
           "--data-binary", json.dumps(body), "-o", str(out), "-w", "%{http_code}"]
    headers = f"Authorization: Bearer {key}\nContent-Type: application/json\n".encode()
    r = subprocess.run(cmd, input=headers, capture_output=True)  # the key travels on stdin only
    code = int(r.stdout.decode().strip() or 0)
    if code == 200:
        return code, ""
    detail = out.read_text(errors="replace")[:200] if out.exists() else r.stderr.decode()[:200]
    return code, SECRET_RE.sub("sk-***", detail)


def synthesize(line, key, raw):
    """Download TTS for one line into `raw`; returns the model that produced it."""
    for model, accepts_instructions in TTS_MODELS:
        body = {"model": model, "voice": VOICES[line["speaker"]], "input": line["text"], "response_format": "wav"}
        if accepts_instructions:
            body["instructions"] = INSTRUCTIONS[line["speaker"]]
        for attempt in range(3):
            code, detail = tts_request(body, key, raw)
            if code == 200:
                return model
            print(f"  {line['id']}: {model} -> HTTP {code} {detail}")
            if code not in (429, 500, 502, 503, 504):
                break  # hard error: fall back to the next model
            time.sleep(3 * (attempt + 1))
    sys.exit(f"TTS failed for {line['id']}")


def trim(x, thr_db=-45, head=0.08, tail=0.18):
    idx = np.flatnonzero(np.abs(x) > db(thr_db))
    if not len(idx):
        raise ValueError("TTS returned silence")
    seg = fade(x[idx[0] : idx[-1] + 1].copy(), 0.003, 0.003)
    return np.concatenate([np.zeros(int(head * SR)), seg, np.zeros(int(tail * SR))])


def levels(x):
    """Per-video-frame RMS, 3-frame smoothed, loudest frame = 1."""
    hop = SR // FPS
    frames = -(-len(x) // hop)
    padded = np.zeros(frames * hop)
    padded[: len(x)] = x
    r = np.sqrt(np.mean(padded.reshape(frames, hop) ** 2, axis=1))
    r = np.convolve(r, np.ones(3) / 3, mode="same")
    return [round(float(v), 3) for v in r / max(r.max(), 1e-12)]


def cmd_lines(force=False):
    lines, key, ff = parse_lines(), api_key(), ffmpeg_bin()
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    LINES_DIR.mkdir(parents=True, exist_ok=True)
    used = {}
    for ln in lines:
        out = LINES_DIR / f"{ln['id']}.wav"
        voice = VOICES[ln["speaker"]]
        stamp = hashlib.sha1(f"{voice}|{ln['text']}".encode()).hexdigest()[:8]
        raw, dec = RAW_DIR / f"{ln['id']}-{stamp}.raw.wav", RAW_DIR / f"{ln['id']}-{stamp}.48k.wav"
        if out.exists() and dec.exists() and not force:  # same id AND same text already rendered
            continue
        used[ln["id"]] = "cached" if raw.exists() else synthesize(ln, key, raw)
        subprocess.run([ff, "-y", "-v", "error", "-i", str(raw), "-af", f"atempo={TEMPO}", "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", str(dec)], check=True)
        x = set_peak(trim(read_wav(dec)), -1.0)
        write_wav(out, x)
        print(f"  {ln['id']:<4} {ln['speaker']:<7} {voice:<6} {used[ln['id']]:<16} {len(x) / SR:6.2f}s  {ln['text'][:60]}")
    lv = {ln["id"]: levels(read_wav(LINES_DIR / f"{ln['id']}.wav")) for ln in lines}
    (EP_DIR / "levels.json").write_text(json.dumps(lv) + "\n")
    print(f"lines: {len(lines)} files, {len(used)} (re)generated via {sorted(set(used.values())) or 'nothing'}; levels.json written")


# ---------------------------------------------------------------- music


def render_pad(n, rng):
    t = t_axis(n)
    wobble = 1 + 0.0022 * np.sin(2 * np.pi * 0.41 * t) + 0.0012 * np.sin(2 * np.pi * 1.9 * t + 1.0)  # tape
    L, R = np.zeros(n), np.zeros(n)
    seg, att, rel = 2 * BAR, 1.1, 1.7
    for k in range(int(np.ceil(MUSIC_SECONDS / seg))):
        a, b = int(k * seg * SR), min(int((k * seg + seg + rel) * SR), n)
        tt = t_axis(b - a)
        env = (0.5 - 0.5 * np.cos(np.pi * np.clip(tt / att, 0, 1))) * (0.5 + 0.5 * np.cos(np.pi * np.clip((tt - seg) / rel, 0, 1)))
        for i, note in enumerate(CHORDS[k % 4]):
            f0 = midi_hz(note) * wobble[a:b]
            if i == 0:  # bass root: one clean triangle, centre
                sig = tri(np.cumsum(f0) / SR + rng.random()) * env * 1.6
                L[a:b] += sig
                R[a:b] += sig
                continue
            for det, pan, wave_fn in ((-0.0035, -0.75, saw), (0.0, 0.0, tri), (0.0035, 0.75, saw)):
                sig = wave_fn(np.cumsum(f0 * (1 + det)) / SR + rng.random()) * env
                gl, gr = pan_gains(pan)
                L[a:b] += sig * gl
                R[a:b] += sig * gr
    # One-pole low-pass whose cutoff breathes with a slow LFO (crossfade of two cutoffs), plus a 2-pole clean-up.
    lfo = 0.5 - 0.5 * np.cos(2 * np.pi * 0.06 * t)
    f = np.fft.rfftfreq(n, 1 / SR)
    clean = 1 / (1 + 1j * f / 3200) ** 2
    out = np.empty((n, 2))
    for c, ch in enumerate((L, R)):
        X = np.fft.rfft(ch) * clean
        lo, hi = np.fft.irfft(X / (1 + 1j * f / 380), n=n), np.fft.irfft(X / (1 + 1j * f / 1400), n=n)
        out[:, c] = lo * (1 - lfo) + hi * lfo
    return out


def ep_note(f, vel):
    t = t_axis(int(1.7 * SR))
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.55)
         + 0.35 * np.sin(2 * np.pi * 2 * f * t + 0.3) * np.exp(-t / 0.22)
         + 0.10 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.045))  # tine
    x *= (1 - np.exp(-t / 0.0025)) * vel
    return fade(lpf(x, 2400, 2), tail=0.05)


def render_melody(n, rng):
    out = np.zeros((n, 2))
    idx = PENTA.index(69)
    for bar in range(4, N_BARS, 2):  # bars 5, 7, 9, ... (1-indexed): every other bar
        chord_pcs = {m % 12 for m in CHORDS[(bar // 2) % 4]}
        for h in sorted(rng.choice(8, size=rng.choice([2, 3, 3, 4]), replace=False)):
            idx = int(np.clip(idx + rng.choice([-2, -1, -1, 0, 1, 1, 2]), 0, len(PENTA) - 1))
            if PENTA[idx] % 12 not in chord_pcs and rng.random() < 0.6:  # lean on chord tones
                idx = min((j for j in range(len(PENTA)) if PENTA[j] % 12 in chord_pcs), key=lambda j: abs(j - idx))
            at = bar * BAR + (h // 2) * BEAT + (0.58 * BEAT if h % 2 else 0) + rng.normal(0, 0.006)
            place(out, ep_note(midi_hz(PENTA[idx]), rng.uniform(0.5, 0.85)), at, pan=-0.25)
    return out


def drum_kit(rng):
    t = t_axis(int(0.5 * SR))
    f = 46 + 95 * np.exp(-t / 0.03)
    kick = np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 0.17) * (1 - np.exp(-t / 0.0015))
    kick = lpf(kick, 2500, 2)
    t = t_axis(int(0.3 * SR))
    snare = (0.45 * np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05)
             + 0.25 * np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.02)  # rim ping
             + 0.6 * lpf(hpf(rng.standard_normal(len(t)), 1300, 2), 6500) * np.exp(-t / 0.055))
    t = t_axis(int(0.1 * SR))
    hat = hpf(rng.standard_normal(len(t)), 7500, 2) * np.exp(-t / 0.018)
    return [fade(set_peak(x, 0), tail=0.01) for x in (kick, snare, hat)]


def render_drums(n, rng):
    kick, snare, hat = drum_kit(rng)
    K, S, H = (np.zeros((n, 2)) for _ in range(3))
    for bar in range(N_BARS):
        if bar + 1 < 3 or 17 <= bar + 1 <= 24:  # pad-only intro; eight-bar "privacy" break
            continue
        t0 = bar * BAR
        place(K, kick, t0, 1.0)
        place(K, kick, t0 + 2 * BEAT, 0.85)
        place(S, snare, t0 + BEAT, rng.uniform(0.85, 1.0))
        place(S, snare, t0 + 3 * BEAT, rng.uniform(0.9, 1.05))
        for k in range(4):  # swung eighths
            place(H, hat, t0 + k * BEAT + rng.normal(0, 0.004), rng.uniform(0.8, 1.0), pan=0.25)
            place(H, hat, t0 + (k + 0.58) * BEAT + rng.normal(0, 0.004), rng.uniform(0.4, 0.55), pan=0.25)
    return set_peak(K, -13) + set_peak(S, -22) + set_peak(H, -27)


def render_vinyl(n, rng):
    k = rng.poisson(13 * n / SR)
    idx = rng.integers(0, n, k)
    amp = rng.uniform(0.1, 1, k) ** 2 * rng.choice([-1.0, 1.0], k)
    gl, gr = pan_gains(rng.uniform(-1, 1, k))
    train = np.zeros((n, 2))
    np.add.at(train, (idx, 0), amp * gl)
    np.add.at(train, (idx, 1), amp * gr)
    tk = t_axis(int(0.0025 * SR))
    kern = np.sin(2 * np.pi * 3000 * tk) * np.exp(-tk / 0.0004)
    crackle = np.stack([np.convolve(train[:, c], kern)[:n] for c in range(2)], axis=1)
    hiss = lpf(rng.standard_normal((n, 2)), 1800)
    return set_peak(crackle, -34) + set_rms(hiss, -62)


def cmd_music():
    rng = np.random.default_rng(7)
    n = int(MUSIC_SECONDS * SR)
    mix = set_rms(render_pad(n, rng), -21) + set_peak(render_melody(n, rng), -16) + render_drums(n, rng) + render_vinyl(n, rng)
    mix = set_rms(fade(mix, head=2.0, tail=4.0), -22)
    assert peak(mix) <= db(-6), f"music peaks at {to_db(peak(mix)):.1f} dBFS"
    write_wav(AUDIO / "music.wav", mix)
    print(f"music: {n / SR:.1f}s  rms {to_db(rms(mix)):.1f} dBFS  peak {to_db(peak(mix)):.1f} dBFS")


# ---------------------------------------------------------------- sfx


def sfx_pop(rng):
    t = t_axis(int(0.3 * SR))
    f = 300 + 600 * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07) * (1 - np.exp(-t / 0.0015))
    x += 0.5 * rng.standard_normal(len(t)) * np.exp(-t / 0.0012)  # tiny click
    return np.repeat(fade(x, tail=0.02)[:, None], 2, axis=1)


def sfx_whoosh(rng):
    n = int(0.55 * SR)
    u = np.linspace(0, 1, n)
    up = 0.5 - 0.5 * np.cos(np.pi * np.clip(u / 0.45, 0, 1))
    down = 0.5 - 0.5 * np.cos(np.pi * np.clip((u - 0.45) / 0.55, 0, 1))
    fc = np.exp(np.log(400) + np.log(3000 / 400) * up - np.log(3000 / 800) * down)  # 400 -> 3000 -> 800 Hz
    env = (0.5 - 0.5 * np.cos(np.pi * np.clip(u / 0.4, 0, 1))) * np.exp(-np.clip(u - 0.4, 0, None) / 0.22)
    x = svf_bandpass(rng.standard_normal(n), fc, q=0.6) * env
    gl, gr = pan_gains(2 * u - 1)  # left -> right
    return fade(np.stack([x * gl, x * gr], axis=1), tail=0.03)


def sfx_click(rng):
    t = t_axis(int(0.04 * SR))
    burst = svf_bandpass(rng.standard_normal(len(t)), 3200, q=0.8) * np.exp(-t / 0.005)
    blip = np.sin(2 * np.pi * 2000 * t) * np.exp(-t / 0.010) * (1 - np.exp(-t / 0.0005))
    x = 0.6 * burst / peak(burst) + 0.7 * blip
    return np.repeat(fade(x, tail=0.008)[:, None], 2, axis=1)


def sfx_chime(rng):
    n = int(0.7 * SR)
    t, out = t_axis(n), np.zeros((n, 2))
    for f, t0, pan in ((880.0, 0.0, -0.2), (1318.51, 0.17, 0.2)):  # A5 then E6
        tt = np.clip(t - t0, 0, None)
        x = (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.26)
             + 0.2 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.12)
             + 0.08 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt / 0.07))
        x *= 1 - np.exp(-tt / 0.004)
        gl, gr = pan_gains(pan)
        out[:, 0] += x * gl
        out[:, 1] += x * gr
    return fade(out, tail=0.08)


def sfx_sting(rng):
    n = int(2.0 * SR)
    t, out = t_axis(n), np.zeros((n, 2))
    env = np.where(t < 0.6, 0.5 - 0.5 * np.cos(np.pi * t / 0.6), np.exp(-(t - 0.6) / 0.55))  # peaks at 0.6 s
    for m in (53, 57, 60, 65, 69, 72):  # F3 A3 C4 F4 A4 C5
        for det, pan, wave_fn in ((-0.004, -0.7, saw), (0.0, 0.0, tri), (0.004, 0.7, saw)):
            sig = wave_fn(np.cumsum(np.full(n, midi_hz(m) * (1 + det))) / SR + rng.random()) * env
            gl, gr = pan_gains(pan)
            out[:, 0] += sig * gl
            out[:, 1] += sig * gr
    out = set_peak(lpf(out, 1500, 2), 0)
    shimmer = (0.5 - 0.5 * np.cos(np.pi * np.clip(t / 0.9, 0, 1))) * np.exp(-np.clip(t - 0.9, 0, None) / 0.45)
    for m in (77, 81, 84, 89):  # F5 A5 C6 F6, slow bloom, light vibrato
        f = midi_hz(m) * (1 + 0.003 * np.sin(2 * np.pi * 5.5 * t + m))
        sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * shimmer
        gl, gr = pan_gains(0.6 * np.sin(m))
        out[:, 0] += 0.1 * sig * gl
        out[:, 1] += 0.1 * sig * gr
    return fade(out, tail=0.3)


SFX = {"pop": sfx_pop, "whoosh": sfx_whoosh, "click": sfx_click, "chime": sfx_chime, "sting": sfx_sting}


def cmd_sfx():
    kinds = parse_sfx_kinds()
    assert set(kinds) == set(SFX), f"types.ts SfxKind {kinds} != synthesised {sorted(SFX)}"
    rng = np.random.default_rng(11)
    for kind in kinds:
        x = set_peak(SFX[kind](rng), -3.0)
        write_wav(SFX_DIR / f"{kind}.wav", x)
        print(f"  sfx/{kind + '.wav':<11} {len(x) / SR:5.2f}s  peak {to_db(peak(x)):.1f} dBFS")


# ---------------------------------------------------------------- manifest + verification


def cmd_manifest():
    lines, kinds = parse_lines(), parse_sfx_kinds()
    lv = json.loads((EP_DIR / "levels.json").read_text())
    man, total = {"lines": {}, "music": None, "sfx": {}}, 0.0
    print(f"{'id':<4} {'speaker':<7} {'dur':>6}  text")
    for ln in lines:
        p = LINES_DIR / f"{ln['id']}.wav"
        assert p.exists(), f"missing {p}"
        x = read_wav(p)
        d = len(x) / SR
        assert d >= 0.4, f"{ln['id']} is too short ({d:.2f}s)"
        assert peak(x) > db(-40), f"{ln['id']} is silent"
        assert len(lv.get(ln["id"], [])) == -(-len(x) // (SR // FPS)), f"levels.json mismatch for {ln['id']}"
        man["lines"][ln["id"]] = {"file": f"{EP_REL}lines/{ln['id']}.wav", "duration": round(d, 3)}
        total += d
        print(f"{ln['id']:<4} {ln['speaker']:<7} {d:6.2f}  {ln['text'][:72]}")
    md = duration(AUDIO / "music.wav")
    assert abs(md - MUSIC_SECONDS) <= 0.5, f"music is {md:.3f}s"
    man["music"] = {"file": "audio/music.wav", "duration": round(md, 3)}
    for kind in kinds:
        p = SFX_DIR / f"{kind}.wav"
        assert p.exists(), f"missing {p}"
        man["sfx"][kind] = {"file": f"audio/sfx/{kind}.wav", "duration": round(duration(p), 3)}
    out = EP_DIR / "manifest.json"
    out.write_text(json.dumps(man, indent=2) + "\n")
    json.loads(out.read_text())
    print(f"\ntotal speech {total:.2f}s over {len(lines)} lines; music {md:.3f}s; sfx {', '.join(kinds)}; manifest ok")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["lines", "music", "sfx", "manifest", "all"])
    ap.add_argument("--force", action="store_true", help="lines: regenerate even if the wav exists")
    a = ap.parse_args()
    steps = {"lines": lambda: cmd_lines(a.force), "music": cmd_music, "sfx": cmd_sfx, "manifest": cmd_manifest}
    for name in (["lines", "music", "sfx", "manifest"] if a.cmd == "all" else [a.cmd]):
        steps[name]()


if __name__ == "__main__":
    main()
