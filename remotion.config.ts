import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
// The bundled headless shell crashes its GPU process on this Mac. Chrome for
// Testing on the real GPU (ANGLE/Metal) renders clean and ~8x faster than
// software GL, which also produced mosaic/black frames under load.
Config.setChromeMode("chrome-for-testing");
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(4);
// Software GL compiles the post-processing shaders slowly on first use.
Config.setDelayRenderTimeoutInMilliseconds(120000);
