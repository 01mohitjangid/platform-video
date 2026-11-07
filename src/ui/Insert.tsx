import React from "react";
import { Easing } from "remotion";
import type { Aspect, InsertKind, Speaker } from "../types";
import { C, clamp01, fontFamily, Hero, prog, type SceneProps } from "./lib";
import { Challenge } from "./scenes/Challenge";
import { Endcard } from "./scenes/Endcard";
import { Feedback } from "./scenes/Feedback";
import { Hours } from "./scenes/Hours";
import { Interview } from "./scenes/Interview";
import { Passed } from "./scenes/Passed";
import { Title } from "./scenes/Title";
import { Contest } from "./scenes/Contest";
import { Dfm } from "./scenes/Dfm";
import { Ask } from "./scenes/Ask";

export interface InsertProps {
  kind: InsertKind;
  frame: number;
  fps: number;
  durationInFrames: number;
  aspect: Aspect;
  width: number;
  height: number;
  talking?: Speaker | null;
  /** Syllabic mouth flap 0..1 (already smoothed). */
  mouth?: number;
  /** 1 → 0 impulse at word onsets. */
  accent?: number;
  title?: string;
  sub?: string;
}

const SCENES: Record<InsertKind, React.FC<SceneProps>> = {
  challenge: Challenge,
  feedback: Feedback,
  passed: Passed,
  interview: Interview,
  hours: Hours,
  contest: Contest,
  dfm: Dfm,
  ask: Ask,
  title: Title,
  endcard: Endcard,
};

/** Camera tilt-down over the first ~10 frames, then a very slow push-in. */
const tilt = (frame: number, fps: number, dur: number) => {
  const n = Math.max(8, Math.round(fps / 3));
  const p = prog(frame, 0, n, Easing.out(Easing.quad));
  const zoom = 1 + 0.02 * clamp01((frame - n) / Math.max(1, dur - n));
  return `perspective(1400px) rotateX(${(16 * (1 - p)).toFixed(3)}deg) translateY(${(6 * (1 - p)).toFixed(3)}%) scale(${((1 + 0.05 * (1 - p)) * zoom).toFixed(4)})`;
};

export const Insert: React.FC<InsertProps> = ({ kind, frame, fps, durationInFrames, aspect, width, height, talking = null, mouth = 0, accent = 0, title, sub }) => {
  const Scene = SCENES[kind];
  const flat = kind === "endcard" || kind === "title";
  const last = kind === "endcard";
  // 0.2 s crossfade in and out, so the cut from the 3D room never pops.
  const fade = Math.max(6, Math.round(fps / 5));
  const opacity = Math.min(1, (frame + 1) / fade, last ? 1 : (durationInFrames - frame) / fade);
  return (
    <div style={{ position: "absolute", inset: 0, width, height, overflow: "hidden", background: "#050607", fontFamily, color: C.ink, WebkitFontSmoothing: "antialiased", opacity }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: flat ? "#0a0b0b" : C.bg, transformOrigin: "50% 45%", transform: flat ? undefined : tilt(frame, fps, durationInFrames) }}>
        {!flat && <Hero h={height} aspect={aspect} />}
        <Scene frame={frame} fps={fps} dur={durationInFrames} aspect={aspect} w={width} h={height} talking={talking} mouth={mouth} accent={accent} title={title} sub={sub} />
      </div>
    </div>
  );
};
