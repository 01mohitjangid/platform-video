import { useMemo } from "react";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { HEAD } from "./camera";

const WALL = "#141230";
const FRAME = "#0b0a1c";
const WOOD = "#5c3f2a";
const LID = "#171a3a";
/** Screen glow leaking over the lid's top edge. */
const LID_RIM = new Color("#5fd3c6").multiplyScalar(1.2);
const SCREEN = new Color("#a9dfd8").multiplyScalar(1.5);
const BULB = new Color("#ffc07a").multiplyScalar(3);

/** Deterministic pseudo-random in [0,1). */
const rnd = (i: number, salt = 0) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Sky() {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(18, 7);
    const top = new Color("#141138").multiplyScalar(1.6).toArray();
    const bottom = new Color("#3b3fa8").multiplyScalar(2.4).toArray();
    g.setAttribute("color", new Float32BufferAttribute([...top, ...top, ...bottom, ...bottom], 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo} position={[0.2, 3, 7.5]}>
      <meshBasicMaterial vertexColors />
    </mesh>
  );
}

/** Distant city: dark towers plus HDR window lights that the depth of field turns into bokeh discs. */
function City() {
  const { towers, lights } = useMemo(() => {
    const towers: { pos: [number, number, number]; size: [number, number, number] }[] = [];
    const lit: { x: number; y: number; z: number; s: number; c: Color }[] = [];
    for (let i = 0; i < 12; i++) {
      const x = -4.5 + i * 0.82 + (rnd(i) - 0.5) * 0.3;
      const w = 0.5 + rnd(i, 1) * 0.7;
      const h = 0.7 + rnd(i, 2) * 2.2;
      const z = 4.6 + rnd(i, 3) * 1.8;
      towers.push({ pos: [x, -0.6 + h / 2, z], size: [w, h, 0.6] });
      const cols = Math.floor(w / 0.18);
      const rows = Math.floor(h / 0.22);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const k = i * 97 + c * 13 + r;
          if (rnd(k, 4) > 0.5) continue;
          const warm = rnd(k, 5) < 0.72;
          const col = new Color(warm ? "#ffb45a" : "#8fb0ff").multiplyScalar(2.2 + 2 * rnd(k, 6));
          lit.push({
            x: x - w / 2 + 0.09 + c * 0.18 + (rnd(k, 14) - 0.5) * 0.08,
            y: -0.6 + 0.12 + r * 0.22 + (rnd(k, 15) - 0.5) * 0.08,
            z: z - 0.33,
            s: 0.7 + 0.8 * rnd(k, 16),
            c: col,
          });
        }
      }
    }
    for (let i = 0; i < 8; i++) {
      lit.push({
        x: -3.5 + 7 * rnd(i, 11),
        y: 0.6 + 1.9 * rnd(i, 12),
        z: 4 + 1.5 * rnd(i, 13),
        s: 2,
        c: new Color("#ffd29a").multiplyScalar(3),
      });
    }
    const lights = new InstancedMesh(new SphereGeometry(0.035, 6, 4), new MeshBasicMaterial(), lit.length);
    const o = new Object3D();
    lit.forEach((l, i) => {
      o.position.set(l.x, l.y, l.z);
      o.scale.setScalar(l.s);
      o.updateMatrix();
      lights.setMatrixAt(i, o.matrix);
      lights.setColorAt(i, l.c);
    });
    return { towers, lights };
  }, []);
  return (
    <>
      {towers.map((t, i) => (
        <mesh key={i} position={t.pos}>
          <boxGeometry args={t.size} />
          <meshBasicMaterial color="#0e0c26" />
        </mesh>
      ))}
      <primitive object={lights} />
    </>
  );
}

const DUST_VS = /* glsl */ `
attribute float seed;
uniform float uTime;
uniform float uScale;
varying float vA;
void main() {
  vec3 p = position;
  p.x += 0.08 * sin(uTime * 0.23 + seed * 6.2831);
  p.y += 0.05 * sin(uTime * 0.17 + seed * 12.566);
  p.z += 0.06 * cos(uTime * 0.19 + seed * 9.42);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (2.0 + 4.0 * seed) * uScale / -mv.z;
  vA = 0.55 + 0.45 * sin(uTime * 0.9 + seed * 20.0);
}`;

const DUST_FS = /* glsl */ `
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.1, d) * vA;
  gl_FragColor = vec4(vec3(1.0, 0.86, 0.72) * a * 3.0, a);
}`;

function Dust({ time, height }: { time: number; height: number }) {
  const geo = useMemo(() => {
    const n = 220;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = -1.6 + 3.2 * rnd(i, 7);
      pos[i * 3 + 1] = 0.4 + 1.9 * rnd(i, 8);
      pos[i * 3 + 2] = -0.6 + 3.4 * rnd(i, 9);
      seed[i] = rnd(i, 10);
    }
    const g = new PlaneGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("seed", new Float32BufferAttribute(seed, 1));
    g.deleteAttribute("normal");
    g.deleteAttribute("uv");
    g.setIndex(null);
    return g;
  }, []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 1 } }), []);
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        vertexShader={DUST_VS}
        fragmentShader={DUST_FS}
        uniforms={uniforms}
        uniforms-uTime-value={time}
        uniforms-uScale-value={height / 1000}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

function Laptop({ target }: { target: Object3D }) {
  return (
    <group position={[0, 0.74, 0.38]}>
      <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.016, 0.25]} />
        <meshStandardMaterial color={LID} flatShading roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.017, -0.01]}>
        <boxGeometry args={[0.3, 0.004, 0.11]} />
        <meshStandardMaterial color="#15151e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.017, 0.085]}>
        <boxGeometry args={[0.1, 0.003, 0.06]} />
        <meshStandardMaterial color="#1c1c27" roughness={0.6} />
      </mesh>
      {/* Lid hinged on the camera-side edge, leaning away from the person. Screen faces +Z (the person). */}
      <group position={[0, 0.016, -0.125]} rotation-x={-0.24}>
        <mesh position={[0, 0.1175, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.235, 0.012]} />
          <meshStandardMaterial color={LID} flatShading roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.236, -0.0035]}>
          <boxGeometry args={[0.352, 0.005, 0.006]} />
          <meshBasicMaterial color={LID_RIM} />
        </mesh>
        <mesh position={[0, 0.122, 0.0065]}>
          <planeGeometry args={[0.335, 0.205]} />
          <meshBasicMaterial color={SCREEN} />
        </mesh>
        <spotLight position={[0, 0.12, 0.02]} target={target} color="#d7efea" intensity={0.8} angle={0.65} penumbra={0.9} decay={2} />
      </group>
    </group>
  );
}

function Lamp() {
  return (
    <group position={[-0.72, 0.74, 0.62]}>
      <mesh position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.02, 8]} />
        <meshStandardMaterial color="#1a1a24" flatShading roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.05, 0.25, 0]} rotation-z={-0.25} castShadow>
        <boxGeometry args={[0.02, 0.48, 0.02]} />
        <meshStandardMaterial color="#1a1a24" flatShading roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.13, 0.5, 0]} rotation-z={-0.3} castShadow>
        <coneGeometry args={[0.085, 0.1, 6, 1, true]} />
        <meshStandardMaterial color="#1a1a24" flatShading roughness={0.5} metalness={0.4} side={DoubleSide} />
      </mesh>
      <mesh position={[0.13, 0.47, 0]}>
        <sphereGeometry args={[0.02, 6, 4]} />
        <meshBasicMaterial color={BULB} />
      </mesh>
      <pointLight position={[0.13, 0.43, 0]} color="#ffb36b" intensity={0.5} decay={2} distance={3} />
    </group>
  );
}

function Std({ pos, size, color, rot }: { pos: [number, number, number]; size: [number, number, number]; color: string; rot?: [number, number, number] }) {
  return (
    <mesh position={pos} rotation={rot} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} flatShading roughness={0.9} />
    </mesh>
  );
}

export function Room({ time, height }: { time: number; height: number }) {
  const screenTarget = useMemo(() => {
    const o = new Object3D();
    o.position.set(...HEAD);
    return o;
  }, []);
  const deskTop = useMemo(() => new RoundedBoxGeometry(1.7, 0.05, 0.75, 2, 0.012), []);

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 1.5]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0c0b1a" roughness={1} />
      </mesh>

      {/* Back wall with the window opening x∈[-1,1.4] y∈[0.8,2.6] */}
      <Std pos={[-3, 1.7, 3]} size={[4, 3.4, 0.1]} color={WALL} />
      <Std pos={[3.4, 1.7, 3]} size={[4, 3.4, 0.1]} color={WALL} />
      <Std pos={[0.2, 0.4, 3]} size={[2.4, 0.8, 0.1]} color={WALL} />
      <Std pos={[0.2, 3, 3]} size={[2.4, 0.8, 0.1]} color={WALL} />
      <Std pos={[-1, 1.7, 3]} size={[0.06, 1.86, 0.14]} color={FRAME} />
      <Std pos={[1.4, 1.7, 3]} size={[0.06, 1.86, 0.14]} color={FRAME} />
      <Std pos={[0.2, 2.6, 3]} size={[2.46, 0.06, 0.14]} color={FRAME} />
      <Std pos={[0.2, 0.8, 3]} size={[2.46, 0.06, 0.14]} color={FRAME} />
      <Std pos={[0.2, 1.7, 3]} size={[0.05, 1.8, 0.12]} color={FRAME} />
      <Std pos={[0.2, 1.7, 3]} size={[2.4, 0.05, 0.12]} color={FRAME} />
      <Std pos={[0.2, 0.78, 2.9]} size={[2.6, 0.05, 0.2]} color="#1c1a3a" />
      <Sky />
      <City />

      {/* Desk */}
      <mesh geometry={deskTop} position={[0, 0.715, 0.42]} castShadow receiveShadow>
        <meshStandardMaterial color={WOOD} flatShading roughness={0.7} />
      </mesh>
      {[-0.8, 0.8].map((lx) =>
        [0.09, 0.75].map((lz) => <Std key={`${lx}${lz}`} pos={[lx, 0.345, lz]} size={[0.06, 0.69, 0.06]} color="#3e2a1c" />),
      )}

      {/* Chair */}
      <group position={[0.14, 0, 0.9]}>
        <Std pos={[0, 0.43, 0]} size={[0.46, 0.06, 0.46]} color="#1c1c2a" />
        <Std pos={[0, 0.72, 0.2]} size={[0.46, 0.5, 0.06]} color="#1c1c2a" />
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
          <meshStandardMaterial color="#2a2a38" flatShading metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.28, 0.3, 0.03, 5]} />
          <meshStandardMaterial color="#1c1c2a" flatShading roughness={0.7} />
        </mesh>
      </group>

      <Laptop target={screenTarget} />
      <primitive object={screenTarget} />
      {/* Lamp bounce onto the lid back and desk front, so the laptop reads as an object from the camera side. */}
      <pointLight position={[-0.3, 1.0, -0.55]} color="#ffb36b" intensity={0.45} distance={1.3} decay={2} />

      {/* Mug */}
      <group position={[0.55, 0.74, 0.3]}>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.042, 0.038, 0.1, 8]} />
          <meshStandardMaterial color="#d8d4e2" flatShading roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 0.05, 0]}>
          <torusGeometry args={[0.03, 0.009, 4, 8]} />
          <meshStandardMaterial color="#d8d4e2" flatShading roughness={0.5} />
        </mesh>
      </group>

      {/* Notebook + pen */}
      <Std pos={[-0.5, 0.75, 0.45]} size={[0.2, 0.02, 0.27]} color="#20315a" />
      <Std pos={[-0.64, 0.755, 0.4]} size={[0.01, 0.01, 0.14]} color="#d0d0d8" rot={[0, 0.3, 0]} />

      <Lamp />
      <Dust time={time} height={height} />
    </>
  );
}
