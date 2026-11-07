import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, IcosahedronGeometry, Quaternion, TorusGeometry, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Emotion } from "../types";
import { PERSON_ROOT, type Vec3 } from "./camera";
import { roundedRect } from "./face";
import { blinkState, easeOutCubic, gaze, noise1, nodPulse } from "./motion";

// FixtureLabs palette: charcoal hoodie, teal accents, warm ink features.
const SKIN = "#f1c9a5";
const INK = "#16110f";
const HAIR = "#2b1a14";
const HAIR_HI = "#5c3b27";
const HOODIE = "#2a2320";
const PANTS = "#1f1916";
const EMBER = "#2dd4bf";
const EMBER_DEEP = "#0f9c8c";

/** Head radii (x, y, z) of the faceted egg; the head centre stays at the `HEAD` anchor. */
const HEAD_R: Vec3 = [0.135, 0.146, 0.124];
const FACE_Z = -0.118;
const EYE_Y = 0.006;
const EYE_H = 0.046;
const DEG = Math.PI / 180;

interface Pose {
  /** Symmetric eye y-scale. */
  eyeSy: number;
  /** [+x brow, -x brow] → [y offset, z rotation]. */
  brows: [[number, number], [number, number]];
  /** Fraction of the eye covered by a skin eyelid (tired). */
  lid: number;
  mouth: "line" | "smile" | "flat" | "o";
  /** Head cock (rad), chin down (rad), torso lean forward (rad); all eased in over the shot. */
  tiltZ: number;
  nodX: number;
  lean: number;
  armUp: boolean;
}

const POSES: Record<Emotion, Pose> = {
  neutral: { eyeSy: 1, brows: [[0, 0], [0, 0]], lid: 0, mouth: "line", tiltZ: 0, nodX: 0, lean: 0, armUp: false },
  skeptical: { eyeSy: 0.92, brows: [[0.012, -0.26], [-0.003, 0.06]], lid: 0, mouth: "flat", tiltZ: 8 * DEG, nodX: 0, lean: 0, armUp: false },
  annoyed: { eyeSy: 0.82, brows: [[-0.007, 0.4], [-0.007, -0.4]], lid: 0, mouth: "flat", tiltZ: -3 * DEG, nodX: 1 * DEG, lean: 0.03, armUp: true },
  surprised: { eyeSy: 1.12, brows: [[0.012, -0.08], [0.012, 0.08]], lid: 0, mouth: "o", tiltZ: 0, nodX: -4 * DEG, lean: -0.06, armUp: false },
  smile: { eyeSy: 1, brows: [[0.006, -0.08], [0.006, 0.08]], lid: 0, mouth: "smile", tiltZ: 2 * DEG, nodX: -2 * DEG, lean: -0.12, armUp: false },
  tired: { eyeSy: 0.95, brows: [[-0.007, 0.04], [-0.007, -0.04]], lid: 0.4, mouth: "line", tiltZ: 1.5 * DEG, nodX: 6 * DEG, lean: 0.08, armUp: false },
};

/** Faceted egg: an icosahedron tapered toward the chin and widened at the cheeks. */
function headGeometry(): BufferGeometry {
  const g = new IcosahedronGeometry(1, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const chin = y < 0 ? 1 - 0.2 * y * y : 1;
    const cheek = 1 + 0.07 * Math.exp(-(((y + 0.15) / 0.35) ** 2));
    p.setXYZ(i, x * chin * cheek * HEAD_R[0], y * HEAD_R[1], z * chin * HEAD_R[2]);
  }
  g.computeVertexNormals();
  return g;
}

/** Skullcap: the upper faces of a slightly larger icosahedron. */
function capGeometry(): BufferGeometry {
  const g = new IcosahedronGeometry(1, 1);
  const p = g.attributes.position;
  const keep: number[] = [];
  for (let f = 0; f < p.count; f += 3) {
    const cy = (p.getY(f) + p.getY(f + 1) + p.getY(f + 2)) / 3;
    if (cy < 0.58) continue;
    for (let k = 0; k < 3; k++) keep.push(p.getX(f + k) * 0.142, p.getY(f + k) * 0.136, p.getZ(f + k) * 0.132);
  }
  const out = new BufferGeometry();
  out.setAttribute("position", new Float32BufferAttribute(keep, 3));
  out.computeVertexNormals();
  return out;
}

interface Chunk {
  kind: "tetra" | "pyramid";
  pos: Vec3;
  rot: Vec3;
  size: number;
  hi: boolean;
}

/** Hair chunks around the head centre; `hi` chunks sit on the rim-lit (-x) side. */
const HAIR_CHUNKS: Chunk[] = [
  // fringe
  { kind: "tetra", pos: [-0.085, 0.1, -0.09], rot: [0.3, 0.4, 0.2], size: 0.038, hi: false },
  { kind: "tetra", pos: [-0.03, 0.105, -0.102], rot: [0.5, 0.9, 0.1], size: 0.038, hi: false },
  { kind: "tetra", pos: [0.03, 0.102, -0.104], rot: [0.2, 1.3, -0.3], size: 0.038, hi: false },
  { kind: "tetra", pos: [0.09, 0.095, -0.09], rot: [0.4, 0.2, -0.5], size: 0.038, hi: false },
  // top spikes
  { kind: "pyramid", pos: [-0.06, 0.145, -0.03], rot: [0.25, 0.3, 0.4], size: 0.045, hi: true },
  { kind: "pyramid", pos: [0, 0.16, -0.01], rot: [0.15, 0.8, -0.05], size: 0.045, hi: true },
  { kind: "pyramid", pos: [0.065, 0.145, -0.02], rot: [0.1, 0.2, -0.45], size: 0.045, hi: false },
  { kind: "pyramid", pos: [-0.03, 0.145, 0.05], rot: [-0.4, 0.5, 0.2], size: 0.045, hi: true },
  { kind: "pyramid", pos: [0.04, 0.14, 0.06], rot: [-0.45, 0.1, -0.2], size: 0.045, hi: false },
  { kind: "pyramid", pos: [0.1, 0.115, 0.02], rot: [0, 0.3, -0.7], size: 0.045, hi: false },
  { kind: "pyramid", pos: [-0.1, 0.115, 0.01], rot: [0.1, 0.4, 0.7], size: 0.045, hi: true },
  // temples (break up the cap edge) and sides
  { kind: "tetra", pos: [-0.118, 0.095, -0.06], rot: [0.4, 0.7, 0.5], size: 0.036, hi: true },
  { kind: "tetra", pos: [0.12, 0.095, -0.055], rot: [0.3, 0.1, -0.6], size: 0.036, hi: false },
  { kind: "tetra", pos: [-0.06, 0.105, -0.102], rot: [0.9, 0.3, 0.4], size: 0.034, hi: false },
  { kind: "tetra", pos: [-0.125, 0.07, -0.02], rot: [0.2, 0.5, 0.3], size: 0.04, hi: true },
  { kind: "tetra", pos: [0.125, 0.07, -0.03], rot: [0.1, 0.2, -0.3], size: 0.04, hi: false },
  { kind: "tetra", pos: [-0.07, 0.1, 0.095], rot: [0.6, 0.3, 0.2], size: 0.045, hi: true },
  { kind: "tetra", pos: [0.05, 0.09, 0.1], rot: [0.5, 0.9, -0.2], size: 0.045, hi: false },
  { kind: "tetra", pos: [0, 0.06, 0.125], rot: [0.8, 0.4, 0], size: 0.045, hi: false },
];

const UP = new Vector3(0, 1, 0);
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** A faceted sleeve/leg segment between two points; `cuff` adds an ember ring at the `to` end. */
function Limb({ from, to, w, color, cuff }: { from: Vec3; to: Vec3; w: number; color: string; cuff?: boolean }) {
  const a = new Vector3(...from);
  const b = new Vector3(...to);
  const len = a.distanceTo(b);
  const dir = b.clone().sub(a).normalize();
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new Quaternion().setFromUnitVectors(UP, dir);
  const cuffPos = b.clone().sub(dir.clone().multiplyScalar(0.03));
  return (
    <>
      <mesh position={mid} quaternion={q} castShadow receiveShadow>
        <cylinderGeometry args={[w * 0.5, w * 0.46, len, 6]} />
        <meshStandardMaterial color={color} flatShading roughness={0.9} />
      </mesh>
      {cuff && (
        <mesh position={cuffPos} quaternion={q}>
          <cylinderGeometry args={[w * 0.52, w * 0.5, 0.012, 8]} />
          <meshStandardMaterial color={EMBER} flatShading roughness={0.8} />
        </mesh>
      )}
    </>
  );
}

interface PersonProps {
  time: number;
  shotTime: number;
  emotion: Emotion;
  /** True while the person speaks. */
  talking: boolean;
  /** True while FixtureAI speaks (the person listens and reacts quietly). */
  listening: boolean;
  /** Syllabic mouth 0..1 (0 when not the speaker). */
  mouth: number;
  /** Word-onset impulse 1→0 (0 when not the speaker). */
  accent: number;
}

export function Person({ time, shotTime, emotion, talking, listening, mouth, accent }: PersonProps) {
  const geo = useMemo(
    () => ({
      head: headGeometry(),
      cap: capGeometry(),
      eye: roundedRect(0.032, EYE_H, 0.0128, 0.014),
      happyEye: new TorusGeometry(0.017, 0.004, 6, 12, Math.PI * 0.8),
      lid: roundedRect(0.038, 0.024, 0.005, 0.012),
      brow: roundedRect(0.05, 0.011, 0.005, 0.012),
      line: roundedRect(0.05, 0.009, 0.0045, 0.012),
      flat: roundedRect(0.034, 0.008, 0.004, 0.012),
      o: roundedRect(0.02, 0.024, 0.008, 0.012),
      open: roundedRect(0.046, 0.04, 0.012, 0.014),
      smile: new TorusGeometry(0.03, 0.0045, 6, 14, Math.PI * 0.7),
      torso: new RoundedBoxGeometry(0.36, 0.5, 0.22, 3, 0.05),
      hood: new RoundedBoxGeometry(0.28, 0.1, 0.12, 2, 0.04),
      foot: new RoundedBoxGeometry(0.09, 0.06, 0.16, 2, 0.02),
      cheek: new IcosahedronGeometry(0.013, 1),
      hand: new IcosahedronGeometry(0.04, 1),
      shoulder: new IcosahedronGeometry(0.07, 1),
    }),
    [],
  );

  const p = POSES[emotion];
  // Pose gestures ease in over the first 0.35 s of the shot; the pose itself is held.
  const g = easeOutCubic(shotTime / 0.35);
  const listen = listening ? easeOutCubic(shotTime / 0.5) : 0;
  // Attentive while listening: lids open to ≤ 12% and a dropped head lifts to ≤ 2°, eased over 0.4 s.
  const attend = listening ? easeOutCubic(shotTime / 0.4) : 0;
  const lidAmt = p.lid + (Math.min(p.lid, 0.12) - p.lid) * attend;
  const nodBase = p.nodX + (Math.min(p.nodX, 2 * DEG) - p.nodX) * attend;
  const breath = 1 + 0.008 * Math.sin(2 * Math.PI * 0.22 * time);

  // Gaze: camera when talking, FixtureAI (-x) when listening, laptop (down, slightly right) when idle.
  const target: [number, number] = talking ? [0, 0] : listening ? [-0.003, 0] : [-0.001, -0.003];
  const gz = gaze(time, 11, target);
  const closure = blinkState(time, shotTime, 3, gz.saccadeStart);

  const nod = nodPulse(shotTime, 17) * listen * 0.8 * DEG;
  const yaw = 1.5 * DEG * noise1(time, 21) + gz.x * 0.3 * 25 + 6 * DEG * listen;
  const pitch = 1 * DEG * noise1(time, 22) + nodBase * g - 1.5 * DEG * accent + nod;
  const roll = 0.8 * DEG * noise1(time, 23) + p.tiltZ * g;
  const sway = 0.3 * DEG * noise1(time, 24, 0.3);
  const lean = p.lean * g + 0.3 * DEG * accent;

  const mouthOpen = mouth > 0;
  const openScale = (0.026 + 0.022 * mouth) / 0.04;
  const eyeH = EYE_H * p.eyeSy;
  const lidH = EYE_H * lidAmt;
  const lost = eyeH * 0.92 * closure;

  const restElbowR: Vec3 = [0.25, 0.77, -0.13];
  const restHandR: Vec3 = [0.1, 0.79, -0.3];
  const arm = p.armUp ? g : 0;
  const shoulderR: Vec3 = [0.19, 0.9, 0];
  const elbowR = lerp3(restElbowR, [0.28, 0.85, -0.1], arm);
  const handR = lerp3(restHandR, [0.2, 1.08, -0.16], arm);
  const shoulderL: Vec3 = [-0.19, 0.9, 0];
  const elbowL: Vec3 = [-0.25, 0.77, -0.13];
  const handL: Vec3 = [-0.1, 0.79, -0.3];

  return (
    <group position={PERSON_ROOT}>
      {[-0.1, 0.1].map((lx) => (
        <group key={lx}>
          <Limb from={[lx, 0.48, 0.05]} to={[lx, 0.5, -0.35]} w={0.1} color={PANTS} />
          <Limb from={[lx, 0.5, -0.35]} to={[lx, 0.06, -0.38]} w={0.085} color={PANTS} />
          <mesh geometry={geo.foot} position={[lx, 0.03, -0.42]} castShadow receiveShadow>
            <meshStandardMaterial color="#141420" flatShading roughness={0.9} />
          </mesh>
        </group>
      ))}

      <group position={[0, 0.46, 0]} rotation={[-lean, 0, sway]} scale={[1, breath, 1]}>
        <group position={[0, -0.46, 0]}>
          <mesh geometry={geo.torso} position={[0, 0.71, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={HOODIE} flatShading roughness={0.9} />
          </mesh>
          {[-0.165, 0.165].map((sx) => (
            <mesh key={sx} geometry={geo.shoulder} position={[sx, 0.9, 0]} castShadow>
              <meshStandardMaterial color={HOODIE} flatShading roughness={0.9} />
            </mesh>
          ))}
          <mesh geometry={geo.hood} position={[0, 0.975, 0.1]} castShadow>
            <meshStandardMaterial color={HOODIE} flatShading roughness={0.9} />
          </mesh>
          {[-0.045, 0.045].map((dx) => (
            <group key={dx}>
              <mesh position={[dx, 0.85, -0.118]}>
                <cylinderGeometry args={[0.0045, 0.0045, 0.13, 6]} />
                <meshStandardMaterial color="#e0703a" flatShading roughness={0.95} />
              </mesh>
              <mesh position={[dx, 0.78, -0.118]}>
                <boxGeometry args={[0.012, 0.018, 0.012]} />
                <meshStandardMaterial color={EMBER_DEEP} flatShading roughness={0.7} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.98, -0.03]} castShadow>
            <cylinderGeometry args={[0.045, 0.048, 0.08, 8]} />
            <meshStandardMaterial color={SKIN} flatShading roughness={0.7} />
          </mesh>

          <Limb from={shoulderR} to={elbowR} w={0.085} color={HOODIE} />
          <Limb from={elbowR} to={handR} w={0.072} color={HOODIE} cuff />
          <mesh geometry={geo.hand} position={handR} scale={[1.15, 0.6, 1.3]} castShadow>
            <meshStandardMaterial color={SKIN} flatShading roughness={0.7} />
          </mesh>
          <Limb from={shoulderL} to={elbowL} w={0.085} color={HOODIE} />
          <Limb from={elbowL} to={handL} w={0.072} color={HOODIE} cuff />
          <mesh geometry={geo.hand} position={handL} scale={[1.15, 0.6, 1.3]} castShadow>
            <meshStandardMaterial color={SKIN} flatShading roughness={0.7} />
          </mesh>

          {/* Head: neck pivot, then everything relative to the head centre (= HEAD anchor). */}
          <group position={[0, 0.99, -0.03]} rotation={[pitch, yaw, roll]}>
            <group position={[0, 0.14, -0.02]}>
              <mesh geometry={geo.head} castShadow receiveShadow>
                <meshStandardMaterial color={SKIN} flatShading roughness={0.7} />
              </mesh>
              <mesh geometry={geo.cap} position={[0, 0.015, 0]} castShadow>
                <meshStandardMaterial color={HAIR} flatShading roughness={0.9} />
              </mesh>
              {HAIR_CHUNKS.map((c, i) => (
                <mesh key={i} position={c.pos} rotation={c.rot} castShadow>
                  {c.kind === "tetra" ? <tetrahedronGeometry args={[c.size]} /> : <coneGeometry args={[c.size, c.size * 2, 4]} />}
                  <meshStandardMaterial color={c.hi ? HAIR_HI : HAIR} flatShading roughness={0.9} />
                </mesh>
              ))}
              {[-1, 1].map((side) => (
                <mesh key={side} position={[side * 0.14, 0, -0.01]} castShadow>
                  <boxGeometry args={[0.028, 0.045, 0.035]} />
                  <meshStandardMaterial color={SKIN} flatShading roughness={0.7} />
                </mesh>
              ))}
              <mesh position={[0, -0.012, -0.135]} rotation={[-Math.PI / 2, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[0.024, 0.05, 4]} />
                <meshStandardMaterial color={SKIN} flatShading roughness={0.7} />
              </mesh>
              {p.mouth === "smile" &&
                [-1, 1].map((side) => (
                  <mesh key={side} geometry={geo.cheek} position={[side * 0.1, -0.05, -0.085]}>
                    <meshStandardMaterial color={SKIN} flatShading roughness={0.7} />
                  </mesh>
                ))}

              {[1, -1].map((side, i) => (
                <group key={side}>
                  {p.mouth === "smile" ? (
                    /* happy: a thin upward arc (∩); the blink squashes it from the top */
                    <mesh
                      geometry={geo.happyEye}
                      position={[side * 0.062 + gz.x, EYE_Y + 0.006 + gz.y - 0.012 * closure, FACE_Z]}
                      rotation-z={Math.PI / 2 - Math.PI * 0.4}
                      scale={[1, 1 - 0.9 * closure, 1]}
                    >
                      <meshStandardMaterial color={INK} roughness={0.9} />
                    </mesh>
                  ) : (
                    <mesh
                      geometry={geo.eye}
                      position={[side * 0.062 + gz.x, EYE_Y + gz.y - lost / 2, FACE_Z]}
                      scale={[1, p.eyeSy * (1 - 0.92 * closure), 1]}
                    >
                      <meshStandardMaterial color={INK} roughness={0.9} />
                    </mesh>
                  )}
                  {p.lid > 0 && (
                    <mesh
                      geometry={geo.lid}
                      position={[side * 0.062 + gz.x, EYE_Y + gz.y + eyeH / 2 - lidH / 2, FACE_Z - 0.004]}
                      scale={[1, lidH / 0.024, 1]}
                    >
                      <meshStandardMaterial color={SKIN} flatShading roughness={0.7} />
                    </mesh>
                  )}
                  <mesh geometry={geo.brow} position={[side * 0.06, 0.056 + p.brows[i][0] * g, FACE_Z + 0.001]} rotation-z={p.brows[i][1] * g}>
                    <meshStandardMaterial color={INK} roughness={0.9} />
                  </mesh>
                </group>
              ))}

              {mouthOpen ? (
                <mesh geometry={geo.open} position={[0, -0.058, FACE_Z]} scale={[1, openScale, 1]}>
                  <meshStandardMaterial color={INK} roughness={0.9} />
                </mesh>
              ) : p.mouth === "smile" ? (
                <mesh geometry={geo.smile} position={[0, -0.045, FACE_Z]} rotation-z={1.5 * Math.PI - 0.35 * Math.PI}>
                  <meshStandardMaterial color={INK} roughness={0.9} />
                </mesh>
              ) : p.mouth === "o" ? (
                <mesh geometry={geo.o} position={[0, -0.06, FACE_Z]}>
                  <meshStandardMaterial color={INK} roughness={0.9} />
                </mesh>
              ) : (
                <mesh geometry={p.mouth === "flat" ? geo.flat : geo.line} position={[p.mouth === "flat" ? 0.012 : 0, -0.058, FACE_Z]}>
                  <meshStandardMaterial color={INK} roughness={0.9} />
                </mesh>
              )}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
