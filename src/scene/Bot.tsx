import { useMemo } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, SphereGeometry, TorusGeometry, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Mood } from "../types";
import { BOT_POS } from "./camera";
import { roundedRect } from "./face";
import { blinkState, easeOutCubic, gaze, noise1, smoothstep } from "./motion";

/**
 * FixtureAI "Visor": a white rounded head with a dark teal visor the eyes glow through,
 * an antenna with a teal tip, a small chest body with a teal light, and two floating hands.
 * Faces -Z. `BOT_POS` is the head centre; the body hangs below it.
 */
const INK = "#15181a";
const TEAL = "#14b8a6";
const TEAL_GLOW = "#7ff5e6";
const EYE_GLOW = "#dffcf7";
/** Hides this far below its resting height when `up` is 0 (fully behind the laptop lid). */
const HIDDEN_DROP = 0.275;
const DEG = Math.PI / 180;
const EYE_H = 0.028;
const FRONT = -0.054;

/** White body: a subtle top-to-bottom gradient baked into vertex colours. */
function white(g: BufferGeometry): BufferGeometry {
  g.computeBoundingBox();
  const { min, max } = g.boundingBox!;
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const top = new Color("#ffffff");
  const bottom = new Color("#dfe3e6");
  const c = new Color();
  for (let i = 0; i < p.count; i++) {
    const t = (p.getY(i) - min.y) / Math.max(1e-6, max.y - min.y);
    c.copy(bottom).lerp(top, t);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
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
      head: white(new RoundedBoxGeometry(0.13, 0.1, 0.09, 3, 0.03)),
      visor: new RoundedBoxGeometry(0.105, 0.04, 0.02, 2, 0.01),
      body: white(new RoundedBoxGeometry(0.09, 0.055, 0.06, 2, 0.018)),
      chest: new RoundedBoxGeometry(0.03, 0.012, 0.004, 1, 0.003),
      hand: white(new SphereGeometry(0.015, 7, 5)),
      tip: new SphereGeometry(0.008, 7, 5),
      eye: roundedRect(0.016, EYE_H, 0.006, 0.005),
      happyEye: new TorusGeometry(0.0095, 0.0026, 6, 12, Math.PI * 0.8),
      mouth: roundedRect(0.015, 0.0045, 0.002, 0.004),
      open: roundedRect(0.015, 0.012, 0.004, 0.005),
    }),
    [],
  );

  const u = Math.min(1, Math.max(0, up));
  const [x, restY, z] = BOT_POS;
  // Linear rise with a small overshoot that settles by 1, then a slow hover.
  const hover = 0.004 * Math.sin(2 * Math.PI * 0.23 * time + 1) + 0.002 * noise1(time, 35, 0.4);
  const y = restY - HIDDEN_DROP * (1 - u) + 0.05 * Math.sin(Math.PI * smoothstep(0.6, 1, u)) + hover * u;
  const stretch = 1 + 0.12 * Math.sin(Math.PI * u);
  const scale: [number, number, number] = [1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch)];

  // Mood is held for the whole shot (eased in on the cut); gaze: person while they talk, camera otherwise.
  const g = easeOutCubic(shotTime / 0.35);
  const proud = mood === "proud" ? g : 0;
  const happy = mood === "happy" ? g : 0;
  const eyeSy = mood === "proud" ? 1 - 0.15 * g : 1;
  const gz = gaze(time, 29, personTalking ? [0.003, 0.001] : [0, 0]);
  const closure = blinkState(time, shotTime, 7, gz.saccadeStart);
  const lost = EYE_H * eyeSy * 0.92 * closure;
  const openScale = (0.006 + 0.008 * mouth) / 0.012;

  // Speech energy lights the antenna tip and the chest; word onsets nod the head and lift the hands.
  const talk = speaking ? 0.35 + 0.65 * mouth : 0;
  const tipGlow = 0.5 + 1.8 * accent + 0.6 * talk;
  const chestGlow = 0.35 + 1.2 * talk;
  const nod = -2.2 * DEG * accent;
  const handLift = 0.006 * accent;
  const handSway = (s: number) => 0.004 * Math.sin(2 * Math.PI * 0.3 * time + s) + 0.002 * noise1(time, 36 + s, 0.5);

  const eyeMat = <meshStandardMaterial color={EYE_GLOW} emissive={TEAL_GLOW} emissiveIntensity={1.15 + 0.3 * talk} roughness={0.4} />;

  return (
    <group
      position={[x, y, z]}
      rotation={[1.2 * DEG * noise1(time, 31, 0.3), 1.5 * DEG * noise1(time, 32, 0.25) - 10 * DEG, 1.2 * DEG * noise1(time, 33, 0.2)]}
      scale={scale}
    >
      {/* Head: tilts up when proud, cocks when happy, nods on word onsets. */}
      <group rotation={[nod - 2.5 * DEG * proud + 1.5 * DEG * noise1(time, 37, 0.35), 2 * DEG * noise1(time, 38, 0.3), 4 * DEG * happy + 1.2 * DEG * noise1(time, 39, 0.3)]}>
        <mesh geometry={geo.head} castShadow receiveShadow>
          <meshStandardMaterial vertexColors flatShading roughness={0.6} metalness={0.02} emissive="#ffffff" emissiveIntensity={0.18} />
        </mesh>
        <mesh geometry={geo.visor} position={[0, 0.012, -0.042]}>
          <meshStandardMaterial color="#07302c" roughness={0.3} metalness={0.2} emissive={TEAL} emissiveIntensity={0.15 + 0.1 * talk} />
        </mesh>
        {[1, -1].map((sx) => {
          const base = new Vector3(sx * 0.024, 0.012 + gz.y, FRONT).add(new Vector3(gz.x, 0, 0));
          return mood === "happy" ? (
            <mesh key={sx} geometry={geo.happyEye} position={base.clone().add(new Vector3(0, 0.004 - 0.006 * closure, 0))} scale={[1, 1 - 0.9 * closure, 1]}>
              {eyeMat}
            </mesh>
          ) : (
            <mesh key={sx} geometry={geo.eye} position={base.clone().add(new Vector3(0, -lost / 2, 0))} scale={[1, eyeSy * (1 - 0.92 * closure), 1]}>
              {eyeMat}
            </mesh>
          );
        })}
        <mesh geometry={mouth > 0 ? geo.open : geo.mouth} position={[0, -0.028, FRONT]} scale={[1, mouth > 0 ? openScale : 1, 1]}>
          <meshStandardMaterial color={INK} roughness={0.9} />
        </mesh>
        {/* Antenna, tilted a little to the side, with a teal tip that pulses on word onsets. */}
        <group position={[0.04, 0.05, 0]} rotation={[0, 0, -0.25]}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.0025, 0.0025, 0.04, 6]} />
            <meshStandardMaterial color="#1b2224" roughness={0.7} />
          </mesh>
          <mesh geometry={geo.tip} position={[0, 0.044, 0]}>
            <meshStandardMaterial color={TEAL} emissive={TEAL_GLOW} emissiveIntensity={tipGlow} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Body, chest light, hands. */}
      <mesh geometry={geo.body} position={[0, -0.087, 0]} castShadow receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.6} metalness={0.02} emissive="#ffffff" emissiveIntensity={0.18} />
      </mesh>
      <mesh geometry={geo.chest} position={[0, -0.08, -0.031]}>
        <meshStandardMaterial color={TEAL} emissive={TEAL_GLOW} emissiveIntensity={chestGlow} roughness={0.5} />
      </mesh>
      {[1, -1].map((sx) => (
        <mesh key={sx} geometry={geo.hand} position={[sx * 0.066, -0.085 + handLift + handSway(sx * 2), -0.005]} castShadow>
          <meshStandardMaterial vertexColors flatShading roughness={0.6} emissive="#ffffff" emissiveIntensity={0.18} />
        </mesh>
      ))}
    </group>
  );
}
