import React from "react";
import { Composition, registerRoot, useCurrentFrame, useVideoConfig } from "remotion";
import type { InsertKind } from "../types";
import { Insert } from "./Insert";

/** Seconds per insert, as the scripts use them. */
const DURATIONS: Record<InsertKind, number> = { challenge: 2.4, feedback: 2.8, passed: 2.6, interview: 3.2, hours: 3.2, contest: 3.4, dfm: 3.4, ask: 3.6, title: 2.4, endcard: 5.2 };
const FPS = 30;

const Dev: React.FC<{ kind: InsertKind; title?: string; sub?: string }> = ({ kind, title, sub }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  return <Insert kind={kind} frame={frame} fps={fps} durationInFrames={durationInFrames} aspect={width > height ? "landscape" : "portrait"} width={width} height={height} title={title} sub={sub} />;
};

/** `npx remotion still src/ui/dev-entry.tsx InsertDev out.png --props='{"kind":"hours"}' --frame=80` */
const DevRoot: React.FC = () => (
  <>
    <Composition id="InsertDev" component={Dev} width={1080} height={1920} fps={FPS} durationInFrames={66} defaultProps={{ kind: "challenge" as InsertKind }} calculateMetadata={({ props }) => ({ durationInFrames: Math.round(DURATIONS[props.kind] * FPS) })} />
    <Composition id="InsertDevWide" component={Dev} width={1920} height={1080} fps={FPS} durationInFrames={66} defaultProps={{ kind: "challenge" as InsertKind }} calculateMetadata={({ props }) => ({ durationInFrames: Math.round(DURATIONS[props.kind] * FPS) })} />
  </>
);

registerRoot(DevRoot);
