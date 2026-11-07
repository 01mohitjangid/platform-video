import React from "react";
import { C, Card, countUp, HexNut, isPortrait, pop, prog, R, rise, TopBar, type SceneProps } from "../lib";

const CHECKS = ["Across flats 19 mm", "Height 10.8 mm", "Thread M12 × 1.25", "Chamfer 30°", "Drawing: section view"];

/** Attempt 3: every check turns green, the verdict flips, points land. */
export const Passed: React.FC<SceneProps> = ({ frame, fps, aspect, w }) => {
  const fr = (frame * 30) / fps;
  const p = isPortrait(aspect);
  const cw = p ? w - 144 : 1440;
  const verdictAt = 34;
  const pts = countUp(fr, verdictAt + 4, 18, 150);

  return (
    <>
      <TopBar active="Problem Set" aspect={aspect} fr={fr} />
      <Card style={{ left: (w - cw) / 2, top: p ? 400 : 160, width: cw, padding: p ? "48px 52px" : "44px 56px", ...rise(fr, 2, 10, 30) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div>
            <div style={{ fontSize: p ? 28 : 27, fontWeight: 600, color: C.accent, letterSpacing: 0.4 }}>CAD · SOLIDWORKS · MEDIUM</div>
            <div style={{ fontSize: p ? 50 : 48, fontWeight: 700, letterSpacing: -1.2, color: C.ink, marginTop: 10, lineHeight: 1.1 }}>M12 lug nut, to drawing</div>
          </div>
          <div style={{ flex: "none", padding: "10px 22px", borderRadius: 999, background: C.chip, border: `1px solid ${C.chipBorder}`, color: C.muted, fontSize: p ? 28 : 27, fontWeight: 600, whiteSpace: "nowrap" }}>Attempt 3 of 3</div>
        </div>

        <div style={{ display: "flex", flexDirection: p ? "column" : "row", gap: p ? 36 : 48, marginTop: p ? 40 : 34, alignItems: p ? "stretch" : "center" }}>
          <div style={{ flex: "none", width: p ? "100%" : 520, height: p ? 420 : 330, borderRadius: R.node, background: "radial-gradient(70% 70% at 50% 45%, #1f2a2a, #121515)", border: `1px solid ${C.cardBorder}`, display: "grid", placeItems: "center", boxShadow: `0 0 ${(60 * prog(fr, verdictAt, 12)).toFixed(0)}px rgba(20,184,166,${(0.35 * prog(fr, verdictAt, 12)).toFixed(3)})` }}>
            <HexNut size={p ? 300 : 250} spin={fr * 0.4} lit={prog(fr, verdictAt, 12)} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: p ? 14 : 12 }}>
            {CHECKS.map((label, i) => {
              const s = 6 + i * 5;
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: p ? 31 : 29, color: C.ink }}>
                  <span style={{ width: 30, height: 30, flex: "none", borderRadius: "50%", display: "grid", placeItems: "center", background: C.okSoft, color: C.ok, fontSize: 20, fontWeight: 700, ...pop(fr, s, 8, 0.4) }}>✓</span>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: p ? 40 : 34, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: p ? "16px 28px" : "14px 26px", borderRadius: R.field, background: C.okSoft, color: C.ok, fontSize: p ? 36 : 34, fontWeight: 700, whiteSpace: "nowrap", ...pop(fr, verdictAt, 10) }}>
            Passed · 5 of 5
          </div>
          <div style={{ fontSize: p ? 40 : 38, fontWeight: 700, color: C.accent, fontVariantNumeric: "tabular-nums", ...pop(fr, verdictAt + 4, 10) }}>+{pts} pts</div>
          <div style={{ fontSize: p ? 30 : 29, color: C.muted, ...rise(fr, verdictAt + 20, 10, 8) }}>Rank 412 → 388</div>
        </div>
      </Card>
    </>
  );
};
