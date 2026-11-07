#!/bin/sh
# Renders one still per camera preset / insert from the real composition and tiles them.
# usage: tools/qa-stills.sh [Episode|EpisodeWide] [frames...]
set -e
COMP="${1:-Episode}"
shift || true
FRAMES="${*:-20 90 200 300 385 430 900 1400 1780 2060 2420 3130 3300}"
OUT="out/qa/$COMP"
mkdir -p "$OUT"
for f in $FRAMES; do
  npx remotion still src/index.ts "$COMP" "$OUT/f$f.png" --frame="$f" --log=error >/dev/null 2>&1 || echo "frame $f failed"
done
FF="${FFMPEG:-$(command -v ffmpeg)}"
INPUTS=""; FILTER=""; i=0
for f in $FRAMES; do
  INPUTS="$INPUTS -i $OUT/f$f.png"
  FILTER="$FILTER[$i]scale=-1:480[s$i];"
  i=$((i + 1))
done
CHAIN=""; j=0; while [ $j -lt $i ]; do CHAIN="$CHAIN[s$j]"; j=$((j + 1)); done
"$FF" -v error $INPUTS -filter_complex "$FILTER${CHAIN}hstack=$i" -y "$OUT/sheet.jpg"
echo "$OUT/sheet.jpg"
