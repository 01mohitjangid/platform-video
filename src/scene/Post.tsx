import { useFrame, useThree } from "@react-three/fiber";
import {
  BlendFunction,
  BloomEffect,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  MaskFunction,
  NoiseEffect,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from "postprocessing";
import { useLayoutEffect, useMemo } from "react";
import { HalfFloatType } from "three";

interface PostProps {
  focusDistance: number;
  focusRange: number;
  bokehScale: number;
}

/**
 * Composer built directly on `postprocessing`, synchronously in useMemo, so it is ready
 * before @remotion/three calls `advance()` for the first frame. (The React wrapper creates
 * its composer in a passive effect + setState and renders black on that first call.)
 */
export function Post({ focusDistance, focusRange, bokehScale }: PostProps) {
  const { gl, scene, camera, size } = useThree();

  const fx = useMemo(() => {
    const composer = new EffectComposer(gl, { multisampling: 4, frameBufferType: HalfFloatType });
    composer.addPass(new RenderPass(scene, camera));
    const dof = new DepthOfFieldEffect(camera, { focusDistance, focusRange, bokehScale, resolutionScale: 0.5 });
    dof.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA;
    const bloom = new BloomEffect({
      luminanceThreshold: 0.9,
      luminanceSmoothing: 0.25,
      intensity: 0.9,
      mipmapBlur: true,
      radius: 0.7,
    });
    const tone = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
    const vignette = new VignetteEffect({ offset: 0.3, darkness: 0.9 });
    const noise = new NoiseEffect({ premultiply: true, blendFunction: BlendFunction.SCREEN });
    noise.blendMode.opacity.value = 0.04;
    composer.addPass(new EffectPass(camera, dof, bloom, tone, vignette, noise));
    return { composer, dof };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus params are applied below per frame
  }, [gl, scene, camera]);

  useLayoutEffect(() => {
    fx.composer.setSize(size.width, size.height);
  }, [fx, size.width, size.height]);

  useLayoutEffect(() => () => fx.composer.dispose(), [fx]);

  useLayoutEffect(() => {
    fx.dof.cocMaterial.focusDistance = focusDistance;
    fx.dof.cocMaterial.focusRange = focusRange;
    fx.dof.bokehScale = bokehScale;
  });

  useFrame(() => fx.composer.render(1 / 30), 1);
  return null;
}
