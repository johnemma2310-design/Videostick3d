// One three.js world posed per frame (pure function of shot id + frame): a small park (grass, path, trees, bench,
// lamp, a lake), its sky with a cartoon Sun and Moon, and a space set (Sun, Earth, the pulse of light, the orbit).
// Looks: day / night / frozen in the park, space / spaceDark out there.
import * as THREE from "three";
import { Pen } from "./toon";
import { Pool, Actor, Fx, Stage, tier, blob, BODY, SU } from "./troop";
import { NOINK } from "./ink";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { grassHD, cloudHD, rep, ctex } from "./paint";
import { sticky, stickyHand, iceDrop, fish, StickyOpts } from "./sticky";
import {
  FPS, SHOTS, camAt, smooth, Env, SUN_POS, MOON_POS, NIGHT_AT, MOON_OFF, ROPE, SUN_R, EARTH_R, ORBIT, pulseX, earthAt,
  ICE_AT, DEAD_AT, LAKE, RELEASE, V3,
} from "./story";

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const lam = (p: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(p));
const STICKY_S = 0.75; // card scale: 2.16 m design -> 1.62 m Sticky

// ---- light looks ----
const DAY: LightPreset = { ...LIGHTS.day };
const NIGHT: LightPreset = { ...LIGHTS.day, lit: [0.42, 0.48, 0.78], shade: [0.13, 0.14, 0.26], lift: [0.03, 0.04, 0.1],
  charTint: [0.55, 0.62, 0.95], sunCol: "#9fb4ff", sunI: 0.9, sky: "#3a4a80", ground: "#1c2238", hemiI: 0.45 };
const FROZEN: LightPreset = { ...NIGHT, lit: [0.7, 0.8, 1.05], shade: [0.2, 0.23, 0.38], charTint: [0.72, 0.8, 1.05], sunI: 1.2, hemiI: 0.6 };
const SKY: Record<Env, string[]> = {
  day: LOOK.day.sky.c,
  night: ["#1d2748", "#162040", "#101934", "#0b1228", "#070b1a"],
  frozen: ["#3a4c7c", "#2c3c68", "#1f2d54", "#152140", "#0c142c"],
  space: ["#03040a", "#03040a", "#03040a", "#03040a", "#03040a"],
  spaceDark: ["#020208", "#020208", "#020208", "#020208", "#020208"],
};
const FOG: Record<Env, [string, number, number]> = {
  day: ["#b8d0ec", 40, 260], night: ["#141b33", 14, 130], frozen: ["#2a3a66", 10, 95], space: ["#000000", 1e5, 2e5], spaceDark: ["#000000", 1e5, 2e5],
};

// ---- painted sprites ----
const sunTex = () => ctex("sunToon", 512, 512, (g) => {
  g.translate(256, 256);
  g.fillStyle = "#ffb42a"; g.strokeStyle = "#241726"; g.lineWidth = 10;
  for (let k = 0; k < 12; k++) { g.save(); g.rotate((k / 12) * Math.PI * 2); g.beginPath(); g.moveTo(-26, -150); g.lineTo(0, -240); g.lineTo(26, -150); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.beginPath(); g.arc(0, 0, 150, 0, Math.PI * 2); g.fillStyle = "#ffd23f"; g.fill(); g.stroke();
  g.beginPath(); g.arc(20, 22, 118, 0.2, 1.9); g.strokeStyle = "rgba(255,150,30,0.6)"; g.lineWidth = 18; g.stroke();
});
const moonTex = () => ctex("moonToon", 256, 256, (g) => {
  g.beginPath(); g.arc(128, 128, 110, 0, Math.PI * 2); g.fillStyle = "#f4f1e6"; g.fill();
  for (const [x, y, r] of [[96, 100, 18], [160, 150, 24], [120, 176, 12], [170, 92, 10]]) { g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fillStyle = "#d9d3c2"; g.fill(); }
  g.beginPath(); g.arc(128, 128, 110, 0, Math.PI * 2); g.strokeStyle = "#241726"; g.lineWidth = 8; g.stroke();
});
const glowTex = () => ctex("glowRad", 256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,220,120,1)"); gr.addColorStop(0.35, "rgba(255,170,60,0.55)"); gr.addColorStop(1, "rgba(255,120,20,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
});
const earthTex = () => ctex("earthToon", 1024, 512, (g, r) => {
  g.fillStyle = "#2f7fd0"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 9; i++) {
    const cx = r() * 1024, cy = 120 + r() * 280; g.fillStyle = i % 3 ? "#5fb34e" : "#c9a865";
    g.beginPath(); for (let k = 0; k < 14; k++) { const a = (k / 14) * 6.28, rr = 50 + r() * 70; g.lineTo(cx + Math.cos(a) * rr * 1.4, cy + Math.sin(a) * rr * 0.8); } g.closePath(); g.fill();
  }
  g.fillStyle = "#f4f7fb"; g.fillRect(0, 0, 1024, 40); g.fillRect(0, 472, 1024, 40);
  for (let i = 0; i < 14; i++) { g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(r() * 1024, 60 + r() * 400, 40 + r() * 60, 10 + r() * 8, 0, 0, 6.3); g.fill(); }
});
const snowTex = () => ctex("snowGround", 512, 512, (g, r) => {
  g.fillStyle = "#e8f0fb"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 500; i++) { g.fillStyle = r() < 0.5 ? "rgba(170,190,225,0.35)" : "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 3 + r() * 14, 2 + r() * 6, 0, 0, 6.3); g.fill(); }
});
const dirtTex = () => ctex("pathDirt", 512, 512, (g, r) => {
  g.fillStyle = "#c9a878"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 700; i++) { g.fillStyle = r() < 0.5 ? "rgba(140,110,76,0.4)" : "rgba(230,210,170,0.4)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 8, 1 + r() * 4, 0, 0, 6.3); g.fill(); }
});

// ---- point clouds: stars on a dome around the camera; snow falling around the camera ----
const STAR_VS = `attribute float aSeed; uniform float uT; uniform float uPx; varying float vA;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((1.2 + 2.6 * fract(aSeed * 7.13)) * uPx / 1000.0, 1.0, 8.0);
  vA = 0.55 + 0.45 * sin(uT * (1.5 + 3.0 * fract(aSeed * 3.7)) + aSeed * 40.0); }`;
const STAR_FS = `uniform float uFade; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; if (r > 1.0) discard;
  gl_FragColor = vec4(vec3(1.0, 0.97, 0.88) * (1.0 - r * r) * vA * uFade * 1.6, 1.0); }`;
const SNOW = { n: 6000, b: 22, h: 10 };
const SNOW_VS = `attribute vec4 aSeed; uniform float uT; uniform vec3 uCam; uniform float uPx; varying float vA;
void main(){ float B = ${SNOW.b.toFixed(1)}, H = ${SNOW.h.toFixed(1)}; vec3 p = position;
  p.y = mod(p.y - uT * (0.5 + 0.6 * aSeed.x), H) - 2.0;
  p.x += sin(uT * (0.7 + aSeed.y) + aSeed.z * 30.0) * 0.35; p.z += cos(uT * (0.6 + aSeed.z) + aSeed.w * 30.0) * 0.35;
  p.xz = uCam.xz + mod(p.xz - uCam.xz + 0.5 * B, B) - 0.5 * B;
  vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((0.035 + 0.04 * aSeed.y) * uPx / max(0.1, -mv.z), 1.5, 60.0);
  vA = smoothstep(0.3, 1.2, -mv.z); }`;
const SNOW_FS = `uniform float uFade; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; if (r > 1.0) discard;
  gl_FragColor = vec4(vec3(0.92, 0.96, 1.0) * (1.0 - r * r * 0.6) * vA * uFade, (1.0 - r * r) * vA * uFade); }`;
const pxOf = (r: THREE.WebGLRenderer, c: THREE.Camera) => { const rt = r.getRenderTarget(), h = rt ? rt.height : r.domElement.height; return h / (2 * Math.tan(THREE.MathUtils.degToRad((c as THREE.PerspectiveCamera).fov) / 2)); };

// ---- park layout ----
const TREES = (() => {
  const out: { x: number; z: number; s: number; i: number }[] = [];
  let i = 0;
  for (let k = 0; out.length < 26 && k < 400; k++) {
    const a = hh(k, 1) * Math.PI * 2, d = 7 + hh(k, 2) * 26, x = Math.cos(a) * d, z = Math.sin(a) * d - 6;
    if (z > -2.5 && Math.abs(x) < 7) continue; // keep the camera side clear
    if (x > LAKE.x0 - 3 && x < LAKE.x1 + 3 && z > LAKE.z0 - 3 && z < LAKE.z1 + 3) continue;
    if (Math.abs(x) < 2.2) continue; // the path
    if (x > 2 && x < 22 && z > -1.5 && z < 14) continue; // the camera's way to the lake
    if (out.some((t) => Math.hypot(t.x - x, t.z - z) < 4)) continue;
    out.push({ x, z, s: 0.8 + hh(k, 3) * 0.6, i: i++ });
  }
  return out;
})();
const FISH = Array.from({ length: 16 }, (_, i) => ({ x: LAKE.x0 + 1.5 + hh(i, 50) * (LAKE.x1 - LAKE.x0 - 3), y: -1.2 - hh(i, 51) * 2.6, z: LAKE.z0 + 1.5 + hh(i, 52) * 8, sp: 0.6 + hh(i, 53), col: ["#ff8a3a", "#ffd23f", "#ff5a5a"][i % 3], i }));

export class World {
  root = new THREE.Group();
  private park = new THREE.Group();
  private space = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight; private sunPoint: THREE.PointLight; private amb: THREE.AmbientLight;
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#bccbec", 40, 260);
  private clouds: THREE.Mesh[] = [];
  private sunDisc: THREE.Mesh; private sunGlowPark: THREE.Mesh; private moon: THREE.Mesh; private moonMat: THREE.MeshBasicMaterial;
  private grassM: THREE.MeshLambertMaterial; private snowM: THREE.MeshLambertMaterial; private ground: THREE.Mesh[] = [];
  private pathM: THREE.MeshLambertMaterial; private canopyM: THREE.MeshLambertMaterial; private hillM: THREE.MeshLambertMaterial; private trunkM: THREE.MeshLambertMaterial;
  private lakeTop: THREE.Mesh; private lakeTopM: THREE.MeshLambertMaterial;
  private iceBlock: THREE.Mesh; private rope: THREE.Mesh; private stone: THREE.Mesh;
  private stars = { uT: { value: 0 }, uPx: { value: 1000 }, uFade: { value: 0 } }; private starPts: THREE.Points;
  private snow = { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uPx: { value: 1000 }, uFade: { value: 0 } }; private snowPts: THREE.Points;
  private sunBall: THREE.Mesh; private sunBallM: THREE.MeshBasicMaterial; private corona: THREE.Mesh; private earth: THREE.Mesh;
  private pulse: THREE.Mesh; private beam: THREE.Mesh; private orbit: THREE.Line; private trail: THREE.Line;
  private sunCache = new Map<number, THREE.Vector3>();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor() {
    const R = this.root, P = this.park, S = this.space;
    R.add(P, S);
    // sky dome (elevation gradient) + stars
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(2400, 48, 24), this.skyMat);
    this.sky.renderOrder = -2; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    {
      const N = 2600, pos = new Float32Array(N * 3), sd = new Float32Array(N);
      for (let i = 0; i < N; i++) { const u = hh(i, 70) * 2 - 1, a = hh(i, 71) * 6.283, y = Math.abs(u) * 0.92 + 0.05, rr = Math.sqrt(1 - y * y);
        pos.set([Math.cos(a) * rr * 2000, y * 2000, Math.sin(a) * rr * 2000], i * 3); sd[i] = hh(i, 72) * 10; }
      // space shots look down too: mirror half of them below the horizon
      for (let i = 0; i < N; i += 2) pos[i * 3 + 1] *= -1;
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
      this.starPts = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: this.stars, vertexShader: STAR_VS, fragmentShader: STAR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      this.starPts.frustumCulled = false; this.starPts.layers.set(NOINK); this.starPts.renderOrder = -1;
      const u = this.stars.uPx; this.starPts.onBeforeRender = (r, _s, c) => { u.value = pxOf(r, c); };
      R.add(this.starPts);
    }
    // lights
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6); this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    this.sunPoint = new THREE.PointLight("#fff1d0", 3.2, 0, 0);
    this.amb = new THREE.AmbientLight("#405080", 0.0);
    R.add(this.hemi, this.sun, this.sun.target, this.sunPoint, this.amb);

    // ================= the park =================
    this.grassM = lam({ map: rep(grassHD(), 70, 70) });
    this.snowM = lam({ map: rep(snowTex(), 50, 50) });
    { // ground with a hole for the lake: four slabs around it
      const E = 600, L = LAKE;
      for (const [x0, x1, z0, z1] of [[-E, E, -E, L.z0], [-E, E, L.z1, E], [-E, L.x0, L.z0, L.z1], [L.x1, E, L.z0, L.z1]]) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2), this.grassM);
        m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.receiveShadow = true;
        const uv = m.geometry.attributes.uv; // keep the texel size the same on every slab
        for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * (x1 - x0) + x0 + E) / (2 * E), (uv.getY(i) * (z1 - z0) + z0 + E) / (2 * E));
        this.ground.push(m); P.add(m);
      }
    }
    this.pathM = lam({ map: rep(dirtTex(), 1, 14) });
    const path = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 60).rotateX(-Math.PI / 2), this.pathM);
    path.position.set(0, 0.012, -18); path.receiveShadow = true; P.add(path);
    // the lake: water box (inside faces) + the surface (water by day, ice when frozen)
    {
      const L = LAKE, w = L.x1 - L.x0, d = L.z1 - L.z0;
      const waterM = new THREE.MeshLambertMaterial({ color: "#2a6fa8", side: THREE.BackSide, emissive: "#0d3555", emissiveIntensity: 0.6 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, L.depth, d), waterM); box.position.set((L.x0 + L.x1) / 2, -L.depth / 2, (L.z0 + L.z1) / 2); P.add(box);
      const bedM = lam({ color: "#5a6a58" });
      const bed = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), bedM); bed.position.set((L.x0 + L.x1) / 2, -L.depth + 0.02, (L.z0 + L.z1) / 2); P.add(bed);
      this.lakeTopM = new THREE.MeshLambertMaterial({ color: "#3f8fd0", transparent: true, opacity: 0.88, side: THREE.DoubleSide, depthWrite: false });
      this.lakeTop = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), this.lakeTopM); this.lakeTop.position.set((L.x0 + L.x1) / 2, -0.04, (L.z0 + L.z1) / 2);
      this.lakeTop.renderOrder = 2; P.add(this.lakeTop);
      // rocks on the shore
      const rockM = lam({ color: "#9a948a" });
      for (let k = 0; k < 22; k++) {
        const t = k / 22, side = k % 4, s = 0.35 + hh(k, 40) * 0.4;
        const x = side < 2 ? L.x0 + t * 4 * w % w : side === 2 ? L.x0 - 0.2 : L.x1 + 0.2, z = side === 0 ? L.z0 - 0.2 : side === 1 ? L.z1 + 0.2 : L.z0 + (t * 4 * d) % d;
        const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockM); r.position.set(x, s * 0.3, z); r.rotation.set(k, k * 2, 0); r.castShadow = true; P.add(r);
      }
    }
    // trees: trunk + three canopy balls; hills; bench; lamp post
    this.trunkM = lam({ color: "#7a5236" });
    this.canopyM = lam({ color: "#5aa84a" });
    for (const t of TREES) {
      const g = new THREE.Group(); g.position.set(t.x, 0, t.z); g.scale.setScalar(t.s);
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 2.4, 10), this.trunkM); tr.position.y = 1.2; tr.castShadow = true; g.add(tr);
      for (const [x, y, z, r] of [[0, 3.1, 0, 1.35], [0.7, 2.6, 0.3, 0.95], [-0.65, 2.7, -0.2, 1.0]]) {
        const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), this.canopyM); c.position.set(x, y, z); c.castShadow = true; c.receiveShadow = true; g.add(c);
      }
      P.add(g);
    }
    this.hillM = lam({ color: "#6fae57" });
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2, d = 160 + hh(k, 8) * 60;
      const h = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), this.hillM);
      h.position.set(Math.cos(a) * d, -2, Math.sin(a) * d); h.scale.set(50 + hh(k, 9) * 40, 14 + hh(k, 10) * 16, 40 + hh(k, 11) * 20); P.add(h);
    }
    {
      const wood = lam({ color: "#a8743c" }), iron = lam({ color: "#3a3a44" });
      const bench = new THREE.Group(); bench.position.set(-2.4, 0, -1.6); bench.rotation.y = 0.35;
      for (const [y, z, h] of [[0.45, 0, 0.06], [0.75, -0.22, 0.32]]) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.6, h, 0.42), wood); s.position.set(0, y, z); s.castShadow = true; bench.add(s); }
      for (const x of [-0.7, 0.7]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.45, 0.4), iron); l.position.set(x, 0.22, 0); bench.add(l); }
      P.add(bench);
      const lamp = new THREE.Group(); lamp.position.set(-4.2, 0, -5.5);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8), iron); pole.position.y = 1.6; lamp.add(pole);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), lam({ color: "#f2e6b8" })); head.position.y = 3.25; lamp.add(head);
      P.add(lamp);
    }
    // clouds + the sky's Sun and Moon (billboards, no fog)
    const cm = [0, 1, 2, 3].map((k) => cloudHD(k));
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + hh(i, 20), d = 500 + hh(i, 21) * 400;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cm[i % 4], transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 90 + hh(i, 22) * 220, Math.sin(a) * d); const w = 110 + hh(i, 23) * 100; m.scale.set(w, w / 2, 1); m.layers.set(NOINK); this.clouds.push(m); P.add(m);
    }
    this.sunGlowPark = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    this.sunGlowPark.scale.setScalar(300); (this.sunGlowPark.material as THREE.MeshBasicMaterial).opacity = 0.45; (this.sunGlowPark.material as THREE.MeshBasicMaterial).color.setRGB(1, 0.85, 0.6); this.sunGlowPark.position.set(...SUN_POS); this.sunGlowPark.layers.set(NOINK); P.add(this.sunGlowPark);
    this.sunDisc = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: sunTex(), transparent: true, depthWrite: false, fog: false, color: new THREE.Color(1.5, 1.4, 1.2) }));
    this.sunDisc.scale.setScalar(150); this.sunDisc.position.set(...SUN_POS); this.sunDisc.layers.set(NOINK); P.add(this.sunDisc);
    this.moonMat = new THREE.MeshBasicMaterial({ map: moonTex(), transparent: true, depthWrite: false, fog: false });
    this.moon = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.moonMat); this.moon.scale.setScalar(60); this.moon.position.set(...MOON_POS); this.moon.layers.set(NOINK); P.add(this.moon);
    // the ice block Sticky freezes in
    this.iceBlock = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1, 0.9).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: "#bfe3ff", transparent: true, opacity: 0.42, emissive: "#3a6aa0", emissiveIntensity: 0.25, depthWrite: false }));
    this.iceBlock.renderOrder = 3; P.add(this.iceBlock);
    // the rope and the stone
    this.rope = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 6).translate(0, 0.5, 0).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#3a2416" }));
    this.rope.layers.set(NOINK); this.rope.frustumCulled = false; P.add(this.rope);
    this.stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 1), lam({ color: "#8d8a86" })); this.stone.castShadow = true; P.add(this.stone);
    // snow
    {
      const N = SNOW.n, pos = new Float32Array(N * 3), sd = new Float32Array(N * 4);
      for (let i = 0; i < N; i++) { pos.set([hh(i, 90) * SNOW.b, hh(i, 91) * SNOW.h, hh(i, 92) * SNOW.b], i * 3); sd.set([hh(i, 93), hh(i, 94), hh(i, 95), hh(i, 96)], i * 4); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("aSeed", new THREE.BufferAttribute(sd, 4));
      this.snowPts = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: this.snow, vertexShader: SNOW_VS, fragmentShader: SNOW_FS, transparent: true, depthWrite: false }));
      this.snowPts.frustumCulled = false; this.snowPts.layers.set(NOINK); this.snowPts.renderOrder = 5;
      const u = this.snow.uPx; this.snowPts.onBeforeRender = (r, _s, c) => { u.value = pxOf(r, c); };
      P.add(this.snowPts);
    }

    // ================= space =================
    this.sunBallM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 0.6, 0.1) });
    this.sunBall = new THREE.Mesh(new THREE.SphereGeometry(SUN_R, 64, 32), this.sunBallM); S.add(this.sunBall);
    this.corona = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.4, 1.1, 0.8) }));
    this.corona.scale.setScalar(SUN_R * 5.5); this.corona.layers.set(NOINK); S.add(this.corona);
    const grad = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]), 2, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
    const et = earthTex(); et.wrapS = THREE.RepeatWrapping;
    this.earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_R, 48, 24), new THREE.MeshToonMaterial({ map: et, gradientMap: grad }));
    S.add(this.earth);
    this.pulse = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.9, 1.0) }));
    this.pulse.layers.set(NOINK); S.add(this.pulse);
    this.beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1, 12, 1, true).rotateZ(Math.PI / 2).translate(0.5, 0, 0),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.3, 0.6), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.beam.layers.set(NOINK); S.add(this.beam);
    const ring: THREE.Vector3[] = []; for (let i = 0; i <= 256; i++) { const a = (i / 256) * Math.PI * 2; ring.push(new THREE.Vector3(Math.cos(a) * ORBIT, 0, Math.sin(a) * ORBIT)); }
    this.orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ring), new THREE.LineDashedMaterial({ color: "#8fa6d8", dashSize: 6, gapSize: 5, transparent: true, opacity: 0.7 }));
    this.orbit.computeLineDistances(); this.orbit.layers.set(NOINK); S.add(this.orbit);
    this.trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 64 }, () => new THREE.Vector3())), new THREE.LineBasicMaterial({ color: "#ffd23f" }));
    this.trail.layers.set(NOINK); this.trail.frustumCulled = false; S.add(this.trail);
  }

  /** camera-relative sun frozen per shot (az from the shot's mean view direction) */
  private shotSun(id: number) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const s = SHOTS[id - 1];
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) { const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(id === 7 ? 120 : 70), el = THREE.MathUtils.degToRad(48);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, S = SHOTS[id - 1], env = S.env(f), c = camAt(id, f);
    const inSpace = env === "space" || env === "spaceDark";
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
    cam.fov = c.fov; cam.near = inSpace ? 1 : 0.1; cam.far = 5000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const focus = new THREE.Vector3(...c.look), sunDir = this.shotSun(id);
    this.park.visible = !inSpace; this.space.visible = inSpace;

    // ---- light + sky + fog per look ----
    const L = env === "night" ? NIGHT : env === "frozen" ? FROZEN : DAY;
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = inSpace ? 0 : L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = inSpace ? 0 : L.sunI;
    const Rr = THREE.MathUtils.clamp(cam.position.distanceTo(focus) * 1.15 + 9, 14, 60);
    this.sun.position.copy(focus).addScaledVector(sunDir, 300); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 700; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.sunPoint.intensity = env === "space" ? 3.2 : 0;
    this.amb.intensity = env === "spaceDark" ? 1.6 : env === "space" ? 0.15 : 0;
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(0, 0, 0);
    TONE.uSat.value = env === "day" ? 1.0 : 0.85;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    SKY[env].forEach((h, i) => untone(h, su["c" + i].value));
    const e = LOOK.day.sky.e.map((deg) => THREE.MathUtils.degToRad(deg)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position); this.starPts.position.copy(cam.position);
    const under = !inSpace && cam.position.y < -0.05;
    const [fc, fn, ff] = under ? ["#1d4f7a", 0.5, 16] as [string, number, number] : FOG[env];
    untone(fc, this.fog.color); this.fog.near = fn; this.fog.far = ff; scene.fog = this.fog; scene.background = null;
    this.stars.uT.value = t;
    this.stars.uFade.value = inSpace ? 1 : env === "night" ? smooth((f - NIGHT_AT - 4) / 40) : env === "frozen" ? 0.8 : 0;
    if (under) this.stars.uFade.value = 0;

    // ---- park state ----
    const day = env === "day", frozen = env === "frozen";
    for (const m of this.clouds) { m.quaternion.copy(cam.quaternion); m.visible = day; }
    this.sunDisc.quaternion.copy(cam.quaternion); this.sunGlowPark.quaternion.copy(cam.quaternion); this.moon.quaternion.copy(cam.quaternion);
    this.sunDisc.visible = day; this.sunGlowPark.visible = day;
    // the Moon is pale in the day sky, bright at night, then it goes dark ("se apaga")
    this.moon.visible = !frozen;
    const moonDark = id === 4 ? smooth((f - MOON_OFF[0]) / (MOON_OFF[1] - MOON_OFF[0])) : id > 4 ? 1 : 0;
    const mb = day ? 0.75 : 1.25;
    this.moonMat.color.setRGB(THREE.MathUtils.lerp(mb, 0.07, moonDark), THREE.MathUtils.lerp(mb, 0.07, moonDark), THREE.MathUtils.lerp(mb, 0.11, moonDark));
    this.moonMat.opacity = day ? 0.7 : 1;
    for (const g of this.ground) g.material = frozen ? this.snowM : this.grassM;
    this.pathM.color.set(frozen ? "#dfe8f6" : "#ffffff");
    const dead = frozen ? smooth((f - DEAD_AT[0]) / (DEAD_AT[1] - DEAD_AT[0])) : 0;
    this.canopyM.color.set(frozen ? "#e6eefb" : "#5aa84a").lerp(new THREE.Color("#6b5e4e"), dead);
    this.hillM.color.set(frozen ? "#dde7f6" : "#6fae57");
    this.lakeTopM.color.set(frozen ? "#cfe8ff" : "#3f8fd0"); this.lakeTopM.opacity = frozen ? (under ? 0.75 : 0.93) : 0.88;
    this.snowPts.visible = frozen && !under && !(id === 7 && f > 1405); this.snow.uT.value = t; this.snow.uCam.value.copy(cam.position); this.snow.uFade.value = 1;
    const ice = id === 7 ? smooth((f - ICE_AT[0]) / (ICE_AT[1] - ICE_AT[0])) : 0;
    this.iceBlock.visible = ice > 0.01; this.iceBlock.scale.set(1, Math.max(0.01, 1.85 * ice), 1);

    // ---- space state ----
    if (inSpace) {
      const lit = env === "space";
      this.sunBallM.color.set(lit ? new THREE.Color(1.15, 0.6, 0.1) : new THREE.Color("#2a2030"));
      this.corona.visible = true; (this.corona.material as THREE.MeshBasicMaterial).color.setRGB(...(lit ? [1.4, 1.1, 0.8] : [0.16, 0.1, 0.22]) as [number, number, number]); this.corona.quaternion.copy(cam.quaternion);
      const ep: V3 = id === 2 ? [ORBIT, 0, 0] : earthAt(f);
      this.earth.position.set(...ep); this.earth.rotation.y = t * 0.6;
      this.sunPoint.position.set(0, 0, 0);
      const px = pulseX(f), on = id === 2 && f >= 136 && f <= 275;
      this.pulse.visible = on; this.pulse.position.set(px, 0, 0); this.pulse.scale.setScalar(1 + 0.15 * Math.sin(f * 0.9));
      this.beam.visible = id === 2 && f >= 136; this.beam.position.set(SUN_R * 0.9, 0, 0); this.beam.scale.set(Math.max(0.01, px - SUN_R * 0.9), 1, 1);
      this.orbit.visible = id === 5; (this.orbit.material as THREE.LineDashedMaterial).opacity = id === 5 ? 0.75 : 0.35;
      // after the release the Earth leaves a straight trail
      this.trail.visible = id === 5 && f > RELEASE;
      if (this.trail.visible) {
        const pa = this.trail.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pa.count; i++) { const q = earthAt(RELEASE + ((f - RELEASE) * i) / (pa.count - 1)); pa.setXYZ(i, q[0], q[1], q[2]); }
        pa.needsUpdate = true;
      }
    }

    // ---- the rope and the stone (analogy shot) ----
    const handW = (o: StickyOpts): THREE.Vector3 => {
      const [hx, hy] = stickyHand(o), right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
      right.y = 0; right.normalize();
      return new THREE.Vector3(0, (975 - hy) * SU * STICKY_S, 0).addScaledVector(right, (hx - 300) * SU * STICKY_S);
    };
    const roping = id === 6;
    const ang = (f - 1030) * ROPE.w;
    this.rope.visible = roping && f < ROPE.release; this.stone.visible = roping;
    let stickyOpts: StickyOpts = { expr: "smile", arm: "icecream" };

    // ---- Sticky's acting ----
    const lid = (() => { const k = f % 71; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; })();
    const scarf = Math.floor(((t * 1.3) % 1) * 8) / 8;
    let shiver = 0, droppedIce = false, sx = 0;
    switch (id) {
      case 1: stickyOpts = { expr: f > 60 && f < 110 && (f >> 3) % 2 ? "lick" : "smile", arm: "icecream", look: [0, f < 45 ? -1 : 0] }; break;
      case 3: stickyOpts = { expr: (f >> 3) % 3 === 0 && f > 420 ? "lick" : "smile", arm: "icecream", look: f > 370 && f < 420 ? [-0.4, -1] : [0, 0] }; break;
      case 4:
        if (f < NIGHT_AT) stickyOpts = { expr: "lick", arm: "icecream" };
        else if (f < 790) { stickyOpts = { expr: "shock", arm: "down", look: f > 570 ? [0.5, -1] : [0, 0] }; droppedIce = true; }
        else { stickyOpts = { expr: "sad", arm: "down", look: [0, 0.4] }; droppedIce = true; }
        break;
      case 6: stickyOpts = { expr: f > ROPE.release ? "shock" : "smile", arm: "up", ang, look: f > ROPE.release ? [1, -0.6] : [0.4, -0.8] }; break;
      case 7:
        stickyOpts = { expr: ice > 0.5 ? "frozen" : "shiver", arm: "down" };
        shiver = ice > 0.5 ? 0 : 0.018 * (f % 2 ? 1 : -1);
        break;
      case 8: stickyOpts = { expr: f < 1545 ? "smile" : (f >> 3) % 4 === 0 ? "lick" : "relief", arm: "icecream", look: f > 1600 ? [-0.4, -1] : [0, 0] }; break;
    }
    stickyOpts = { ...stickyOpts, blink: stickyOpts.expr === "shock" || stickyOpts.expr === "frozen" ? 0 : lid, scarf };
    sx = shiver;
    if (roping) {
      const hand = handW(stickyOpts);
      const c0 = new THREE.Vector3(...ROPE.c);
      let sp: THREE.Vector3;
      if (f < ROPE.release) sp = new THREE.Vector3(c0.x + Math.cos(ang) * ROPE.r, c0.y + 0.1 * Math.sin(ang * 2), c0.z + Math.sin(ang) * ROPE.r);
      else {
        const a = (ROPE.release - 1030) * ROPE.w, d = (f - ROPE.release) * ROPE.w * ROPE.r;
        sp = new THREE.Vector3(c0.x + Math.cos(a) * ROPE.r - Math.sin(a) * d, c0.y + 0.03 * (f - ROPE.release), c0.z + Math.sin(a) * ROPE.r + Math.cos(a) * d);
      }
      this.stone.position.copy(sp); this.stone.rotation.set(f * 0.3, f * 0.2, 0);
      this.rope.position.copy(hand); this.rope.lookAt(sp); this.rope.scale.set(1, 1, hand.distanceTo(sp));
    }

    // ---- cards ----
    const st: Stage = { places: [], fx: [] };
    if (!inSpace) {
      this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
      const d = cam.position.distanceTo(this.v.set(0, 1, 0)) / STICKY_S, [w, h, k] = tier(d);
      const so = stickyOpts;
      st.places.push({ key: `sticky|${JSON.stringify(so)}`, x: sx, y: 0, z: 0, size: [w, h, k], scale: STICKY_S, draw: (p: Pen) => sticky(p, so) });
      if (!(env === "night")) blob(st, sunDir, 0, 0, 0, 0.8);
      if (droppedIce && f > NIGHT_AT + 3) {
        const fall = smooth((f - NIGHT_AT - 3) / 8);
        st.fx.push({ key: "iceDrop", cw: 256, ch: 256, draw: iceDrop, x: 0.42, y: THREE.MathUtils.lerp(0.75, 0.02, fall), z: 0.25, w: 0.42, h: 0.42, flat: fall > 0.95, rot: 0.6 });
      }
      if (frozen) for (const fi of FISH) {
        const x = fi.x + Math.sin(t * fi.sp + fi.i) * 1.5, dir = Math.cos(t * fi.sp + fi.i) > 0 ? 1 : -1;
        st.fx.push({ key: `fish|${fi.col}|${dir}`, cw: 256, ch: 128, draw: (p) => { if (dir < 0) { p.g.translate(256, 0); p.g.scale(-1, 1); } fish(fi.col)(p); }, x, y: fi.y + 0.15 * Math.sin(t * 2 + fi.i), z: fi.z, w: 1.0, h: 0.5 });
      }
    }
    let ai = 0;
    for (const p of st.places) {
      const a = this.actor(ai++), [w, h, k] = p.size, s = p.scale ?? 1;
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.geometry = BODY; a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      a.mesh.scale.set(s, s, s);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft); e2.mesh.visible = true; e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e2.mesh.rotation.order = "YXZ"; e2.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (let i = 0; i < ai; i++) this.actors[i].bind();
    for (let i = 0; i < fi; i++) this.fxs[i].bind();
    return focus;
  }
}
