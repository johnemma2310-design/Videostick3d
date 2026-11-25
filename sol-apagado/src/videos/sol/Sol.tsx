// "Sol apagado" short in the flat-characters-in-a-3D-toon-world style, with the template's post
// chain: InkPass -> lens blur pre + main -> bloom -> NEUTRAL tone map -> grade, MSAA 4. Shot changes crossfade by
// stacking a second canvas. Captions and voice are added afterwards with ffmpeg (one word at a time).
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World } from "./world";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { layersAt, dofAt, MARKS, COUNT, smooth } from "./story";

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const Inner: React.FC<{ id: number }> = ({ id }) => {
  const f = useCurrentFrame();
  const { camera, scene, gl, size } = useThree();
  const world = useMemo(() => new World(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  // the R3F <EffectComposer> (3.2.x) rendered blank under Remotion here: drive postprocessing's composer by hand
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera));
    c.addPass(fx.ink);
    c.addPass(new EffectPass(camera, fx.lens.pre));
    c.addPass(new EffectPass(camera, fx.lens.main));
    c.addPass(new EffectPass(camera, fx.bloom, fx.tone, fx.grade));
    return c;
  }, [gl, scene, camera, fx]);
  useEffect(() => { composer.setSize(size.width, size.height); }, [composer, size.width, size.height]);
  useFrame(() => { composer.render(); }, 1);
  const cam = camera as THREE.PerspectiveCamera;
  const target = world.update(id, f, cam, scene);
  noInkFallback(world.root);
  const d = dofAt(id, f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, "day");
  return <primitive object={world.root} dispose={null} />;
};

const dprOverride = () => (getInputProps() as { dpr?: number }).dpr;
const ShotView: React.FC<{ id: number; alpha: number }> = ({ id, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.1, far: 5000 }}>
      <Inner id={id} />
    </ThreeCanvas>
  </AbsoluteFill>
);

// ---- titles + the countdown: a quiet line at the top of the frame ----
const FONT = "'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif";
const Title: React.FC<{ f: number; a: number; b: number; label: string; sub: string; col: string; y?: number }> = ({ f, a, b, label, sub, col, y = 300 }) => {
  const pop = smooth((f - a) / 6), out = 1 - smooth((f - (b - 6)) / 6);
  return (
    <g opacity={out}>
      <g transform={`translate(540,${y}) scale(${0.85 + 0.15 * pop})`} opacity={pop}>
        <text textAnchor="middle" y={0} fontFamily={FONT} fontSize={88} fill={col} stroke="#1a1010" strokeWidth={8} paintOrder="stroke">{label}</text>
        {sub && <text textAnchor="middle" y={52} fontFamily={FONT} fontSize={42} fill="#fff" stroke="#1a1010" strokeWidth={7} paintOrder="stroke">{sub}</text>}
      </g>
    </g>
  );
};
const Overlay: React.FC<{ f: number }> = ({ f }) => {
  const live = MARKS.filter((m) => f >= m.a && f <= m.b);
  const counting = f >= COUNT.a && f <= COUNT.hide;
  let clock = "";
  if (counting) {
    const left = Math.max(0, Math.round(COUNT.from * (1 - (f - COUNT.a) / (COUNT.b - COUNT.a))));
    clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  }
  if (!live.length && !counting) return null;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {live.map((m) => <Title key={m.label} f={f} {...m} />)}
        {counting && <Title f={f} a={COUNT.a} b={COUNT.hide} label={clock} sub={f >= COUNT.b ? "" : "para enterarte"} col={f >= COUNT.b ? "#ff5a4a" : "#ffffff"} />}
      </svg>
    </AbsoluteFill>
  );
};

export const SolShort: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#9cbfea" }}>
      {layersAt(f).map((l) => <ShotView key={`shot${l.id}`} id={l.id} alpha={l.alpha} />)}
      <Overlay f={f} />
    </AbsoluteFill>
  );
};
