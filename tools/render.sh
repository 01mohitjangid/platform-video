#!/bin/sh
# Renders both cuts of one version: out/<story>/v<N>.mp4 (9:16 reel) and out/<story>/v<N>-wide.mp4 (16:9).
# usage: tools/render.sh ask        the latest version of ask
#        tools/render.sh ask v1     one version
set -e
STORY="${1:?usage: tools/render.sh <story> [version]}"
LATEST=$(ls "src/scripts/$STORY" | sed -n 's/^v\([0-9][0-9]*\)\.ts$/\1/p' | sort -n | tail -1)
V="${2:-v$LATEST}"
mkdir -p "out/$STORY"
npx remotion render src/index.ts "$STORY-$V" "out/$STORY/$V.mp4"
npx remotion render src/index.ts "$STORY-$V-wide" "out/$STORY/$V-wide.mp4"
