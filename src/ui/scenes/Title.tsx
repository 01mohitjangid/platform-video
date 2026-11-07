import React from "react";
import { C, isPortrait, prog, rise, type SceneProps } from "../lib";

/** Chapter card: a short teal rule, the time or place in large type, one quiet line under it. */
export const Title: React.FC<SceneProps> = ({ frame, fps, aspect, h, title = "", sub }) => {
  const fr = (frame * 30) / fps;
  const p = isPortrait(aspect);
  const rule = prog(fr, 2, 16);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${p ? "90% 28%" : "55% 50%"} at 50% 50%, rgba(20,184,166,0.07), transparent 70%)`, opacity: prog(fr, 0, 12) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: h * (p ? 0.43 : 0.41), textAlign: "center", padding: "0 96px" }}>
        <div style={{ margin: "0 auto", width: 72 * rule, height: 3, borderRadius: 2, background: C.accent }} />
        <div style={{ fontSize: p ? 84 : 80, fontWeight: 700, letterSpacing: -2.4, color: C.ink, marginTop: 36, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", ...rise(fr, 4, 14, 24) }}>{title}</div>
        {sub ? <div style={{ fontSize: p ? 34 : 32, color: C.muted, marginTop: 22, lineHeight: 1.35, ...rise(fr, 12, 14, 14) }}>{sub}</div> : null}
      </div>
    </>
  );
};
