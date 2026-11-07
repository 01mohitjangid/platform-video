import React from "react";
import { C, Card, FixtureAIMark, isPortrait, pop, prog, R, rise, TopBar, type SceneProps } from "../lib";

const FLAGS: { flag: string; fix: string }[] = [
  { flag: "Pocket cut from the side needs a 5-axis setup", fix: "Open it from the top. Same mass, 3-axis." },
  { flag: "Internal corner R0.5: no cutter reaches it", fix: "R3. The end mill has a radius too." },
  { flag: "Wall 1.2 mm: chatter, scrap risk", fix: "2.5 mm. Costs 4 g." },
];

/** FixtureAI DFM review: the machining cost multiple, three flags, each with the fix. */
export const Dfm: React.FC<SceneProps> = ({ frame, fps, aspect, w }) => {
  const fr = (frame * 30) / fps;
  const p = isPortrait(aspect);
  const cw = p ? w - 144 : 1440;
  const fixedAt = 70;

  return (
    <>
      <TopBar active="Problem Set" aspect={aspect} fr={fr} />
      <Card style={{ left: (w - cw) / 2, top: p ? 400 : 160, width: cw, padding: p ? "48px 52px" : "44px 56px", ...rise(fr, 4, 12, 40) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, ...rise(fr, 6, 10, 12) }}>
          <FixtureAIMark size={p ? 72 : 64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: p ? 44 : 42, fontWeight: 700, letterSpacing: -1, color: C.ink, lineHeight: 1.1 }}>FixtureAI DFM review</div>
            <div style={{ fontSize: p ? 28 : 27, color: C.muted, marginTop: 6 }}>Motor mount bracket · 6061-T6 · milled · reviewed in 6 s</div>
          </div>
        </div>

        <div style={{ marginTop: p ? 34 : 30, padding: p ? "26px 32px" : "24px 30px", borderRadius: R.node, background: C.chip, border: `1px solid ${C.chipBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, ...rise(fr, 12, 10, 16) }}>
          <div style={{ fontSize: p ? 30 : 29, color: C.muted }}>Machining cost vs. baseline</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: p ? 52 : 48, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: C.err, textDecoration: fr >= fixedAt ? "line-through" : "none", textDecorationThickness: 4, opacity: fr >= fixedAt ? 0.6 : 1, ...pop(fr, 16, 10) }}>4.1×</span>
            <span style={{ color: C.muted, opacity: prog(fr, fixedAt, 8) }}>→</span>
            <span style={{ color: C.accent, ...pop(fr, fixedAt + 2, 10) }}>1.1×</span>
          </div>
        </div>

        <div style={{ marginTop: p ? 22 : 20, display: "flex", flexDirection: "column", gap: p ? 16 : 14 }}>
          {FLAGS.map((f, i) => {
            const s = 26 + i * 12;
            const fixed = prog(fr, fixedAt - 10 + i * 6, 10);
            return (
              <div key={f.flag} style={{ display: "flex", flexDirection: p ? "column" : "row", gap: p ? 10 : 24, alignItems: p ? "stretch" : "center", padding: p ? "20px 26px" : "18px 26px", borderRadius: R.field, background: C.chip, border: `1px solid ${C.chipBorder}`, ...rise(fr, s, 12, 20) }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16, fontSize: p ? 30 : 29, color: C.ink, lineHeight: 1.3 }}>
                  <span style={{ width: 30, height: 30, flex: "none", borderRadius: "50%", display: "grid", placeItems: "center", background: fixed > 0.5 ? C.okSoft : C.errSoft, color: fixed > 0.5 ? C.ok : C.err, fontSize: 20, fontWeight: 700, ...pop(fr, s + 4, 8, 0.5) }}>{fixed > 0.5 ? "✓" : "!"}</span>
                  {f.flag}
                </div>
                <div style={{ flex: 1, fontSize: p ? 29 : 28, color: C.link, lineHeight: 1.3, paddingLeft: p ? 46 : 0, opacity: fixed, transform: `translateX(${((1 - fixed) * 12).toFixed(1)}px)` }}>{f.fix}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
};
