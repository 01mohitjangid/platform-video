import React from "react";
import { C, Card, FixtureAIMark, isPortrait, pop, prog, R, rise, TopBar, type SceneProps } from "../lib";

const FIXES: { title: string; detail: string; was: string; should: string }[] = [
  { title: "Thread callout", detail: "The drawing calls M12 × 1.25 (fine pitch).", was: "M12 × 1.5", should: "M12 × 1.25" },
  { title: "Chamfer angle", detail: "Both faces: 30° to the bearing surface.", was: "45°", should: "30°" },
];

/** FixtureAI feedback on attempt 2: two things wrong, each as was → should. */
export const Feedback: React.FC<SceneProps> = ({ frame, fps, aspect, w }) => {
  const fr = (frame * 30) / fps;
  const p = isPortrait(aspect);
  const cw = p ? w - 144 : 1440;

  return (
    <>
      <TopBar active="Problem Set" aspect={aspect} fr={fr} />
      <Card style={{ left: (w - cw) / 2, top: p ? 400 : 160, width: cw, padding: p ? "48px 52px" : "44px 56px", ...rise(fr, 4, 12, 40) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, ...rise(fr, 6, 10, 12) }}>
          <FixtureAIMark size={p ? 72 : 64} />
          <div>
            <div style={{ fontSize: p ? 44 : 42, fontWeight: 700, letterSpacing: -1, color: C.ink, lineHeight: 1.1 }}>FixtureAI feedback</div>
            <div style={{ fontSize: p ? 28 : 27, color: C.muted, marginTop: 6 }}>Attempt 2 · M12 lug nut · reviewed in 4 s</div>
          </div>
        </div>

        <div style={{ marginTop: p ? 36 : 32, display: "flex", flexDirection: p ? "column" : "row", gap: p ? 22 : 24 }}>
          {FIXES.map((f, i) => {
            const s = 16 + i * 14;
            return (
              <div key={f.title} style={{ flex: 1, padding: p ? "30px 32px" : "28px 30px", borderRadius: R.node, background: C.chip, border: `1px solid ${C.chipBorder}`, ...rise(fr, s, 12, 26) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: p ? 36 : 34, fontWeight: 700, color: C.ink }}>{f.title}</div>
                  <span style={{ padding: "6px 16px", borderRadius: 999, background: C.errSoft, color: C.err, fontSize: 26, fontWeight: 700, ...pop(fr, s + 4, 8) }}>Fix</span>
                </div>
                <div style={{ fontSize: p ? 30 : 29, color: C.muted, marginTop: 10, lineHeight: 1.35 }}>{f.detail}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 22, fontSize: p ? 38 : 36, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ color: C.err, textDecoration: "line-through", textDecorationThickness: 3, opacity: prog(fr, s + 10, 8) }}>{f.was}</span>
                  <span style={{ color: C.muted, opacity: prog(fr, s + 14, 8) }}>→</span>
                  <span style={{ color: C.accent, ...pop(fr, s + 16, 10) }}>{f.should}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: p ? 36 : 30, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 18 }}>
          <div style={{ fontSize: p ? 32 : 30, color: C.ink, ...rise(fr, 54, 10, 10) }}>
            Everything else holds. <span style={{ color: C.muted }}>Two edits, then resubmit.</span>
          </div>
          <div style={{ padding: p ? "16px 30px" : "14px 28px", borderRadius: R.field, background: C.accent, color: "#042b27", fontSize: p ? 31 : 30, fontWeight: 700, whiteSpace: "nowrap", ...pop(fr, 60, 10) }}>Open in SolidWorks</div>
        </div>
      </Card>
    </>
  );
};
