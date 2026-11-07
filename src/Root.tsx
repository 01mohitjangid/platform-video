import React from "react";
import { Composition } from "remotion";
import { EPISODES, type EpisodeId } from "./episodes";
import { Episode } from "./Episode";
import { buildTimeline, FPS, totalFrames } from "./timeline";

const frames = (id: EpisodeId): number => totalFrames(buildTimeline(EPISODES[id].sequence, EPISODES[id].manifest, FPS));

const VIDEOS: { id: string; episode: EpisodeId }[] = [
  { id: "LugNut", episode: "lug-nut" },
  { id: "Interview", episode: "interview" },
  { id: "Hours", episode: "hours" }, { id: "Contest", episode: "contest" }, { id: "Dfm", episode: "dfm" }, { id: "Ask", episode: "ask" },
];

/** Every episode twice: a 9:16 reel and a 16:9 wide cut. */
export const Root: React.FC = () => (
  <>
    {VIDEOS.map(({ id, episode }) => (
      <React.Fragment key={id}>
        <Composition id={id} component={Episode} width={1080} height={1920} fps={FPS} durationInFrames={frames(episode)} defaultProps={{ aspect: "portrait", episode }} />
        <Composition id={`${id}Wide`} component={Episode} width={1920} height={1080} fps={FPS} durationInFrames={frames(episode)} defaultProps={{ aspect: "landscape", episode }} />
      </React.Fragment>
    ))}
  </>
);
