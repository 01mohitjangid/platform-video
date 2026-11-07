import { Composition, registerRoot, useVideoConfig } from "remotion";
import { Scene, type SceneProps } from "./Scene";

/** Dev harness: `npx remotion still src/scene/dev-entry.tsx SceneDev out/dev/x.png --props='{"camera":"wide",...}'` */
type DevProps = Omit<SceneProps, "aspect" | "width" | "height">;

const Dev: React.FC<DevProps> = (p) => {
  const { width, height } = useVideoConfig();
  return <Scene {...p} width={width} height={height} aspect={width > height ? "landscape" : "portrait"} />;
};

const defaults: DevProps = {
  camera: "wide",
  progress: 0.3,
  time: 1,
  talking: null,
  level: 0,
  emotion: "tired",
  botUp: 1,
  mouth: 0,
  accent: 0,
  shotTime: 2,
  mood: "neutral",
};

const Root = () => (
  <>
    <Composition id="SceneDev" component={Dev} width={1080} height={1920} fps={30} durationInFrames={150} defaultProps={defaults} />
    <Composition id="SceneDevWide" component={Dev} width={1920} height={1080} fps={30} durationInFrames={150} defaultProps={defaults} />
  </>
);

registerRoot(Root);
