// Generic short: one canvas per live shot (crossfades stack a second one), post chain InkPass -> lens blur ->
// bloom -> NEUTRAL tone map -> grade (MSAA 4), titles at the top. Audio + subtitles are added after the render.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, getInputProps, delayRender, continueRender } from "remotion";
import { cargarFoto, fotoEstado } from "./cameo";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World } from "./world";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { smooth } from "./timeline";
import { dims, type Story } from "./types";

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const Inner: React.FC<{ id: number; story: Story }> = ({ id, story }) => {
  const f = useCurrentFrame();
  const { camera, scene, gl, size } = useThree();
  const world = useMemo(() => new World(story), [story]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera), lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(), tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera)); c.addPass(fx.ink);
    c.addPass(new EffectPass(camera, fx.lens.pre)); c.addPass(new EffectPass(camera, fx.lens.main));
    c.addPass(new EffectPass(camera, fx.bloom, fx.tone, fx.grade));
    return c;
  }, [gl, scene, camera, fx]);
  useEffect(() => { composer.setSize(size.width, size.height); }, [composer, size.width, size.height]);
  useFrame(() => { composer.render(); }, 1);
  const cam = camera as THREE.PerspectiveCamera;
  const target = world.update(id, f, cam, scene);
  noInkFallback(world.root);
  const d = story.dofAt(id, f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd)); fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, "day");
  return <primitive object={world.root} dispose={null} />;
};

const dprOverride = () => (getInputProps() as { dpr?: number }).dpr;
const ShotView: React.FC<{ id: number; alpha: number; story: Story }> = ({ id, alpha, story }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={dims(story).width} height={dims(story).height} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.1, far: 5000 }}>
      <Inner id={id} story={story} />
    </ThreeCanvas>
  </AbsoluteFill>
);

const FONT = "'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif";
const Overlay: React.FC<{ f: number; story: Story; speed: number }> = ({ f, story, speed }) => {
  const live = story.MARKS.filter((m) => f >= m.a && f <= m.b);
  // horizontal: títulos más arriba y un poco más chicos (la mitad de abajo es de los subtítulos)
  const { width: W, height: H } = dims(story), hz = W > H, tx = W / 2, ty = hz ? 150 : 300, fs = hz ? 80 : 88, fsub = hz ? 40 : 42;
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        {speed > 0.01 && Array.from({ length: hz ? 22 : 26 }, (_, i) => {
          const y = hz ? ((i * 197 + 61) % (H - 20)) : ((i * 197 + 61) % 1900), x = ((i * 389 + f * 90) % (W + 420)) - 300, len = (180 + (i % 5) * 60) * (hz ? 1.3 : 1);
          return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke="#ffffff" strokeOpacity={0.55 * speed} strokeWidth={4 + (i % 3) * 2} strokeLinecap="round" />;
        })}
        {live.map((m) => {
          const pop = smooth((f - m.a) / 6), out = 1 - smooth((f - (m.b - 6)) / 6);
          return (
            <g key={m.label + m.a} opacity={out}>
              <g transform={`translate(${tx},${ty}) scale(${0.85 + 0.15 * pop})`} opacity={pop}>
                <text textAnchor="middle" y={0} fontFamily={FONT} fontSize={fs} fill={m.col} stroke="#1a1010" strokeWidth={8} paintOrder="stroke">{m.label}</text>
                {m.sub && <text textAnchor="middle" y={hz ? 48 : 52} fontFamily={FONT} fontSize={fsub} fill="#fff" stroke="#1a1010" strokeWidth={7} paintOrder="stroke">{m.sub}</text>}
              </g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** precarga la foto del cameo (story.cameo) antes de pintar el primer cuadro; si no existe se dibuja un "?" */
const useFotoCameo = (story: Story) => {
  const foto = story.cameo?.foto;
  const [h] = useState(() => (foto && fotoEstado(foto) === "cargando" ? delayRender("foto del cameo") : null));
  const [, listo] = useState(0);
  useEffect(() => { if (h === null || !foto) return; cargarFoto(foto).then(() => { listo(1); continueRender(h); }); }, [h, foto]);
};

export const makeShort = (story: Story): React.FC => () => {
  const f = useCurrentFrame();
  useFotoCameo(story);
  const layers = story.layersAt(f), top = layers[layers.length - 1];
  return (
    <AbsoluteFill style={{ background: "#9cbfea" }}>
      {layers.map((l) => <ShotView key={`shot${l.id}`} id={l.id} alpha={l.alpha} story={story} />)}
      <Overlay f={f} story={story} speed={story.state(top.id, f).speedLines ?? 0} />
      {story.overlay && <AbsoluteFill>{story.overlay(f)}</AbsoluteFill>}
    </AbsoluteFill>
  );
};
