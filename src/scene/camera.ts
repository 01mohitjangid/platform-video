import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { Aspect, CameraPreset } from "../types";
import { easeInOutSine, noise1 } from "./motion";

export type Vec3 = [number, number, number];

export interface Shot {
  pos: Vec3;
  target: Vec3;
  /** Vertical fov in degrees. */
  fov: number;
  /** World point the depth of field focuses on. */
  focus: Vec3;
  /** Depth of field focus range, world units. */
  range: number;
  /** Bokeh blur scale. */
  bokeh: number;
}

/**
 * World anchors in metres. Cameras look along +Z, so screen-left is +X.
 * Desk top y=0.74, lid top y≈0.98 at z≈0.2. Person sits screen-left, FixtureAI screen-right.
 */
export const PERSON_ROOT: Vec3 = [0.14, 0, 0.8];
export const HEAD: Vec3 = [0.14, 1.13, 0.75];
export const BOT_POS: Vec3 = [-0.1, 1.085, 0.36];
const MID: Vec3 = [0.02, 1.1, 0.55];

export const CAMERA_PRESETS: Record<CameraPreset, Record<Aspect, Shot>> = {
  wide: {
    portrait: { pos: [-0.35, 1.4, -2.5], target: [0.02, 1.08, 0.5], fov: 42, focus: MID, range: 1.4, bokeh: 3 },
    landscape: { pos: [-0.4, 1.4, -2.9], target: [0.02, 1.08, 0.5], fov: 32, focus: MID, range: 1.4, bokeh: 3 },
  },
  twoShot: {
    portrait: { pos: [0.03, 1.3, -0.82], target: [0.02, 1.1, 0.72], fov: 44, focus: MID, range: 0.9, bokeh: 3.5 },
    landscape: { pos: [0.05, 1.12, -0.75], target: [0.03, 1.06, 0.55], fov: 30, focus: MID, range: 0.9, bokeh: 3.5 },
  },
  personMCU: {
    portrait: { pos: [0.5, 1.12, -0.4], target: [0.14, 1.05, 0.75], fov: 40, focus: HEAD, range: 0.6, bokeh: 4 },
    landscape: { pos: [0.55, 1.12, -0.5], target: [0.14, 1.06, 0.75], fov: 30, focus: HEAD, range: 0.6, bokeh: 4 },
  },
  personCU: {
    portrait: { pos: [0.2, 1.06, -0.4], target: [0.14, 1.13, 0.75], fov: 34, focus: HEAD, range: 0.4, bokeh: 4.5 },
    landscape: { pos: [0.22, 1.06, -0.45], target: [0.14, 1.12, 0.75], fov: 31, focus: HEAD, range: 0.4, bokeh: 4.5 },
  },
  botMCU: {
    portrait: { pos: [0.0, 1.1, -0.44], target: [-0.1, 1.09, 0.36], fov: 31, focus: BOT_POS, range: 0.35, bokeh: 4.5 },
    landscape: { pos: [0.0, 1.1, -0.6], target: [-0.1, 1.09, 0.36], fov: 25, focus: BOT_POS, range: 0.35, bokeh: 4.5 },
  },
  botCU: {
    portrait: { pos: [-0.09, 1.0, -0.16], target: [-0.1, 1.095, 0.36], fov: 34, focus: BOT_POS, range: 0.3, bokeh: 5 },
    landscape: { pos: [-0.09, 1.0, -0.3], target: [-0.1, 1.095, 0.36], fov: 28, focus: BOT_POS, range: 0.3, bokeh: 5 },
  },
  peek: {
    portrait: { pos: [0.06, 1.02, -0.9], target: [0.03, 1.12, 0.3], fov: 38, focus: BOT_POS, range: 0.5, bokeh: 4 },
    landscape: { pos: [0.06, 1.02, -1.0], target: [0.03, 1.12, 0.3], fov: 30, focus: BOT_POS, range: 0.5, bokeh: 4 },
  },
};

export interface ResolvedCamera {
  position: Vector3;
  quaternion: Quaternion;
  fov: number;
  focusDistance: number;
}

const UP = new Vector3(0, 1, 0);

/** Pure function of (shot, progress, time): eased dolly push-in plus a slow ±0.6° non-periodic drift. */
export function resolveCamera(shot: Shot, progress: number, time: number): ResolvedCamera {
  const target = new Vector3(...shot.target);
  const position = new Vector3(...shot.pos).lerp(target, 0.08 * easeInOutSine(progress));
  const quaternion = new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(position, target, UP));
  const drift = new Euler(
    0.007 * noise1(time, 41, 0.25),
    0.0105 * noise1(time, 42, 0.2),
    0.004 * noise1(time, 43, 0.15),
  );
  quaternion.multiply(new Quaternion().setFromEuler(drift));
  return { position, quaternion, fov: shot.fov, focusDistance: position.distanceTo(new Vector3(...shot.focus)) };
}
