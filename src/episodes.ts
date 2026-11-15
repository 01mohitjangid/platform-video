import lugNutManifest from "../public/audio/lug-nut/v1/manifest.json";
import lugNutLevels from "../public/audio/lug-nut/v1/levels.json";
import { SEQUENCE as lugNut } from "./scripts/lug-nut/v1";
import interviewManifest from "../public/audio/interview/manifest.json";
import interviewLevels from "../public/audio/interview/levels.json";
import { SEQUENCE as interview } from "./scripts/interview";
import hoursManifest from "../public/audio/hours/v1/manifest.json";
import hoursLevels from "../public/audio/hours/v1/levels.json";
import { SEQUENCE as hours } from "./scripts/hours/v1";
import contestManifest from "../public/audio/contest/v1/manifest.json";
import contestLevels from "../public/audio/contest/v1/levels.json";
import { SEQUENCE as contest } from "./scripts/contest/v1";
import dfmManifest from "../public/audio/dfm/v1/manifest.json";
import dfmLevels from "../public/audio/dfm/v1/levels.json";
import { SEQUENCE as dfm } from "./scripts/dfm/v1";
import askManifest from "../public/audio/ask/manifest.json";
import askLevels from "../public/audio/ask/levels.json";
import { SEQUENCE as ask } from "./scripts/ask";
import askV1Manifest from "../public/audio/ask/v1/manifest.json";
import askV1Levels from "../public/audio/ask/v1/levels.json";
import { SEQUENCE as askV1 } from "./scripts/ask/v1";
import interviewV1Manifest from "../public/audio/interview-v1/manifest.json";
import interviewV1Levels from "../public/audio/interview-v1/levels.json";
import { SEQUENCE as interviewV1 } from "./scripts/interview-v1";
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
  "ask-v1": { sequence: askV1, manifest: askV1Manifest as AudioManifest, levels: askV1Levels as Levels },
  "interview-v1": { sequence: interviewV1, manifest: interviewV1Manifest as AudioManifest, levels: interviewV1Levels as Levels },
} satisfies Record<string, Episode>;

export type EpisodeId = keyof typeof EPISODES;
