import React from "react";
import { Composition, Folder } from "remotion";
import { EPISODES } from "./episodes";
import { Episode } from "./Episode";
import { buildTimeline, FPS, totalFrames } from "./timeline";

const VIDEOS = Object.values(EPISODES);
const STORIES = [...new Set(VIDEOS.map((v) => v.story))];

/** Every version twice: a 9:16 reel ("ask-v2") and a 16:9 wide cut ("ask-v2-wide"). Studio shows one folder per story. */
export const Root: React.FC = () => (
  <>
    {STORIES.map((story) => (
      <Folder key={story} name={story}>
        {VIDEOS.filter((v) => v.story === story).map(({ id, sequence, manifest }) => {
          const frames = totalFrames(buildTimeline(sequence, manifest, FPS));
          return (
            <React.Fragment key={id}>
              <Composition id={id} component={Episode} width={1080} height={1920} fps={FPS} durationInFrames={frames} defaultProps={{ aspect: "portrait", episode: id }} />
              <Composition id={`${id}-wide`} component={Episode} width={1920} height={1080} fps={FPS} durationInFrames={frames} defaultProps={{ aspect: "landscape", episode: id }} />
            </React.Fragment>
          );
        })}
      </Folder>
    ))}
  </>
);
