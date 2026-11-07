import lugNutManifest from "../public/audio/lug-nut/manifest.json";
import lugNutLevels from "../public/audio/lug-nut/levels.json";
import { SEQUENCE as lugNut } from "./scripts/lug-nut";
import interviewManifest from "../public/audio/interview/manifest.json";
import interviewLevels from "../public/audio/interview/levels.json";
import { SEQUENCE as interview } from "./scripts/interview";
import hoursManifest from "../public/audio/hours/manifest.json";
import hoursLevels from "../public/audio/hours/levels.json";
import { SEQUENCE as hours } from "./scripts/hours";
import contestManifest from "../public/audio/contest/manifest.json";
import contestLevels from "../public/audio/contest/levels.json";
import { SEQUENCE as contest } from "./scripts/contest";
import dfmManifest from "../public/audio/dfm/manifest.json";
import dfmLevels from "../public/audio/dfm/levels.json";
import { SEQUENCE as dfm } from "./scripts/dfm";
import askManifest from "../public/audio/ask/manifest.json";
import askLevels from "../public/audio/ask/levels.json";
import { SEQUENCE as ask } from "./scripts/ask";
import type { Levels } from "./timeline";
import type { AudioManifest, SequenceItem } from "./types";

export interface Episode {
  sequence: SequenceItem[];
  manifest: AudioManifest;
  levels: Levels;
}

/** Every video this project renders: a script plus its generated voices. */
export const EPISODES = {
  "lug-nut": { sequence: lugNut, manifest: lugNutManifest as AudioManifest, levels: lugNutLevels as Levels },
  interview: { sequence: interview, manifest: interviewManifest as AudioManifest, levels: interviewLevels as Levels },
  hours: { sequence: hours, manifest: hoursManifest as AudioManifest, levels: hoursLevels as Levels },
  contest: { sequence: contest, manifest: contestManifest as AudioManifest, levels: contestLevels as Levels },
  dfm: { sequence: dfm, manifest: dfmManifest as AudioManifest, levels: dfmLevels as Levels },
  ask: { sequence: ask, manifest: askManifest as AudioManifest, levels: askLevels as Levels },
} satisfies Record<string, Episode>;

export type EpisodeId = keyof typeof EPISODES;
