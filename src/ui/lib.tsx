import React from "react";
import { Easing, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import type { Aspect, Speaker } from "../types";

const jakarta = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
export const fontFamily = `${jakarta.fontFamily}, -apple-system, "Helvetica Neue", sans-serif`;

/** FixtureLabs dark tokens (frontend/app/globals.css, .dark). Primary is the brand teal. */
export const C = {
  bg: "#0a0a0a",
  bg2: "#262626",
  card: "#171717",
  cardBorder: "rgba(255,255,255,0.1)",
  cardShadow: "0 24px 70px rgba(0,0,0,0.45)",
  line: "#262626",
  ink: "#fafafa",
  muted: "#a1a1a1",
  faint: "#737373",
  accent: "#14b8a6",
  link: "#5eead4",
  ok: "#4ade80",
  okSoft: "rgba(74,222,128,0.14)",
  okGlow: "74,222,128",
  err: "#f87171",
  errSoft: "rgba(248,113,113,0.15)",
  chip: "#1f1f1f",
  chipBorder: "rgba(255,255,255,0.08)",
  glass: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.14)",
  glassActive: "rgba(255,255,255,0.18)",
  hero: `radial-gradient(60% 40% at 22% 74%, rgba(20,184,166,0.22), transparent 70%), linear-gradient(180deg, #041a18 0%, #073530 26%, #0b4a43 48%, #083531 66%, #061b19 82%, #0a0a0a 100%)`,
};

export const R = { card: 24, node: 18, field: 12 } as const;

export interface SceneProps {
  frame: number;
  fps: number;
  dur: number;
  aspect: Aspect;
  w: number;
  h: number;
  /** Who is speaking over this insert (from the timeline); null when nobody. */
  talking?: Speaker | null;
  /** Syllabic mouth flap 0..1, already smoothed. */
  mouth?: number;
  /** 1 → 0 impulse at each word onset. */
  accent?: number;
  /** `title` cards: the big line and the line under it. */
  title?: string;
  sub?: string;
}

export const isPortrait = (a: Aspect) => a === "portrait";

// ---------- time helpers (all pure functions of the frame) ----------

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0 → 1 from `start` over `dur` frames, eased. */
export const prog = (frame: number, start: number, dur: number, easing: (t: number) => number = easeOut) =>
  easing(clamp01((frame - start) / Math.max(1, dur)));

/** Fade + rise entrance. */
export const rise = (frame: number, start: number, dur = 10, dy = 28): React.CSSProperties => {
  const p = prog(frame, start, dur);
  return { opacity: p, transform: `translateY(${((1 - p) * dy).toFixed(2)}px)` };
};

/** Fade + scale pop with a little overshoot. */
export const pop = (frame: number, start: number, dur = 10, from = 0.86): React.CSSProperties => {
  const p = prog(frame, start, dur, Easing.out(Easing.back(1.6)));
  return { opacity: clamp01(p * 2), transform: `scale(${(from + (1 - from) * p).toFixed(4)})` };
};

export const countUp = (frame: number, start: number, dur: number, to: number) => Math.round(prog(frame, start, dur) * to);

// ---------- primitives ----------

/** The FixtureAI avatar: the Visor face as a small tile. */
export const FixtureAIMark: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div style={{ width: size, height: size, flex: "none", borderRadius: size * 0.3, background: "#f4f5f6", display: "grid", placeItems: "center", boxShadow: "inset 0 1px 0 #fff, 0 6px 18px rgba(0,0,0,0.35)", ...style }}>
    <svg width={size * 0.74} height={size * 0.74} viewBox="-50 -50 100 100">
      <rect x={-40} y={-18} width={80} height={30} rx={11} fill="#07302c" />
      <rect x={-27} y={-12} width={12} height={18} rx={4} fill="#dffcf7" />
      <rect x={15} y={-12} width={12} height={18} rx={4} fill="#dffcf7" />
      <rect x={-7} y={22} width={14} height={4.5} rx={2.2} fill="#15181a" />
      <circle cx={30} cy={-38} r={5} fill="#14b8a6" />
      <path d="M30 -33 L26 -22" stroke="#15181a" strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  </div>
);

/** A flat-shaded hex nut for the part preview, slowly turning; `lit` tints it teal. */
export const HexNut: React.FC<{ size: number; spin: number; lit?: number }> = ({ size, spin, lit = 0 }) => {
  const sx = 0.55 + 0.45 * Math.abs(Math.cos((spin * Math.PI) / 180));
  const face = `rgb(${Math.round(228 - 60 * lit)},${Math.round(232 - 10 * lit)},${Math.round(234 - 20 * lit)})`;
  const side = `rgb(${Math.round(150 - 60 * lit)},${Math.round(158 - 10 * lit)},${Math.round(164 - 20 * lit)})`;
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ transform: `scaleX(${sx.toFixed(3)})` }}>
      <polygon points="52,8 26,53 -26,53 -52,8 -26,-37 26,-37" fill={side} />
      <polygon points="52,-4 26,41 -26,41 -52,-4 -26,-49 26,-49" fill={face} stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={0} cy={-4} r={19} fill="#121515" />
      <circle cx={0} cy={-4} r={19} fill="none" stroke="#14b8a6" strokeWidth={2.5} strokeDasharray="4 3" opacity={0.6 + 0.4 * lit} />
    </svg>
  );
};

/** The teal hero band at the top of every app screen. */
export const Hero: React.FC<{ h: number; aspect: Aspect }> = ({ h, aspect }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: isPortrait(aspect) ? h * 0.4 : h * 0.6, background: C.hero }} />
);

export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: R.card, boxShadow: C.cardShadow, ...style }}>{children}</div>
);

export type NavItem = "Problem Set" | "Contests" | "Interview Studio" | "Profile";
const NAV: NavItem[] = ["Problem Set", "Contests", "Interview Studio", "Profile"];

/** App top bar: FixtureLabs wordmark · Problem Set / Contests / Interview Studio / Profile · avatar. */
export const TopBar: React.FC<{ active: NavItem; aspect: Aspect; fr: number }> = ({ active, aspect, fr }) => {
  const p = isPortrait(aspect);
  const pad = p ? 64 : 96;
  const navH = p ? 78 : 72;
  return (
    <div style={{ position: "absolute", left: pad, right: pad, top: p ? 64 : 44, height: navH, display: "flex", alignItems: "center", justifyContent: "space-between", ...rise(fr, 0, 10, 10) }}>
      <Img src={staticFile("brand/fixturelabs-white.png")} style={{ height: p ? 30 : 32, width: "auto", display: "block" }} />
      {!p && (
        <div style={{ display: "flex", padding: 6, borderRadius: 999, background: C.glass, border: `1px solid ${C.glassBorder}`, backdropFilter: "blur(20px)" }}>
          {NAV.map((t) => (
            <div key={t} style={{ padding: "0 30px", height: navH - 14, display: "grid", placeItems: "center", borderRadius: 999, fontSize: 27, fontWeight: 600, color: "#fff", background: t === active ? C.glassActive : "transparent", whiteSpace: "nowrap" }}>
              {t}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {p && <div style={{ padding: "0 26px", height: navH - 14, display: "grid", placeItems: "center", borderRadius: 999, background: C.glassActive, border: `1px solid ${C.glassBorder}`, fontSize: 27, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>{active}</div>}
        <div style={{ width: navH - 16, height: navH - 16, borderRadius: "50%", background: C.ink, color: C.bg, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 28 }}>A</div>
      </div>
    </div>
  );
};
