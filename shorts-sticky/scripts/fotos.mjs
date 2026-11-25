// usage: node scripts/fotos.mjs <CompositionId> <prefix> <f,f,...> [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [id, prefix, frames, scale = "0.35"] = process.argv.slice(2);
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, chromiumOptions });
const onBrowserLog = (l) => { if (l.type === "error") console.log("[error]", l.text.slice(0, 300)); };
for (const f of frames.split(",").map(Number)) {
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 85, scale: Number(scale), chromiumOptions, timeoutInMilliseconds: 240000, onBrowserLog });
  console.log("still", f);
}
