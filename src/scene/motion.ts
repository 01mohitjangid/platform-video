/** Deterministic, non-periodic motion helpers: value noise, eases, blink and gaze schedules. Pure functions of time. */

export const hash = (i: number, seed = 0): number => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth value noise in -1..1 on a ~0.5 Hz lattice with cubic interpolation. */
export function noise1(t: number, seed: number, hz = 0.5): number {
  const x = t * hz;
  const i = Math.floor(x);
  const f = x - i;
  const s = f * f * (3 - 2 * f);
  const a = hash(i, seed) * 2 - 1;
  const b = hash(i + 1, seed) * 2 - 1;
  return a + (b - a) * s;
}

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
export const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * Math.min(1, Math.max(0, t))) - 1) / 2;
export const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Latest event start ≤ time from a seeded sequence of gaps in [min, max]. */
function lastEvent(time: number, seed: number, min: number, max: number, first = 1): number {
  let start = first + (max - min) * hash(0, seed);
  for (let k = 1; k < 400; k++) {
    const next = start + min + (max - min) * hash(k, seed);
    if (next > time) break;
    start = next;
  }
  return start;
}

const CLOSE = 3 / 30;
const OPEN = 5 / 30;

/** Blink envelope: closes in 3 frames, opens in 5. */
function blinkEnvelope(u: number): number {
  if (u < 0) return 0;
  if (u < CLOSE) return easeOutCubic(u / CLOSE);
  if (u < CLOSE + OPEN) return 1 - easeInOutSine((u - CLOSE) / OPEN);
  return 0;
}

export interface Gaze {
  x: number;
  y: number;
  /** Start time of the most recent saccade (for a coupled blink). */
  saccadeStart: number;
}

/**
 * Eye offset (metres) that holds a target, jumps to a new seeded micro-target every 2–4 s
 * with a 0.12 s eased saccade, plus ±0.6 mm slow noise.
 */
export function gaze(time: number, seed: number, target: [number, number]): Gaze {
  const start = lastEvent(time, seed, 2, 4, 0.6);
  const k = Math.round(start * 97);
  const prevK = Math.round(lastEvent(start - 0.001, seed, 2, 4, 0.6) * 97);
  const micro = (i: number): [number, number] => [(hash(i, seed + 1) - 0.5) * 0.004, (hash(i, seed + 2) - 0.5) * 0.003];
  const a = micro(prevK);
  const b = micro(k);
  const s = easeInOutSine((time - start) / 0.12);
  return {
    x: target[0] + a[0] + (b[0] - a[0]) * s + 0.0006 * noise1(time, seed + 3, 0.3),
    y: target[1] + a[1] + (b[1] - a[1]) * s + 0.0006 * noise1(time, seed + 4, 0.3),
    saccadeStart: start,
  };
}

/**
 * Eye closure 0..1: blinks 2.8–5.2 s apart, never in the first 0.4 s of a shot, plus a blink
 * coupled to each gaze saccade.
 */
export function blinkState(time: number, shotTime: number, seed: number, saccadeStart?: number): number {
  const shotStart = time - shotTime;
  const start = lastEvent(time, seed, 2.8, 5.2, 1.2);
  let c = start >= shotStart + 0.4 ? blinkEnvelope(time - start) : 0;
  if (saccadeStart !== undefined && saccadeStart >= shotStart + 0.4) c = Math.max(c, blinkEnvelope(time - saccadeStart));
  return c;
}

/** A quiet listening nod: 0..1 bump of `dur` seconds on a seeded 1.5–3 s schedule within the shot. */
export function nodPulse(shotTime: number, seed: number, dur = 0.4): number {
  if (shotTime < 0.6) return 0;
  const start = lastEvent(shotTime, seed, 1.5, 3, 0.9);
  const u = (shotTime - start) / dur;
  return u >= 0 && u <= 1 ? Math.sin(Math.PI * u) : 0;
}
