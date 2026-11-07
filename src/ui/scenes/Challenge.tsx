import React from "react";
import { C, Card, HexNut, isPortrait, pop, prog, R, rise, TopBar, type SceneProps } from "../lib";

const CHECKS: { label: string; ok: boolean }[] = [
  { label: "Across flats 19 mm", ok: true },
  { label: "Height 10.8 mm", ok: true },
  { label: "Thread M12 × 1.25", ok: false },
  { label: "Chamfer 30°", ok: false },
  { label: "Drawing: section view", ok: true },
];

/** The lug nut challenge: part preview, the five checks, attempt 2 marked "Not yet". */
export const Challenge: React.FC<SceneProps> = ({ frame, fps, aspect, w }) => {
  const fr = (frame * 30) / fps;
  const p = isPortrait(aspect);
  const cw = p ? w - 144 : 1440;
  const verdictAt = 40;

  const checks = (
    <div style={{ display: "flex", flexDirection: "column", gap: p ? 14 : 12 }}>
      {CHECKS.map((c, i) => {
        const s = 16 + i * 5;
        return (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: p ? 31 : 29, color: C.ink, ...rise(fr, s, 10, 16) }}>
            <span style={{ width: 30, height: 30, flex: "none", borderRadius: "50%", display: "grid", placeItems: "center", background: c.ok ? C.okSoft : C.errSoft, color: c.ok ? C.ok : C.err, fontSize: 20, fontWeight: 700, ...pop(fr, s + 3, 8, 0.5) }}>
              {c.ok ? "✓" : "✕"}
            </span>
            <span style={{ color: c.ok ? C.ink : C.err }}>{c.label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <TopBar active="Problem Set" aspect={aspect} fr={fr} />
      <Card style={{ left: (w - cw) / 2, top: p ? 400 : 160, width: cw, padding: p ? "48px 52px" : "44px 56px", ...rise(fr, 4, 12, 40) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div style={{ ...rise(fr, 6, 10, 12) }}>
            <div style={{ fontSize: p ? 28 : 27, fontWeight: 600, color: C.accent, letterSpacing: 0.4 }}>CAD · SOLIDWORKS · MEDIUM</div>
            <div style={{ fontSize: p ? 50 : 48, fontWeight: 700, letterSpacing: -1.2, color: C.ink, marginTop: 10, lineHeight: 1.1 }}>M12 lug nut, to drawing</div>
          </div>
          <div style={{ flex: "none", padding: "10px 22px", borderRadius: 999, background: C.chip, border: `1px solid ${C.chipBorder}`, color: C.muted, fontSize: p ? 28 : 27, fontWeight: 600, whiteSpace: "nowrap", ...pop(fr, 10, 10) }}>
            Attempt 2 of 3
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: p ? "column" : "row", gap: p ? 36 : 48, marginTop: p ? 40 : 34, alignItems: p ? "stretch" : "center" }}>
          <div style={{ flex: "none", width: p ? "100%" : 520, height: p ? 420 : 330, borderRadius: R.node, background: "radial-gradient(70% 70% at 50% 45%, #1f2a2a, #121515)", border: `1px solid ${C.cardBorder}`, display: "grid", placeItems: "center", ...pop(fr, 10, 14, 0.94) }}>
            <HexNut size={p ? 300 : 250} spin={fr * 0.4} />
          </div>
          <div style={{ flex: 1 }}>{checks}</div>
        </div>

        <div style={{ marginTop: p ? 40 : 34, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: p ? "16px 28px" : "14px 26px", borderRadius: R.field, background: C.errSoft, color: C.err, fontSize: p ? 34 : 32, fontWeight: 700, whiteSpace: "nowrap", ...pop(fr, verdictAt, 10) }}>
            Not yet · 3 of 5 checks
          </div>
          <div style={{ fontSize: p ? 30 : 29, color: C.muted, opacity: prog(fr, verdictAt + 8, 10) }}>FixtureAI feedback is ready.</div>
        </div>
      </Card>
    </>
  );
};
