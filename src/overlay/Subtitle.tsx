import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import type { Aspect, Speaker } from "../types";

const { fontFamily } = loadFont("normal", { weights: ["500", "600"], subsets: ["latin"] });

export interface SubtitleProps {
  text: string;
  speaker: Speaker;
  frame: number;
  durationInFrames: number;
  aspect: Aspect;
  width: number;
}

/** Reel-style caption: white, centred, upper third on portrait, lower band on landscape. Shouting = ALL CAPS in the script. */
export const Subtitle: React.FC<SubtitleProps> = ({ text, speaker, frame, durationInFrames, aspect, width }) => {
  const appear = interpolate(frame, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const leave = interpolate(frame, [durationInFrames - 4, durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(appear, leave);
  const rise = (1 - appear) * 10;
  const fontSize = aspect === "portrait" ? width * 0.042 : width * 0.022;

  return (
    <AbsoluteFill
      style={{
        justifyContent: aspect === "portrait" ? "flex-start" : "flex-end",
        alignItems: "center",
        paddingTop: aspect === "portrait" ? "19%" : 0,
        paddingBottom: aspect === "portrait" ? 0 : "9%",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 600,
          fontSize,
          lineHeight: 1.28,
          color: speaker === "bot" ? "#d9fbf5" : "#ffffff",
          textAlign: "center",
          maxWidth: aspect === "portrait" ? "80%" : "62%",
          textShadow: "0 2px 14px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)",
          opacity,
          transform: `translateY(${rise}px)`,
          letterSpacing: -0.2,
          textWrap: "balance",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
