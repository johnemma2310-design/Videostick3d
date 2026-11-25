// Extra sets for the multi-scene shorts. Each builder adds a group at its own origin and returns the bits that
// change per frame. Interiors have no ceiling (the sun gets in); the camera never looks up inside.
import * as THREE from "three";
import { twoTone } from "./shade";
import { ctex, rep, grassHD } from "./paint";
import { NOINK } from "./ink";
import { hh } from "./timeline";
import type { SceneState } from "./types";

export const ORIGIN = {
  house: [0, 0, 800], elevator: [60, 0, 800], hospital: [120, 0, 800], store: [180, 0, 800], classroom: [240, 0, 800],
  desert: [0, 0, -450], reef: [-400, 0, 450], farm: [400, 0, 450],
} as const;

const lam = (c: string | THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(typeof c === "string" ? { color: c } : c));
const box = (g: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material, cast = true) => {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = cast; b.receiveShadow = true; g.add(b); return b;
};
const cyl = (g: THREE.Object3D, r0: number, r1: number, h: number, x: number, y: number, z: number, m: THREE.Material, seg = 16) => {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); c.position.set(x, y, z); c.castShadow = true; c.receiveShadow = true; g.add(c); return c;
};
const sph = (g: THREE.Object3D, r: number, x: number, y: number, z: number, m: THREE.Material, sx = 1, sy = 1, sz = 1) => {
  const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m); s.position.set(x, y, z); s.scale.set(sx, sy, sz); s.castShadow = true; s.receiveShadow = true; g.add(s); return s;
};
const floorTex = (key: string, a: string, b: string, n = 8) => ctex(key, 512, 512, (g) => { const s = 512 / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); } g.strokeStyle = "rgba(0,0,0,0.15)"; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); } });
const planks = () => ctex("woodFloor", 512, 512, (g, r) => { for (let i = 0; i < 8; i++) { g.fillStyle = ["#c98f5a", "#b97d4a", "#d49a62"][i % 3]; g.fillRect(0, i * 64, 512, 64); g.strokeStyle = "#7a4b2a"; g.lineWidth = 3; g.strokeRect(0, i * 64, 512, 64); g.beginPath(); const x = r() * 512; g.moveTo(x, i * 64); g.lineTo(x, i * 64 + 64); g.stroke(); } });
const label = (key: string, text: string, bg: string, fg = "#ffffff", w = 512, h = 128) => ctex(key, w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = "#241726"; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = fg; g.font = `bold ${Math.round(h * 0.55)}px Arial Black, Arial`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2, h / 2 + 4); });
const plane = (g: THREE.Object3D, w: number, h: number, x: number, y: number, z: number, m: THREE.Material, ry = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; p.receiveShadow = true; g.add(p); return p; };
/** an open-top room: floor + back/left/right walls */
const room = (g: THREE.Group, o: readonly number[], w: number, d: number, h: number, floor: THREE.Material, back: string, left: string, right: string) => {
  const [X, , Z] = o;
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), floor); f.position.set(X, 0, Z); f.receiveShadow = true; g.add(f);
  const wall = (c: string) => twoTone(new THREE.MeshLambertMaterial({ color: c, emissive: new THREE.Color(c).multiplyScalar(0.45) }));
  box(g, w, h, 0.2, X, h / 2, Z - d / 2, wall(back), false); box(g, 0.2, h, d, X - w / 2, h / 2, Z, wall(left), false); box(g, 0.2, h, d, X + w / 2, h / 2, Z, wall(right), false);
};

export type SetRefs = {
  tv: THREE.MeshBasicMaterial; lamp: THREE.MeshBasicMaterial; windows: THREE.MeshBasicMaterial[]; fridgeDoor: THREE.Object3D; fridgeLight: THREE.MeshBasicMaterial;
  tap: THREE.Mesh; elevLight: THREE.MeshBasicMaterial; elevBtns: THREE.MeshBasicMaterial; monitor: THREE.MeshBasicMaterial; genLight: THREE.MeshBasicMaterial;
  storeLights: THREE.MeshBasicMaterial[]; globe: THREE.Object3D; weeds: THREE.Mesh[]; spawn: { pts: THREE.Points; u: { uT: { value: number }; uShow: { value: number } } };
  domeSlit: THREE.MeshBasicMaterial;
};

export const buildSets = (groups: Record<string, THREE.Group>): SetRefs => {
  const R = {} as SetRefs; R.windows = []; R.storeLights = []; R.weeds = [];
  // ================= house: kitchen + living room =================
  {
    const g = groups.house, o = ORIGIN.house, [X, , Z] = o;
    room(g, o, 11, 9, 3.2, lam({ map: rep(planks(), 5, 4) }), "#ffd36e", "#7fd1c7", "#f49ac1");
    // window on the back wall
    const wm = new THREE.MeshBasicMaterial({ color: "#8fd0ff" }); R.windows.push(wm);
    plane(g, 2.4, 1.4, X + 1.8, 1.9, Z - 4.38, wm).layers.set(NOINK);
    box(g, 2.6, 0.12, 0.2, X + 1.8, 1.15, Z - 4.3, lam("#ffffff")); box(g, 0.1, 1.5, 0.12, X + 1.8, 1.9, Z - 4.32, lam("#ffffff"));
    // kitchen along the left wall
    const wood = lam("#e9a35a"), top = lam("#f4f1ea");
    box(g, 0.8, 0.9, 3.6, X - 5.0, 0.45, Z - 1.6, wood); box(g, 0.9, 0.06, 3.7, X - 5.0, 0.93, Z - 1.6, top);
    box(g, 0.5, 0.1, 0.7, X - 4.9, 0.9, Z - 1.0, lam("#9aa4b4")); // sink
    const tapM = lam("#c9ccd6"); cyl(g, 0.03, 0.03, 0.4, X - 5.15, 1.15, Z - 1.0, tapM); box(g, 0.25, 0.04, 0.04, X - 5.05, 1.33, Z - 1.0, tapM);
    R.tap = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.42, 8), new THREE.MeshBasicMaterial({ color: "#8fd8ff", transparent: true, opacity: 0.8 })); R.tap.position.set(X - 4.94, 1.1, Z - 1.0); R.tap.layers.set(NOINK); g.add(R.tap);
    // fridge with a door on a hinge
    const fm = lam("#bfe9ff");
    box(g, 0.9, 1.95, 0.8, X - 4.9, 0.98, Z - 3.8, fm);
    R.fridgeLight = new THREE.MeshBasicMaterial({ color: "#fff6d0" }); const inner = plane(g, 0.78, 1.8, X - 4.9, 0.98, Z - 3.39, R.fridgeLight); inner.layers.set(NOINK);
    for (let k = 0; k < 4; k++) box(g, 0.6 + 0.0 * k, 0.18, 0.2, X - 4.9, 0.4 + k * 0.42, Z - 3.5, lam(["#ff6b6b", "#ffd23f", "#6bd36b", "#ff9a3c"][k]), false);
    const hinge = new THREE.Group(); hinge.position.set(X - 4.45, 0, Z - 3.39); g.add(hinge);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.95, 0.06), fm); door.position.set(-0.45, 0.98, 0.03); door.castShadow = true; hinge.add(door);
    box(door, 0.05, 0.5, 0.05, -0.36, 0.2, 0.06, lam("#7a8090"));
    R.fridgeDoor = hinge;
    // table + chairs
    box(g, 1.6, 0.08, 1.0, X - 1.8, 0.78, Z - 1.0, lam("#ff9a3c")); for (const [dx, dz] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]]) cyl(g, 0.04, 0.04, 0.78, X - 1.8 + dx, 0.39, Z - 1.0 + dz, lam("#7a4b2a"));
    for (const dx of [-1, 1]) { box(g, 0.45, 0.06, 0.45, X - 1.8 + dx * 1.15, 0.48, Z - 1.0, lam("#2f86d6")); box(g, 0.06, 0.5, 0.45, X - 1.8 + dx * 1.38, 0.75, Z - 1.0, lam("#2f86d6")); }
    // living room: sofa, TV, lamp, rug, plant
    const sofa = lam("#e85d5d"); box(g, 2.4, 0.45, 0.9, X + 3.0, 0.32, Z - 0.6, sofa); box(g, 2.4, 0.6, 0.25, X + 3.0, 0.7, Z - 0.15, sofa); box(g, 0.25, 0.6, 0.9, X + 1.85, 0.5, Z - 0.6, sofa); box(g, 0.25, 0.6, 0.9, X + 4.15, 0.5, Z - 0.6, sofa);
    box(g, 2.0, 0.5, 0.5, X + 3.0, 0.25, Z - 3.9, lam("#7a4b2a")); box(g, 1.8, 1.0, 0.08, X + 3.0, 1.05, Z - 3.9, lam("#20202a"));
    R.tv = new THREE.MeshBasicMaterial({ color: "#7fd8ff" }); plane(g, 1.62, 0.86, X + 3.0, 1.05, Z - 3.85, R.tv).layers.set(NOINK);
    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.6, 40).rotateX(-Math.PI / 2), lam({ map: ctex("rug", 256, 256, (gg) => { for (let r = 128; r > 0; r -= 18) { gg.fillStyle = ["#ff6fa3", "#ffd23f", "#2ed3c6", "#9b6bff"][(r / 18 | 0) % 4]; gg.beginPath(); gg.arc(128, 128, r, 0, 6.3); gg.fill(); } }) }));
    rug.position.set(X + 3.0, 0.01, Z - 2.2); rug.receiveShadow = true; g.add(rug);
    cyl(g, 0.03, 0.03, 1.6, X + 4.8, 0.8, Z - 3.6, lam("#20202a")); R.lamp = new THREE.MeshBasicMaterial({ color: "#fff0b0" });
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.35, 16, 1, true), R.lamp); shade.position.set(X + 4.8, 1.7, Z - 3.6); g.add(shade);
    cyl(g, 0.22, 0.18, 0.4, X - 3.2, 0.2, Z - 4.0, lam("#d8653a")); sph(g, 0.45, X - 3.2, 0.75, Z - 4.0, lam("#4fae4a"), 1, 1.2, 1);
    // wall pictures
    for (const [px, c] of [[-2.4, "#9b6bff"], [-0.8, "#2ed3c6"]] as const) plane(g, 0.8, 0.6, X + px, 2.0, Z - 4.38, lam(c));
  }
  // ================= elevator =================
  {
    const g = groups.elevator, [X, , Z] = ORIGIN.elevator, steel = lam("#c9ccd6"), panel = lam("#a87a52");
    const f = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.2).rotateX(-Math.PI / 2), lam({ map: rep(floorTex("elevFloor", "#5a5a66", "#4a4a56"), 2, 2) })); f.position.set(X, 0, Z); g.add(f);
    box(g, 2.4, 2.6, 0.1, X, 1.3, Z - 1.1, panel, false); box(g, 0.1, 2.6, 2.2, X - 1.2, 1.3, Z, steel, false); box(g, 0.1, 2.6, 2.2, X + 1.2, 1.3, Z, steel, false);
    box(g, 2.4, 0.1, 2.2, X, 2.6, Z, steel, false);
    R.elevLight = new THREE.MeshBasicMaterial({ color: "#fff6d0" }); const lp = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8).rotateX(Math.PI / 2), R.elevLight); lp.position.set(X, 2.54, Z); lp.layers.set(NOINK); g.add(lp);
    R.elevBtns = new THREE.MeshBasicMaterial({ map: ctex("elevBtns", 128, 256, (gg) => { gg.fillStyle = "#30303a"; gg.fillRect(0, 0, 128, 256); for (let i = 0; i < 8; i++) { gg.fillStyle = "#ffd23f"; gg.beginPath(); gg.arc(40 + (i % 2) * 48, 40 + (i >> 1) * 52, 16, 0, 6.3); gg.fill(); } }) });
    const bp = plane(g, 0.3, 0.6, X + 1.14, 1.3, Z - 0.6, R.elevBtns, -Math.PI / 2); bp.layers.set(NOINK);
    plane(g, 2.3, 0.2, X, 2.4, Z - 1.04, new THREE.MeshBasicMaterial({ map: label("elevNum", "▲ 14", "#20202a", "#ff5a4a") })).layers.set(NOINK);
  }
  // ================= hospital =================
  {
    const g = groups.hospital, o = ORIGIN.hospital, [X, , Z] = o;
    room(g, o, 10, 8, 3.2, lam({ map: rep(floorTex("hospFloor", "#e8f4f2", "#cfe8e4"), 4, 4) }), "#bfeee6", "#9fd8f0", "#bfeee6");
    box(g, 2.0, 0.5, 1.0, X - 1.5, 0.55, Z - 2.6, lam("#ffffff")); box(g, 2.0, 0.12, 1.02, X - 1.3, 0.85, Z - 2.6, lam("#2f86d6")); box(g, 0.1, 1.0, 1.0, X - 2.5, 0.8, Z - 2.6, lam("#9aa4b4"));
    sph(g, 0.22, X - 2.2, 0.9, Z - 2.6, lam("#ffffff"), 1, 0.5, 1.4);
    cyl(g, 0.03, 0.03, 1.4, X - 0.2, 0.7, Z - 3.3, lam("#7a8090")); box(g, 0.9, 0.6, 0.1, X - 0.2, 1.6, Z - 3.3, lam("#20202a"));
    R.monitor = new THREE.MeshBasicMaterial({ map: ctex("ekg", 256, 128, (gg) => { gg.fillStyle = "#0a2a1a"; gg.fillRect(0, 0, 256, 128); gg.strokeStyle = "#3aff6a"; gg.lineWidth = 6; gg.beginPath(); gg.moveTo(0, 70); for (const [x, y] of [[60, 70], [80, 70], [92, 20], [104, 110], [116, 70], [180, 70], [192, 30], [204, 100], [216, 70], [256, 70]]) gg.lineTo(x, y); gg.stroke(); }) });
    plane(g, 0.82, 0.52, X - 0.2, 1.6, Z - 3.24, R.monitor).layers.set(NOINK);
    cyl(g, 0.02, 0.02, 1.8, X - 2.8, 0.9, Z - 2.0, lam("#9aa4b4")); sph(g, 0.14, X - 2.8, 1.75, Z - 2.0, lam("#9fd8ff"), 1, 1.3, 0.5);
    // the generator keeping it alive
    const gen = lam("#ffd23f"); box(g, 1.6, 1.1, 1.0, X + 3.0, 0.55, Z - 2.8, gen); cyl(g, 0.08, 0.08, 1.0, X + 3.5, 1.5, Z - 3.0, lam("#5a5a66"));
    plane(g, 1.0, 0.4, X + 3.0, 0.75, Z - 2.28, new THREE.MeshBasicMaterial({ map: label("genLbl", "⚡ PLANTA", "#20202a", "#ffd23f") })).layers.set(NOINK);
    R.genLight = new THREE.MeshBasicMaterial({ color: "#3aff6a" }); sph(g, 0.06, X + 2.4, 1.0, Z - 2.28, R.genLight).layers.set(NOINK);
    box(g, 0.08, 2.4, 2.4, X + 0.9, 1.2, Z - 2.6, lam("#f7a8c0"), false); // curtain
    plane(g, 1.4, 0.5, X - 3.0, 2.5, Z - 3.88, new THREE.MeshBasicMaterial({ map: label("hospSign", "HOSPITAL", "#ffffff", "#e62117") })).layers.set(NOINK);
  }
  // ================= store aisle =================
  {
    const g = groups.store, o = ORIGIN.store, [X, , Z] = o;
    const f = new THREE.Mesh(new THREE.PlaneGeometry(10, 22).rotateX(-Math.PI / 2), lam({ map: rep(floorTex("storeFloor", "#f4f1ea", "#e4e0d6"), 4, 8) })); f.position.set(X, 0, Z - 6); f.receiveShadow = true; g.add(f);
    box(g, 10, 3.4, 0.2, X, 1.7, Z - 17, lam("#2ed3c6"), false);
    const COLS = ["#ff6b6b", "#ffd23f", "#6bd36b", "#2f86d6", "#ff9a3c", "#9b6bff", "#ff6fa3", "#2ed3c6", "#ffffff"];
    const prodGeo = new THREE.BoxGeometry(0.22, 0.3, 0.18);
    for (const sx of [-1, 1]) {
      const shelf = lam("#e8e2c8");
      box(g, 0.6, 2.2, 14, X + sx * 2.2, 1.1, Z - 8, lam("#c9ccd6"));
      for (let lv = 0; lv < 4; lv++) {
        box(g, 0.7, 0.05, 14, X + sx * 1.85, 0.35 + lv * 0.5, Z - 8, shelf, false);
        const n = 50, inst = new THREE.InstancedMesh(prodGeo, new THREE.MeshLambertMaterial({ color: "#ffffff" }), n); const m = new THREE.Matrix4(), c = new THREE.Color();
        for (let i = 0; i < n; i++) { m.makeTranslation(X + sx * 1.75, 0.53 + lv * 0.5, Z - 1.2 - i * 0.27); inst.setMatrixAt(i, m); inst.setColorAt(i, c.set(COLS[Math.floor(hh(i + lv * 50, sx + 3) * COLS.length)])); }
        inst.castShadow = true; g.add(inst);
      }
    }
    for (let k = 0; k < 4; k++) { const lm = new THREE.MeshBasicMaterial({ color: "#ffffff" }); R.storeLights.push(lm); const l = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 2.2), lm); l.position.set(X, 3.2, Z - 2 - k * 4); l.layers.set(NOINK); g.add(l); }
    plane(g, 2.2, 0.6, X - 1.9, 2.6, Z - 3, new THREE.MeshBasicMaterial({ map: label("pilas", "🔋 PILAS", "#ffd23f", "#20202a") }), Math.PI / 2).layers.set(NOINK);
    plane(g, 2.2, 0.6, X + 1.9, 2.6, Z - 7, new THREE.MeshBasicMaterial({ map: label("velas", "🕯 VELAS", "#ff6fa3", "#ffffff") }), -Math.PI / 2).layers.set(NOINK);
    box(g, 1.6, 0.9, 0.7, X + 3.6, 0.45, Z + 1.0, lam("#e62117")); // checkout
  }
  // ================= classroom =================
  {
    const g = groups.classroom, o = ORIGIN.classroom, [X, , Z] = o;
    room(g, o, 11, 9, 3.2, lam({ map: rep(planks(), 5, 4) }), "#bfe3a8", "#ffe08a", "#bfe3a8");
    plane(g, 5.0, 1.9, X, 1.8, Z - 4.38, new THREE.MeshBasicMaterial({ map: ctex("board", 1024, 400, (gg) => {
      gg.fillStyle = "#1f5a3a"; gg.fillRect(0, 0, 1024, 400); gg.strokeStyle = "#8a5a34"; gg.lineWidth = 24; gg.strokeRect(0, 0, 1024, 400);
      gg.strokeStyle = "#f4f1ea"; gg.lineWidth = 6; gg.beginPath(); gg.arc(230, 200, 110, 0, 6.3); gg.stroke(); gg.beginPath(); gg.moveTo(170, 60); gg.lineTo(290, 340); gg.stroke();
      gg.beginPath(); gg.arc(720, 200, 120, 0, 6.3); gg.stroke(); gg.beginPath(); gg.moveTo(720, 200); gg.lineTo(720, 110); gg.moveTo(720, 200); gg.lineTo(790, 230); gg.stroke();
      gg.fillStyle = "#f4f1ea"; gg.font = "bold 64px Arial"; gg.fillText("24 h", 870, 120); gg.fillText("22 h?", 860, 330);
    }) })).layers.set(NOINK);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = X - 3.3 + c * 2.2, z = Z - 0.2 + r * 1.6; box(g, 1.0, 0.06, 0.6, x, 0.72, z, lam(["#ff9a3c", "#2f86d6", "#ff6fa3", "#6bd36b"][(r + c) % 4])); for (const dx of [-0.42, 0.42]) cyl(g, 0.03, 0.03, 0.72, x + dx, 0.36, z, lam("#5a5a66")); }
    box(g, 1.8, 0.8, 0.8, X + 3.2, 0.4, Z - 3.2, lam("#b97d4a"));
    const globe = new THREE.Group(); globe.position.set(X + 3.0, 1.15, Z - 3.2); g.add(globe);
    cyl(globe, 0.12, 0.18, 0.08, 0, -0.33, 0, lam("#7a4b2a"));
    const gm = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), lam({ map: ctex("globeTex", 256, 128, (gg) => { gg.fillStyle = "#2f86d6"; gg.fillRect(0, 0, 256, 128); gg.fillStyle = "#6bd36b"; for (const [x, y, w, h] of [[30, 30, 50, 40], [110, 50, 40, 60], [170, 30, 60, 40], [200, 80, 30, 30]]) gg.fillRect(x, y, w, h); }) })); globe.add(gm); R.globe = gm;
    const wm = new THREE.MeshBasicMaterial({ color: "#8fd0ff" }); R.windows.push(wm); plane(g, 0.05, 1, X + 5.38, 1.9, Z - 1, wm);
    for (const zz of [-2.5, 0.5]) plane(g, 2.0, 1.3, X + 5.38, 1.9, Z + zz, wm, -Math.PI / 2).layers.set(NOINK);
  }
  // ================= desert (with the observatory) =================
  {
    const g = groups.desert, [X, , Z] = ORIGIN.desert;
    const sand = ctex("dsand", 512, 512, (gg, r) => { gg.fillStyle = "#f2a65a"; gg.fillRect(0, 0, 512, 512); for (let i = 0; i < 1200; i++) { gg.fillStyle = r() < 0.5 ? "rgba(200,110,50,0.35)" : "rgba(255,210,150,0.4)"; gg.beginPath(); gg.ellipse(r() * 512, r() * 512, 2 + r() * 7, 1 + r() * 3, 0, 0, 6.3); gg.fill(); } });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320).rotateX(-Math.PI / 2), lam({ map: rep(sand, 40, 40) })); ground.position.set(X, 0, Z); ground.receiveShadow = true; g.add(ground);
    const duneM = lam("#f0a050");
    for (let k = 0; k < 14; k++) sph(g, 1, X - 60 + hh(k, 1) * 120, -1, Z - 20 - hh(k, 2) * 80, duneM, 10 + hh(k, 3) * 18, 3 + hh(k, 4) * 4, 6 + hh(k, 5) * 8);
    const mesa = lam("#c8553a");
    for (let k = 0; k < 6; k++) cyl(g, 10 + hh(k, 6) * 10, 14 + hh(k, 7) * 10, 14 + hh(k, 8) * 18, X - 90 + k * 36, 7, Z - 120 - hh(k, 9) * 40, mesa, 7);
    const cact = lam("#3fa34d");
    for (let k = 0; k < 16; k++) { const x = X - 20 + hh(k, 10) * 40, z = Z - 2 - hh(k, 11) * 30; if (Math.abs(x - X) < 3 && z > Z - 6) continue; const h = 1.5 + hh(k, 12) * 2; cyl(g, 0.22, 0.25, h, x, h / 2, z, cact, 10); cyl(g, 0.14, 0.14, 0.7, x + 0.35, h * 0.6, z, cact, 8).rotation.z = 0.0; sph(g, 0.22, x, h, z, cact); }
    // observatory on a little hill
    sph(g, 1, X + 14, -1, Z - 26, lam("#e8a060"), 14, 4, 12);
    cyl(g, 3.2, 3.2, 3, X + 14, 4.0, Z - 26, lam("#f4f1ea"), 24);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), lam("#ffffff")); dome.position.set(X + 14, 5.5, Z - 26); dome.castShadow = true; g.add(dome);
    R.domeSlit = new THREE.MeshBasicMaterial({ color: "#20202a" }); const slit = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.0, 0.1), R.domeSlit); slit.position.set(X + 14, 7.2, Z - 22.9); slit.rotation.x = -0.5; g.add(slit);
  }
  // ================= coral reef (underwater) =================
  {
    const g = groups.reef, [X, , Z] = ORIGIN.reef;
    const bottom = new THREE.Mesh(new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2), lam({ map: rep(ctex("reefSand", 256, 256, (gg, r) => { gg.fillStyle = "#f2e2b0"; gg.fillRect(0, 0, 256, 256); for (let i = 0; i < 400; i++) { gg.fillStyle = "rgba(200,180,130,0.4)"; gg.fillRect(r() * 256, r() * 256, 3, 2); } }), 40, 40) }));
    bottom.position.set(X, 0, Z); bottom.receiveShadow = true; g.add(bottom);
    const C = ["#ff6fa3", "#ff9a3c", "#9b6bff", "#ffd23f", "#2ed3c6", "#ff5a5a", "#6bd36b"];
    for (let k = 0; k < 70; k++) {
      const x = X - 14 + hh(k, 1) * 28, z = Z - 3 - hh(k, 2) * 26; if (Math.abs(x - X) < 1.5 && z > Z - 6) continue;
      const m = lam(C[k % C.length]), kind = k % 4, s = 0.4 + hh(k, 3) * 0.9;
      if (kind === 0) sph(g, s, x, s * 0.5, z, m, 1, 0.75, 1);                              // brain coral
      else if (kind === 1) { for (let b = 0; b < 5; b++) { const c = cyl(g, 0.06, 0.1, s * 2.2, x + Math.cos(b) * 0.2, s, z + Math.sin(b) * 0.2, m, 8); c.rotation.set(Math.sin(b * 2) * 0.5, 0, Math.cos(b * 3) * 0.5); sph(g, 0.12, c.position.x + Math.cos(b * 3) * s * 0.5, s * 2.0, c.position.z, m); } } // branching
      else if (kind === 2) { const c = new THREE.Mesh(new THREE.ConeGeometry(s * 0.6, s * 1.8, 12, 1, true), m); c.position.set(x, s * 0.9, z); c.rotation.x = Math.PI; c.castShadow = true; g.add(c); } // vase
      else for (let b = 0; b < 3; b++) sph(g, s * 0.5, x + b * 0.3, s * 0.3 + b * 0.2, z, m, 1.4, 0.25, 1);                  // plates
    }
    const weedM = lam("#3fa34d");
    for (let k = 0; k < 40; k++) { const h = 1.2 + hh(k, 20) * 2.2, w = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, 0.04).translate(0, h / 2, 0), weedM); w.position.set(X - 15 + hh(k, 21) * 30, 0, Z - 2 - hh(k, 22) * 28); w.castShadow = true; g.add(w); R.weeds.push(w); }
    for (let k = 0; k < 10; k++) sph(g, 0.8 + hh(k, 30), X - 16 + hh(k, 31) * 32, 0.3, Z - 4 - hh(k, 32) * 24, lam("#8a8f9a"), 1.5, 0.7, 1.2);
    // coral spawn: pink eggs rising
    const N = 2500, pos = new Float32Array(N * 3), sd = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos.set([X - 14 + hh(i, 40) * 28, hh(i, 41) * 8, Z - 3 - hh(i, 42) * 26], i * 3); sd[i] = hh(i, 43); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    const u = { uT: { value: 0 }, uShow: { value: 0 } };
    const pts = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false,
      vertexShader: `attribute float aSeed; uniform float uT; varying float vA; void main(){ vec3 p = position; p.y = mod(p.y + uT * (0.3 + 0.5 * aSeed), 8.0); p.x += sin(uT + aSeed * 30.0) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(60.0 / -mv.z, 2.0, 24.0); vA = smoothstep(0.0, 1.0, p.y) * (1.0 - smoothstep(6.0, 8.0, p.y)); }`,
      fragmentShader: `uniform float uShow; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; if (r > 1.0) discard; gl_FragColor = vec4(1.0, 0.55, 0.75, (1.0 - r * r) * vA * uShow); }` }));
    pts.frustumCulled = false; pts.layers.set(NOINK); g.add(pts); R.spawn = { pts, u };
  }
  // ================= farm =================
  {
    const g = groups.farm, [X, , Z] = ORIGIN.farm;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320).rotateX(-Math.PI / 2), lam({ map: rep(grassHD(), 40, 40) })); ground.position.set(X, 0, Z); ground.receiveShadow = true; g.add(ground);
    const rows = [lam("#8a5a34"), lam("#ffd23f"), lam("#6bd36b")];
    for (let k = 0; k < 12; k++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(40, 1.6).rotateX(-Math.PI / 2), rows[k % 3]); r.position.set(X - 30, 0.02, Z - 20 - k * 2); r.receiveShadow = true; g.add(r); }
    // the red barn
    const red = lam("#d84a3a"), white = lam("#ffffff");
    box(g, 8, 5, 6, X + 8, 2.5, Z - 18, red);
    const tri = new THREE.Shape(); tri.moveTo(-4.4, 0); tri.lineTo(4.4, 0); tri.lineTo(0, 3.0); tri.closePath();
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 6.4, bevelEnabled: false }).translate(0, 0, -3.2), lam("#5a3a2a")); roof.position.set(X + 8, 5.0, Z - 18); roof.castShadow = true; g.add(roof);
    box(g, 2.6, 3, 0.1, X + 8, 1.5, Z - 14.96, white); box(g, 2.2, 2.6, 0.12, X + 8, 1.3, Z - 14.92, lam("#a8322a"));
    cyl(g, 1.6, 1.6, 9, X + 14, 4.5, Z - 19, lam("#c9ccd6")); sph(g, 1.6, X + 14, 9, Z - 19, lam("#d84a3a"));
    // fence + hay
    const post = lam("#b97d4a");
    for (let k = 0; k < 20; k++) { cyl(g, 0.07, 0.07, 1.1, X - 12 + k * 1.6, 0.55, Z - 6, post, 6); }
    box(g, 32, 0.08, 0.06, X + 3.2, 0.8, Z - 6, post); box(g, 32, 0.08, 0.06, X + 3.2, 0.45, Z - 6, post);
    for (let k = 0; k < 6; k++) { const h = cyl(g, 0.6, 0.6, 1.0, X - 6 + k * 2.2, 0.6, Z - 10 - (k % 2) * 1.5, lam("#f2c94c"), 16); h.rotation.z = Math.PI / 2; }
    for (let k = 0; k < 10; k++) { const t = new THREE.Group(); t.position.set(X - 40 + k * 9, 0, Z - 40 - (k % 3) * 6); const tr = cyl(t, 0.2, 0.3, 2.6, 0, 1.3, 0, lam("#7a5236")); void tr; sph(t, 1.6, 0, 3.6, 0, lam("#4fae4a")); g.add(t); }
  }
  return R;
};

export const updateSets = (R: SetRefs, S: SceneState, f: number) => {
  const t = f / 30, lit = S.lights ?? (S.env === "night" ? 0 : 1), night = S.env === "night";
  R.tv.color.set(S.tv ? (Math.floor(t * 2) % 2 ? "#7fd8ff" : "#ffd27a") : "#101018");
  R.lamp.color.set(lit > 0.5 ? "#fff0b0" : "#3a3a44");
  for (const w of R.windows) w.color.set(night ? "#1d2748" : S.env === "dusk" ? "#ffb47a" : "#8fd0ff");
  R.fridgeDoor.rotation.y = -1.6 * (S.fridge ?? 0);
  R.fridgeLight.color.set(lit > 0.5 ? "#fff6d0" : "#2a2a34");
  R.tap.visible = (S.water ?? 0) > 0.02; R.tap.scale.set(1, Math.max(0.05, S.water ?? 0), 1);
  R.elevLight.color.set(lit > 0.5 ? "#fff6d0" : "#202028"); R.elevBtns.color.set(lit > 0.5 ? "#ffffff" : "#303038");
  R.monitor.color.set("#ffffff"); R.genLight.color.set(Math.floor(t * 3) % 2 ? "#3aff6a" : "#1a5a2a");
  for (const m of R.storeLights) m.color.set(lit > 0.5 ? "#ffffff" : "#30303a");
  R.globe.rotation.y = t * 1.5;
  R.weeds.forEach((w, i) => { w.rotation.z = Math.sin(t * 1.3 + i) * 0.18; w.rotation.x = Math.cos(t + i * 0.7) * 0.1; });
  R.spawn.u.uT.value = t; R.spawn.u.uShow.value = S.spawn ?? 0;
  R.domeSlit.color.set(night ? "#ffd27a" : "#20202a");
};
