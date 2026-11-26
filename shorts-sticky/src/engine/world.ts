// Generic stickman world, posed per frame from a Story's SceneState. Four sets far apart (only the active one is
// visible): park (0,0), street (STREET_X,0), beach (BEACH_X,0), space (its own group at the origin).
import { bocaAt } from "./timeline";
import * as THREE from "three";
import { Pen } from "./toon";
import { Pool, Actor, Fx, Stage, tier, tierW, tierX, blob, BODY, WIDE, XBODY, XSHIFT } from "./troop";
import { NOINK } from "./ink";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { grassHD, cloudHD, rep, ctex } from "./paint";
import { type StickyOpts, sticky, person, dog, cat, bird, turtle, penguin, car, wave, cow, chicken, pig, fishCard, beetle, spinTop, plane } from "./stick";
import type { Story, Env, Card, V3 } from "./types";
import { FPS, hh, smooth } from "./timeline";
import { buildSets, updateSets, SetRefs, moverFlotantes, type Flotantes } from "./sets";
import { cameoDraw, fotoEstado } from "./cameo";

export const STREET_X = 400, BEACH_X = -400;
const lam = (p: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(p));
const SUN_DIR = new THREE.Vector3(-0.18, 0.45, -0.87).normalize();
const MOON_DIR = new THREE.Vector3(0.32, 0.42, -0.85).normalize();
const MILKY_DIR = new THREE.Vector3(-0.1, 0.8, -0.55).normalize();

const DAY: LightPreset = { ...LIGHTS.day };
const DUSK: LightPreset = { ...LIGHTS.golden, el: 18, lit: [1.45, 0.95, 0.62], shade: [0.22, 0.2, 0.34], charTint: [1.0, 0.84, 0.74] };
const UNDER: LightPreset = { ...LIGHTS.day, lit: [0.85, 1.15, 1.35], shade: [0.2, 0.32, 0.45], lift: [0.04, 0.08, 0.12], charTint: [0.8, 1.0, 1.15], sunCol: "#bfe8ff", sunI: 2.0, sky: "#7fd0ff", ground: "#2a6a8a", hemiI: 0.8 };
const NIGHT: LightPreset = { ...LIGHTS.day, lit: [0.45, 0.5, 0.8], shade: [0.14, 0.15, 0.27], lift: [0.03, 0.04, 0.1], charTint: [0.6, 0.66, 0.98], sunCol: "#9fb4ff", sunI: 0.9, sky: "#3a4a80", ground: "#1c2238", hemiI: 0.5 };
const SKY: Record<Env, string[]> = {
  day: LOOK.day.sky.c, dusk: ["#ffc47c", "#f7ae78", "#e8967c", "#9a7aa0", "#4e4a7a"],
  night: ["#1d2748", "#162040", "#101934", "#0b1228", "#070b1a"], underwater: ["#1f8fc8", "#1a7fb8", "#166ea6", "#125c92", "#0e4a7a"], space: ["#03040a", "#03040a", "#03040a", "#03040a", "#03040a"],
};
const FOG: Record<Env, [string, number, number]> = { day: ["#b8d0ec", 40, 230], dusk: ["#e9a982", 35, 220], night: ["#141b33", 18, 140], underwater: ["#1d86bf", 2, 34], space: ["#000", 1e5, 2e5] };

const glowTex = () => ctex("glowRad", 256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,230,150,1)"); gr.addColorStop(0.35, "rgba(255,190,90,0.5)"); gr.addColorStop(1, "rgba(255,150,40,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
});
const sunTex = () => ctex("sunToon", 512, 512, (g) => {
  g.translate(256, 256); g.fillStyle = "#ffb42a"; g.strokeStyle = "#241726"; g.lineWidth = 10;
  for (let k = 0; k < 12; k++) { g.save(); g.rotate((k / 12) * Math.PI * 2); g.beginPath(); g.moveTo(-26, -150); g.lineTo(0, -240); g.lineTo(26, -150); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.beginPath(); g.arc(0, 0, 150, 0, Math.PI * 2); g.fillStyle = "#ffd23f"; g.fill(); g.stroke();
});
const moonTex = () => ctex("moonToon", 256, 256, (g) => {
  g.beginPath(); g.arc(128, 128, 110, 0, Math.PI * 2); g.fillStyle = "#f4f1e6"; g.fill();
  for (const [x, y, r] of [[96, 100, 18], [160, 150, 24], [120, 176, 12], [170, 92, 10]]) { g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fillStyle = "#d9d3c2"; g.fill(); }
  g.beginPath(); g.arc(128, 128, 110, 0, Math.PI * 2); g.strokeStyle = "#241726"; g.lineWidth = 8; g.stroke();
});
const milkyTex = () => ctex("milkyWay", 1024, 256, (g, r) => {
  for (let i = 0; i < 900; i++) {
    const x = r() * 1024, y = 128 + (r() - 0.5) * (90 + 60 * Math.sin(x / 140)), rr = 10 + r() * 50, gr = g.createRadialGradient(x, y, 0, x, y, rr);
    const c = r() < 0.7 ? "200,210,255" : "255,220,200"; gr.addColorStop(0, `rgba(${c},0.07)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
  }
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; g.fillRect(r() * 1024, 128 + (r() - 0.5) * 150 * r(), 1.5, 1.5); }
  for (let i = 0; i < 30; i++) { const x = r() * 1024, y = 128 + (r() - 0.5) * 40; g.fillStyle = "rgba(20,14,30,0.35)"; g.beginPath(); g.ellipse(x, y, 40 + r() * 60, 6 + r() * 8, 0.1, 0, 6.3); g.fill(); }
});
const earthTex = () => ctex("earthToon", 1024, 512, (g, r) => {
  g.fillStyle = "#2f7fd0"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 9; i++) { const cx = r() * 1024, cy = 120 + r() * 280; g.fillStyle = i % 3 ? "#5fb34e" : "#c9a865"; g.beginPath(); for (let k = 0; k < 14; k++) { const a = (k / 14) * 6.28, rr = 50 + r() * 70; g.lineTo(cx + Math.cos(a) * rr * 1.4, cy + Math.sin(a) * rr * 0.8); } g.closePath(); g.fill(); }
  g.fillStyle = "#f4f7fb"; g.fillRect(0, 0, 1024, 40); g.fillRect(0, 472, 1024, 40);
  for (let i = 0; i < 14; i++) { g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(r() * 1024, 60 + r() * 400, 40 + r() * 60, 10 + r() * 8, 0, 0, 6.3); g.fill(); }
});
const moonSurf = () => ctex("moonSurf", 512, 256, (g, r) => {
  g.fillStyle = "#cfcac0"; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 60; i++) { g.fillStyle = r() < 0.5 ? "#b3ad a2".replace(" ", "") : "#a8a296"; g.beginPath(); g.arc(r() * 512, r() * 256, 4 + r() * 22, 0, 6.3); g.fill(); }
});
const asphalt = () => ctex("asphalt", 512, 512, (g, r) => {
  g.fillStyle = "#55565e"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1500; i++) { g.fillStyle = r() < 0.5 ? "rgba(30,30,36,0.35)" : "rgba(120,120,130,0.3)"; g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
  g.fillStyle = "#f2e6b8"; for (let y = 0; y < 512; y += 128) g.fillRect(250, y, 12, 70); // centre dashes
});
const pavement = () => ctex("pavement", 256, 256, (g) => {
  g.fillStyle = "#b9b4aa"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(90,86,80,0.6)"; g.lineWidth = 3;
  for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
});
const sandTex = () => ctex("sand", 512, 512, (g, r) => {
  g.fillStyle = "#ecd39a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? "rgba(200,170,110,0.35)" : "rgba(255,245,210,0.4)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 6, 1 + r() * 3, 0, 0, 6.3); g.fill(); }
});
const seaTex = () => ctex("sea", 512, 512, (g, r) => {
  g.fillStyle = "#2f86c8"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(220,240,255,0.55)"; g.lineWidth = 4;
  for (let i = 0; i < 60; i++) { const x = r() * 512, y = r() * 512; g.beginPath(); g.arc(x, y, 14 + r() * 20, 3.6, 5.8); g.stroke(); }
});
/** a facade tile of 4 x 4 windows: colour map + emissive map (lit windows) */
const facade = (key: string, wall: string, seed: number) => {
  const map = ctex(`fac_${key}`, 512, 512, (g) => {
    g.fillStyle = wall; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      g.fillStyle = "#2c3a56"; g.fillRect(i * 128 + 30, j * 128 + 26, 68, 80);
      g.strokeStyle = "#241726"; g.lineWidth = 6; g.strokeRect(i * 128 + 30, j * 128 + 26, 68, 80);
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(i * 128 + 36, j * 128 + 32, 20, 68);
    }
  });
  const em = ctex(`facE_${key}`, 512, 512, (g) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (hh(i * 4 + j, seed) < 0.62) { g.fillStyle = hh(i * 7 + j, seed + 1) < 0.5 ? "#ffd27a" : "#fff0c0"; g.fillRect(i * 128 + 33, j * 128 + 29, 62, 74); }
  });
  return { map, em };
};

// ---- point clouds ----
const STAR_VS = `attribute float aSeed; uniform float uT; uniform float uPx; varying float vA;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((1.2 + 2.6 * fract(aSeed * 7.13)) * uPx / 1000.0, 1.0, 8.0);
  vA = 0.55 + 0.45 * sin(uT * (1.5 + 3.0 * fract(aSeed * 3.7)) + aSeed * 40.0); }`;
const STAR_FS = `uniform float uFade; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; if (r > 1.0) discard;
  gl_FragColor = vec4(vec3(1.0, 0.97, 0.88) * (1.0 - r * r) * vA * uFade * 1.6, 1.0); }`;
const pxOf = (r: THREE.WebGLRenderer, c: THREE.Camera) => { const rt = r.getRenderTarget(), h = rt ? rt.height : r.domElement.height; return h / (2 * Math.tan(THREE.MathUtils.degToRad((c as THREE.PerspectiveCamera).fov) / 2)); };

/** Sticky musculoso (musc > 0) va en la tarjeta ancha XBODY: el dibujo se corre XSHIFT a la derecha */
const xcard = (c: Card) => c.kind === "sticky" && (c.o.musc ?? 0) > 0;
const drawCard = (c: Card) => (p: Pen) => {
  switch (c.kind) {
    case "sticky": if (xcard(c)) p.g.translate(XSHIFT, 0); return sticky(p, c.o);
    case "person": return person(p, c.o);
    case "dog": return dog(p, c.o);
    case "cat": return cat(p, c.o);
    case "bird": return bird(p, c.o);
    case "turtle": return turtle(p, c.o);
    case "penguin": return penguin(p, c.o);
    case "car": return car(p, c.o);
    case "wave": return wave(p, c.o);
    case "cow": return cow(p, c.o);
    case "chicken": return chicken(p, c.o);
    case "pig": return pig(p, c.o);
    case "fish": return fishCard(p, c.o);
    case "beetle": return beetle(p, c.o);
    case "top": return spinTop(p, c.o);
    case "plane": return plane(p, c.o);
    case "cameo": return cameoDraw(p, c.o);
  }
};

export class World {
  root = new THREE.Group();
  private sets: Record<string, THREE.Group> = Object.fromEntries(["park", "street", "beach", "space", "house", "elevator", "hospital", "store", "classroom", "desert", "reef", "farm", "gym"].map((k) => [k, new THREE.Group()]));
  private setRefs!: SetRefs;
  /** objetos sueltos de cada escenario que flotan con S.flota */
  private flotan: Flotantes = {};
  private pool = new Pool(); private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight; private sunPoint: THREE.PointLight; private amb: THREE.AmbientLight;
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh; private fog = new THREE.Fog("#bccbec", 40, 260);
  private clouds: THREE.Mesh[] = []; private sunDisc: THREE.Mesh; private sunGlow: THREE.Mesh; private moonDisc: THREE.Mesh; private moonMat: THREE.MeshBasicMaterial; private milky: THREE.Mesh;
  private stars = { uT: { value: 0 }, uPx: { value: 1000 }, uFade: { value: 0 } }; private starPts: THREE.Points;
  private winMats: THREE.MeshLambertMaterial[] = []; private lampHeads: THREE.MeshBasicMaterial[] = []; private lampGlows: THREE.Mesh[] = [];
  private tl: { r: THREE.MeshBasicMaterial; y: THREE.MeshBasicMaterial; g: THREE.MeshBasicMaterial } | null = null;
  private sea: THREE.Mesh; private seaTex: THREE.Texture;
  private sunBall: THREE.Mesh; private sunBallM: THREE.MeshBasicMaterial; private corona: THREE.Mesh; private earthG = new THREE.Group(); private earth: THREE.Mesh; private axis: THREE.Mesh; private moonBall: THREE.Mesh;
  private sunCache = new Map<number, THREE.Vector3>();
  private parkGround!: THREE.Mesh; private grassM!: THREE.MeshLambertMaterial; private snowM!: THREE.MeshLambertMaterial; private greens: THREE.MeshLambertMaterial[] = []; private pathM!: THREE.MeshLambertMaterial; private crossM!: THREE.MeshLambertMaterial;
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  /** horizontal (1080 de alto): las tarjetas se ven más chicas en pixeles, así que basta menos resolución */
  private tierK = 1; private hz = false;
  constructor(private story: Story) {
    const R = this.root;
    this.hz = story.formato === "horizontal"; this.tierK = this.hz ? 1920 / 1080 : 1;
    for (const g of Object.values(this.sets)) R.add(g);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(2400, 48, 24), this.skyMat); this.sky.renderOrder = -3; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    { // stars all around
      const N = 2600, pos = new Float32Array(N * 3), sd = new Float32Array(N);
      for (let i = 0; i < N; i++) { const u = hh(i, 70) * 2 - 1, a = hh(i, 71) * 6.283, y = (i % 2 ? 1 : -1) * (Math.abs(u) * 0.92 + 0.05), rr = Math.sqrt(1 - y * y); pos.set([Math.cos(a) * rr * 2000, y * 2000, Math.sin(a) * rr * 2000], i * 3); sd[i] = hh(i, 72) * 10; }
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
      this.starPts = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: this.stars, vertexShader: STAR_VS, fragmentShader: STAR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      this.starPts.frustumCulled = false; this.starPts.layers.set(NOINK); this.starPts.renderOrder = -2;
      const u = this.stars.uPx; this.starPts.onBeforeRender = (r, _s, c) => { u.value = pxOf(r, c); }; R.add(this.starPts);
    }
    this.milky = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: milkyTex(), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    this.milky.scale.set(2400, 600, 1); this.milky.layers.set(NOINK); this.milky.renderOrder = -2; R.add(this.milky);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6); this.sun.castShadow = true; this.sun.shadow.mapSize.set(this.hz ? 4096 : 2048, this.hz ? 4096 : 2048);
    this.sunPoint = new THREE.PointLight("#fff1d0", 3.2, 0, 0); this.amb = new THREE.AmbientLight("#405080", 0);
    R.add(this.hemi, this.sun, this.sun.target, this.sunPoint, this.amb);
    // sky discs + clouds (follow the camera, in every outdoor set)
    this.sunGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0.45, color: new THREE.Color(1, 0.85, 0.6) }));
    this.sunGlow.scale.setScalar(300); this.sunGlow.layers.set(NOINK); R.add(this.sunGlow);
    this.sunDisc = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: sunTex(), transparent: true, depthWrite: false, fog: false, color: new THREE.Color(1.5, 1.4, 1.2) }));
    this.sunDisc.scale.setScalar(140); this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    this.moonMat = new THREE.MeshBasicMaterial({ map: moonTex(), transparent: true, depthWrite: false, fog: false });
    this.moonDisc = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.moonMat); this.moonDisc.scale.setScalar(70); this.moonDisc.layers.set(NOINK); R.add(this.moonDisc);
    const cm = [0, 1, 2, 3].map((k) => cloudHD(k));
    for (let i = 0; i < 18; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cm[i % 4], transparent: true, depthWrite: false, fog: false }));
      const w = 110 + hh(i, 23) * 100; m.scale.set(w, w / 2, 1); m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    this.buildPark(); this.buildStreet(); this.buildBeach(); this.setRefs = buildSets(this.sets, this.flotan);
    // ---- space ----
    const S = this.sets.space;
    this.sunBallM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 0.6, 0.1) });
    this.sunBall = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), this.sunBallM); S.add(this.sunBall);
    this.corona = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.4, 1.1, 0.8) }));
    this.corona.layers.set(NOINK); S.add(this.corona);
    const grad = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]), 2, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
    const et = earthTex(); et.wrapS = THREE.RepeatWrapping;
    this.earth = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.MeshToonMaterial({ map: et, gradientMap: grad }));
    this.axis = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.0, 8), new THREE.MeshBasicMaterial({ color: "#ff5a4a" }));
    this.earthG.add(this.earth, this.axis); S.add(this.earthG);
    this.moonBall = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshToonMaterial({ map: moonSurf(), gradientMap: grad })); S.add(this.moonBall);
    this.sea = this.sets.beach.getObjectByName("sea") as THREE.Mesh; this.seaTex = (this.sea.material as THREE.MeshLambertMaterial).map!;
  }

  private hills(g: THREE.Group, cx: number, col: string) {
    const m = lam({ color: col }); if (col === "#6fae57") this.greens.push(m);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2, d = 150 + hh(k, 8) * 50;
      const h = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), m);
      h.position.set(cx + Math.cos(a) * d, -2, Math.sin(a) * d); h.scale.set(50 + hh(k, 9) * 40, 14 + hh(k, 10) * 16, 40 + hh(k, 11) * 20); g.add(h);
    }
  }
  private tree(g: THREE.Group, x: number, z: number, s: number, palm = false) {
    const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s);
    if (palm) {
      const tm = lam({ color: "#9a7046" }), lm = lam({ color: "#4f9a3c" });
      for (let i = 0; i < 6; i++) { const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.75, 8), tm); seg.position.set(i * i * 0.02, 0.37 + i * 0.72, 0); seg.rotation.z = -i * 0.04; seg.castShadow = true; t.add(seg); }
      for (let k = 0; k < 7; k++) { const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), lm); leaf.scale.set(1.5, 0.12, 0.38); leaf.position.set(0.5 + Math.cos(k * 0.9) * 1.1, 4.3 - 0.25, Math.sin(k * 0.9) * 1.1); leaf.rotation.y = -k * 0.9; leaf.rotation.z = -0.35; leaf.castShadow = true; t.add(leaf); }
    } else {
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 2.4, 10), lam({ color: "#7a5236" })); tr.position.y = 1.2; tr.castShadow = true; t.add(tr);
      const cm = lam({ color: "#5aa84a" }); this.greens.push(cm);
      for (const [a, b, c, r] of [[0, 3.1, 0, 1.35], [0.7, 2.6, 0.3, 0.95], [-0.65, 2.7, -0.2, 1.0]]) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), cm); m.position.set(a, b, c); m.castShadow = true; t.add(m); }
    }
    g.add(t);
  }
  private buildPark() {
    const g = this.sets.park;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320).rotateX(-Math.PI / 2), lam({ map: rep(grassHD(), 40, 40) })); ground.receiveShadow = true; g.add(ground);
    this.parkGround = ground; this.grassM = ground.material as THREE.MeshLambertMaterial;
    this.snowM = lam({ map: rep(ctex("snowGround", 512, 512, (gg, r) => { gg.fillStyle = "#e8f0fb"; gg.fillRect(0, 0, 512, 512); for (let i = 0; i < 500; i++) { gg.fillStyle = r() < 0.5 ? "rgba(170,190,225,0.35)" : "rgba(255,255,255,0.7)"; gg.beginPath(); gg.ellipse(r() * 512, r() * 512, 3 + r() * 14, 2 + r() * 6, 0, 0, 6.3); gg.fill(); } }), 40, 40) });
    const pathTex = ctex("pathDirt", 512, 512, (gg, r) => { gg.fillStyle = "#c9a878"; gg.fillRect(0, 0, 512, 512); for (let i = 0; i < 700; i++) { gg.fillStyle = r() < 0.5 ? "rgba(140,110,76,0.4)" : "rgba(230,210,170,0.4)"; gg.beginPath(); gg.ellipse(r() * 512, r() * 512, 2 + r() * 8, 1 + r() * 4, 0, 0, 6.3); gg.fill(); } });
    const path = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 80).rotateX(-Math.PI / 2), lam({ map: rep(pathTex, 1, 18) })); this.pathM = path.material as THREE.MeshLambertMaterial; path.position.set(0, 0.012, -20); path.receiveShadow = true; g.add(path);
    const cross = new THREE.Mesh(new THREE.PlaneGeometry(60, 2.4).rotateX(-Math.PI / 2), lam({ map: rep(pathTex, 14, 1) })); this.crossM = cross.material as THREE.MeshLambertMaterial; cross.position.set(0, 0.013, -6); cross.receiveShadow = true; g.add(cross);
    for (let k = 0, n = 0; n < 30 && k < 500; k++) {
      const a = hh(k, 1) * Math.PI * 2, d = 8 + hh(k, 2) * 30, x = Math.cos(a) * d, z = Math.sin(a) * d - 8;
      if (z > -1 && Math.abs(x) < 9) continue; if (Math.abs(x) < 2.5 || Math.abs(z + 6) < 2.5) continue;
      this.tree(g, x, z, 0.8 + hh(k, 3) * 0.6); n++;
    }
    const wood = lam({ color: "#a8743c" }), iron = lam({ color: "#3a3a44" });
    for (const [bx, bz, ry] of [[-3, -3.2, 0], [3.2, -3.2, 0], [-3.5, -9, 0.4]]) {
      const b = new THREE.Group(); b.position.set(bx, 0, bz); b.rotation.y = ry;
      (this.flotan.park ??= []).push({ o: b, p: b.position.clone(), r: b.rotation.clone(), h: 2.2 + hh(bx, 3) * 1.2, ph: bx * 1.7, sp: 0.8, dx: 0, dz: 0 });
      for (const [y, z, h] of [[0.45, 0, 0.06], [0.75, -0.22, 0.32]]) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.6, h, 0.42), wood); s.position.set(0, y, z); s.castShadow = true; b.add(s); }
      for (const x of [-0.7, 0.7]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.45, 0.4), iron); l.position.set(x, 0.22, 0); b.add(l); }
      g.add(b);
    }
    this.hills(g, 0, "#6fae57");
  }
  private buildStreet() {
    const g = this.sets.street, X = STREET_X;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 300).rotateX(-Math.PI / 2), lam({ map: rep(asphalt(), 1, 40) })); road.position.set(X, 0, 0); road.receiveShadow = true; g.add(road);
    const pv = pavement();
    for (const s of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(5, 0.16, 300), lam({ map: rep(pv, 3, 180) })); sw.position.set(X + s * 7, 0.08, 0); sw.receiveShadow = true; g.add(sw);
    }
    const far = new THREE.Mesh(new THREE.PlaneGeometry(320, 320).rotateX(-Math.PI / 2), lam({ color: "#7a7a80" })); far.position.set(X, -0.02, 0); far.receiveShadow = true; g.add(far);
    const walls = ["#e7b98e", "#cfd6e2", "#e8d7a8", "#b9c9a8", "#e3a99a", "#d6c3e6"];
    const facs = walls.map((w, i) => facade(`w${i}`, w, i * 13 + 1));
    for (const s of [-1, 1]) for (let z = -130, i = 0; z < 130; i++) {
      const w = 9 + hh(i, s + 30) * 7, h = 10 + hh(i, s + 31) * 24, d = 10, k = (i + (s > 0 ? 3 : 0)) % walls.length;
      const fm = lam({ map: rep(facs[k].map, w / 5, h / 5), emissiveMap: rep(facs[k].em, w / 5, h / 5), emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0 });
      this.winMats.push(fm);
      const plain = lam({ color: walls[k] });
      const mats = s < 0 ? [fm, plain, plain, plain, plain, plain] : [plain, fm, plain, plain, plain, plain];
      const b = new THREE.Mesh(new THREE.BoxGeometry(d, h, w - 0.4), mats); b.position.set(X + s * (9.5 + d / 2), h / 2, z + w / 2); b.castShadow = true; b.receiveShadow = true; g.add(b);
      z += w;
    }
    // street lamps with a glow pool on the pavement
    const iron = lam({ color: "#2e2e38" }), glow = glowTex();
    for (const s of [-1, 1]) for (let z = -120; z <= 120; z += 16) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), iron); pole.position.set(X + s * 5.2, 2.5, z + (s > 0 ? 8 : 0)); g.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), iron); arm.position.set(X + s * 4.6, 5, pole.position.z); g.add(arm);
      const hm = new THREE.MeshBasicMaterial({ color: "#555" }); this.lampHeads.push(hm);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), hm); head.position.set(X + s * 4.0, 4.85, pole.position.z); head.layers.set(NOINK); g.add(head);
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(0.9, 0.7, 0.4) }));
      pool.scale.set(7, 1, 7); pool.position.set(X + s * 4.0, 0.2, pole.position.z); pool.layers.set(NOINK); this.lampGlows.push(pool); g.add(pool);
    }
    // traffic light at z = -10
    {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 4.2, 8), iron); pole.position.set(X + 5.2, 2.1, -10); g.add(pole);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), lam({ color: "#2a2a30" })); box.position.set(X + 5.2, 4.6, -10); g.add(box);
      const mk = (c: number, y: number) => { const m = new THREE.MeshBasicMaterial({ color: "#222" }); const l = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), m); l.position.set(X + 5.2, y, -9.74); l.layers.set(NOINK); g.add(l); void c; return m; };
      this.tl = { r: mk(0, 5.05), y: mk(1, 4.6), g: mk(2, 4.15) };
    }
  }
  private buildBeach() {
    const g = this.sets.beach, X = BEACH_X;
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(320, 200).rotateX(-Math.PI / 2), lam({ map: rep(sandTex(), 40, 25) }));
    sand.rotation.x = 0; sand.position.set(X, 0, 0); sand.receiveShadow = true;
    // slope down toward the sea (-z): tilt about x
    sand.geometry.rotateX(-0.045); g.add(sand);
    const st = seaTex(); const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: rep(st, 60, 60), color: "#ffffff", transparent: true, opacity: 0.94 }));
    sea.name = "sea"; sea.position.set(X, 0, -150); g.add(sea);
    for (let i = 0; i < 8; i++) this.tree(g, X - 30 + i * 9 + hh(i, 60) * 4, 10 + hh(i, 61) * 14, 0.9 + hh(i, 62) * 0.3, true);
    const rm = lam({ color: "#9a948a" });
    for (let k = 0; k < 14; k++) { const s = 0.4 + hh(k, 40) * 0.8; const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rm); r.position.set(X - 40 + hh(k, 41) * 80, s * 0.2 + 0.03 * (hh(k, 42) * 10), 2 + hh(k, 42) * 10); r.castShadow = true; g.add(r); }
    this.hills(g, X, "#c9b98a");
  }

  private shotSun(id: number) {
    let v = this.sunCache.get(id); if (v) return v;
    let fx = 0, fz = 0;
    for (let f = 0; f < this.story.TOTAL; f += 9) { const ls = this.story.layersAt(f); if (!ls.some((l) => l.id === id)) continue; const c = this.story.camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(70), el = THREE.MathUtils.degToRad(48);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize(); this.sunCache.set(id, v); return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, S = this.story.state(id, f), env = S.env, c = this.story.camAt(id, f), inSpace = S.set === "space";
    const sh = S.shake ?? 0;
    cam.position.set(c.pos[0] + sh * Math.sin(f * 2.3), c.pos[1] + sh * Math.cos(f * 3.1), c.pos[2]); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
    cam.fov = c.fov; cam.near = inSpace ? 0.05 : 0.1; cam.far = 5000; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); cam.layers.enable(NOINK);
    for (const [k, g] of Object.entries(this.sets)) g.visible = k === S.set;
    const focus = new THREE.Vector3(...c.look), sunDir = this.shotSun(id);
    // ---- lights ----
    const L = env === "night" ? NIGHT : env === "dusk" ? DUSK : env === "underwater" ? UNDER : DAY;
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = inSpace ? 0 : L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = inSpace ? 0 : L.sunI;
    // horizontal: el cuadro es más ancho, la caja de sombras también (para que no se corten a los lados)
    const Rr = THREE.MathUtils.clamp(cam.position.distanceTo(focus) * 1.15 + 9, 14, 60) * (this.hz ? 1.6 : 1);
    this.sun.position.copy(focus).addScaledVector(sunDir, 300); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 700; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(0, 0, 0); TONE.uSat.value = env === "day" ? 1.0 : 0.9;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms; SKY[env].forEach((h, i) => untone(h, su["c" + i].value));
    const e = LOOK.day.sky.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position); this.starPts.position.copy(cam.position);
    const [fc, fn, ff] = FOG[env]; untone(fc, this.fog.color); this.fog.near = fn; this.fog.far = ff; scene.fog = this.fog; scene.background = null;
    this.stars.uT.value = t; this.stars.uFade.value = inSpace ? 1 : S.stars ?? (env === "night" ? 0.8 : 0);
    // sky objects
    const place = (m: THREE.Object3D, dir: THREE.Vector3, d: number) => { m.position.copy(cam.position).addScaledVector(dir, d); m.quaternion.copy(cam.quaternion); };
    place(this.sunDisc, SUN_DIR, 600); place(this.sunGlow, SUN_DIR, 610); place(this.moonDisc, MOON_DIR, 560);
    const outdoors = ["park", "street", "beach", "desert", "farm"].includes(S.set);
    this.sunDisc.visible = this.sunGlow.visible = outdoors && (S.sunDisc ?? env === "day");
    const md = S.moonDisc ?? { show: env === "night" ? 1 : 0, bright: 1 };
    this.moonDisc.visible = outdoors && md.show > 0.01; this.moonDisc.scale.setScalar(70 * md.show);
    const mb = env === "day" ? 0.75 * md.bright : 1.25 * md.bright; this.moonMat.color.setRGB(mb, mb, mb * 1.02); this.moonMat.opacity = env === "day" ? 0.7 : 1;
    place(this.milky, MILKY_DIR, 1500); this.milky.rotateZ(0.7); (this.milky.material as THREE.MeshBasicMaterial).opacity = S.milky ?? 0; this.milky.visible = (S.milky ?? 0) > 0.01 && !inSpace;
    this.clouds.forEach((m, i) => { const a = (i / 18) * Math.PI * 2 + hh(i, 20), d = 500 + hh(i, 21) * 400; m.position.set(cam.position.x + Math.cos(a) * d, 90 + hh(i, 22) * 220, cam.position.z + Math.sin(a) * d); m.quaternion.copy(cam.quaternion); m.visible = !inSpace && env !== "night" && env !== "underwater" && ["park", "street", "beach", "desert", "farm"].includes(S.set); });
    updateSets(this.setRefs, S, f);
    moverFlotantes(this.flotan, S, f);
    // ---- snowy park (the pole) ----
    this.parkGround.material = S.snow ? this.snowM : this.grassM;
    this.pathM.color.set(S.snow ? "#e8f0fb" : "#ffffff"); this.crossM.color.set(S.snow ? "#e8f0fb" : "#ffffff");
    for (const m of this.greens) m.color.set(S.snow ? "#e6eefb" : m === this.greens[this.greens.length - 1] ? "#6fae57" : "#5aa84a");
    // ---- street lights ----
    const lit = S.lights ?? (env === "night" ? 1 : 0);
    for (const m of this.winMats) m.emissiveIntensity = (env === "day" ? 0.15 : 1.1) * lit;
    for (const m of this.lampHeads) m.color.setRGB(0.33 + 1.9 * lit, 0.33 + 1.55 * lit, 0.33 + 0.9 * lit);
    for (const g of this.lampGlows) { g.visible = lit > 0.02 && env !== "day"; (g.material as THREE.MeshBasicMaterial).opacity = lit; }
    if (this.tl) { const cyc = Math.floor(t / 2.5) % 2; this.tl.r.color.set(lit > 0.5 && cyc === 0 ? "#ff3a2a" : "#2a2222"); this.tl.g.color.set(lit > 0.5 && cyc === 1 ? "#3aff6a" : "#222a24"); this.tl.y.color.set("#2a2820"); }
    // ---- sea ----
    this.sea.position.y = S.tide ?? 0; this.seaTex.offset.set((S.flow ?? 0) * t * 0.08 + t * 0.004, t * 0.01);
    // ---- space ----
    this.sunPoint.intensity = 0; this.amb.intensity = 0;
    if (inSpace) {
      const sp = S.space ?? {};
      this.sunBall.visible = this.corona.visible = !!sp.sun;
      if (sp.sun) {
        this.sunBall.position.set(...sp.sun.pos); this.sunBall.scale.setScalar(sp.sun.r); this.sunBallM.color.set(sp.sun.lit ? new THREE.Color(1.15, 0.6, 0.1) : new THREE.Color("#2a2030"));
        this.corona.position.set(...sp.sun.pos); this.corona.scale.setScalar(sp.sun.r * 5.5); this.corona.quaternion.copy(cam.quaternion);
        this.sunPoint.position.set(...sp.sun.pos); this.sunPoint.intensity = sp.sun.lit ? 3.2 : 0;
      }
      if (sp.lightDir) { this.sun.intensity = 2.6; this.sun.color.set("#fff4e0"); this.sun.castShadow = false; this.sun.position.copy(focus).add(new THREE.Vector3(...sp.lightDir).multiplyScalar(300)); this.sun.target.position.copy(focus); }
      else this.sun.castShadow = true;
      this.amb.intensity = 0.35;
      this.earthG.visible = !!sp.earth;
      if (sp.earth) { this.earthG.position.set(...sp.earth.pos); this.earthG.scale.setScalar(sp.earth.r); this.earthG.rotation.set(0, sp.earth.prec ?? 0, sp.earth.tilt ?? 0.41); this.earth.rotation.y = sp.earth.rot; this.axis.visible = !!sp.earth.axis; }
      this.moonBall.visible = !!sp.moon && sp.moon.show > 0.01;
      if (sp.moon) { this.moonBall.position.set(...sp.moon.pos); this.moonBall.scale.setScalar(sp.moon.r * Math.max(0.001, sp.moon.show)); this.moonBall.rotation.y = t * 0.1; }
    } else this.sun.castShadow = true;

    // ---- cards ----
    const st: Stage = { places: [], fx: [] };
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const rolls: number[] = [], casts: boolean[] = [], breath: number[] = [];
    for (const cd of S.cards) {
      const s = cd.s ?? 1, y = (cd.y ?? 0) + (S.set === "beach" ? 0.045 * cd.z : 0), wide = cd.kind === "car" || cd.kind === "wave" || cd.kind === "plane" || cd.kind === "cameo", xb = xcard(cd);
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(cd.x, y + 1.1 * s, cd.z), (wide ? 4.5 : xb ? 2.2 : 1.6) * s))) continue;
      const d = cam.position.distanceTo(this.v.set(cd.x, y + 1 * s, cd.z)) / s, dk = d * this.tierK;
      const size = wide ? tierW(dk) : xb ? tierX(dk) : tier(dk);
      // Sticky mueve la boca con la voz del narrador (si la historia trae `voz`)
      if (cd.kind === "sticky" && this.story.voz && cd.o.talk === undefined) {
        const tk = bocaAt(this.story.voz, f);
        if (tk) (cd as { o: StickyOpts }).o = { ...cd.o, talk: tk };
      }
      breath.push(wide ? 0 : Math.sin(t * 2.4 + cd.x * 1.7 + cd.z * 2.3));
      st.places.push({ key: `${cd.kind}|${JSON.stringify(cd.o)}${cd.kind === "cameo" ? "|" + fotoEstado(cd.o.foto) : ""}`, x: cd.x, y, z: cd.z, size, scale: s, wide, xbody: xb, mirror: !!cd.mirror, draw: drawCard(cd) });
      rolls.push(cd.roll ?? 0);
      const grounded = (cd.y ?? 0) < 0.05 && !inSpace && env !== "night" && env !== "underwater" && cd.kind !== "wave";
      casts.push(grounded && d * s < 60);
      // con sombra de silueta solo queda la mancha de contacto bajo los pies
      if (grounded && d * s < 40) blob(st, sunDir, cd.x, y, cd.z, (wide ? 2.2 : cd.kind === "sticky" || cd.kind === "person" ? 0.8 : 0.6) * s, 1, false);
    }
    let ai = 0;
    for (const p of st.places) {
      const a = this.actor(ai), [w, h, k] = p.size, s = p.scale ?? 1;
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.geometry = p.wide ? WIDE : p.xbody ? XBODY : BODY; a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), rolls[ai]);
      a.mesh.scale.set(p.mirror ? -s : s, s * (1 + 0.012 * breath[ai]), s); // respiración: sube y baja muy poquito
      // silueta de sombra: de cara al sol (de lado se vería como una rayita)
      const cast = this.sun.castShadow && casts[ai];
      a.caster.visible = cast;
      if (cast) { a.caster.geometry = a.mesh.geometry; a.caster.position.copy(a.mesh.position); a.caster.rotation.set(0, Math.atan2(sunDir.x, sunDir.z), rolls[ai], "YXZ"); a.caster.scale.copy(a.mesh.scale); }
      ai++;
    }
    for (let i = ai; i < this.actors.length; i++) { this.actors[i].mesh.visible = false; this.actors[i].caster.visible = false; }
    let fi = 0;
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++); e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft); e2.mesh.visible = true; e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0); else { e2.mesh.rotation.order = "YXZ"; e2.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (let i = 0; i < ai; i++) this.actors[i].bind();
    for (let i = 0; i < fi; i++) this.fxs[i].bind();
    void smooth; void (0 as unknown as V3);
    return focus;
  }
}
