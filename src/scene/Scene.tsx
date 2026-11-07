import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import type { PerspectiveCamera } from "three";
import type { Aspect, CameraPreset, Emotion, Mood, Speaker } from "../types";
import { CAMERA_PRESETS, resolveCamera, type ResolvedCamera } from "./camera";
import { Bot } from "./Bot";
import { Person } from "./Person";
import { Post } from "./Post";
import { Room } from "./Room";

export { CAMERA_PRESETS };

export interface SceneProps {
  camera: CameraPreset;
  /** 0→1 across the current shot; drives a slow dolly push-in. */
  progress: number;
  /** Seconds since video start; drives all idle motion. */
  time: number;
  talking: Speaker | null;
  /** 0..1 speech energy this frame. */
  level: number;
  /** Syllabic mouth 0..1 for the current speaker (already de-chattered upstream). */
  mouth: number;
  /** 1 at each word onset, decaying to 0 over 8 frames. */
  accent: number;
  /** Seconds since the current cut. */
  shotTime: number;
  /** FixtureAI's mood, held through the following person line. */
  mood: Mood;
  emotion: Emotion;
  /** 0 = hidden behind the laptop lid, 1 = fully risen. */
  botUp: number;
  aspect: Aspect;
  width: number;
  height: number;
}

/** Writes the resolved camera onto R3F's default camera before the frame is advanced. */
function Rig({ cam, aspect }: { cam: ResolvedCamera; aspect: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.copy(cam.position);
    camera.quaternion.copy(cam.quaternion);
    camera.fov = cam.fov;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  });
  return null;
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#2b2f7a", "#120a08", 0.6]} />
      {/* Cool indigo fill from the camera-left / window side. */}
      <directionalLight position={[-3, 1.6, -2.5]} color="#3f4ad8" intensity={0.8} />
      {/* Soft white key on FixtureAI so the nut reads white, not indigo. */}
      <pointLight position={[-0.3, 1.45, -0.25]} color="#ffffff" intensity={0.35} distance={1.6} decay={2} />
      {/* Warm ember rim from behind-right. */}
      <directionalLight
        position={[-1.8, 2.6, 2.8]}
        color="#ffb270"
        intensity={4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-1.5}
        shadow-camera-right={1.5}
        shadow-camera-top={1.5}
        shadow-camera-bottom={-1.5}
        shadow-camera-near={0.5}
        shadow-camera-far={8}
      />
    </>
  );
}

export const Scene: React.FC<SceneProps> = (p) => {
  const shot = CAMERA_PRESETS[p.camera][p.aspect];
  const cam = resolveCamera(shot, p.progress, p.time);
  const personTalking = p.talking === "person";
  const botTalking = p.talking === "bot";
  return (
    <ThreeCanvas
      width={p.width}
      height={p.height}
      style={{ position: "absolute", inset: 0 }}
      dpr={1}
      shadows
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: 40, near: 0.05, far: 40 }}
    >
      <color attach="background" args={["#07061a"]} />
      <Rig cam={cam} aspect={p.width / p.height} />
      <Lights />
      <Room time={p.time} height={p.height} />
      <Person
        time={p.time}
        shotTime={p.shotTime}
        emotion={p.emotion}
        talking={personTalking}
        listening={botTalking}
        mouth={personTalking ? p.mouth : 0}
        accent={personTalking ? p.accent : 0}
      />
      <Bot
        time={p.time}
        shotTime={p.shotTime}
        up={p.botUp}
        mood={p.mood}
        speaking={botTalking}
        personTalking={personTalking}
        mouth={botTalking ? p.mouth : 0}
        accent={botTalking ? p.accent : 0}
      />
      <Post focusDistance={cam.focusDistance} focusRange={shot.range} bokehScale={shot.bokeh} />
    </ThreeCanvas>
  );
};
