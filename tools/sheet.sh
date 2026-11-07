#!/bin/sh
# Contact sheets of a rendered video for a frame-by-frame review.
# usage: tools/sheet.sh out/fixturelabs-intro.mp4 [fps=2]
set -e
VIDEO="$1"
FPS="${2:-2}"
FF="${FFMPEG:-$(command -v ffmpeg)}"
DIR="$(dirname "$VIDEO")/sheets"
rm -rf "$DIR" && mkdir -p "$DIR/f"
"$FF" -v error -i "$VIDEO" -vf "fps=$FPS,scale=-2:480" "$DIR/f/%03d.jpg"
N=$(ls "$DIR/f" | wc -l | tr -d ' ')
i=0
while [ $((i * 24)) -lt "$N" ]; do
  "$FF" -v error -start_number $((i * 24 + 1)) -i "$DIR/f/%03d.jpg" -frames:v 1 -vf "tile=8x3:padding=4:color=black" -y "$DIR/sheet-$i.jpg"
  i=$((i + 1))
done
echo "$N frames → $i sheets in $DIR"
