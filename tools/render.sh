#!/bin/sh
# Renders both cuts of one version: out/<id>.mp4 (9:16 reel) and out/<id>-wide.mp4 (16:9).
# usage: tools/render.sh ask-v2 | lug-nut-v1
set -e
EP="${1:?usage: tools/render.sh <story>-v<N>   (for example ask-v2)}"
mkdir -p out
npx remotion render src/index.ts "$EP" "out/$EP.mp4"
npx remotion render src/index.ts "$EP-wide" "out/$EP-wide.mp4"
