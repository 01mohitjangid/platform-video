/** Shared deterministic face motion (blobatar-style idle): blinks and glances as pure functions of time. */
import { ExtrudeGeometry, Shape } from "three";

/** A flat rounded rectangle (the blobatar eye/mouth shape), extruded `depth` and centred on the origin. */
export function roundedRect(w: number, h: number, r: number, depth: number): ExtrudeGeometry {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x, y + r);
  s.lineTo(x, y + h - r);
  s.quadraticCurveTo(x, y + h, x + r, y + h);
  s.lineTo(x + w - r, y + h);
  s.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
  s.lineTo(x + w, y + r);
  s.quadraticCurveTo(x + w, y, x + w - r, y);
  s.lineTo(x + r, y);
  s.quadraticCurveTo(x, y, x, y + r);
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -depth / 2);
  return g;
}

export const hash = (i: number, salt = 0): number => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const BLINK_FRAMES = 4 / 30;

/** Start time of the latest blink at or before `time`; gaps between blinks run 3.2–4.8 s. */
export function lastBlinkStart(time: number, seed: number): number {
  let start = 1 + 1.6 * hash(0, seed);
  for (let k = 1; k < 400; k++) {
    const next = start + 3.2 + 1.6 * hash(k, seed);
    if (next > time) break;
    start = next;
  }
  return start;
}

/** Eye y-scale for a 4-frame blink: 1 → 0.08 → 1. */
export function blink(time: number, seed: number): number {
  const u = (time - lastBlinkStart(time, seed)) / BLINK_FRAMES;
  if (u < 0 || u > 1) return 1;
  return 1 - 0.92 * Math.sin(Math.PI * u);
}

/** Slow seeded glance: a few millimetres of x/y eye offset, retargeted every 2.6 s with a 0.5 s ease. */
export function glance(time: number, seed: number): [number, number] {
  const win = 2.6;
  const k = Math.floor(time / win);
  const u = Math.min(1, (time - k * win) / 0.5);
  const s = u * u * (3 - 2 * u);
  const tx = (i: number) => (hash(i, seed + 1) - 0.5) * 0.008;
  const ty = (i: number) => (hash(i, seed + 2) - 0.5) * 0.004;
  return [tx(k - 1) + (tx(k) - tx(k - 1)) * s, ty(k - 1) + (ty(k) - ty(k - 1)) * s];
}

export const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
