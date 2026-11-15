/// <reference types="webpack/module" />
import type { Levels } from "./timeline";
import type { AudioManifest, SequenceItem } from "./types";

export interface Episode {
  /** "ask-v2": the composition id. Its wide cut is "ask-v2-wide". */
  id: string;
  /** "ask": the folder name in src/scripts/, public/audio/ and out/. */
  story: string;
  version: number;
  sequence: SequenceItem[];
  manifest: AudioManifest;
  levels: Levels;
}

// Every src/scripts/<story>/v<N>.ts with voices in public/audio/<story>/v<N>/ is a video.
// The bundler (webpack) finds these files when it builds, so a new story or version needs no list here.
// A version without a manifest.json yet (not voiced) is left out until it is voiced.
const scripts = require.context("./scripts", true, /^\.\/[a-z0-9-]+\/v\d+\.ts$/);
const audio = require.context("../public/audio", true, /^\.\/[a-z0-9-]+\/v\d+\/(manifest|levels)\.json$/);

const found = scripts.keys().flatMap((key): Episode[] => {
  const m = key.match(/^\.\/([a-z0-9-]+)\/v(\d+)\.ts$/);
  if (!m || !audio.keys().includes(`./${m[1]}/v${m[2]}/manifest.json`)) return [];
  const dir = `./${m[1]}/v${m[2]}`;
  return [{
    id: `${m[1]}-v${m[2]}`,
    story: m[1],
    version: Number(m[2]),
    sequence: (scripts(key) as { SEQUENCE: SequenceItem[] }).SEQUENCE,
    manifest: audio(`${dir}/manifest.json`) as AudioManifest,
    levels: audio(`${dir}/levels.json`) as Levels,
  }];
});
found.sort((a, b) => a.story.localeCompare(b.story) || a.version - b.version); // v2 before v10

/** Every video this project renders, by composition id. */
export const EPISODES: Record<string, Episode> = Object.fromEntries(found.map((e) => [e.id, e]));
