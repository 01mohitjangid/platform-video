import { useMemo } from "react";
import {
  CatmullRomCurve3,
  Color,
  ExtrudeGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Quaternion,
  Shape,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import type { Mood } from "../types";
import { BOT_POS } from "./camera";
import { roundedRect } from "./face";
import { blinkState, easeOutCubic, gaze, noise1, smoothstep } from "./motion";

/** "Pebble · Ember": a warm low-poly stone with ripple rings top-left and a small face low-right. Faces -Z. */
const R: [number, number, number] = [0.084, 0.0865, 0.072];
const INK = "#16110f";
const GLOW = "#ffd9b8";
/** FixtureAI hides this far below its resting height when `up` is 0 (fully behind the laptop lid). */
const HIDDEN_DROP = 0.275;
const DEG = Math.PI / 180;
const EYE_H = 0.026;

const M_POINTS: [number, number][] = [
  [248, 221],
  [319.5, 294],
  [391, 221],
  [423, 391],
  [396, 395],
  [373, 280],
  [319.5, 335],
  [266, 280],
  [243, 395],
  [216, 391],
];

/** Point on the stone's surface for a direction, pushed out by `lift`, with a quaternion facing outward. */
function onSurface(dir: Vector3, lift: number) {
  const n = dir.clone().normalize();
  const position = new Vector3(n.x * R[0], n.y * R[1], n.z * R[2]);
  const normal = new Vector3(position.x / (R[0] * R[0]), position.y / (R[1] * R[1]), position.z / (R[2] * R[2])).normalize();
  position.add(normal.clone().multiplyScalar(lift));
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), normal);
  return { position, quaternion, normal };
}

function bodyGeometry() {
  const g = new IcosahedronGeometry(1, 2);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const top = new Color("#ffa06a");
  const mid = new Color("#d9531e");
  const bottom = new Color("#7a1409");
  const c = new Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    // gentle deterministic lumps, a bulge top-left (+x,+y) and more mass lower-right (-x,-y)
    const noise = 0.035 * Math.sin(3.1 * x + 1) * Math.sin(2.4 * y + 2) * Math.cos(2.8 * z + 0.5);
    const bulge = 0.05 * Math.max(0, x) * Math.max(0, y) + 0.07 * Math.max(0, -x) * Math.max(0, -y + 0.2);
    const d = 1 + noise + bulge;
    p.setXYZ(i, x * d * R[0], y * d * R[1], z * d * R[2]);
    const t = Math.min(1, Math.max(0, 0.5 + 0.45 * y + 0.3 * x));
    if (t > 0.5) c.copy(mid).lerp(top, (t - 0.5) * 2);
    else c.copy(bottom).lerp(mid, t * 2);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

/** A ripple ring: an arc at angular distance `alpha` from the ripple centre, lying on the surface. */
function ringGeometry(alpha: number) {
  const centre = new Vector3(0.3, 0.25, -1).normalize();
  const up = new Vector3(0.75, 0.66, 0).normalize(); // azimuth 0 points up-left
  const u = up.clone().sub(centre.clone().multiplyScalar(up.dot(centre))).normalize();
  const v = new Vector3().crossVectors(centre, u);
  const pts: Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const phi = -0.8 + 1.6 * (i / 16);
    const dir = centre
      .clone()
      .multiplyScalar(Math.cos(alpha))
      .add(u.clone().multiplyScalar(Math.sin(alpha) * Math.cos(phi)))
      .add(v.clone().multiplyScalar(Math.sin(alpha) * Math.sin(phi)));
    pts.push(onSurface(dir, 0.0015).position);
  }
  return new TubeGeometry(new CatmullRomCurve3(pts), 24, 0.0026, 5, false);
}

function markGeometry() {
  const s = 0.02 / 207;
  const shape = new Shape();
  M_POINTS.forEach(([x, y], i) => {
    const px = (x - 319.5) * s;
    const py = (308 - y) * s;
    if (i === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  });
  shape.closePath();
  const g = new ExtrudeGeometry(shape, { depth: 0.004, bevelEnabled: false });
  g.translate(0, 0, -0.002);
  return g;
}

interface BotProps {
  time: number;
  shotTime: number;
  /** 0 hidden behind the lid → 1 risen. */
  up: number;
  mood: Mood;
  speaking: boolean;
  personTalking: boolean;
  /** Syllabic mouth 0..1 (0 when not the speaker). */
  mouth: number;
  /** Word-onset impulse 1→0 (0 when not the speaker). */
  accent: number;
}

export function Bot({ time, shotTime, up, mood, speaking, personTalking, mouth, accent }: BotProps) {
  const geo = useMemo(
    () => ({
      body: bodyGeometry(),
      rings: [0.3, 0.46, 0.62].map(ringGeometry),
      eye: roundedRect(0.016, EYE_H, 0.006, 0.006),
      happyEye: new TorusGeometry(0.0095, 0.0024, 6, 12, Math.PI * 0.8),
      mouth: roundedRect(0.014, 0.0045, 0.002, 0.005),
      open: roundedRect(0.014, 0.012, 0.004, 0.006),
      mark: markGeometry(),
    }),
    [],
  );
  const face = useMemo(
    () => ({
      eyes: [onSurface(new Vector3(-0.12, -0.12, -1), 0.003), onSurface(new Vector3(-0.56, -0.18, -1), 0.003)],
      mouth: onSurface(new Vector3(-0.33, -0.44, -1), 0.003),
      mark: onSurface(new Vector3(-0.55, -0.78, -0.9), 0.001),
    }),
    [],
  );

  const u = Math.min(1, Math.max(0, up));
  const [x, restY, z] = BOT_POS;
  // Linear rise so `up` reads as "fraction risen", with a small overshoot bump that settles by 1.
  const y = restY - HIDDEN_DROP * (1 - u) + 0.05 * Math.sin(Math.PI * smoothstep(0.6, 1, u));
  const stretch = 1 + 0.18 * Math.sin(Math.PI * u);
  const breath = 1 + 0.01 * Math.sin(2 * Math.PI * 0.2 * time + 1);
  const s = (1 + 0.025 * mouth) * breath;
  const scale: [number, number, number] = [s / Math.sqrt(stretch), s * stretch, s / Math.sqrt(stretch)];

  // Mood is held for the whole shot (eased in on the cut); gaze: person while they talk, camera otherwise.
  const g = easeOutCubic(shotTime / 0.35);
  const proud = mood === "proud" ? g : 0;
  const eyeSy = mood === "proud" ? 1 - 0.15 * g : 1;
  const gz = gaze(time, 29, personTalking ? [0.003, 0.001] : [0, 0]);
  const closure = blinkState(time, shotTime, 7, gz.saccadeStart);
  const lost = EYE_H * eyeSy * 0.92 * closure;

  const openScale = (0.006 + 0.008 * mouth) / 0.012;
  const pulse = (i: number) => (accent > 0 ? Math.exp(-(((accent - (1 - 0.25 * i)) / 0.18) ** 2)) : 0);

  return (
    <group
      position={[x, y, z]}
      rotation={[
        1.5 * DEG * noise1(time, 31, 0.3) - 2 * DEG * proud - 0.6 * DEG * accent,
        1.5 * DEG * noise1(time, 32, 0.25),
        1.5 * DEG * noise1(time, 33, 0.2),
      ]}
      scale={scale}
    >
      <mesh geometry={geo.body} castShadow receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.55} emissive="#ff6a2a" emissiveIntensity={0.12} />
      </mesh>
      {geo.rings.map((rg, i) => (
        <mesh key={i} geometry={rg}>
          <meshStandardMaterial color="#c98a62" emissive={GLOW} emissiveIntensity={0.4 + 2 * pulse(i)} roughness={0.6} />
        </mesh>
      ))}
      {face.eyes.map((e, i) => {
        const off = e.normal.clone().multiplyScalar(0).add(new Vector3(gz.x, gz.y, 0));
        return mood === "happy" ? (
          <mesh
            key={i}
            geometry={geo.happyEye}
            position={e.position.clone().add(off).add(new Vector3(0, 0.004 - 0.006 * closure, 0))}
            quaternion={e.quaternion}
            rotation-z={0}
            scale={[1, 1 - 0.9 * closure, 1]}
          >
            <meshStandardMaterial color={INK} roughness={0.9} />
          </mesh>
        ) : (
          <mesh key={i} geometry={geo.eye} position={e.position.clone().add(off).add(new Vector3(0, -lost / 2, 0))} quaternion={e.quaternion} scale={[1, eyeSy * (1 - 0.92 * closure), 1]}>
            <meshStandardMaterial color={INK} roughness={0.9} />
          </mesh>
        );
      })}
      <mesh geometry={mouth > 0 ? geo.open : geo.mouth} position={face.mouth.position} quaternion={face.mouth.quaternion} scale={[1, mouth > 0 ? openScale : 1, 1]}>
        <meshStandardMaterial color={INK} roughness={0.9} />
      </mesh>
      <mesh geometry={geo.mark} position={face.mark.position} quaternion={face.mark.quaternion}>
        <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={0.6} roughness={0.6} />
      </mesh>
    </group>
  );
}
