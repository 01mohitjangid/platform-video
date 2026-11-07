import React from "react";
import { Img, staticFile } from "remotion";
import { C, isPortrait, lerp, prog, rise, type SceneProps } from "../lib";

/** End card: the FixtureLabs wordmark glows in, then the anchor tagline. */
export const Endcard: React.FC<SceneProps> = ({ frame, fps, dur, aspect, w, h }) => {
  const fr = (frame * 30) / fps;
  const p = isPortrait(aspect);
  const d30 = (dur * 30) / fps;
  const [tTag, tSmall] = [0.42, 0.68].map((f) => Math.round(f * d30));
  const logoW = p ? 760 : 820;
  const cy = p ? h * 0.42 : h * 0.4;
  const appear = prog(fr, 0, 12);
  const scale = lerp(0.94, 1, prog(fr, 0, 40));
  const lit = prog(fr, 10, 24);
  const settled = fr > 60 ? 0.04 * Math.sin((fr / 30) * 0.5 * Math.PI * 2) : 0;
  const bloom = Math.max(0, Math.min(1, fr < 34 ? (fr - 10) / 24 : 1 - ((fr - 34) / 26) * 0.45)) + settled;

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${p ? "80% 30%" : "50% 55%"} at 50% ${p ? 42 : 40}%, rgba(20,184,166,${(0.04 + 0.1 * lit).toFixed(3)}), transparent 70%)` }} />
      <div style={{ position: "absolute", left: w / 2 - logoW / 2, top: cy - logoW * 0.062, width: logoW, opacity: appear, transform: `scale(${scale.toFixed(4)})` }}>
        <Img src={staticFile("brand/fixturelabs-white.png")} style={{ position: "absolute", left: 0, top: 0, width: logoW, filter: "blur(40px)", opacity: 0.55 * bloom }} />
        <Img src={staticFile("brand/fixturelabs-white.png")} style={{ position: "absolute", left: 0, top: 0, width: logoW, filter: "blur(12px)", opacity: 0.6 * bloom }} />
        <Img src={staticFile("brand/fixturelabs-white.png")} style={{ position: "relative", width: logoW, opacity: 0.45 + 0.55 * lit }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: cy + logoW * 0.07 + (p ? 90 : 70), textAlign: "center" }}>
        <div style={{ fontSize: p ? 48 : 44, fontWeight: 600, color: C.ink, letterSpacing: -0.6, ...rise(fr, tTag, 14, 14) }}>Built to make you hireable.</div>
        <div style={{ fontSize: 30, color: C.faint, marginTop: p ? 40 : 32, ...rise(fr, tSmall, 14, 10) }}>The world's first AI mechanical engineering tutor.</div>
      </div>
    </>
  );
};
