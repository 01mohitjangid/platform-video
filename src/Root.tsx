import React from "react";
import { Composition, Folder } from "remotion";
import { EPISODES } from "./episodes";
import { Episode } from "./Episode";
import { buildTimeline, FPS, totalFrames } from "./timeline";

/** Composition id from the episode id: "lug-nut-v1" → "LugNutV1" (and "LugNutV1Wide"). */
const VIDEOS = Object.values(EPISODES).map((e) => ({ ...e, comp: e.id.replace(/(?:^|-)(\w)/g, (_, c: string) => c.toUpperCase()) }));
const STORIES = [...new Set(VIDEOS.map((v) => v.story))];

/** Every version twice: a 9:16 reel and a 16:9 wide cut. Studio shows one folder per story. */
export const Root: React.FC = () => (
  <>
    {STORIES.map((story) => (
      <Folder key={story} name={story}>
        {VIDEOS.filter((v) => v.story === story).map(({ id, comp, sequence, manifest }) => {
          const frames = totalFrames(buildTimeline(sequence, manifest, FPS));
          return (
            <React.Fragment key={id}>
              <Composition id={comp} component={Episode} width={1080} height={1920} fps={FPS} durationInFrames={frames} defaultProps={{ aspect: "portrait", episode: id }} />
              <Composition id={`${comp}Wide`} component={Episode} width={1920} height={1080} fps={FPS} durationInFrames={frames} defaultProps={{ aspect: "landscape", episode: id }} />
            </React.Fragment>
          );
        })}
      </Folder>
    ))}
  </>
);
