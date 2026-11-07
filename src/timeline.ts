import type {
  AudioManifest,
  Mood,
  CameraPreset,
  Emotion,
  InsertKind,
  Segment,
  SequenceItem,
  Speaker,
} from "./types";
import { isInsert, isLine } from "./types";

export const FPS = 30;

/** Lays the sequence out on the frame grid. Lines take their voice file's length plus the gap. */
export function buildTimeline(seq: SequenceItem[], manifest: AudioManifest, fps = FPS): Segment[] {
  const segs: Segment[] = [];
  let cursor = 0;
  for (const item of seq) {
    let seconds: number;
    if (isLine(item)) {
      const audio = manifest.lines[item.id];
      if (!audio) throw new Error(`No voice file for line "${item.id}"`);
      seconds = audio.duration + (item.gap ?? 0.25);
    } else {
      seconds = item.dur;
    }
    const durationInFrames = Math.max(1, Math.round(seconds * fps));
    segs.push({ item, from: cursor, durationInFrames });
    cursor += durationInFrames;
  }
  return segs;
}

export const totalFrames = (segs: Segment[]): number => {
  const last = segs[segs.length - 1];
  return last.from + last.durationInFrames;
};

export const segmentAt = (segs: Segment[], frame: number): Segment =>
  segs.find((s) => frame >= s.from && frame < s.from + s.durationInFrames) ?? segs[segs.length - 1];

/** An insert plus the `onInsert` lines that play over it, as one continuous span. */
export interface InsertSpan {
  kind: InsertKind;
  from: number;
  durationInFrames: number;
  title?: string;
  sub?: string;
}

export function insertSpans(segs: Segment[]): InsertSpan[] {
  const spans: InsertSpan[] = [];
  for (const seg of segs) {
    if (isInsert(seg.item)) {
      spans.push({ kind: seg.item.insert, from: seg.from, durationInFrames: seg.durationInFrames, title: seg.item.title, sub: seg.item.sub });
    } else if (isLine(seg.item) && seg.item.onInsert && spans.length) {
      spans[spans.length - 1].durationInFrames += seg.durationInFrames;
    }
  }
  return spans;
}

export interface FrameState {
  camera: CameraPreset;
  progress: number;
  talking: Speaker | null;
  level: number;
  /** Mouth flap 0..1 for the speaker: opens on syllables, closes in the dips, never flickers. */
  mouth: number;
  /** A short impulse (1 → 0 over ~8 frames) at each word onset; drives head accents and FixtureAI's ring pulses. */
  accent: number;
  /** Seconds since the current shot began; the scene uses it to settle into a shot instead of popping. */
  shotTime: number;
  /** FixtureAI's mood: its own line's `mood`, held through the following person line as a reaction. */
  mood: Mood;
  emotion: Emotion;
  botUp: number;
  insert: { kind: InsertKind; frame: number; durationInFrames: number; title?: string; sub?: string } | null;
  caption: { text: string; speaker: Speaker; frame: number; durationInFrames: number } | null;
}

export type Levels = Record<string, number[]>;

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** FixtureAI is hidden until its first line, then rises over 0.7 s (the scene adds its own overshoot). */
function botUpAt(segs: Segment[], frame: number, fps: number): number {
  const first = segs.find((s) => isLine(s.item) && s.item.speaker === "bot");
  if (!first) return 1;
  const t = (frame - first.from - 0.1 * fps) / (0.7 * fps);
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return easeOutCubic(t);
}

/** The person's last stated emotion carries into the shots where they do not speak. */
function emotionAt(segs: Segment[], frame: number): Emotion {
  let emotion: Emotion = "neutral";
  for (const seg of segs) {
    if (seg.from > frame) break;
    const e = isLine(seg.item) ? (seg.item.speaker === "person" ? seg.item.emotion : undefined) : "beat" in seg.item ? seg.item.emotion : undefined;
    if (e) emotion = e;
  }
  return emotion;
}

/**
 * Syllabic mouth from the RMS curve: open while the level sits above 55% of the local
 * peak (±6 frames), with a 2-frame minimum hold in either state so it never chatters.
 * Returns 0..1 (how far open), not a boolean, so the jaw can ease.
 */
export function mouthAt(lineLevels: number[], i: number): number {
  if (i < 0 || i >= lineLevels.length) return 0;
  const isOpen = (k: number): boolean => {
    if (k < 0 || k >= lineLevels.length) return false;
    let peak = 0;
    for (let j = Math.max(0, k - 6); j <= Math.min(lineLevels.length - 1, k + 6); j++) peak = Math.max(peak, lineLevels[j]);
    return peak > 0.12 && lineLevels[k] > 0.55 * peak;
  };
  // Minimum hold: a state that lasts a single frame is overruled by its neighbours.
  let open = isOpen(i);
  if (isOpen(i - 1) !== open && isOpen(i + 1) !== open) open = !open;
  if (!open) return 0;
  // Ease the jaw with the level inside the open run, floor 0.45 so short syllables still read.
  return 0.45 + 0.55 * Math.min(1, lineLevels[i] / 0.7);
}

/** 1 at a word onset (mouth opens after ≥2 closed frames), decaying to 0 over 8 frames. */
export function accentAt(lineLevels: number[], i: number): number {
  for (let k = i; k >= Math.max(0, i - 8); k--) {
    if (mouthAt(lineLevels, k) > 0 && mouthAt(lineLevels, k - 1) === 0 && mouthAt(lineLevels, k - 2) === 0) {
      return 1 - (i - k) / 8;
    }
  }
  return 0;
}

/** FixtureAI's last stated mood carries forward until its next line. */
function moodAt(segs: Segment[], frame: number): Mood {
  let mood: Mood = "neutral";
  for (const seg of segs) {
    if (seg.from > frame) break;
    if (isLine(seg.item) && seg.item.speaker === "bot") mood = seg.item.mood ?? "neutral";
  }
  return mood;
}

export function resolveFrame(segs: Segment[], frame: number, levels: Levels, fps: number): FrameState {
  const seg = segmentAt(segs, frame);
  const mood = moodAt(segs, frame);
  const local = frame - seg.from;
  const progress = Math.min(1, local / Math.max(1, seg.durationInFrames - 1));
  const shotTime = local / fps;
  const botUp = botUpAt(segs, frame, fps);
  const emotion = emotionAt(segs, frame);

  const span = insertSpans(segs).find((s) => frame >= s.from && frame < s.from + s.durationInFrames) ?? null;
  const insert = span ? { kind: span.kind, frame: frame - span.from, durationInFrames: span.durationInFrames, title: span.title, sub: span.sub } : null;

  if (isLine(seg.item)) {
    const line = seg.item;
    const lineLevels = levels[line.id] ?? [];
    const level = local < lineLevels.length ? lineLevels[local] : 0;
    const speaking = local < lineLevels.length;
    return {
      camera: line.camera,
      progress,
      shotTime,
      talking: speaking ? line.speaker : null,
      level: speaking ? level : 0,
      mouth: speaking ? mouthAt(lineLevels, local) : 0,
      accent: speaking ? accentAt(lineLevels, local) : 0,
      mood,
      emotion,
      botUp,
      insert,
      caption: line.onInsert
        ? null
        : { text: line.caption ?? line.text, speaker: line.speaker, frame: local, durationInFrames: seg.durationInFrames },
    };
  }

  if (isInsert(seg.item)) {
    return { camera: "wide", progress, shotTime, talking: null, level: 0, mouth: 0, accent: 0, mood, emotion, botUp, insert, caption: null };
  }

  // Beat
  return { camera: seg.item.camera, progress, shotTime, talking: null, level: 0, mouth: 0, accent: 0, mood, emotion, botUp, insert: null, caption: null };
}

/** Music volume per frame: ducks under voices, sits a little lower under inserts, swells on the end card, fades out. */
export function musicEnvelope(segs: Segment[], fps: number): number[] {
  const total = totalFrames(segs);
  const target = new Array<number>(total).fill(0.42);
  for (const seg of segs) {
    const v = isLine(seg.item) ? 0.16 : isInsert(seg.item) ? (seg.item.insert === "endcard" ? 0.5 : seg.item.insert === "title" ? 0.42 : 0.3) : 0.42;
    for (let f = seg.from; f < seg.from + seg.durationInFrames; f++) target[f] = v;
  }
  // Fast attack when ducking, slow release when coming back.
  const out = new Array<number>(total);
  let cur = 0;
  for (let f = 0; f < total; f++) {
    const k = target[f] < cur ? 1 / 5 : 1 / 18;
    cur += (target[f] - cur) * k;
    out[f] = cur;
  }
  const fadeIn = Math.round(2 * fps);
  const fadeOut = Math.round(2.5 * fps);
  for (let f = 0; f < total; f++) {
    const a = Math.min(1, f / fadeIn);
    const b = Math.min(1, (total - 1 - f) / fadeOut);
    out[f] *= Math.min(a, b);
  }
  return out;
}
