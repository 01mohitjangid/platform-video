import React from "react";
import { Easing } from "remotion";
import { C, Card, FixtureAIMark, isPortrait, pop, prog, R, rise, TopBar, type SceneProps } from "../lib";

const Q = "Honestly… what does a datum actually mean? I nod in class.";
const A = "The surface you agree to measure from. Put the part on a table: the table is datum A. Everything else is measured from there.";

/** FixtureAI chat: the question typed out, the plain answer, a crash course chip. */
export const Ask: React.FC<SceneProps> = ({ frame, fps, dur, aspect, w }) => {
  const fr = (frame * 30) / fps;
  const D = (dur * 30) / fps;
  const p = isPortrait(aspect);
  const cw = p ? w - 144 : 1240;
  const qWords = Q.split(" ");
  const qp = prog(fr, 12, Math.round(D * 0.3), Easing.linear) * qWords.length;
  const qn = Math.floor(qp);
  const ansAt = Math.round(D * 0.42);
  const aWords = A.split(" ");
  const ap = prog(fr, ansAt + 6, Math.round(D * 0.3), Easing.linear) * aWords.length;
  const an = Math.floor(ap);
  const chipAt = Math.round(D * 0.82);
  const fs = p ? 34 : 32;

  return (
    <>
      <TopBar active="Problem Set" aspect={aspect} fr={fr} />
      <Card style={{ left: (w - cw) / 2, top: p ? 400 : 160, width: cw, padding: p ? "40px 44px" : "36px 44px", ...rise(fr, 4, 12, 40) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, paddingBottom: p ? 26 : 22, borderBottom: `1px solid ${C.line}`, ...rise(fr, 6, 10, 12) }}>
          <FixtureAIMark size={p ? 64 : 56} />
          <div>
            <div style={{ fontSize: p ? 36 : 34, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>FixtureAI</div>
            <div style={{ fontSize: p ? 27 : 26, color: C.muted, marginTop: 4 }}>Ask anything. Basic is allowed.</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: p ? 30 : 26, opacity: prog(fr, 10, 6) }}>
          <div style={{ maxWidth: "82%", padding: p ? "22px 28px" : "20px 26px", borderRadius: `${R.node}px ${R.node}px 6px ${R.node}px`, background: "rgba(20,184,166,0.16)", border: "1px solid rgba(20,184,166,0.3)", fontSize: fs, lineHeight: 1.4, color: C.ink, minHeight: fs * 1.4 + 44 }}>
            {qWords.slice(0, qn).join(" ")}
            {qWords[qn] && <span style={{ opacity: qp - qn }}> {qWords[qn]}</span>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, marginTop: p ? 26 : 22, alignItems: "flex-start", ...rise(fr, ansAt, 10, 16) }}>
          <FixtureAIMark size={p ? 48 : 44} style={{ marginTop: 6 }} />
          <div style={{ flex: 1 }}>
            <div style={{ maxWidth: "92%", padding: p ? "22px 28px" : "20px 26px", borderRadius: `${R.node}px ${R.node}px ${R.node}px 6px`, background: C.chip, border: `1px solid ${C.chipBorder}`, fontSize: fs, lineHeight: 1.4, color: C.ink, minHeight: fs * 1.4 * (p ? 4 : 2) + 44 }}>
              {fr < ansAt + 6 ? <span style={{ color: C.muted, letterSpacing: 4 }}>{"•".repeat(1 + (Math.floor(fr / 6) % 3))}</span> : null}
              {aWords.slice(0, an).join(" ")}
              {aWords[an] && <span style={{ opacity: ap - an }}> {aWords[an]}</span>}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 18, padding: p ? "14px 24px" : "12px 22px", borderRadius: 999, background: C.chip, border: `1px solid rgba(20,184,166,0.4)`, color: C.link, fontSize: p ? 28 : 27, fontWeight: 600, whiteSpace: "nowrap", ...pop(fr, chipAt, 10) }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.accent }} /> Crash course · GD&T basics · 3 min
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
