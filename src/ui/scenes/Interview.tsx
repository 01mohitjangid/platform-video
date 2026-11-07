import React from "react";
import { Easing } from "remotion";
import { C, Card, FixtureAIMark, isPortrait, pop, prog, R, rise, TopBar, type SceneProps } from "../lib";

const Q = "Walk me through tolerancing a shaft running in a bored housing.";
const A = "Datum A on the housing bore, B on the end face. Shaft diameter 20, bore 20… and the fit, I'd, um…";
const STRONG = "Datum logic";
const WORK = "State the fit class (H7 g6)";

/** Interview Studio: the question, the answer typed as it is spoken, the evaluation card, "Try again". */
export const Interview: React.FC<SceneProps> = ({ frame, fps, dur, aspect, w }) => {
  const fr = (frame * 30) / fps;
  const D = (dur * 30) / fps;
  const p = isPortrait(aspect);
  const cw = p ? w - 144 : 1440;
  const ansAt = 14;
  const words = A.split(" ");
  const wp = prog(fr, ansAt, Math.round(D * 0.42), Easing.linear) * words.length;
  const n = Math.floor(wp);
  const evalAt = Math.round(D * 0.62);
  const fs = p ? 34 : 31;

  return (
    <>
      <TopBar active="Interview Studio" aspect={aspect} fr={fr} />
      <Card style={{ left: (w - cw) / 2, top: p ? 400 : 160, width: cw, padding: p ? "48px 52px" : "44px 56px", ...rise(fr, 4, 12, 40) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, ...rise(fr, 6, 10, 12) }}>
          <div style={{ fontSize: p ? 28 : 27, fontWeight: 600, color: C.accent, letterSpacing: 0.4 }}>MOCK INTERVIEW · GD&T · QUESTION 3 OF 8</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, color: C.muted, whiteSpace: "nowrap" }}>
            <span style={{ width: 14, height: 14, borderRadius: "50%", background: C.err }} />
            Recording · 00:41
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginTop: p ? 32 : 28, ...rise(fr, 8, 10, 14) }}>
          <FixtureAIMark size={p ? 64 : 56} />
          <div style={{ fontSize: p ? 38 : 36, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{Q}</div>
        </div>

        <div style={{ marginTop: p ? 28 : 24, marginLeft: p ? 84 : 76, padding: p ? "24px 30px" : "22px 28px", borderRadius: R.node, background: C.chip, border: `1px solid ${C.chipBorder}`, fontSize: fs, lineHeight: 1.4, color: C.ink, minHeight: p ? 150 : 120, opacity: prog(fr, ansAt - 2, 6) }}>
          <span style={{ color: C.muted, fontSize: 26, fontWeight: 600, display: "block", marginBottom: 8 }}>YOU</span>
          {words.slice(0, n).join(" ")}
          {words[n] && <span style={{ opacity: wp - n }}> {words[n]}</span>}
        </div>

        <div style={{ marginTop: p ? 32 : 26, padding: p ? "28px 32px" : "26px 30px", borderRadius: R.node, border: `1px solid rgba(20,184,166,0.35)`, background: "rgba(20,184,166,0.06)", ...rise(fr, evalAt, 12, 24) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: p ? 34 : 32, fontWeight: 700, color: C.ink }}>Evaluation</div>
            <div style={{ fontSize: p ? 34 : 32, fontWeight: 700, color: C.accent, fontVariantNumeric: "tabular-nums", ...pop(fr, evalAt + 6, 10) }}>6 / 10</div>
          </div>
          <div style={{ display: "flex", flexDirection: p ? "column" : "row", gap: p ? 12 : 28, marginTop: 16, fontSize: p ? 30 : 29 }}>
            <div style={{ ...rise(fr, evalAt + 8, 10, 10) }}><span style={{ color: C.ok, fontWeight: 700 }}>Strong</span> <span style={{ color: C.ink }}>{STRONG}</span></div>
            <div style={{ ...rise(fr, evalAt + 14, 10, 10) }}><span style={{ color: C.err, fontWeight: 700 }}>Work on</span> <span style={{ color: C.ink }}>{WORK}</span></div>
          </div>
        </div>

        <div style={{ marginTop: p ? 30 : 24, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ padding: p ? "16px 30px" : "14px 28px", borderRadius: R.field, background: C.accent, color: "#042b27", fontSize: p ? 31 : 30, fontWeight: 700, whiteSpace: "nowrap", ...pop(fr, evalAt + 20, 10) }}>Try again</div>
        </div>
      </Card>
    </>
  );
};
