"""Start the next version of a story by copying its latest one.

    npm run new-version -- ask    # ask/v2 -> ask/v3: src/scripts/ask/v3.ts and public/audio/ask/v3/

The copy has the same script and the same voice files, so it renders like the version before it until you
change it. Edit src/scripts/ask/v3.ts, voice it (EPISODE=ask/v3 python3 tools/audio.py lines, then manifest)
and render it (npm run render -- ask). Older versions are never touched.
"""

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS, AUDIO = ROOT / "src" / "scripts", ROOT / "public" / "audio"


def new_version(story):
    nums = [int(m[1]) for p in (SCRIPTS / story).glob("v*.ts") if (m := re.fullmatch(r"v(\d+)", p.stem))]
    if not nums:
        sys.exit(f"no versions of {story}: expected src/scripts/{story}/v1.ts")
    old, new = f"v{max(nums)}", f"v{max(nums) + 1}"
    src, dst = AUDIO / story / old, AUDIO / story / new
    if not (src / "manifest.json").exists():
        sys.exit(f"{story}/{old} has no voices yet. Voice it first: EPISODE={story}/{old} python3 tools/audio.py lines")
    if dst.exists():
        sys.exit(f"{dst.relative_to(ROOT)} already exists. Move it away first.")

    # Copy exactly what the old version renders: the voices its manifest points at.
    manifest = json.loads((src / "manifest.json").read_text())
    (dst / "lines").mkdir(parents=True)
    for line_id, line in manifest["lines"].items():
        shutil.copy2(ROOT / "public" / line["file"], dst / "lines" / f"{line_id}.wav")
        line["file"] = f"audio/{story}/{new}/lines/{line_id}.wav"
    (dst / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    shutil.copy2(src / "levels.json", dst / "levels.json")
    shutil.copy2(SCRIPTS / story / f"{old}.ts", SCRIPTS / story / f"{new}.ts")
    print(f"{story}/{new} is a copy of {story}/{old}. Edit src/scripts/{story}/{new}.ts")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    new_version(sys.argv[1])
