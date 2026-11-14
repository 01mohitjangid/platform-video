#!/bin/sh
# Renders both cuts of one episode or version: out/<episode>.mp4 (9:16 reel) and out/<episode>-wide.mp4 (16:9).
# usage: tools/render.sh ask | ask-v2 | lug-nut
set -e
EP="${1:?usage: tools/render.sh <episode>   (for example ask or ask-v2)}"
# Same id rule as src/Root.tsx: ask-v2 -> AskV2
COMP=$(printf %s "$EP" | awk -F- '{ for (i = 1; i <= NF; i++) printf "%s%s", toupper(substr($i, 1, 1)), substr($i, 2) }')
mkdir -p out
npx remotion render src/index.ts "$COMP" "out/$EP.mp4"
npx remotion render src/index.ts "${COMP}Wide" "out/$EP-wide.mp4"
