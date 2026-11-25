// «¿Y si la Luna desapareciera esta noche?» v2 — 54.9 s (1647 frames), many places, small casts per place.
// words: Luna 12 · desapareciera 18 · noche 42 · oscuridad 96 | no tiene luz propia 142 · espejo gigante 184 · Sol 236 ·
// Sin ella 265 · más oscura del mes 333 | animales 392 · primero 423 | corales 465 · Luna llena 512 | tortugas 555 ·
// horizonte más brillante 618 | escarabajos 680 · su luz 718 · perderían 739 | Por suerte 777 · mareas 875 | Por desgracia 909 ·
// un tercio 955 · hoy 979 | grave 1018 · ancla 1087 · inclinación 1122 · Tierra 1143 | Fíjate 1174 · trompo 1208 ·
// tambalearse 1269 | millones de años 1312 · estaciones 1347 · caos 1381 | Lo curioso 1419 · yendo 1462 · aleja 1499 ·
// cuatro centímetros 1529 · año 1561 · uñas 1614
import type { Story, SceneState, Card, V3, Env } from "../engine/types";
import { makeTimeline, Shot, smooth, hh, gait, blinkAt } from "../engine/timeline";
import { BEACH_X } from "../engine/world";
import { ORIGIN } from "../engine/sets";
import { band, mirrorFor } from "../engine/crowd";
import type { Expr, Arm, PersonOpts } from "../engine/stick";

const TOTAL = 1647, BX = BEACH_X, GONE = 30;
const FA = ORIGIN.farm, RF = ORIGIN.reef, DS = ORIGIN.desert, CL = ORIGIN.classroom, HO = ORIGIN.house;
const at = (o: readonly number[], x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
const EARTH: V3 = [0, 0, 0], E2: V3 = [0, -12, 0], MOON: V3 = [0, 22, 0], SUN: V3 = [-700, 60, -260];
const SHOTS: Shot[] = [
  { id: 1, a: 0, b: 130, keys: [
    { f: 0, pos: [0.6, 1.3, 5.6], look: [6, 9, -10], fov: 46 }, { f: 30, pos: [0.6, 1.3, 5.5], look: [6, 9, -10], fov: 46 },
    { f: 75, pos: [0.4, 1.55, 4.8], look: [0, 1.0, -0.6], fov: 46, glide: true }, { f: 130, pos: [0.3, 1.5, 4.3], look: [0, 1.0, -0.6], fov: 46 },
  ] },
  { id: 2, a: 124, b: 262, keys: [
    { f: 124, pos: [3, 23, 13], look: MOON, fov: 40 }, { f: 150, pos: [3, 23, 12.4], look: MOON, fov: 40 },
    { f: 230, pos: [10, 6, 74], look: [0, 5, 0], fov: 46, glide: true }, { f: 262, pos: [9.6, 6, 72], look: [0, 5, 0], fov: 46 },
  ] },
  { id: 3, a: 256, b: 450, keys: [ // the darkest night on the farm
    { f: 256, pos: at(FA, -3, 2.2, 10), look: at(FA, 3, 1.4, -8), fov: 50 },
    { f: 450, pos: at(FA, -1.5, 1.6, 6.5), look: at(FA, 1, 1.1, -2), fov: 48, glide: true },
  ] },
  { id: 4, a: 444, b: 546, keys: [{ f: 444, pos: at(RF, 0.8, 1.8, 4), look: at(RF, 0, 1.3, -8), fov: 52 }, { f: 546, pos: at(RF, 0.3, 1.5, 2.6), look: at(RF, -0.5, 1.6, -8), fov: 50, glide: true }] },
  { id: 5, a: 540, b: 668, keys: [
    { f: 540, pos: [BX - 0.6, 2.2, 14.5], look: [BX - 0.8, 1.2, 9.4], fov: 46 },
    { f: 668, pos: [BX + 0.4, 2.9, 13.6], look: [BX - 0.4, 0.7, 6.5], fov: 50, glide: true },
  ] },
  { id: 6, a: 662, b: 770, keys: [{ f: 662, pos: at(DS, 1.4, 0.7, 4.2), look: at(DS, 0, 0.3, 0), fov: 50 }, { f: 770, pos: at(DS, 1.0, 0.9, 3.4), look: at(DS, -0.4, 0.4, 0), fov: 48, glide: true }] },
  { id: 7, a: 764, b: 1000, keys: [
    { f: 764, pos: [BX + 3.5, 2.8, 15.5], look: [BX - 0.5, 1.0, 6], fov: 48 },
    { f: 1000, pos: [BX + 2.2, 2.4, 13.5], look: [BX - 0.5, 0.9, 5], fov: 46, glide: true },
  ] },
  { id: 8, a: 994, b: 1170, keys: [{ f: 994, pos: at(CL, 0.4, 1.7, 6.2), look: at(CL, 1.6, 1.1, -2.6), fov: 50 }, { f: 1170, pos: at(CL, 1.8, 1.5, 3.6), look: at(CL, 3.0, 1.15, -3.2), fov: 46, glide: true }] },
  { id: 9, a: 1164, b: 1250, keys: [{ f: 1164, pos: at(HO, 1.25, 1.5, 6.0), look: at(HO, 1.25, 0.8, 1.2), fov: 50 }, { f: 1250, pos: at(HO, 1.25, 1.3, 5.0), look: at(HO, 1.25, 0.6, 1.4), fov: 48, glide: true }] },
  { id: 10, a: 1244, b: 1300, keys: [{ f: 1244, pos: [8, 5, 60], look: EARTH, fov: 40 }, { f: 1300, pos: [12, 7, 54], look: EARTH, fov: 40, glide: true }] },
  { id: 11, a: 1294, b: 1410, keys: [{ f: 1294, pos: at(FA, -3, 2.4, 9), look: at(FA, 2, 1.2, -6), fov: 52 }, { f: 1410, pos: at(FA, -2, 2.0, 7), look: at(FA, 1, 1.1, -4), fov: 50, glide: true }] },
  { id: 12, a: 1404, b: TOTAL, keys: [
    { f: 1404, pos: [0.4, 1.5, 4.6], look: [0, 1.0, -0.6], fov: 46 }, { f: 1470, pos: [0.6, 1.3, 5.4], look: [6, 9, -10], fov: 46, glide: true },
    { f: 1560, pos: [0.6, 1.3, 5.5], look: [6, 9, -10], fov: 40 }, { f: TOTAL, pos: [0.35, 1.5, 4.4], look: [0, 1.0, -0.6], fov: 46, glide: true },
  ] },
];
const { camAt, layersAt } = makeTimeline(SHOTS);
const scarf = (f: number) => Math.floor(((f / 30) * 1.3 % 1) * 8) / 8;
const sticky = (f: number, expr: Expr, arm: Arm, pos: V3, look: [number, number] = [0, 0]): Card =>
  ({ kind: "sticky", o: { expr, arm, look, blink: expr === "shock" || expr === "scream" ? 0 : blinkAt(f, 1), scarf: scarf(f) }, x: pos[0], y: pos[1] || undefined, z: pos[2], s: 0.75 });
const who = (o: PersonOpts, pos: V3, s = 0.74): Card => ({ kind: "person", o, x: pos[0], z: pos[2], s });
const FARMER: PersonOpts = { expr: "worried", hat: "cowboy", hatCol: "#b97d4a", stache: "thick", beard: "#7a5236", arm: "candle" };

const farmAnimals = (f: number, scared: boolean, c: { pos: V3; look: V3 }): Card[] => {
  const out: Card[] = [];
  [[3.2, -3.0], [-3.4, -3.8], [5.6, -6]].forEach(([x, z], i) => out.push({ kind: "cow", o: { coat: "#ffffff", mood: scared ? "scared" : "calm", walk: scared && i === 1 ? gait(f, 1) : undefined }, x: FA[0] + x, z: FA[2] + z, s: 0.95, mirror: i % 2 === 1 }));
  for (let i = 0; i < 6; i++) out.push({ kind: "chicken", o: { coat: "#ffffff", mood: scared ? "scared" : "calm", walk: gait(f, 2.4, hh(i, 2)) }, x: FA[0] - 2 + hh(i, 3) * 5 + Math.sin(f / 20 + i) * 0.4, z: FA[2] - 0.5 - hh(i, 4) * 2.5, s: 0.4, mirror: mirrorFor(c.pos, c.look, Math.cos(f / 20 + i), 0) });
  out.push({ kind: "pig", o: { coat: "#f7a8c0", mood: "calm" }, x: FA[0] + 1.4, z: FA[2] - 1.4, s: 0.6 });
  return out;
};
const turtles = (f: number, lost: number, c: { pos: V3; look: V3 }): Card[] => {
  const out: Card[] = [], t = f / 30;
  for (let i = 0; i < 26; i++) {
    const x0 = BX - 3.5 + hh(i, 1) * 6.5, z0 = 6.0 + hh(i, 2) * 3.0, sp = 0.35 + hh(i, 3) * 0.2;
    const a = lost > 0 ? hh(i, 4) * 6.28 + t * (0.8 + hh(i, 5)) : -Math.PI / 2, go = Math.min(t - 18, 8);
    const x = x0 + (lost > 0 ? Math.cos(a) * 0.8 : 0), z = z0 + (lost > 0 ? Math.sin(a) * 0.8 : -sp * Math.max(0, go));
    out.push({ kind: "turtle", o: { coat: "#3f8a4a", walk: gait(f, 2.2, hh(i, 6)) }, x, z, s: 0.45, mirror: mirrorFor(c.pos, c.look, lost > 0 ? Math.cos(a) : 0, lost > 0 ? Math.sin(a) : -1) });
  }
  return out;
};

const state = (id: number, f: number): SceneState => {
  const c = camAt(id, f);
  switch (id) {
    case 1: {
      const gone = f >= GONE, k = 1 - smooth((f - GONE) / 4), ex: Expr = !gone ? "happy" : f < 70 ? "shock" : "scream";
      return { set: "park", env: "night", moonDisc: { show: k, bright: 1.2 }, stars: 0.8, shake: gone && f < GONE + 8 ? 0.04 : 0,
        cards: [sticky(f, gone ? "shock" : "happy", gone ? "down" : "point", [0, 0, 0], gone ? [0, 0] : [0.6, -1]),
          ...band({ n: 14, seed: 5, x0: -5, x1: 5, z0: -1.6, z1: -9, f, cam: c, lead: [0, 0], expr: () => ex, arm: (i) => (!gone && i % 4 === 0 ? "point" : gone && i % 5 === 0 ? "cover" : "down"), look: gone ? [0, 0] : [0.5, -1], mood: (i) => (i % 5 === 2 ? (gone ? "scared" : "howl") : undefined) })] };
    }
    case 2: return { set: "space", env: "space", cards: [], space: { sun: { pos: SUN, r: 60, lit: true }, earth: { pos: E2, r: 10, rot: f * 0.004 }, moon: { pos: MOON, r: 2.7, show: 1 - smooth((f - 265) / 8) } } };
    case 3: return { set: "farm", env: "night", stars: 1, moonDisc: { show: 0, bright: 1 },
      cards: [sticky(f, f > 384 ? "worried" : "neutral", "flash", at(FA, 0, 0, 2), [0.4, 0]), who(FARMER, at(FA, -1.6, 0, 0.4)), ...farmAnimals(f, f > 384, c)] };
    case 4: { // the reef: corals spawn with the full moon
      const fish: Card[] = [];
      for (let i = 0; i < 12; i++) { const dir = i % 2 ? 1 : -1, x = RF[0] - 6 + ((hh(i, 1) * 12 + dir * f * 0.04) % 12 + 12) % 12, y = 0.8 + hh(i, 2) * 2.6, z = RF[2] - 2 - hh(i, 3) * 9;
        fish.push({ kind: "fish", o: { coat: ["#ffd23f", "#ff9a3c", "#ff6fa3", "#2ed3c6", "#9b6bff"][i % 5], spot: i % 3 ? "#ffffff" : undefined }, x, y, z, s: 0.35 + hh(i, 4) * 0.25, mirror: mirrorFor(c.pos, c.look, dir, 0) }); }
      return { set: "reef", env: "underwater", spawn: smooth((f - 470) / 20), cards: [sticky(f, "happy", "wave", at(RF, -0.2, 0.4, -1.2), [0, -0.6]), ...fish] };
    }
    case 5: {
      const lost = f > 620 ? 1 : 0;
      return { set: "beach", env: "night", tide: 0, stars: 1, moonDisc: { show: 0, bright: 1 },
        cards: [sticky(f, lost ? "worried" : "smile", "flash", [BX - 0.8, 0, 9.4], [0.4, 0.4]), ...band({ n: 6, seed: 9, x0: BX - 6, x1: BX + 5, z0: 2.5, z1: 7.5, f, cam: c, lead: [BX - 0.8, 9.4], expr: () => (lost ? "worried" : "smile"), arm: () => "flash" }), ...turtles(f, lost, c)] };
    }
    case 6: { // dung beetles going round in circles
      const bugs: Card[] = [];
      for (let i = 0; i < 7; i++) { const a = hh(i, 1) * 6.28 + f / 30 * (0.7 + hh(i, 2)) * (f > 730 ? 1 : 0.2), r = 0.5 + hh(i, 3) * 1.6;
        bugs.push({ kind: "beetle", o: { coat: ["#2a7a5a", "#2a2a32", "#5a3a7a"][i % 3], walk: gait(f, 3, hh(i, 4)) }, x: DS[0] - 0.4 + Math.cos(a) * r, z: DS[2] - 0.6 + Math.sin(a) * r, s: 0.32, mirror: Math.sin(a) > 0 }); }
      return { set: "desert", env: "night", stars: 1, cards: [sticky(f, f > 730 ? "worried" : "smile", "flash", at(DS, -1.6, 0, -1.4), [0.6, 0.6]), ...bugs] };
    }
    case 7: {
      const amp = f < 909 ? 0.55 : 0.55 - 0.37 * smooth((f - 920) / 40), tide = amp * Math.sin((f - 764) / 30 * 1.6);
      return { set: "beach", env: "day", tide,
        cards: [sticky(f, f > 909 ? "worried" : "smile", "icecream", [BX + 0.5, 0, 9], [-0.5, 0.4]), ...band({ n: 12, seed: 11, x0: BX - 6, x1: BX + 5, z0: 4, z1: 10.5, f, cam: c, lead: [BX + 0.5, 9], expr: (i) => (f > 909 ? "worried" : i % 3 ? "happy" : "smile"), arm: (i) => (i % 4 === 0 ? "icecream" : i % 5 === 0 ? "wave" : "down"), wander: 0.4 }),
          { kind: "bird", o: { coat: "#ffffff", spot: "#c9ccd6", fly: true, walk: (f / 8) % 1 }, x: BX - 2 + Math.sin(f / 40) * 3, y: 4.5, z: 3, s: 0.45 }] };
    }
    case 8: { // the classroom: the globe and its tilt
      const kids: Card[] = []; [[-3.3, 0.5], [-1.1, 0.5], [-1.1, 2.1], [-3.3, 2.1], [3.3, 0.5]].forEach(([x, z], i) => kids.push(who({ expr: i % 2 ? "smile" : "happy", hat: (["cap", "bow", "hair", "pony", "beanie"] as const)[i], hatCol: ["#ffd23f", "#ff6fa3", "#000", "#9b6bff", "#2ed3c6"][i], glasses: i === 2, arm: i === 3 ? "wave" : "down" }, at(CL, x, 0, z), 0.54)));
      return { set: "classroom", env: "day", cards: [who({ expr: "smile", hat: "bowler", hatCol: "#5a3a2a", stache: "curly", glasses: true, tie: "#e62117", arm: "point" }, at(CL, 1.6, 0, -2.6)), sticky(f, "smile", "down", at(CL, -0.6, 0, 1.4), [0.6, -0.2]), ...kids] };
    }
    case 9: { // a spinning top that starts to wobble
      const w = smooth((f - 1200) / 40), tilt = w * 0.35 * Math.sin(f * 0.35);
      return { set: "house", env: "day", lights: 1,
        cards: [{ kind: "top", o: { col: "#e62117", t: f / 30, tilt: Math.round(tilt * 20) / 20 }, x: HO[0] + 1.25, z: HO[2] + 1.7, s: 0.5 }, who({ expr: f > 1230 ? "shock" : "happy", hat: "cap", hatCol: "#2ed3c6" }, at(HO, 0.65, 0, 1.0), 0.54), sticky(f, f > 1230 ? "shock" : "smile", "down", at(HO, 1.85, 0, 0.9), [-0.6, 0.6])] };
    }
    case 10: {
      const w = smooth((f - 1244) / 20), tilt = 0.41 + w * 0.35 * Math.sin((f - 1244) * 0.22), prec = w * (f - 1244) * 0.12;
      return { set: "space", env: "space", cards: [], space: { sun: { pos: SUN, r: 60, lit: true }, earth: { pos: EARTH, r: 10, rot: f * 0.02, tilt, prec, axis: true } } };
    }
    case 11: { // seasons gone mad on the farm
      const envs: Env[] = ["day", "dusk", "night", "day", "night", "dusk"], env = envs[Math.floor((f - 1294) / 9) % envs.length];
      return { set: "farm", env, stars: env === "night" ? 0.8 : 0, moonDisc: { show: 0, bright: 1 }, cards: [sticky(f, "scream", "cover", at(FA, 0, 0, 2)), who({ ...FARMER, expr: "scream", arm: "cover" }, at(FA, -1.6, 0, 0.4)), ...farmAnimals(f, true, c)] };
    }
    default: {
      const back = 0.9 - 0.12 * smooth((f - 1490) / 70), nails = f > 1580;
      return { set: "park", env: "night", moonDisc: { show: back, bright: 1.2 }, stars: 0.8,
        cards: [sticky(f, nails ? "happy" : "smile", nails ? "hug" : "point", [0, 0, 0], nails ? [0, 0.6] : [0.6, -1]),
          ...band({ n: 10, seed: 6, x0: -5, x1: 5, z0: -1.6, z1: -9, f, cam: c, lead: [0, 0], expr: (i) => (i % 3 ? "smile" : "happy"), arm: (i) => (i % 4 === 0 ? "wave" : "down"), look: [0.5, -1], mood: (i) => (i % 5 === 2 ? "howl" : undefined) })] };
    }
  }
};

const dofAt = (id: number, f: number) => {
  const c = camAt(id, f), up = c.look[1] - c.pos[1] > 4;
  if (id === 2 || id === 10 || up) return { cInf: 0 };
  if (id === 4) return { cInf: 4 };
  if (id === 5) return { cInf: 6, focus: [BX - 0.8, 1.4, 9.4] as V3 };
  if (id === 7) return { cInf: 6, focus: [BX + 0.5, 1.4, 9] as V3 };
  return { cInf: 7 };
};

export const LUNA: Story = {
  TOTAL, camAt, layersAt, dofAt, state,
  MARKS: [
    { a: 140, b: 256, label: "LA LUNA NO BRILLA", sub: "refleja la luz del Sol", col: "#ffffff" },
    { a: 290, b: 380, label: "SIN LUNA", sub: "noches oscurísimas", col: "#ffd23f" },
    { a: 456, b: 540, label: "CORALES", sub: "se reproducen con la Luna llena", col: "#ff9ab8" },
    { a: 549, b: 662, label: "TORTUGAS", sub: "buscan el horizonte brillante", col: "#9de38a" },
    { a: 672, b: 764, label: "ESCARABAJOS", sub: "se orientan con su luz", col: "#ffd23f" },
    { a: 844, b: 905, label: "MAREAS", sub: "el Sol también las provoca", col: "#9fd4ff" },
    { a: 940, b: 1000, label: "1/3", sub: "de las mareas de hoy", col: "#9fd4ff" },
    { a: 1100, b: 1166, label: "23.4°", sub: "la inclinación de la Tierra", col: "#ff6a5a" },
    { a: 1342, b: 1404, label: "CAOS", sub: "estaciones locas", col: "#ff6a5a" },
    { a: 1522, b: TOTAL + 10, label: "3.8 cm al año", sub: "lo que crecen tus uñas", col: "#ffd23f" },
  ],
};
