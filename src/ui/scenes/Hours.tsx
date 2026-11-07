import React from "react";
import { C, Card, countUp, isPortrait, pop, prog, R, rise, TopBar, type SceneProps } from "../lib";

const DOMAINS: { name: string; h: number; max: number }[] = [
  { name: "CAD", h: 148, max: 148 },
  { name: "GD&T", h: 71, max: 148 },
  { name: "DFM", h: 54, max: 148 },
  { name: "FEA", h: 39, max: 148 },
];
const RECENT = ["M12 lug nut · passed", "Bracket DFM review · passed", "Shaft–housing fit · passed"];

/** Public profile: Verified Build Hours by domain, recent passed work, one share link. */
export const Hours: React.FC<SceneProps> = ({ frame, fps, aspect, w }) => {
  const fr = (frame * 30) / fps;
  const p = isPortrait(aspect);
  const cw = p ? w - 144 : 1440;
  const total = countUp(fr, 10, 26, 312);
  const linkAt = 58;

  return (
    <>
      <TopBar active="Profile" aspect={aspect} fr={fr} />
      <Card style={{ left: (w - cw) / 2, top: p ? 400 : 160, width: cw, padding: p ? "48px 52px" : "44px 56px", ...rise(fr, 4, 12, 40) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, ...rise(fr, 6, 10, 12) }}>
          <div style={{ width: p ? 96 : 84, height: p ? 96 : 84, flex: "none", borderRadius: "50%", background: "rgba(20,184,166,0.18)", color: C.accent, display: "grid", placeItems: "center", fontSize: p ? 44 : 38, fontWeight: 700 }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: p ? 44 : 42, fontWeight: 700, letterSpacing: -1, color: C.ink, lineHeight: 1.1 }}>Aarav Mehta</div>
            <div style={{ fontSize: p ? 28 : 27, color: C.muted, marginTop: 6 }}>Mechanical engineering · final year · Pune</div>
          </div>
          {!p && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 20px", borderRadius: 999, background: C.okSoft, color: C.ok, fontSize: 27, fontWeight: 700, whiteSpace: "nowrap", ...pop(fr, 12, 10) }}>✓ Verified</div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: p ? "column" : "row", gap: p ? 30 : 48, marginTop: p ? 36 : 32 }}>
          <div style={{ flex: "none", ...rise(fr, 10, 12, 16) }}>
            <div style={{ fontSize: p ? 28 : 27, fontWeight: 600, color: C.muted, letterSpacing: 0.3 }}>VERIFIED BUILD HOURS</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 4 }}>
              <span style={{ fontSize: p ? 150 : 132, fontWeight: 700, lineHeight: 1, letterSpacing: -5, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{total}</span>
              <span style={{ fontSize: p ? 40 : 36, color: C.muted }}>h</span>
            </div>
            <div style={{ fontSize: p ? 28 : 27, color: C.muted, marginTop: 8 }}>Every hour tied to a passed challenge.</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: p ? 16 : 14, justifyContent: "center" }}>
            {DOMAINS.map((d, i) => {
              const s = 16 + i * 5;
              const k = prog(fr, s + 4, 18);
              return (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 18, ...rise(fr, s, 10, 10) }}>
                  <span style={{ width: p ? 90 : 84, fontSize: p ? 30 : 29, fontWeight: 600, color: C.ink }}>{d.name}</span>
                  <div style={{ flex: 1, height: p ? 22 : 20, borderRadius: 999, background: C.bg2, overflow: "hidden" }}>
                    <div style={{ width: `${((d.h / d.max) * 100 * k).toFixed(1)}%`, height: "100%", borderRadius: 999, background: C.accent }} />
                  </div>
                  <span style={{ width: 80, textAlign: "right", fontSize: p ? 30 : 29, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{Math.round(d.h * k)} h</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: p ? 34 : 28, display: "flex", flexWrap: "wrap", gap: 14 }}>
          {RECENT.map((r, i) => (
            <span key={r} style={{ padding: "10px 20px", borderRadius: 999, background: C.chip, border: `1px solid ${C.chipBorder}`, color: C.ink, fontSize: p ? 28 : 27, whiteSpace: "nowrap", ...pop(fr, 40 + i * 4, 8) }}>
              <span style={{ color: C.ok, marginRight: 10 }}>✓</span>{r}
            </span>
          ))}
        </div>

        <div style={{ marginTop: p ? 34 : 28, display: "flex", alignItems: "center", gap: 18, padding: p ? "18px 22px" : "16px 22px", borderRadius: R.field, background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.35)", ...rise(fr, linkAt, 12, 16) }}>
          <span style={{ flex: 1, fontSize: p ? 30 : 29, color: C.accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>app.fixturelabs.io/u/aarav-mehta</span>
          <span style={{ padding: "10px 22px", borderRadius: 999, background: C.accent, color: "#042b27", fontSize: p ? 28 : 27, fontWeight: 700, whiteSpace: "nowrap", ...pop(fr, linkAt + 8, 10) }}>Share with recruiter</span>
        </div>
      </Card>
    </>
  );
};
