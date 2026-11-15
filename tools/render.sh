#!/bin/sh
# Renders both cuts of one version: out/<story>/v<N>.mp4 (9:16 reel) and out/<story>/v<N>-wide.mp4 (16:9).
# usage: tools/render.sh ask v2
set -e
STORY="${1:?usage: tools/render.sh <story> <version>}"
V="${2:?usage: tools/render.sh <story> <version>}"
mkdir -p "out/$STORY"
npx remotion render src/index.ts "$STORY-$V" "out/$STORY/$V.mp4"
npx remotion render src/index.ts "$STORY-$V-wide" "out/$STORY/$V-wide.mp4"
