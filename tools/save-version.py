"""Save an episode as it renders right now as a numbered version, then keep editing the draft.

    npm run save-version -- ask    # src/scripts/ask.ts -> src/scripts/ask-v3.ts, voices -> public/audio/ask-v3/

`ask` stays the draft you edit. `ask-v3` is a frozen copy: the same script, the same voice files and its own
compositions (AskV3 and AskV3Wide). It is registered in src/episodes.ts. Render it with `npm run render -- ask-v3`.
"""

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS, AUDIO, REGISTRY = ROOT / "src" / "scripts", ROOT / "public" / "audio", ROOT / "src" / "episodes.ts"
IMPORTS_END, ENTRIES_END = "import type { Levels }", "} satisfies Record"


def next_version(ep):
    taken = [int(m[1]) for p in SCRIPTS.glob(f"{ep}-v*.ts") if (m := re.fullmatch(rf"{re.escape(ep)}-v(\d+)", p.stem))]
    return f"{ep}-v{max(taken, default=0) + 1}"


def register(ver):
    """Add the version to src/episodes.ts, next to the hand-written entries."""
    v = re.sub(r"-(\w)", lambda m: m[1].upper(), ver)  # ask-v3 -> askV3
    imports = (
        f'import {v}Manifest from "../public/audio/{ver}/manifest.json";\n'
        f'import {v}Levels from "../public/audio/{ver}/levels.json";\n'
        f'import {{ SEQUENCE as {v} }} from "./scripts/{ver}";\n'
    )
    entry = f'  "{ver}": {{ sequence: {v}, manifest: {v}Manifest as AudioManifest, levels: {v}Levels as Levels }},\n'
    ts = REGISTRY.read_text()
    if IMPORTS_END not in ts or ENTRIES_END not in ts:
        sys.exit(f"src/episodes.ts changed shape; add {ver} by hand:\n\n{imports}\n{entry}")
    REGISTRY.write_text(ts.replace(IMPORTS_END, imports + IMPORTS_END, 1).replace(ENTRIES_END, entry + ENTRIES_END, 1))


def save(ep):
    if re.search(r"-v\d+$", ep):
        sys.exit(f"{ep} is already a saved version. Save the draft instead: {re.sub(r'-v[0-9]+$', '', ep)}")
    script, src = SCRIPTS / f"{ep}.ts", AUDIO / ep
    if not script.exists() or not (src / "manifest.json").exists():
        sys.exit(f"{ep}: needs {script.relative_to(ROOT)} and {(src / 'manifest.json').relative_to(ROOT)}")
    ver = next_version(ep)
    dst = AUDIO / ver
    if dst.exists():
        sys.exit(f"{dst.relative_to(ROOT)} already exists")

    # Copy exactly what the draft renders: the voices its manifest points at, not whatever else is in lines/.
    manifest = json.loads((src / "manifest.json").read_text())
    (dst / "lines").mkdir(parents=True)
    for line_id, line in manifest["lines"].items():
        shutil.copy2(ROOT / "public" / line["file"], dst / "lines" / f"{line_id}.wav")
        line["file"] = f"audio/{ver}/lines/{line_id}.wav"
    (dst / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    shutil.copy2(src / "levels.json", dst / "levels.json")
    shutil.copy2(script, SCRIPTS / f"{ver}.ts")
    register(ver)
    print(f"saved {ep} as {ver} ({len(manifest['lines'])} voice lines). Render it: npm run render -- {ver}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    save(sys.argv[1])
