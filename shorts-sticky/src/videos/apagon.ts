// «Apagón mundial: las primeras 72 horas» v2 — 58.4 s (1753 frames), many places, small casts per place.
// words: luz 32 · divertida 108 | Hora cero 144 · apagan 168 · semáforos 201 · internet 221 · elevadores 261 · pisos 303 ·
// celular 349 · funciona 383 | Por poco tiempo 419 · antenas 468 · horas 523 · silencio total 575 | Hora doce 622 · agua 686 ·
// electricidad 763 | Hora veinticuatro 805 · refrigerador 838 · perder 921 · hospitales 944 · gasolina 988 | Por suerte 1025 ·
// Vía Láctea 1124 | Por desgracia 1163 · vecino 1212 · vela 1231 · pilas 1257 | Hora setenta y dos 1291 · tres días 1396 |
// 1994 1474 · Los Ángeles 1544 · llamó 1584 · observatorio 1606 · nube plateada 1649 · Vía Láctea 1714
import type { Story, SceneState, Card, V3 } from "../engine/types";
import { makeTimeline, Shot, smooth, gait, blinkAt } from "../engine/timeline";
import { STREET_X } from "../engine/world";
import { ORIGIN } from "../engine/sets";
import { band, mirrorFor } from "../engine/crowd";
import type { Expr, Arm, PersonOpts } from "../engine/stick";

const TOTAL = 1753, X = STREET_X, OFF = 168;
const H = ORIGIN.house, E = ORIGIN.elevator, P = ORIGIN.hospital, S = ORIGIN.store, D = ORIGIN.desert;
const hz = (z: number) => H[2] + z, at = (o: readonly number[], x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
const SHOTS: Shot[] = [
  { id: 1, a: 0, b: 75, keys: [{ f: 0, pos: [X - 3, 3.4, 12], look: [X + 1, 1.6, -8], fov: 52 }, { f: 75, pos: [X - 2.4, 2.4, 7], look: [X + 1, 1.4, -6], fov: 50, glide: true }] },
  { id: 2, a: 70, b: 245, keys: [ // the living room: TV on... hour zero
    { f: 70, pos: at(H, 0.2, 1.7, 6.6), look: at(H, 1.6, 1.0, 0), fov: 50 },
    { f: 165, pos: at(H, 0.6, 1.55, 5.6), look: at(H, 1.6, 1.0, 0.2), fov: 48 },
    { f: 245, pos: at(H, 0.9, 1.5, 5.0), look: at(H, 1.5, 1.0, 0.3), fov: 46 },
  ] },
  { id: 3, a: 240, b: 258, keys: [{ f: 240, pos: [X - 1.4, 2.2, -2], look: [X + 5.2, 4.3, -10], fov: 44 }, { f: 258, pos: [X - 1.3, 2.2, -2.3], look: [X + 5.2, 4.3, -10], fov: 44 }] },
  { id: 4, a: 252, b: 322, keys: [{ f: 252, pos: at(E, 0, 1.5, 3.6), look: at(E, 0, 1.2, 0), fov: 50 }, { f: 322, pos: at(E, 0, 1.45, 3.1), look: at(E, 0, 1.15, 0), fov: 48 }] },
  { id: 5, a: 316, b: 420, keys: [{ f: 316, pos: [X - 3.0, 1.6, 4.8], look: [X - 5.6, 1.0, -0.6], fov: 48 }, { f: 420, pos: [X - 3.3, 1.55, 4.2], look: [X - 5.6, 1.0, -0.6], fov: 46 }] },
  { id: 6, a: 414, b: 620, keys: [{ f: 414, pos: [0.4, 1.6, 5.2], look: [0, 1.0, -0.8], fov: 48 }, { f: 620, pos: [1.2, 2.6, 7.5], look: [0, 0.9, -1.5], fov: 50, glide: true }] },
  { id: 7, a: 614, b: 800, keys: [ // the kitchen at noon: the tap dries up
    { f: 614, pos: at(H, -2.0, 1.7, 4.6), look: at(H, -4.2, 1.0, 0.0), fov: 50 },
    { f: 800, pos: at(H, -2.4, 1.55, 3.6), look: at(H, -4.4, 1.0, -0.4), fov: 48, glide: true },
  ] },
  { id: 8, a: 794, b: 935, keys: [ // the fridge
    { f: 794, pos: at(H, -3.9, 1.6, 1.4), look: at(H, -4.5, 1.0, -3.4), fov: 50 },
    { f: 935, pos: at(H, -4.0, 1.5, 0.8), look: at(H, -4.6, 1.0, -3.4), fov: 48, glide: true },
  ] },
  { id: 9, a: 929, b: 1022, keys: [{ f: 929, pos: at(P, 0.6, 1.8, 5.4), look: at(P, 0.2, 1.0, -1.6), fov: 52 }, { f: 1022, pos: at(P, 0.9, 1.7, 4.6), look: at(P, 0.6, 1.0, -1.8), fov: 50, glide: true }] },
  { id: 10, a: 1016, b: 1160, keys: [
    { f: 1016, pos: [X - 3.2, 1.5, 4.4], look: [X - 5.6, 1.05, -0.6], fov: 46 },
    { f: 1056, pos: [X - 3.1, 1.45, 4.3], look: [X - 5.6, 1.05, -0.6], fov: 46 },
    { f: 1112, pos: [X - 2.5, 1.0, 4.0], look: [X - 3, 30, -20], fov: 60, glide: true },
    { f: 1160, pos: [X - 2.4, 1.0, 4.1], look: [X - 4, 31, -20], fov: 60 },
  ] },
  { id: 11, a: 1154, b: 1291, keys: [{ f: 1154, pos: at(S, 0.2, 1.7, 4.0), look: at(S, 0, 1.1, -3), fov: 50 }, { f: 1291, pos: at(S, 0.1, 1.6, 3.0), look: at(S, 0, 1.1, -2), fov: 48, glide: true }] },
  { id: 12, a: 1285, b: 1430, keys: [{ f: 1285, pos: at(H, -0.6, 1.7, 5.4), look: at(H, -1.6, 1.0, -0.4), fov: 50 }, { f: 1430, pos: at(H, -0.9, 1.55, 4.4), look: at(H, -1.7, 1.0, -0.6), fov: 48, glide: true }] },
  { id: 13, a: 1424, b: TOTAL, keys: [ // Los Angeles 1994: the observatory on the hill
    { f: 1424, pos: at(D, -4, 1.8, 12), look: at(D, 6, 3.0, -22), fov: 50 },
    { f: 1600, pos: at(D, -2.5, 1.6, 9), look: at(D, 2, 1.6, -6), fov: 48, glide: true },
    { f: 1680, pos: at(D, -2, 1.0, 9.5), look: at(D, 2, 32, -24), fov: 62, glide: true },
    { f: TOTAL, pos: at(D, -2, 1.0, 9.6), look: at(D, 1, 33, -24), fov: 62 },
  ] },
];
const { camAt, layersAt } = makeTimeline(SHOTS);
const scarf = (f: number) => Math.floor(((f / 30) * 1.3 % 1) * 8) / 8;
const sticky = (f: number, expr: Expr, arm: Arm, pos: V3, look: [number, number] = [0, 0]): Card =>
  ({ kind: "sticky", o: { expr, arm, look, blink: expr === "shock" || expr === "scream" ? 0 : blinkAt(f, 1), scarf: scarf(f) }, x: pos[0], z: pos[2], s: 0.75 });
const who = (o: PersonOpts, pos: V3, s = 0.74, extra: Partial<Card> = {}): Card => ({ kind: "person", o, x: pos[0], z: pos[2], y: pos[1] || undefined, s, ...extra } as Card);
const MOM: PersonOpts = { expr: "smile", hat: "pony", hatCol: "#ff6fa3" };
const DAD: PersonOpts = { expr: "smile", hat: "none", stache: "thick", glasses: true, tie: "#2f86d6" };
const KID: PersonOpts = { expr: "happy", hat: "cap", hatCol: "#ffd23f" };
const GRANNY: PersonOpts = { expr: "smile", hat: "bow", hatCol: "#9b6bff", glasses: true, cane: true };

const state = (id: number, f: number): SceneState => {
  const c = camAt(id, f);
  switch (id) {
    case 1: {
      const crowd = band({ n: 12, seed: 3, x0: X - 9, x1: X - 4, z0: -3, z1: -16, f, cam: c, expr: (i) => (i % 3 ? "smile" : "neutral"), arm: (i) => (i % 3 === 0 ? "phone" : "down"), walking: true, wander: 0.5 });
      const cars: Card[] = [0, 1, 2, 3].map((k) => { const dir = k % 2 ? 1 : -1; return { kind: "car", o: { body: ["#d84a3a", "#2f86d6", "#f2b632", "#3fa34d"][k], lights: true, wheel: Math.round(((f / 10) % 6.28) * 4) / 4 }, x: X + dir * 2.1, z: -30 + k * 12 + dir * 9 * f / 30, s: 0.95, mirror: mirrorFor(c.pos, c.look, 0, dir) }; });
      return { set: "street", env: "night", lights: 1, cards: [...crowd, ...cars] };
    }
    case 2: {
      const on = f < OFF, ex: Expr = on ? (f > 95 ? "happy" : "smile") : f < 205 ? "shock" : "scream";
      return { set: "house", env: on ? "dusk" : "night", lights: on ? 1 : 0, tv: on, shake: f >= OFF && f < OFF + 10 ? 0.04 : 0,
        cards: [sticky(f, on ? "happy" : "shock", on ? "phone" : "down", at(H, 1.2, 0, 0.9), on ? [0.3, 0.3] : [0, 0]),
          who({ ...MOM, expr: ex, arm: on ? "wave" : "cover" }, at(H, 2.9, 0, 0.3)), who({ ...KID, expr: ex, arm: on ? "cheer" : "hug" }, at(H, 3.9, 0, 0.5), 0.54),
          { kind: "cat", o: { coat: "#f2a03a", mood: on ? "calm" : "scared" }, x: H[0] + 0.2, z: H[2] + 0.4, s: 0.5, mirror: true }] };
    }
    case 3: return { set: "street", env: "night", lights: 0, stars: 0.5, cards: [] };
    case 4: {
      const e2: Expr = f > 285 ? "worried" : "shock";
      return { set: "elevator", env: "night", lights: 0, shake: f >= 262 && f < 270 ? 0.03 : 0,
        cards: [who({ ...DAD, expr: e2, arm: "phone" }, at(E, -0.65, 0, 0.1)), sticky(f, e2, "down", at(E, 0.05, 0, 0.35)), who({ expr: e2, hat: "bowler", hatCol: "#2b2b33", bag: "#ff6fa3", arm: "cover" }, at(E, 0.7, 0, 0.0))] };
    }
    case 5: return { set: "street", env: "night", lights: 0, stars: 0.6,
      cards: [sticky(f, "worried", "phone", [X - 5.6, 0, 0], [0.3, 0.4]), ...band({ n: 14, seed: 8, x0: X - 9, x1: X - 3.5, z0: -1.6, z1: -10, f, cam: c, lead: [X - 5.6, 0], expr: () => "worried", arm: (i) => (i % 4 === 3 ? "down" : "phone") })] };
    case 6: {
      const dead = f > 556;
      return { set: "park", env: "night", stars: 0.9, moonDisc: { show: 0.8, bright: 1 },
        cards: [sticky(f, dead ? "sad" : "worried", dead ? "down" : "phone", [0, 0, 0], dead ? [0, 0.3] : [0.3, 0.4]),
          ...band({ n: 9, seed: 12, x0: -4, x1: 4, z0: -1.6, z1: -7, f, cam: c, lead: [0, 0], expr: () => (dead ? "sad" : "worried"), arm: (i) => (!dead && i % 3 ? "phone" : "down"), mood: () => (dead ? "sleep" : undefined) })] };
    }
    case 7: {
      const water = f < 690 ? 1 : 1 - smooth((f - 690) / 14);
      return { set: "house", env: "day", lights: 0, water,
        cards: [sticky(f, water > 0.5 ? "smile" : "shock", "down", at(H, -4.1, 0, -0.6), [-0.8, 0.4]), who({ ...GRANNY, expr: water > 0.5 ? "smile" : "worried", arm: "down" }, at(H, -2.9, 0, -1.9)),
          { kind: "dog", o: { coat: "#c98f5a", spot: "#3a2c24", mood: "calm" }, x: H[0] - 3.0, z: hz(0.4), s: 0.6 }] };
    }
    case 8: {
      const open = smooth((f - 830) / 14);
      return { set: "house", env: "dusk", lights: 0, fridge: open,
        cards: [sticky(f, f > 880 ? "sad" : "worried", "cover", at(H, -3.7, 0, -2.2), [-0.6, 0]), { kind: "dog", o: { coat: "#c98f5a", spot: "#3a2c24", mood: f > 900 ? "scared" : "calm", walk: gait(f, 1.6) }, x: H[0] - 3.2, z: hz(-1.8), s: 0.6, mirror: true },
          { kind: "cat", o: { coat: "#8a8a94", mood: "calm" }, x: H[0] - 2.4, z: hz(-2.4), s: 0.5 }] };
    }
    case 9: {
      const doc: PersonOpts = { expr: "worried", hat: "none", glasses: true, tie: "#2ed3c6", arm: "point" };
      const nurse: PersonOpts = { expr: "smile", hat: "bow", hatCol: "#ff6fa3", arm: "wave" };
      return { set: "hospital", env: "dusk", lights: 0,
        cards: [who(doc, at(P, 0.3, 0, -1.2)), who(nurse, at(P, 1.8, 0, -1.6)), who({ expr: "sleep", hat: "beanie", hatCol: "#2f86d6", stache: "curly" }, at(P, -1.5, 0.95, -2.5), 0.6, { roll: -Math.PI / 2 }), sticky(f, "worried", "down", at(P, -0.8, 0, 0.6))] };
    }
    case 10: {
      const wow = f > 1050;
      return { set: "street", env: "night", lights: 0, stars: 1, milky: smooth((f - 1060) / 40) * 0.95,
        cards: [sticky(f, wow ? "happy" : "neutral", "down", [X - 5.6, 0, 0], wow ? [0, -1] : [0, 0]), ...band({ n: 8, seed: 14, x0: X - 9, x1: X - 3.5, z0: -1.6, z1: -8, f, cam: c, lead: [X - 5.6, 0], expr: () => (wow ? "happy" : "neutral"), arm: (i) => (wow && i % 3 === 0 ? "point" : "down"), look: wow ? [0, -1] : [0, 0] })] };
    }
    case 11: {
      const nz = -9 + 6 * smooth((f - 1160) / 100);
      return { set: "store", env: "night", lights: 0,
        cards: [who({ expr: "worried", arm: "candle", hat: "beanie", hatCol: "#2f86d6", stache: "thick", glasses: true, walk: f < 1262 ? gait(f, 1.1) : undefined }, at(S, -0.5, 0, nz)),
          sticky(f, f > 1240 ? "smile" : "neutral", "flash", at(S, 0.6, 0, -0.6), [-0.4, 0]), { kind: "cat", o: { coat: "#2a2a32", mood: "calm" }, x: S[0] + 0.9, z: S[2] - 4, s: 0.5 }] };
    }
    case 12: return { set: "house", env: "day", lights: 1,
      cards: [sticky(f, "happy", "point", at(H, -1.0, 0, 0.4), [0.6, 0]), who({ ...DAD, expr: "smile", arm: "hug" }, at(H, -2.4, 0, -0.4)), who({ ...MOM, expr: "happy", arm: "cheer" }, at(H, -0.1, 0, -0.9)), who({ ...KID, arm: "wave" }, at(H, -1.8, 0, 0.9), 0.54),
        { kind: "dog", o: { coat: "#c98f5a", spot: "#3a2c24", mood: "bark" }, x: H[0] + 0.8, z: hz(0.6), s: 0.6 }] };
    default: {
      const scared = f > 1584, up = f > 1640;
      return { set: "desert", env: "night", stars: 1, milky: 0.35 + 0.65 * smooth((f - 1640) / 40),
        cards: [sticky(f, up ? "shock" : "neutral", "down", at(D, 0, 0, 2), up ? [0, -1] : [0, 0]),
          ...band({ n: 11, seed: 16, x0: D[0] - 5, x1: D[0] + 6, z0: D[2] - 1, z1: D[2] - 9, f, cam: c, lead: [D[0], D[2] + 2], expr: () => (scared ? "scream" : "neutral"), arm: (i) => (scared && i % 3 === 0 ? "phone" : scared && i % 3 === 1 ? "point" : "down"), look: up ? [0, -1] : [0, 0] })] };
    }
  }
};

const dofAt = (id: number, f: number) => {
  const c = camAt(id, f), up = c.look[1] - c.pos[1] > 8;
  if (up || id === 1 || id === 3 || id === 11) return { cInf: up ? 2 : 4 };
  if (id === 13) return { cInf: 6, focus: at(D, 0, 1.0, 2) };
  return { cInf: 8 };
};

export const APAGON: Story = {
  TOTAL, camAt, layersAt, dofAt, state,
  MARKS: [
    { a: 144, b: 240, label: "HORA 0", sub: "se va la luz", col: "#ffd23f" },
    { a: 262, b: 318, label: "ATORADOS", sub: "en el elevador", col: "#ff6a5a" },
    { a: 556, b: 612, label: "SIN SEÑAL", sub: "las antenas se apagan", col: "#ff6a5a" },
    { a: 622, b: 760, label: "HORA 12", sub: "sin agua en la llave", col: "#ffd23f" },
    { a: 805, b: 920, label: "HORA 24", sub: "la comida se echa a perder", col: "#ffd23f" },
    { a: 944, b: 1016, label: "HOSPITALES", sub: "con plantas de gasolina", col: "#ffffff" },
    { a: 1291, b: 1420, label: "HORA 72", sub: "agua y comida para 3 días", col: "#ffd23f" },
    { a: 1470, b: 1620, label: "1994", sub: "apagón en Los Ángeles", col: "#ffffff" },
    { a: 1704, b: TOTAL + 10, label: "LA VÍA LÁCTEA", sub: "la \"nube plateada\"", col: "#d6e4ff" },
  ],
};
