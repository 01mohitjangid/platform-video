import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EPISODES, type EpisodeId } from "./episodes";
import type { Aspect } from "./types";
import { isInsert, isLine } from "./types";
import { buildTimeline, musicEnvelope, resolveFrame } from "./timeline";
import { Scene } from "./scene/Scene";
import { Insert } from "./ui/Insert";
import { Subtitle } from "./overlay/Subtitle";

// Remotion wants composition props to be an open record.
export type EpisodeProps = { aspect: Aspect; episode: EpisodeId; [key: string]: unknown };

export const Episode: React.FC<EpisodeProps> = ({ aspect, episode }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { sequence, manifest, levels } = EPISODES[episode];
  const segs = useMemo(() => buildTimeline(sequence, manifest, fps), [sequence, manifest, fps]);
  const envelope = useMemo(() => musicEnvelope(segs, fps), [segs, fps]);
  const state = resolveFrame(segs, frame, levels, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#07060a" }}>
      {/* The 3D canvas stays mounted for the whole video: re-creating the WebGL
          context after every insert stalled the renderer. Inserts cover it. */}
      <Scene
        camera={state.camera}
        progress={state.progress}
        time={frame / fps}
        talking={state.talking}
        level={state.level}
        mouth={state.mouth}
        accent={state.accent}
        shotTime={state.shotTime}
        mood={state.mood}
        emotion={state.emotion}
        botUp={state.botUp}
        aspect={aspect}
        width={width}
        height={height}
      />
      {state.insert ? (
        <Insert
          kind={state.insert.kind}
          frame={state.insert.frame}
          fps={fps}
          durationInFrames={state.insert.durationInFrames}
          title={state.insert.title}
          sub={state.insert.sub}
          talking={state.talking}
          mouth={state.talking === "bot" ? state.mouth : 0}
          accent={state.talking === "bot" ? state.accent : 0}
          aspect={aspect}
          width={width}
          height={height}
        />
      ) : null}

      {state.caption ? (
        <Subtitle
          text={state.caption.text}
          speaker={state.caption.speaker}
          frame={state.caption.frame}
          durationInFrames={state.caption.durationInFrames}
          aspect={aspect}
          width={width}
        />
      ) : null}

      {/* Voices and sound effects, one Sequence per segment. */}
      {segs.map((seg) => {
        const item = seg.item;
        const sfx = isLine(item) || isInsert(item) ? item.sfx : undefined;
        const voice = isLine(item) ? manifest.lines[item.id] : undefined;
        if (!sfx && !voice) return null;
        const key = isLine(item) ? item.id : `${seg.from}`;
        return (
          <Sequence key={key} from={seg.from} durationInFrames={seg.durationInFrames} name={key}>
            {voice ? <Audio src={staticFile(voice.file)} volume={1} /> : null}
            {sfx ? <Audio src={staticFile(manifest.sfx[sfx].file)} volume={sfx === "sting" ? 0.7 : 0.55} /> : null}
          </Sequence>
        );
      })}

      <Audio src={staticFile(manifest.music.file)} volume={(f) => envelope[Math.min(f, envelope.length - 1)] ?? 0} />
    </AbsoluteFill>
  );
};
