import React from "react";
import { C, Card, isPortrait, lerp, pop, prog, R, rise, TopBar, type SceneProps } from "../lib";

const PROBLEMS: { name: string; state: "passed" | "live" | "locked" }[] = [
  { name: "Bracket to drawing", state: "passed" },
  { name: "Shaft–housing fit", state: "passed" },
  { name: "Bend allowance, 2 mm steel", state: "live" },
  { name: "Thermal expansion gap", state: "locked" },
];
const PILL = {
  passed: { text: "Passed", bg: C.okSoft, fg: C.ok },
  live: { text: "In progress", bg: "rgba(20,184,166,0.14)", fg: C.accent },
  locked: { text: "Locked", bg: C.chip, fg: C.faint },
};

/** A live contest room: the clock running down, two of four passed, the rank climbing while you watch. */
export const Contest: React.FC<SceneProps> = ({ frame, fps, aspect, w }) => {
  const fr = (frame * 30) / fps;
  const p = isPortrait(aspect);
  const cw = p ? w - 144 : 1440;
  const left = 41 * 60 + 52 - Math.floor(fr / 30);
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  const rank = Math.round(lerp(212, 88, prog(fr, 24, 48)));
  const up = 212 - rank;

  return (
    <>
      <TopBar active="Contests" aspect={aspect} fr={fr} />
      <Card style={{ left: (w - cw) / 2, top: p ? 400 : 160, width: cw, padding: p ? "48px 52px" : "44px 56px", ...rise(fr, 4, 12, 40) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, ...rise(fr, 6, 10, 12) }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: p ? 28 : 27, fontWeight: 600, color: C.accent, letterSpacing: 0.4 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: C.err, boxShadow: `0 0 ${8 + 6 * Math.sin(fr / 5)}px rgba(248,113,113,0.8)` }} />
              SUNDAY SPRINT · LIVE
            </div>
            <div style={{ fontSize: p ? 50 : 48, fontWeight: 700, letterSpacing: -1.2, color: C.ink, marginTop: 10, lineHeight: 1.1 }}>Sunday Sprint #14</div>
          </div>
          <div style={{ flex: "none", padding: "12px 24px", borderRadius: 999, background: C.chip, border: `1px solid ${C.chipBorder}`, color: C.ink, fontSize: p ? 34 : 32, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...pop(fr, 10, 10) }}>
            {clock} <span style={{ color: C.muted, fontWeight: 600, fontSize: p ? 26 : 25 }}>left</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: p ? "column" : "row", gap: p ? 34 : 48, marginTop: p ? 38 : 34 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: p ? 14 : 12 }}>
            {PROBLEMS.map((q, i) => {
              const s = 14 + i * 5;
              const pill = PILL[q.state];
              return (
                <div key={q.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: p ? "18px 24px" : "16px 22px", borderRadius: R.field, background: C.chip, border: `1px solid ${C.chipBorder}`, ...rise(fr, s, 10, 16) }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: p ? 31 : 29, color: q.state === "locked" ? C.faint : C.ink }}>
                    <span style={{ width: 40, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{i + 1}.</span>
                    {q.name}
                  </div>
                  <span style={{ padding: "6px 16px", borderRadius: 999, background: pill.bg, color: pill.fg, fontSize: 25, fontWeight: 700, whiteSpace: "nowrap", ...pop(fr, s + 4, 8) }}>{pill.text}</span>
                </div>
              );
            })}
          </div>

          <div style={{ flex: "none", width: p ? "100%" : 440, padding: p ? "30px 34px" : "28px 32px", borderRadius: R.node, border: "1px solid rgba(20,184,166,0.35)", background: "rgba(20,184,166,0.06)", ...rise(fr, 22, 12, 20) }}>
            <div style={{ fontSize: p ? 28 : 27, fontWeight: 600, color: C.muted, letterSpacing: 0.3 }}>YOUR RANK</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 4 }}>
              <span style={{ fontSize: p ? 150 : 132, fontWeight: 700, lineHeight: 1, letterSpacing: -5, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{rank}</span>
              <span style={{ fontSize: p ? 36 : 34, fontWeight: 700, color: C.ok, opacity: prog(fr, 30, 8) }}>↑ {up}</span>
            </div>
            <div style={{ fontSize: p ? 28 : 27, color: C.muted, marginTop: 10 }}>of 412 · 2 of 4 passed</div>
          </div>
        </div>
      </Card>
    </>
  );
};
