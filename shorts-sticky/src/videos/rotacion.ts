import VOZ from "../../voz/rotacion/palabras.json";
// «¿Y si la Tierra dejara de girar 1 segundo?» — 52.7 s (1581 frames), timed to public/voz_rotacion.wav.
// words: Tierra 12 · girar 32 · segundo 52 · volando 86 | Aunque 119 · rapidísimo 173 · ecuador 202 · suelo gira 224 ·
// mil seiscientos setenta 242 · hora 294 · sonido 345 | frenara 397 · golpe 410 · detiene 442 · pero tú no 461 · gente 505 ·
// perros 530 · coches 556 · mares 594 | disparado 644 · este 666 · camión 697 · frena 706 · adelante 739 · avión 828 |
// aire 864 · huracán 951 · olas gigantes 988 · costas 1023 | Por suerte 1057 · polos 1087 · moverías 1149 | Por desgracia 1191 ·
// pingüinos 1238 | Lo bueno 1275 · espacio 1314 · frenar 1335 · así 1356 | se está frenando 1404 · despacio 1428 ·
// seiscientos millones 1462 · un día 1506 · veintidós horas 1535-1548
import type { Story, SceneState, Card, V3 } from "../engine/types";
import { makeTimeline, Shot, smooth, hh, gait, blinkAt } from "../engine/timeline";
import { STREET_X, BEACH_X } from "../engine/world";
import { band, mirrorFor } from "../engine/crowd";
import { ORIGIN } from "../engine/sets";
import type { Expr, Arm } from "../engine/stick";

const TOTAL = 1581, X = STREET_X, BX = BEACH_X;
const FA = ORIGIN.farm, CL = ORIGIN.classroom;
const at = (o: readonly number[], x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
const SHOTS: Shot[] = [
  { id: 1, a: 0, b: 110, keys: [{ f: 0, pos: [0.4, 1.6, 5.2], look: [0, 1.0, -0.8], fov: 48 }, { f: 110, pos: [0.2, 1.7, 6.2], look: [1.5, 1.4, -0.8], fov: 52, glide: true }] },
  { id: 2, a: 104, b: 235, keys: [{ f: 104, pos: [4, 6, 40], look: [0, 0, 0], fov: 42 }, { f: 235, pos: [0, 4, 36], look: [0, 0, 0], fov: 42, glide: true }] },
  { id: 3, a: 229, b: 372, keys: [{ f: 229, pos: at(FA, -1.5, 1.6, 9), look: at(FA, 0, 3.2, -6), fov: 54 }, { f: 372, pos: at(FA, -1.2, 1.5, 8), look: at(FA, 1, 3.8, -6), fov: 56, glide: true }] },
  { id: 4, a: 366, b: 630, keys: [
    { f: 366, pos: [X - 2.6, 1.7, 5.4], look: [X - 5.6, 1.0, -0.8], fov: 48 }, { f: 470, pos: [X - 2.9, 1.6, 4.8], look: [X - 5.6, 1.0, -0.6], fov: 48 },
    { f: 630, pos: [X - 0.5, 2.4, 9.5], look: [X - 3, 1.6, -4], fov: 54, glide: true },
  ] },
  { id: 5, a: 624, b: 770, keys: [{ f: 624, pos: [X + 7.2, 2.2, -2.5], look: [X - 2.1, 1.8, -3.5], fov: 54 }, { f: 770, pos: [X + 7.0, 2.4, -3.5], look: [X - 2.1, 2.0, -5.5], fov: 56, glide: true }] },
  { id: 6, a: 764, b: 853, keys: [{ f: 764, pos: at(FA, 0, 1.4, 8), look: at(FA, 0, 6, -10), fov: 56 }, { f: 853, pos: at(FA, 0.5, 1.4, 7.5), look: at(FA, 2, 6.5, -10), fov: 56 }] },
  { id: 7, a: 847, b: 1051, keys: [{ f: 847, pos: [BX + 4, 2.6, 16], look: [BX, 1.4, 7], fov: 50 }, { f: 1051, pos: [BX + 5, 3.2, 17.5], look: [BX - 1, 2.6, 5], fov: 56, glide: true }] },
  { id: 8, a: 1045, b: 1272, keys: [
    { f: 1045, pos: [0.4, 1.5, 4.4], look: [0, 1.0, -0.6], fov: 46 }, { f: 1180, pos: [0.3, 1.5, 4.0], look: [0, 1.0, -0.6], fov: 46 },
    { f: 1250, pos: [1.5, 4.8, 13], look: [0, 0.6, -4], fov: 54, glide: true }, { f: 1272, pos: [1.6, 5.0, 13.5], look: [0, 0.6, -4], fov: 54 },
  ] },
  { id: 9, a: 1266, b: 1400, keys: [{ f: 1266, pos: [-6, 4, 36], look: [0, 0, 0], fov: 42 }, { f: 1400, pos: [-3, 5.5, 31], look: [0, 0, 0], fov: 42, glide: true }] },
  { id: 10, a: 1394, b: TOTAL, keys: [{ f: 1394, pos: at(CL, -0.5, 1.7, 6.4), look: at(CL, -0.4, 1.5, -4), fov: 50 }, { f: TOTAL, pos: at(CL, -0.3, 1.6, 5.0), look: at(CL, -0.3, 1.5, -4), fov: 48, glide: true }] },
];
const { camAt, layersAt } = makeTimeline(SHOTS);
const scarf = (f: number) => Math.floor(((f / 30) * 1.3 % 1) * 8) / 8;
const sticky = (f: number, expr: Expr, arm: Arm = "down", look: [number, number] = [0, 0], x = 0, z = 0): Card =>
  ({ kind: "sticky", o: { expr, arm, look, blink: expr === "shock" || expr === "scream" ? 0 : blinkAt(f, 1), scarf: scarf(f) }, x, z, s: 0.75 });

/** screen-right direction on the ground for this shot's camera at frame f ("east") */
const east = (id: number, f: number): [number, number] => { const c = camAt(id, f), fx = c.look[0] - c.pos[0], fz = c.look[2] - c.pos[2], n = Math.hypot(fx, fz) || 1; return [-fz / n, fx / n]; };
/** launch a card east from frame f0: fast, rising, tumbling */
const fly = (cd: Card, id: number, f: number, f0: number, v = 13): Card => {
  if (f < f0) return cd;
  const dt = (f - f0) / 30, [ex, ez] = east(id, f0), k = 0.6 + hh(cd.x * 13 + cd.z * 7, 1) * 0.8;
  const isWide = cd.kind === "car";
  const o = cd.kind === "sticky" || cd.kind === "person" ? { ...cd.o, expr: "scream" as Expr, arm: "fly" as Arm, walk: undefined } : cd.kind === "dog" || cd.kind === "cat" ? { ...cd.o, mood: "scared" as const, walk: undefined } : cd.o;
  return { ...cd, o, x: cd.x + ex * v * k * dt, z: cd.z + ez * v * k * dt, y: (cd.y ?? 0) + (isWide ? 0.8 : 1.6) * dt * k + 0.6 * dt * dt, roll: -(isWide ? 1.2 : 3.5) * dt * k, mirror: isWide ? cd.mirror : false } as Card;
};

const parkCrowd = (id: number, f: number, expr: (i: number) => Expr, arm: (i: number) => Arm = () => "down", seed = 21) =>
  band({ n: 14, seed, x0: -5, x1: 5, z0: -1.4, z1: -9, f, cam: camAt(id, f), lead: [0, 0], expr, arm, wander: 0.25, walking: false });

const state = (id: number, f: number): SceneState => {
  switch (id) {
    case 1: {
      const go = 66, flying = f >= go;
      const cards = [sticky(f, f > 40 ? "shock" : "smile", f > 40 ? "down" : "icecream"), ...parkCrowd(id, f, (i) => (f > 40 ? "shock" : i % 3 ? "smile" : "happy"), (i) => (i % 6 === 0 ? "icecream" : i % 7 === 0 ? "phone" : "down"))];
      return { set: "park", env: "day", shake: f >= 40 && f < 50 ? 0.05 : 0, speedLines: flying ? smooth((f - go) / 6) : 0,
        cards: cards.map((c, i) => fly(c, id, f, go + (i % 5) * 2)) };
    }
    case 2: return { set: "space", env: "space", cards: [], space: { earth: { pos: [0, 0, 0], r: 10, rot: f * 0.09, axis: true }, lightDir: [-1, 0.3, 0.6] } };
    case 4: {
      const stop = 410, st = f >= stop;
      const crowd = band({ n: 14, seed: 23, x0: X - 9, x1: X - 3.5, z0: -1.6, z1: -11, f, cam: camAt(id, f), lead: [X - 5.6, 0], expr: (i) => (st ? "shock" : i % 3 ? "neutral" : "smile"), arm: (i) => (i % 5 === 0 ? "phone" : "down"), walking: !st, wander: st ? 0 : 0.6 });
      const across = band({ n: 8, seed: 24, x0: X + 6, x1: X + 9, z0: -14, z1: 10, f, cam: camAt(id, f), expr: () => (st ? "shock" : "neutral"), walking: !st });
      const cars: Card[] = [0, 1, 2].map((k) => ({ kind: "car", o: { body: ["#d84a3a", "#2f86d6", "#f2b632"][k], wheel: 0 }, x: X - 2.1 + (k % 2) * 4.2, z: -6 - k * 9, s: 0.95, mirror: mirrorFor(camAt(id, f).pos, camAt(id, f).look, 0, k % 2 ? 1 : -1) }));
      const people = [...crowd, ...across].filter((c) => c.kind === "person"), pets = [...crowd, ...across].filter((c) => c.kind !== "person");
      return { set: "street", env: "day", shake: st && f < stop + 12 ? 0.07 : 0, speedLines: f > 461 ? 0.8 : 0,
        cards: [fly(sticky(f, st ? "shock" : "smile", "down", [0, 0], X - 5.6, 0), id, f, 461), ...people.map((c, i) => fly(c, id, f, 497 + (i % 6) * 2)), ...pets.map((c, i) => fly(c, id, f, 522 + (i % 4) * 2)), ...cars.map((c, i) => fly(c, id, f, 546 + i * 3, 10))] };
    }
    case 5: {
      const brake = 706, carX = X - 2.1, z = f < brake ? -3.5 + 12 * (brake - f) / 30 : -3.5, t = f / 30;
      const truck: Card = { kind: "car", o: { body: "#2f86d6", wheel: f < brake ? Math.round((t * 8 % 6.28) * 4) / 4 : 0 }, x: carX, z, s: 1.5, mirror: mirrorFor(camAt(id, f).pos, camAt(id, f).look, 0, -1) };
      const riders: Card[] = [0, 1, 2].map((k) => {
        const base: Card = k === 1 ? { ...sticky(f, f < brake ? "happy" : "scream", f < brake ? "wave" : "fly"), x: carX + 0.3, y: 2.62, z: z + 0.9 - k * 0.9 } :
          { kind: "person", o: { expr: f < brake ? "smile" : "scream", hat: k ? "cowboy" : "cap", hatCol: k ? "#7a4b2a" : "#d84a3a", stache: k ? "thick" : undefined, arm: f < brake ? "wave" : "fly" }, x: carX + 0.3, y: 2.62, z: z + 0.9 - k * 0.9, s: 0.74 };
        if (f < brake) return base;
        const dt = (f - brake) / 30;
        return { ...base, z: base.z - 9 * dt, y: Math.max(0, 2.62 + 2.2 * dt - 3 * dt * dt), roll: -2.5 * dt } as Card;
      });
      const side = band({ n: 10, seed: 25, x0: X - 9.5, x1: X - 4.5, z0: -14, z1: 6, f, cam: camAt(id, f), expr: () => (f > brake ? "shock" : "neutral"), walking: false });
      return { set: "street", env: "day", shake: f >= brake && f < brake + 8 ? 0.05 : 0, speedLines: f > brake && f < 780 ? 0.7 : 0, cards: [truck, ...riders, ...side] };
    }
    case 7: {
      const wv = f > 975, wx = BX - 26 + 26 * smooth((f - 975) / 70);
      const crowd = band({ n: 10, seed: 27, x0: BX - 7, x1: BX + 6, z0: 3, z1: 11, f, cam: camAt(id, f), lead: [BX, 9], expr: () => "scream", arm: (i) => (i % 3 ? "fly" : "cover") });
      return { set: "beach", env: "day", tide: 0.2, flow: 8, speedLines: 1, shake: 0.03,
        cards: [fly(sticky(f, "scream", "fly", [1, 0], BX, 9), id, f, 930, 6), ...crowd.map((c, i) => fly(c, id, f, 900 + (i % 10) * 10, 7)), ...(wv ? [{ kind: "wave", o: { t: f / 30 }, x: wx, z: -1, s: 4.2 } as Card] : [])] };
    }
    case 8: {
      const pengs: Card[] = [];
      for (let i = 0; i < 40; i++) { const x = -9 + hh(i, 81) * 18, z = -1.5 - hh(i, 82) * 14; if (Math.abs(x) < 1.2 && z > -3) continue; pengs.push({ kind: "penguin", o: { coat: "#20202a", walk: i % 3 ? gait(f, 1.6, hh(i, 83)) : undefined }, x: x + Math.sin(f / 40 + i) * 0.3, z, s: 0.42 + hh(i, 84) * 0.12 }); }
      return { set: "park", env: "day", snow: true, cards: [sticky(f, f > 1191 ? "sad" : "relief", "down", f > 1191 ? [0.6, 0.2] : [0, 0]), ...pengs] };
    }
    case 3: case 6: { // the farm and a plane in the sky
      const cows: Card[] = [[3.0, -3], [-3.2, -4], [5.2, -6.5]].map(([x, z], i) => ({ kind: "cow", o: { coat: "#fff", mood: id === 6 ? "scared" : "calm" }, x: FA[0] + x, z: FA[2] + z, s: 0.95, mirror: i === 1 }));
      const px = id === 3 ? -16 + (f - 229) * 0.12 + Math.max(0, f - 321) * 0.9 : -22 + (f - 764) * 0.5;
      const plane: Card = { kind: "plane", o: { body: id === 3 ? "#ffffff" : "#ffd23f" }, x: FA[0] + px, y: 6.5, z: FA[2] - 14, s: 2.2, mirror: mirrorFor(camAt(id, f).pos, camAt(id, f).look, 1, 0) };
      const chick: Card[] = [0, 1, 2, 3].map((i) => ({ kind: "chicken", o: { coat: "#fff", walk: gait(f, 2.4, i * 0.3), mood: "calm" }, x: FA[0] - 1.5 + i * 1.1, z: FA[2] - 0.5 - (i % 2), s: 0.4, mirror: i % 2 === 0 }));
      return { set: "farm", env: "day", speedLines: (id === 3 && f > 321) || id === 6 ? 0.5 : 0,
        cards: [plane, ...cows, ...chick, sticky(f, f > 321 || id === 6 ? "shock" : "smile", "point", [FA[0], 0], FA[0], FA[2] + 2), { kind: "person", o: { expr: "happy", hat: "cowboy", hatCol: "#b97d4a", stache: "thick", arm: "wave" }, x: FA[0] - 1.5, z: FA[2] + 0.6, s: 0.74 }] };
    }
    case 10: { // the classroom: a day used to be shorter than 22 hours
      const kids: Card[] = [[-3.3, 0.5], [-1.1, 0.5], [1.1, 0.5], [-2.2, 2.1], [2.2, 2.1]].map(([x, z], i) => ({ kind: "person", o: { expr: i % 2 ? "smile" : "happy", hat: (["cap", "bow", "hair", "pony", "beanie"] as const)[i], hatCol: ["#ffd23f", "#ff6fa3", "#000", "#9b6bff", "#2ed3c6"][i], glasses: i === 2, arm: i % 2 ? "wave" : "cheer" }, x: CL[0] + x, z: CL[2] + z, s: 0.54 }));
      return { set: "classroom", env: "day", cards: [{ kind: "person", o: { expr: "smile", hat: "bowler", hatCol: "#5a3a2a", stache: "curly", glasses: true, tie: "#e62117", arm: "point" }, x: CL[0] - 2.6, z: CL[2] - 3.2, s: 0.74, mirror: true }, { kind: "sticky", o: { expr: "happy", arm: "point", look: [0, -0.6], blink: blinkAt(f, 1), scarf: 0 }, x: CL[0] + 0.3, z: CL[2] - 1.6, s: 0.75 }, ...kids] };
    }
    case 9: return { set: "space", env: "space", cards: [], space: { earth: { pos: [0, 0, 0], r: 10, rot: 1.2 + f * (f > 1385 ? 0.02 : 0.03), axis: true }, lightDir: [-1, 0.3, 0.6] } };
    default: return { set: "park", env: "day", cards: [] };
  }
};

const dofAt = (id: number, f: number) => {
  if (id === 2 || id === 9) return { cInf: 0 };
  if (id === 4) return f > 470 ? { cInf: 3 } : { cInf: 10, focus: [X - 5.6, 1.05, 0] as V3 };
  if (id === 3 || id === 5 || id === 6 || id === 7 || id === 10) return { cInf: 3 };
  return f > 70 && id === 1 ? { cInf: 3 } : { cInf: 10, focus: [0, 1.05, 0] as V3 };
};

export const ROTACION: Story = {
  voz: VOZ,
  TOTAL, camAt, layersAt, dofAt, state,
  MARKS: [
    { a: 40, b: 104, label: "1 SEGUNDO", sub: "la Tierra se detiene", col: "#ffd23f" },
    { a: 240, b: 320, label: "1,670 km/h", sub: "gira el suelo en el ecuador", col: "#ffffff" },
    { a: 321, b: 372, label: "MÁS QUE EL SONIDO", sub: "1,235 km/h", col: "#ffd23f" },
    { a: 774, b: 853, label: "MÁS QUE UN AVIÓN", sub: "un avión: ~900 km/h", col: "#ffd23f" },
    { a: 912, b: 982, label: "VIENTOS", sub: "más que cualquier huracán", col: "#ff6a5a" },
    { a: 984, b: 1051, label: "OLAS GIGANTES", sub: "barriendo las costas", col: "#9fd4ff" },
    { a: 1080, b: 1185, label: "EN LOS POLOS", sub: "casi no se gira", col: "#ffffff" },
    { a: 1449, b: 1504, label: "HACE 600 MILLONES", sub: "de años", col: "#ffffff" },
    { a: 1506, b: TOTAL + 10, label: "1 DÍA = 22 HORAS", sub: "la Tierra se está frenando", col: "#ffd23f" },
  ],
};
