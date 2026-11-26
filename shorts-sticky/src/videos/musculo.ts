import VOZ from "../../voz/musculo/palabras.json";
// «¿Y si ganaras 1 kg de músculo cada hora?» — video largo horizontal 1920x1080, voz de 600.5 s (18016 frames).
// Las tomas salen de la tabla ROWS (tiempo de inicio de la frase en segundos, según palabras.json; frame = t*30).
// Las tomas de más de 9.2 s se parten en dos (otro ángulo de cámara y, si se pide, otra expresión/escenario).
// Sticky crece (musc 0..10) según el capítulo: hora 1 → 0.3 ... mes 1 → 10 (a pasos de 0.25).
import type { Story, SceneState, Card, V3, Env, SetName } from "../engine/types";
import { makeTimeline, Shot, gait, smooth } from "../engine/timeline";
import { ORIGIN } from "../engine/sets";
import { STREET_X, BEACH_X } from "../engine/world";
import { sticky, who, MAMA, PAPA, NINO, ABUELA, DOCTORA, CIENTIFICA, PROFE, TENDERO, OBRERO, SENOR, TOBY, MICHI, ESCALA } from "../engine/elenco";
import { band, mirrorFor } from "../engine/crowd";
import type { Expr, Arm, PersonOpts } from "../engine/stick";

const TOTAL = Math.ceil(600.528 * 30);
const FPS = 30;

// ---------- musc por capítulo (segundos de inicio → músculo) ----------
const CH: [number, number][] = [[0, 0], [27.6, 0.3], [69.0, 1], [145.5, 2.5], [198.6, 4], [289.2, 5.5], [349.7, 7], [426.2, 8.5], [514.8, 10]];
const muscAt = (t: number): number => {
  let v = 10;
  for (let i = 0; i < CH.length - 1; i++) if (t < CH[i + 1][0]) { const u = (t - CH[i][0]) / (CH[i + 1][0] - CH[i][0]); v = CH[i][1] + (CH[i + 1][1] - CH[i][1]) * smooth(u * 0.5 + 0.25 * u); break; }
  return Math.round(v * 4) / 4;
};

// ---------- configuración de escenarios ----------
type Cfg = {
  O: [number, number];            // origen (x, z)
  az: number; d: number; h: number; side: number; // z de Sticky, distancia de cámara, altura, desplazamiento lateral
  ex?: { x0: number; x1: number; z0: number; z1: number; n: number }; // extras (relativo al origen)
  slots: [number, number][];      // lugares para el elenco; dx > 0 = el lado abierto (hacia donde mira Sticky)
};
const HO = ORIGIN.house, EL = ORIGIN.elevator, HS = ORIGIN.hospital, ST = ORIGIN.store, CL = ORIGIN.classroom, DS = ORIGIN.desert, RF = ORIGIN.reef, FA = ORIGIN.farm, GY = ORIGIN.gym;
const CFG: Record<string, Cfg> = {
  house: { O: [HO[0], HO[2]], az: 0.4, d: 5.6, h: 1.5, side: 1.4, ex: { x0: -4, x1: 4, z0: -3.6, z1: -1.8, n: 2 }, slots: [[2.6, -1.0], [4.0, -2.3], [1.3, -2.9], [5.0, -0.8]] },
  gym: { O: [GY[0], GY[2]], az: 0.6, d: 6.0, h: 1.6, side: 1.4, ex: { x0: -5, x1: 3, z0: -4.2, z1: -2.2, n: 3 }, slots: [[2.6, -1.4], [4.0, -2.6], [1.2, -3.0], [-0.3, -3.6]] },
  street: { O: [STREET_X, 0], az: 1.0, d: 7.0, h: 1.5, side: 0, ex: { x0: -9, x1: 9, z0: -16, z1: -3, n: 24 }, slots: [[2.8, -1.6], [4.4, -2.6], [1.4, -3.0], [5.6, -1.4]] },
  elevator: { O: [EL[0], EL[2]], az: 0.3, d: 4.6, h: 1.4, side: 0, slots: [[0.9, -0.1], [-0.9, -0.2]] },
  hospital: { O: [HS[0], HS[2]], az: 0.5, d: 5.4, h: 1.6, side: 1.0, ex: { x0: -3.5, x1: 3.5, z0: -3.0, z1: -1.6, n: 1 }, slots: [[2.6, -1.0], [4.0, -2.0], [1.2, -2.2]] },
  store: { O: [ST[0], ST[2]], az: -0.4, d: 4.8, h: 1.6, side: 0, ex: { x0: -1.2, x1: 1.2, z0: -12, z1: -4, n: 4 }, slots: [[1.3, -1.5], [-1.3, -2.2], [1.2, -3.2]] },
  classroom: { O: [CL[0], CL[2]], az: 1.4, d: 5.6, h: 1.6, side: 1.2, ex: { x0: -3.5, x1: 3.5, z0: 0.5, z1: 2.2, n: 3 }, slots: [[2.8, -0.4], [4.0, -2.2], [1.4, -2.6]] },
  park: { O: [0, 0], az: 0, d: 6.0, h: 1.5, side: 0, ex: { x0: -8, x1: 8, z0: -12, z1: -2, n: 12 }, slots: [[2.6, -1.2], [4.0, -2.4], [1.3, -3.0], [5.0, -1.0]] },
  farm: { O: [FA[0], FA[2]], az: 2.0, d: 6.0, h: 1.6, side: 0, ex: { x0: -6, x1: 6, z0: -2, z1: -7, n: 2 }, slots: [[2.8, -1.4], [4.2, -2.4], [1.4, -3.0]] },
  desert: { O: [DS[0], DS[2]], az: 0, d: 6.2, h: 1.3, side: 0, slots: [[2.8, -1.2], [4.2, -2.4], [1.4, -3.0]] },
  beach: { O: [BEACH_X, 0], az: 9, d: 5.8, h: 1.8, side: 0, ex: { x0: -6, x1: 5, z0: 3.5, z1: 7.5, n: 5 }, slots: [[2.8, -1.4], [4.2, -2.4]] },
  reef: { O: [RF[0], RF[2]], az: -1.2, d: 5.0, h: 1.8, side: 0, slots: [] },
  space: { O: [0, 0], az: 0, d: 6, h: 1.0, side: 0, slots: [] },
};
const SETNAME: Record<string, SetName> = { house: "house", gym: "gym", street: "street", elevator: "elevator", hospital: "hospital", store: "store", classroom: "classroom", park: "park", farm: "farm", desert: "desert", beach: "beach", reef: "reef", space: "space" };

// ---------- elenco ----------
const PERS: Record<string, PersonOpts> = { MAMA, PAPA, NINO, ABUELA, DOCTORA, CIENTIFICA, PROFE, TENDERO, OBRERO, SENOR };
const SCALE: Record<string, number> = { NINO: ESCALA.nino };

// ---------- tabla de tomas ----------
// [segundo de inicio, escenario, ambiente, expresión, brazo, elenco, opciones]
// opciones: walk (m/s, camina hacia el lado abierto), run, e2/a2 (expresión y brazo de la 2.ª mitad), set2/env2 (escenario de la 2.ª mitad),
//           fridge (nevera abierta), bascula (0..1 al final), tv, rx (expresión del elenco), arm (brazo del elenco)
type Opt = { walk?: number; run?: boolean; e2?: Expr; a2?: Arm; set2?: string; env2?: Env; fridge?: boolean; bascula?: number; tv?: boolean; rx?: Expr; carm?: Arm; side?: 1 | -1; fy?: boolean };
type Row = [number, string, Env, Expr, Arm, string, Opt?];
const ROWS: Row[] = [
  [0.0, "house", "day", "smile", "flex", "MAMA", { e2: "smile", a2: "point" }],
  [9.0, "space", "space", "smile", "point", "", {}],
  [15.8, "gym", "day", "smile", "flex", "extras:2", { e2: "happy", a2: "curl" }],
  [26.4, "house", "day", "neutral", "up", "MAMA", {}],
  [27.6, "house", "day", "sleep", "up", "", { e2: "shock", a2: "down" }],
  [36.0, "house", "day", "happy", "icecream", "MAMA", { fridge: true }],
  [46.0, "store", "day", "happy", "icecream", "TENDERO", { e2: "smile", a2: "flash" }],
  [53.5, "desert", "day", "worried", "down", "", { e2: "sad" }],
  [63.1, "house", "day", "lick", "icecream", "", { fridge: true }],
  [69.0, "house", "day", "worried", "cover", "MAMA", { e2: "worried", a2: "down" }],
  [79.2, "park", "day", "worried", "cover", "NINO,TOBY", { walk: 1.3, rx: "smile" }],
  [86.4, "hospital", "day", "worried", "down", "DOCTORA", { rx: "shock" }],
  [94.8, "gym", "day", "shock", "flex", "", { e2: "worried", a2: "flex" }],
  [104.8, "beach", "day", "shiver", "down", "TOBY", { e2: "relief", a2: "up" }],
  [115.4, "house", "day", "happy", "icecream", "MAMA", { fridge: true, rx: "shock" }],
  [125.9, "house", "dusk", "worried", "cover", "MICHI", { e2: "worried", a2: "down" }],
  [133.7, "street", "day", "worried", "down", "OBRERO,SENOR,extras", { walk: 1.3 }],
  [140.2, "street", "day", "shock", "down", "extras", { walk: 1.3, rx: "shock" }],
  [145.5, "street", "dusk", "shock", "down", "SENOR,NINO", { walk: 1.3 }],
  [151.3, "house", "dusk", "happy", "flex", "", { e2: "shock", a2: "down", set2: "street", env2: "dusk" }],
  [161.2, "gym", "day", "smile", "flex", "extras:2", {}],
  [171.5, "park", "day", "happy", "icecream", "NINO,TOBY", { walk: 1.3, e2: "happy", a2: "icecream" }],
  [181.8, "park", "dusk", "shock", "down", "NINO,TOBY", { rx: "shock", e2: "sleep", a2: "down", set2: "house", env2: "night" }],
  [191.9, "house", "night", "sleep", "down", "MICHI", { e2: "worried", a2: "cover" }],
  [198.6, "house", "day", "happy", "flex", "", { e2: "worried", a2: "down" }],
  [209.0, "house", "day", "worried", "cover", "PAPA", { e2: "shock", a2: "flex" }],
  [219.1, "street", "day", "worried", "down", "ABUELA", { rx: "worried" }],
  [227.3, "park", "day", "worried", "cover", "PAPA", { walk: 1.0 }],
  [234.4, "hospital", "day", "worried", "down", "DOCTORA", { rx: "worried" }],
  [240.4, "street", "day", "scream", "down", "extras", { walk: 3.5, run: true, rx: "shock" }],
  [251.1, "gym", "day", "worried", "down", "DOCTORA", { bascula: 0.6, rx: "shock" }],
  [261.0, "hospital", "day", "relief", "down", "DOCTORA", { rx: "smile", e2: "worried" }],
  [268.3, "elevator", "day", "worried", "down", "extras:1", { rx: "worried" }],
  [276.3, "elevator", "day", "shock", "flex", "extras:2", { rx: "shock", e2: "worried", a2: "down" }],
  [286.9, "street", "dusk", "worried", "down", "ABUELA", {}],
  [289.2, "house", "day", "shock", "point", "MAMA", { e2: "worried", a2: "down" }],
  [298.2, "house", "day", "shock", "down", "PAPA", { e2: "scream", a2: "cover" }],
  [308.8, "street", "day", "happy", "wave", "NINO,SENOR,extras", { rx: "happy", carm: "phone" }],
  [316.6, "park", "day", "happy", "wave", "extras", { rx: "happy", carm: "phone" }],
  [322.5, "house", "day", "shock", "icecream", "MAMA", { fridge: true, rx: "shock" }],
  [330.8, "store", "day", "happy", "icecream", "TENDERO", { rx: "shock", e2: "happy" }],
  [341.4, "street", "day", "shock", "point", "extras", { rx: "worried" }],
  [349.7, "gym", "day", "worried", "down", "MAMA,CIENTIFICA", { bascula: 0.9 }],
  [358.2, "gym", "day", "smile", "flex", "extras:2", { e2: "smile", a2: "curl" }],
  [366.1, "house", "night", "shiver", "down", "", { e2: "worried", a2: "up" }],
  [373.0, "hospital", "day", "shock", "down", "DOCTORA", { rx: "shock" }],
  [380.7, "classroom", "day", "smile", "point", "CIENTIFICA,PROFE", { e2: "worried", a2: "down" }],
  [389.7, "farm", "day", "neutral", "flex", "OBRERO,TOBY", {}],
  [397.4, "classroom", "day", "shock", "down", "CIENTIFICA", { e2: "smile", a2: "flex" }],
  [406.5, "house", "day", "worried", "down", "MAMA,CIENTIFICA", {}],
  [413.8, "house", "day", "smile", "point", "CIENTIFICA,PROFE", { e2: "worried", a2: "down" }],
  [421.8, "house", "dusk", "shock", "down", "MAMA", {}],
  [426.2, "street", "day", "worried", "flex", "extras", { rx: "shock" }],
  [434.5, "park", "day", "worried", "down", "MAMA,NINO,TOBY", { e2: "worried", a2: "icecream" }],
  [445.0, "beach", "day", "worried", "down", "NINO,TOBY", { walk: 0.9, rx: "shock" }],
  [451.5, "gym", "day", "worried", "curl", "SENOR,extras:2", { rx: "shock", e2: "shock" }],
  [459.8, "gym", "day", "smile", "curl", "SENOR,extras:2", { rx: "shock" }],
  [468.8, "street", "dusk", "worried", "down", "extras", { rx: "shock" }],
  [477.7, "house", "night", "worried", "down", "MAMA,PAPA", { tv: true, rx: "shock" }],
  [484.4, "classroom", "day", "smile", "wave", "PROFE,CIENTIFICA", { rx: "shock" }],
  [492.7, "park", "dusk", "worried", "cover", "NINO,TOBY,MICHI", { rx: "shock" }],
  [499.4, "house", "dusk", "worried", "icecream", "MAMA", { fridge: true, rx: "shock", e2: "shock" }],
  [509.2, "farm", "dusk", "worried", "down", "MAMA,PAPA", { rx: "worried" }],
  [514.8, "desert", "day", "worried", "flex", "CIENTIFICA", { e2: "shock", a2: "flex" }],
  [523.8, "gym", "day", "shock", "flex", "extras:3", { bascula: 1.0, rx: "shock", e2: "smile" }],
  [533.0, "classroom", "day", "neutral", "flex", "CIENTIFICA,PROFE", { rx: "smile" }],
  [541.9, "house", "night", "shock", "icecream", "MAMA", { fridge: true, rx: "shock" }],
  [548.7, "hospital", "day", "worried", "down", "DOCTORA", { rx: "shock" }],
  [559.3, "space", "space", "shock", "flex", "", { e2: "sad", a2: "down" }],
  [569.9, "beach", "dusk", "neutral", "down", "TOBY", { walk: 0.9 }],
  [579.3, "reef", "underwater", "sleep", "down", "extras", { e2: "smile" }],
  [588.1, "beach", "day", "happy", "icecream", "TOBY,MICHI", {}],
  [596.1, "park", "day", "smile", "wave", "MAMA,PAPA,NINO,TOBY,MICHI", { rx: "happy", carm: "wave" }],
];

// ---------- armado de tomas ----------
type Meta = { a: number; b: number; t0: number; set: string; env: Env; expr: Expr; arm: Arm; cast: string[]; o: Opt; idx: number; half: number; s: 1 | -1 };
const META: Meta[] = [];
const SHOTS: Shot[] = [];
const WALKX = (m: Meta, t: number) => (m.o.walk ? m.s * m.o.walk * (t - (m.a + 3) / FPS) : 0); // desplazamiento de Sticky respecto del ancla (s = lado abierto)

ROWS.forEach((row, i) => {
  const [t0, set, env, expr, arm, cast, o = {}] = row;
  const tEnd = i + 1 < ROWS.length ? ROWS[i + 1][0] : TOTAL / FPS;
  const dur = tEnd - t0, split = dur > 9.2;
  const parts = split ? 2 : 1;
  for (let p = 0; p < parts; p++) {
    const ta = t0 + (dur * p) / parts, tb = t0 + (dur * (p + 1)) / parts;
    const idx = META.length;
    const m: Meta = {
      a: Math.round(ta * FPS), b: Math.round(tb * FPS) + 6, t0: ta, idx, half: p,
      set: p === 1 && o.set2 ? o.set2 : set, env: p === 1 && o.env2 ? o.env2 : env,
      expr: p === 1 && o.e2 ? o.e2 : expr, arm: p === 1 && o.a2 ? o.a2 : arm,
      cast: cast ? cast.split(",") : [], o, s: o.side ?? ((idx * 5 + i) % 2 ? 1 : -1) as 1 | -1,
    };
    if (i === 0 && p === 0) m.a = 0;
    META.push(m);
    SHOTS.push({ id: idx + 1, a: m.a, b: m.b, keys: [] });
  }
});

// posición de Sticky y cámara
const anchor = (m: Meta): [number, number] => { const c = CFG[m.set]; return [c.O[0] - m.s * c.side, c.O[1] + c.az]; };
const muscOf = (m: Meta) => muscAt(m.t0 + 1);
const FRIDGE_A: [number, number] = [-3.7, -2.9];
const camKeys = (m: Meta) => {
  const c = CFG[m.set], [ax, az] = anchor(m), mu = muscOf(m), k = m.idx % 3, fov = 42 + (m.idx % 3);
  const wide = (1 + 0.03 * mu) * 0.68;
  let d = c.d * wide * (m.half ? 0.88 : 1) * (m.o.walk ? 1.12 : 1);
  const h = c.h + mu * 0.03, s = m.s, a = m.a, b = m.b;
  // lead camera: Sticky at one third of the frame
  const lat = 0.24 * d * s;
  let p0: V3, l0: V3, p1: V3, l1: V3, g: V3;
  if (m.set === "house" && m.o.fridge) {
    const [fx, fz] = [HO[0] + FRIDGE_A[0], HO[2] + FRIDGE_A[1]];
    p0 = [fx - 0.2, h, fz + d]; l0 = [fx - 1.1, 1.05, fz - 0.5]; p1 = [fx + 0.3, h - 0.05, fz + d - 0.6]; l1 = [fx - 0.9, 1.05, fz - 0.5];
  } else if (m.set === "gym" && m.o.bascula !== undefined) {
    const px = GY[0] + 2.3, pz = GY[2] + 0.95, dd = 5.0 * wide;
    p0 = [px + dd * 0.85, 1.55, pz + dd * 0.8]; l0 = [px - 0.8, 1.15, pz - 0.1]; p1 = [px + dd * 0.7, 1.5, pz + dd * 0.65]; l1 = [px - 0.9, 1.15, pz - 0.1];
  } else if (m.set === "space") {
    p0 = [2.4, 0.9, 7.2 * wide]; l0 = [-0.5, 0.7, 0]; p1 = [1.8, 1.0, 6.2 * wide]; l1 = [-0.5, 0.8, 0];
  } else if (m.set === "reef") {
    p0 = [ax + 0.8, h, az + d * 1.1]; l0 = [ax - 0.3, 1.6, az - 1.0]; p1 = [ax + 0.4, h - 0.2, az + d * 0.9]; l1 = [ax - 0.4, 1.7, az - 1.0];
  } else {
    // el seguimiento al caminar: Sticky se mueve y la cámara va con él
    const w0 = WALKX(m, a / FPS), w1 = WALKX(m, b / FPS);
    const sway = k === 2 ? 0.8 : 0.3;
    p0 = [ax + w0 + s * sway, h, az + d]; l0 = [ax + w0 + lat, 1.1, az - 1.2];
    const dz = k === 0 ? -0.8 : k === 1 ? 0.7 : 0, dx = k === 2 ? -s * 1.0 : 0;
    p1 = [ax + w1 + s * sway + dx, h - (k === 0 ? 0.05 : 0), az + d + dz]; l1 = [ax + w1 + lat + dx * 0.5, 1.1, az - 1.2];
  }
  g = [0, 0, 0];
  void g;
  return [{ f: a, pos: p0, look: l0, fov }, { f: b, pos: p1, look: l1, fov, glide: true }];
};
META.forEach((m, i) => { SHOTS[i].keys = camKeys(m); });
const { camAt, layersAt } = makeTimeline(SHOTS);

// ---------- estado de cada toma ----------
const state = (id: number, f: number): SceneState => {
  const m = META[id - 1], c = CFG[m.set], t = f / FPS, cam = camAt(id, f);
  const [ax0, az0] = anchor(m), mu = muscAt(t);
  const wx = WALKX(m, t);
  let sx = ax0 + wx, sz = az0, sy = 0;
  const o = m.o;
  if (m.set === "house" && o.fridge) { sx = HO[0] + FRIDGE_A[0]; sz = HO[2] + FRIDGE_A[1]; }
  if (m.set === "gym" && o.bascula !== undefined) { sx = GY[0] + 2.3; sz = GY[2] + 0.95; sy = 0.125; }
  if (m.set === "space") { sx = 0; sz = 0; sy = 0; }
  if (m.set === "reef") { sy = 0.5 + Math.sin(f / 22) * 0.06; }
  const walking = !!o.walk, gaitHz = o.run ? 2.4 : o.walk && o.walk < 1.15 ? 0.9 : 1.1;
  let st = sticky(f, m.expr, m.arm, [sx, sy, sz], [0.3 * m.s, 0], walking ? gait(f, gaitHz) : undefined, mu);
  if (st.kind === "sticky") {
    if (o.run) st = { ...st, o: { ...st.o, run: true } };
    if (walking && m.s < 0) st = { ...st, mirror: true };
  }
  const cards: Card[] = [st];
  // ----- elenco -----
  const rx: Expr = o.rx ?? (m.expr === "shock" || m.expr === "worried" || m.expr === "scream" ? "shock" : "happy");
  const slots = c.slots;
  let si = 0;
  const lead: [number, number] = [sx, sz];
  const abs = (dx: number, dz: number): [number, number] => {
    const base = m.set === "house" && o.fridge ? [HO[0] + FRIDGE_A[0], HO[2] + FRIDGE_A[1]] : m.set === "gym" && o.bascula !== undefined ? [GY[0] + 2.3, GY[2] + 0.95] : [ax0, az0];
    const sg = m.set === "house" && o.fridge ? 1 : m.set === "gym" && o.bascula !== undefined ? -1 : m.s;
    return [base[0] + sg * dx, (m.set === "gym" && o.bascula !== undefined ? GY[2] + 0.2 : base[1]) + dz];
  };
  let extrasN = 0;
  for (const tok of m.cast) {
    if (tok.startsWith("extras")) { extrasN = tok.includes(":") ? Number(tok.split(":")[1]) : c.ex?.n ?? 0; continue; }
    const slot = slots[si++ % Math.max(1, slots.length)];
    if (!slot) continue;
    let [x, z] = abs(slot[0], slot[1]);
    if (m.set === "street" || m.set === "park" || m.set === "beach") { x += wx * 0; }
    if (m.set === "elevator") { x = EL[0] + slot[0] * (si % 2 ? 1 : -1); z = EL[2] - 0.1 + slot[1]; }
    const face = x > sx; // mira hacia Sticky
    if (tok === "TOBY") cards.push({ kind: "dog", o: { ...TOBY, mood: rx === "shock" ? "scared" : "calm", walk: undefined }, x, z, s: ESCALA.perro, mirror: face });
    else if (tok === "MICHI") cards.push({ kind: "cat", o: { ...MICHI, mood: rx === "shock" ? "scared" : "calm" }, x, z, s: ESCALA.gato, mirror: face });
    else {
      const P = PERS[tok]; if (!P) continue;
      cards.push(who({ ...P, expr: rx, arm: o.carm ?? (tok === "DOCTORA" ? "down" : P.arm ?? "down") }, [x, 0, z], SCALE[tok] ?? ESCALA.adulto, { mirror: face }));
    }
  }
  if (extrasN > 0 && c.ex && m.set !== "reef") {
    const e = c.ex, O = c.O;
    cards.push(...band({
      n: extrasN, seed: 3 + m.idx * 7, x0: O[0] + e.x0, x1: O[0] + e.x1, z0: O[1] + e.z0, z1: O[1] + e.z1, f,
      cam: { pos: cam.pos, look: cam.look }, lead, expr: () => rx, arm: (i) => (o.carm && i % 2 === 0 ? o.carm : "down"), look: [0.4 * m.s, 0], wander: m.set === "street" || m.set === "park" ? 0.4 : 0.15,
    }));
  }
  if (extrasN > 0 && m.set === "reef") {
    for (let i = 0; i < 12; i++) {
      const dir = i % 2 ? 1 : -1, x = RF[0] - 6 + ((((i * 0.37) % 1) * 12 + dir * f * 0.04) % 12 + 12) % 12, y = 0.8 + ((i * 0.53) % 1) * 2.6, z = RF[2] - 3 - ((i * 0.29) % 1) * 7;
      cards.push({ kind: "fish", o: { coat: ["#ffd23f", "#ff9a3c", "#ff6fa3", "#2ed3c6", "#9b6bff"][i % 5], spot: i % 3 ? "#ffffff" : undefined }, x, y, z, s: 0.35 + ((i * 0.41) % 1) * 0.25, mirror: mirrorFor(cam.pos, cam.look, dir, 0) });
    }
  }
  // granja: vacas (los toros Belgian Blue)
  if (m.set === "farm") {
    [[3.2, -3.4], [-3.0, -4.0]].forEach(([x, z], i) => cards.push({ kind: "cow", o: { coat: "#ffffff", mood: "calm" }, x: FA[0] + x, z: FA[2] + z, s: 0.95, mirror: i % 2 === 1 }));
    cards.push({ kind: "pig", o: { coat: "#f7a8c0", mood: "calm" }, x: FA[0] + 5.0, z: FA[2] - 1.0, s: 0.6 });
  }
  // ----- estado del mundo -----
  const base: SceneState = { set: SETNAME[m.set], env: m.env, cards };
  if (m.env === "night") { base.stars = 0.9; }
  if (m.set === "street") base.lights = m.env === "day" ? 0 : 1;
  if (m.set === "gym") { base.saco = 0.3 + 0.3 * Math.sin(t * 1.8); base.cinta = 1.2; }
  if (m.set === "gym" && o.bascula !== undefined) base.bascula = o.bascula * smooth((f - m.a) / 40);
  if (m.set === "house") { base.fridge = o.fridge ? smooth((f - m.a) / 12) * 0.9 : 0; base.tv = !!o.tv; }
  if (m.set === "beach") base.tide = 0.2 * Math.sin(t * 1.2);
  if (m.set === "reef") base.spawn = 0;
  if (m.set === "space") {
    base.space = { sun: { pos: [-700, 60, -260], r: 60, lit: true }, earth: { pos: [0, -13, -6], r: 10, rot: f * 0.004 }, moon: { pos: [0, 22, 0], r: 2.7, show: 0 } };
  }
  return base;
};

const dofAt = (id: number, f: number) => {
  const m = META[id - 1];
  if (m.set === "space") return { cInf: 0 };
  void f;
  return { cInf: m.set === "reef" ? 4 : 7 };
};

// ---------- carteles ----------
const T = (s: number) => Math.round(s * FPS);
const MK: [number, string, string, string, number?][] = [
  [15.8, "½ A 1 KG AL MES", "lo normal si entrenas bien", "#ffffff"],
  [27.6, "HORA 1", "+1 kg de músculo", "#ffd23f"],
  [53.5, "75 % AGUA", "el músculo es casi agua", "#9fd4ff"],
  [69.0, "HORA 3", "+3 kg de músculo", "#ffd23f"],
  [94.8, "ESTRÍAS", "la piel no alcanza", "#ff9ab8"],
  [104.8, "13 kcal AL DÍA", "por cada kilo de músculo", "#ff9a3c"],
  [133.7, "PUERTAS: 80 cm", "los hombros ya casi no caben", "#ffffff"],
  [145.5, "HORA 8 · +8 kg", "fin del primer día", "#ffd23f", 150],
  [198.6, "DÍA 2", "+24 kg de ayer", "#ffd23f"],
  [240.4, "RABDOMIÓLISIS", "fibras rotas, riñones en riesgo", "#ff6a5a"],
  [268.3, "75 kg POR PERSONA", "el cálculo del ascensor", "#ffffff"],
  [289.2, "DÍA 3", "+72 kg de músculo", "#ffd23f"],
  [330.8, "2 500–5 000 kcal", "por cada kilo nuevo", "#ff9a3c"],
  [349.7, "SEMANA 1 · +168 kg", "pesa unos 240 kg", "#ffd23f", 150],
  [389.7, "MIOSTATINA", "el freno del músculo", "#9de38a"],
  [413.8, "200 kg/m²", "lo que aguanta un piso", "#ffffff"],
  [426.2, "SEMANA 2", "+336 kg de músculo", "#ffd23f"],
  [459.8, "500 kg", "récord de peso muerto", "#9fd4ff"],
  [514.8, "MES 1 · +720 kg", "790 kg en total", "#ffd23f", 150],
  [523.8, "635 kg", "récord: Jon Brower Minnoch", "#ffffff"],
  [541.9, "+9 000 kcal", "al día sin moverse", "#ff9a3c"],
];
const MARKS = MK.map(([t, label, sub, col, len = 120], i) => {
  const a = T(t) + 6, nextA = i + 1 < MK.length ? T(MK[i + 1][0]) + 6 - 6 : TOTAL;
  return { a, b: Math.min(a + len, nextA - 2), label, sub, col };
});

export const MUSCULO: Story = {
  formato: "horizontal", voz: VOZ, TOTAL, camAt, layersAt, dofAt, state, MARKS,
};
export const MUSCULO_TOMAS = META.length;
