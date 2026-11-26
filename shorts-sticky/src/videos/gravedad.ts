import VOZ from "../../voz/gravedad/palabras.json";
// «¿Y si la gravedad se apagara 5 segundos?» — SHORT PARA NIÑOS (BIBLIA/SHORTS_NINOS.md), 49.4 s (1483 frames), 26 tomas.
// words: Sticky 3 · no vuelve a bajar 45 · gravedad 94 · cinco segundos 120 · Todo empieza a flotar 166 | Toby 217 · Michi 281 ·
// furiosa 324 | granja 366 · gallinas 387 · vaca 406 | calle 453 · coches 473 | playa 540 · mar 560 · burbujas 576 |
// gimnasio 635 · pesas 661 · Sticky levanta 716 | aula 786 · pupitres 805 · abuela 840 · bastón 865 | Dato real 898 · mil seiscientos
// setenta 943 · Sin gravedad 1024 · disparado 1064 · línea recta 1080 | Por suerte 1120 · Tres 1200 · dos 1218 · uno 1232 · PUM 1261 ·
// todo cae 1319 | Toby aterriza 1356 · sobre Sticky 1376 | ¿Y tú...? 1416 · sin gravedad 1444
import type { Story, SceneState, Card, V3 } from "../engine/types";
import { makeTimeline, Shot, Key, smooth, hh, gait, bocaAt } from "../engine/timeline";
import { STREET_X, BEACH_X } from "../engine/world";
import { band, mirrorFor, extra, card as exCard } from "../engine/crowd";
import { ORIGIN } from "../engine/sets";
import type { Expr, Arm } from "../engine/stick";
import { sticky, who, ESCALA, TOBY, MICHI, ABUELA, GRANJERO, PROFE, OBRERO, NINO, CIENTIFICA, PALETA } from "../engine/elenco";

const TOTAL = 1483, X = STREET_X, BX = BEACH_X;
const FA = ORIGIN.farm, CL = ORIGIN.classroom, HO = ORIGIN.house, GY = ORIGIN.gym;
const FALL = 1261; // ¡PUM! la gravedad vuelve
const at = (o: readonly number[], x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
const K = (f: number, pos: V3, look: V3, fov: number, glide = false): Key => ({ f, pos, look, fov, glide });

// cortes (26 tomas de 1.5 a 3 s, un corte nuevo cada ~2 s)
const CUTS = [0, 55, 115, 168, 222, 290, 362, 436, 488, 536, 584, 632, 695, 745, 790, 840, 898, 960, 1020, 1075, 1122, 1178, 1240, 1290, 1350, 1415, TOTAL];
const parkY = (f: number) => { // Sticky salta y ya no baja: sube y se queda flotando
  const dt = (f - 8) / 30;
  if (dt < 0) return 0;
  if (f < 20) return 5 * dt - 4.9 * dt * dt;
  return 1.22 + (4.0 - 1.22) * (1 - Math.exp(-((f - 20) / 30) * 0.8)) + Math.sin(f / 14) * 0.12;
};
const SH: Key[][] = [
  /* 1 */ [K(0, [0.4, 1.5, 4.8], [0, 1.1, -0.5], 50), K(30, [0.3, 2.0, 5.0], [0, 2.4, -0.5], 54, true), K(61, [0.2, 3.0, 5.6], [0, 3.8, -0.5], 58, true)],
  /* 2 */ [K(55, [0, 2.0, 13], [0, 3.6, -2], 58), K(67, [0, 2.4, 9.5], [0, 3.8, -2], 44), K(121, [-1.5, 3.2, 8.5], [0, 4.2, -2], 50, true)],
  /* 3 */ [K(115, [1.0, 0.5, 6.0], [0, 4.6, -1], 62), K(174, [-0.5, 0.5, 5.0], [0, 5.0, -1], 52, true)],
  /* 4 */ [K(168, [0.5, 4.7, 3.9], [0, 4.9, 0], 46), K(174, [0.45, 4.7, 3.7], [0, 4.9, 0], 38), K(228, [0.2, 4.8, 2.9], [0, 5.0, 0], 38, true)],
  /* 5 casa: Toby */ [K(222, at(HO, -1.9, 1.2, 5.0), at(HO, -1.9, 1.2, 2.2), 54), K(296, at(HO, -1.9, 1.9, 4.3), at(HO, -1.9, 2.7, 2.2), 50, true)],
  /* 6 casa: Michi */ [K(290, at(HO, -0.2, 1.3, 4.6), at(HO, -0.6, 1.6, 2.0), 62), K(368, at(HO, -0.5, 1.4, 4.4), at(HO, -0.7, 1.9, 2.0), 60, true)],
  /* 7 granja */ [K(362, at(FA, -1.5, 1.6, 9), at(FA, 0, 3.0, -6), 54), K(442, at(FA, -1.0, 1.8, 7.6), at(FA, 0, 4.4, -6), 58, true)],
  /* 8 calle 1 */ [K(436, [X - 2.6, 1.7, 5.4], [X - 5.6, 1.0, -0.8], 48), K(494, [X - 2.0, 2.0, 4.4], [X - 5.6, 3.2, -2], 54, true)],
  /* 9 calle 2 (camión flota) */ [K(488, [X + 7.2, 2.2, -2.5], [X - 2.1, 1.8, -3.5], 54), K(542, [X + 6.0, 3.4, -1.0], [X - 2.1, 3.4, -3.5], 58, true)],
  /* 10 playa 1 */ [K(536, [BX + 4, 2.6, 16], [BX, 1.4, 7], 50), K(590, [BX + 3, 2.9, 15], [BX, 2.6, 7], 56, true)],
  /* 11 playa 2 */ [K(584, [BX - 1.5, 0.8, 13.5], [BX, 4.2, 6], 56), K(638, [BX + 1.0, 1.0, 12.5], [BX, 5.0, 6], 50, true)],
  /* 12 gimnasio 1 */ [K(632, at(GY, -1.2, 1.6, 2.6), at(GY, -1.2, 1.3, -1.6), 52), K(701, at(GY, -1.2, 1.9, 1.6), at(GY, -1.2, 2.2, -1.6), 56, true)],
  /* 13 báscula 0 kg */ [K(695, at(GY, 2.3, 1.5, 4.3), at(GY, 2.3, 1.5, 0.5), 50), K(751, at(GY, 2.3, 1.7, 3.3), at(GY, 2.3, 2.6, 0.5), 48, true)],
  /* 14 gimnasio fuerza */ [K(745, at(GY, -3.5, 0.7, 2.8), at(GY, -1.0, 2.2, -2.0), 58), K(751, at(GY, -3.3, 0.8, 2.7), at(GY, -1.0, 2.2, -2.0), 48), K(796, at(GY, -2.3, 1.0, 2.4), at(GY, -1.0, 3.0, -2.0), 50, true)],
  /* 15 aula 1 */ [K(790, at(CL, 0.2, 1.7, 5.0), at(CL, 0, 1.6, -1), 54), K(846, at(CL, 0.2, 2.0, 4.2), at(CL, 0, 2.4, -1), 50, true)],
  /* 16 aula 2: abuela */ [K(840, at(CL, 0.2, 0.8, 3.8), at(CL, 0, 3.0, -1.5), 56), K(904, at(CL, 0.6, 1.2, 3.2), at(CL, 0.2, 3.6, -1.5), 50, true)],
  /* 17 espacio */ [K(898, [4, 6, 40], [0, 0, 0], 42), K(904, [3.5, 5.5, 37], [0, 0, 0], 36), K(966, [0, 3, 33], [0, 0, 0], 40, true)],
  /* 18 parque: ecuador */ [K(960, [0.8, 0.5, 7], [0, 6, 0], 58), K(966, [0.6, 0.6, 6.5], [0, 6, 0], 48), K(1026, [-0.6, 0.5, 5.6], [0, 6.5, 0], 52, true)],
  /* 19 Sticky disparado */ [K(1020, [-1.5, 5.0, 9], [-1.5, 5.0, 0], 52), K(1081, [3.5, 5.2, 9], [4.0, 5.0, 0], 46, true)],
  /* 20 se aleja en línea recta */ [K(1075, [0.5, 3.5, 10], [0, 5, -30], 50), K(1128, [0.3, 3.8, 9], [0, 5.5, -40], 40, true)],
  /* 21 parque: por suerte */ [K(1122, [4, 3.2, 9], [0, 3.8, 0], 52), K(1184, [-3, 4.2, 8], [0, 3.8, 0], 52, true)],
  /* 22 cuenta atrás */ [K(1178, [0.4, 3.6, 7.2], [0, 3.8, 1.5], 52), K(1200, [0.4, 3.7, 6.0], [0, 3.8, 1.5], 52), K(1206, [0.3, 3.8, 5.6], [0, 3.8, 1.5], 44),
    K(1218, [0.3, 3.8, 5.2], [0, 3.8, 1.5], 44), K(1224, [0.3, 3.8, 5.0], [0, 3.8, 1.5], 38), K(1232, [0.3, 3.8, 4.7], [0, 3.8, 1.5], 38), K(1238, [0.3, 3.8, 4.4], [0, 3.8, 1.5], 30), K(1246, [0.3, 3.8, 4.2], [0, 3.8, 1.5], 30)],
  /* 23 ¡PUM! */ [K(1240, [0, 2.5, 12], [0, 4, -2], 55), K(1261, [0, 2.4, 11.6], [0, 4, -2], 55), K(1264, [0, 2.0, 12], [0, 3, -2], 72), K(1296, [0, 1.4, 11], [0, 1.6, -2], 62, true)],
  /* 24 el montón */ [K(1290, [-0.1, 0.8, 6.5], [0, 0.9, -1], 56), K(1356, [0.2, 1.0, 5.2], [0, 1.0, -1], 56, true)],
  /* 25 casa: Toby cae */ [K(1350, at(HO, -2.4, 1.3, 5.8), at(HO, -2.4, 0.9, 2.4), 56), K(1384, at(HO, -2.4, 1.4, 5.4), at(HO, -2.4, 1.0, 2.4), 54, true), K(1388, at(HO, -2.4, 1.4, 5.3), at(HO, -2.4, 0.9, 2.4), 48), K(1421, at(HO, -2.4, 1.4, 5.0), at(HO, -2.4, 0.9, 2.4), 50, true)],
  /* 26 cierre */ [K(1415, [0.5, 1.2, 3.8], [0, 1.0, 0], 46), K(1448, [0.3, 1.2, 3.0], [0, 1.05, 0], 44, true), K(1452, [0.3, 1.2, 2.8], [0, 1.05, 0], 34), K(TOTAL, [0.2, 1.2, 2.4], [0, 1.05, 0], 36, true)],
];
const SHOTS: Shot[] = SH.map((keys, i) => ({ id: i + 1, a: CUTS[i], b: i === SH.length - 1 ? TOTAL : CUTS[i + 1] + 6, keys }));
const { camAt, layersAt } = makeTimeline(SHOTS);

// ---------- ayudas ----------
const ease = (x: number) => 1 - Math.exp(-Math.max(0, x));
const setO = (c: Card, p: Record<string, unknown>): Card => ({ ...c, o: { ...(c as any).o, ...p } }) as Card;
const SW: Arm[] = ["up", "fly", "cheer", "fly"];
/** Sticky nadando en el aire */
const swim = (f: number, k = 0): Arm => SW[(Math.floor(f / 7) + k) % 4];
/** hace flotar una tarjeta desde el cuadro f0: sube suave, se mece y gira */
const flo = (c: Card, f: number, f0: number, o: { up?: number; ph?: number; dx?: number; spin?: number } = {}): Card => {
  if (f < f0) return c;
  const dt = (f - f0) / 30, ph = o.ph ?? hh(c.x * 3.1 + c.z * 1.7, 5) * 6.28, up = o.up ?? 2.5;
  const y = (c.y ?? 0) + up * ease(dt * 1.3) + 0.12 * dt + Math.sin(dt * 1.7 + ph) * 0.18;
  return { ...c, y, x: c.x + Math.sin(dt * 0.9 + ph) * (o.dx ?? 0.25), roll: (o.spin ?? 1) * (Math.sin(dt * 1.2 + ph) * 0.5 + dt * 0.12 * (hh(ph, 2) < 0.5 ? 1 : -1)) } as Card;
};
/** Sticky: siempre hace algo y con la boca de la voz */
const stk = (f: number, expr: Expr, arm: Arm, x: number, z: number, y = 0, musc?: number, roll?: number): Card =>
  ({ ...sticky(f, expr, arm, [x, y, z], [0, 0], undefined, musc), roll });
const dog = (f: number, x: number, z: number, mood: "calm" | "scared" | "bark" | "howl" = "scared", y = 0): Card => ({ kind: "dog", o: { ...TOBY, mood }, x, z, y: y || undefined, s: ESCALA.perro });
const cat = (x: number, z: number, mood: "calm" | "scared" | "bark" | "howl" = "howl", y = 0): Card => ({ kind: "cat", o: { ...MICHI, mood }, x, z, y: y || undefined, s: ESCALA.gato });
const floatPeople = (cs: Card[], f: number, f0: number, up = 2.4, expr: Expr = "scream"): Card[] =>
  cs.map((c, i) => {
    const g = flo(c, f, f0 + (i % 5) * 4, { up: up + hh(i, 71) * 2 });
    return f >= f0 && (c.kind === "person" || c.kind === "sticky") ? setO(g, { expr, arm: i % 2 ? "fly" : "up", walk: undefined }) : g.kind === "dog" || g.kind === "cat" ? setO(g, { mood: "scared", walk: undefined }) : g;
  });
const parkCrowd = (id: number, f: number, seed: number, n = 12) =>
  band({ n, seed, x0: -4.5, x1: 4.5, z0: -1.6, z1: -9, f, cam: camAt(id, f), lead: [0, 0], expr: () => "shock", arm: () => "down", wander: 0, walking: false });

// ---------- formación del parque (tomas 18 y 21-24): todos flotando juntos, y al ¡PUM! todo cae ----------
type Fm = { k: "sticky" | "dog" | "cat" | "cow" | "granny" | "chicken" | "kid" | "ex"; x: number; z: number; yh: number; i: number; lie: number };
const FORM: Fm[] = [
  { k: "sticky", x: 0, z: 1.5, yh: 3.6, i: 0, lie: 1.45 },
  { k: "dog", x: -1.7, z: 0.2, yh: 5.0, i: 1, lie: 0 },
  { k: "cat", x: 1.6, z: 0.5, yh: 4.4, i: 2, lie: 0 },
  { k: "cow", x: 2.9, z: -2.5, yh: 6.0, i: 3, lie: 0 },
  { k: "granny", x: -2.8, z: -1.5, yh: 5.6, i: 4, lie: -1.3 },
  { k: "chicken", x: -0.6, z: -1.6, yh: 6.4, i: 5, lie: 0 },
  { k: "chicken", x: 1.0, z: -2.6, yh: 7.0, i: 6, lie: 0 },
  { k: "kid", x: 1.1, z: -0.8, yh: 2.8, i: 7, lie: 1.2 },
  { k: "ex", x: -3.6, z: -3.5, yh: 6.6, i: 8, lie: 1.0 },
  { k: "ex", x: 3.6, z: -4.5, yh: 5.0, i: 9, lie: -1.0 },
  { k: "ex", x: -1.2, z: -5.5, yh: 6.0, i: 10, lie: 0 },
];
const fm = (m: Fm, f: number, sExpr: Expr, sArm: Arm): Card => {
  const df = f - FALL - (m.i % 4) * 2, tl = Math.sqrt((2 * m.yh) / 25), dt = df / 30, floating = df < 0;
  let y: number, roll: number;
  const ph = m.i * 1.3, wob = Math.sin(f / 15 + ph) * 0.2, r0 = Math.sin(f / 22 + ph) * 0.45;
  if (floating) { y = m.yh + wob; roll = r0; }
  else if (dt < tl) { y = m.yh - 12.5 * dt * dt; roll = r0 + (m.lie - r0) * smooth(dt / tl); }
  else { const u = dt - tl; y = 0.3 * Math.exp(-u * 6) * Math.abs(Math.sin(u * 14)); roll = m.lie; }
  const landed = !floating && dt >= tl, air = floating ? "float" : landed ? "land" : "fall";
  const expr: Expr = air === "land" ? "sad" : air === "fall" ? "scream" : "shock";
  const lift = Math.abs(Math.sin(roll)) * (m.k === "sticky" ? 0.6 : m.k === "kid" ? 0.35 : 0.45);
  y += lift;
  const base = { x: m.x, z: m.z, y, roll } as const;
  switch (m.k) {
    case "sticky": return { ...stk(f, sExpr, sArm, m.x, m.z, y), roll };
    case "dog": return { kind: "dog", o: { ...TOBY, mood: air === "float" ? "scared" : air === "fall" ? "howl" : "scared" }, s: ESCALA.perro, ...base };
    case "cat": return { kind: "cat", o: { ...MICHI, mood: "howl" }, s: ESCALA.gato, ...base };
    case "cow": return { kind: "cow", o: { coat: "#ffffff", mood: "scared" }, s: 0.95, ...base, mirror: true };
    case "chicken": return { kind: "chicken", o: { coat: "#ffffff", mood: "scared", walk: gait(f, 3, m.i * 0.3) }, s: 0.4, ...base };
    case "granny": return { kind: "person", o: { ...ABUELA, expr, arm: air === "float" ? "fly" : "up" }, s: ESCALA.adulto, ...base };
    case "kid": return { kind: "person", o: { ...NINO, expr, arm: air === "float" ? "cheer" : "up" }, s: ESCALA.nino, ...base };
    default: return exCard(extra(m.i, 31), m.x, m.z, f, { expr, arm: air === "land" ? "down" : "fly", y, roll });
  }
};

// ---------- estado por toma ----------
const state = (id: number, f: number): SceneState => {
  const cam = camAt(id, f);
  switch (id) {
    case 1: case 2: case 3: case 4: { // parque: Sticky salta y NO baja
      const ex: Expr = f < 24 ? "happy" : f < 150 ? "shock" : "scream";
      const arm: Arm = f < 24 ? "up" : swim(f);
      const s = stk(f, ex, arm, 0, 0, parkY(f), undefined, f < 24 ? 0 : Math.sin(f / 9) * 0.35);
      const crowd = floatPeople(parkCrowd(id, f, 21), f, 70, 2.2);
      return { set: "park", env: "day", shake: f >= 20 && f < 28 ? 0.04 : id === 4 && f < 180 ? 0.05 : 0, speedLines: id === 2 && f < 110 ? 0.6 : id === 4 ? 0.3 : 0, cards: [s, ...crowd] };
    }
    case 5: { // casa: Toby nada en el aire
      const toby = flo(dog(f, HO[0] - 1.45, HO[2] + 2.1, "scared", 0.3), f, 222, { up: 2.6, spin: 1.6 });
      const sti = flo(stk(f, f < 250 ? "happy" : "shock", swim(f), HO[0] - 2.45, HO[2] + 2.3, 0.3), f, 226, { up: 2.2 });
      const mich = flo(cat(HO[0] + 0.8, HO[2] + 2.6, "howl", 0.2), f, 224, { up: 2.8 });
      return { set: "house", env: "day", tv: true, shake: f < 232 ? 0.03 : 0, cards: [sti, toby, mich] };
    }
    case 6: { // casa: Michi furiosa
      const mich = flo(cat(HO[0] - 0.4, HO[2] + 2.3, "howl", 0.6), f, 290, { up: 1.2, spin: 2 });
      const sti = flo(stk(f, "worried", swim(f, 1), HO[0] - 1.0, HO[2] + 2.7, 0.5), f, 290, { up: 0.8 });
      const toby = flo(dog(f, HO[0] + 0.9, HO[2] + 2.2, "scared", 0.9), f, 290, { up: 1.4, spin: 1.8 });
      return { set: "house", env: "day", tv: true, shake: f > 320 && f < 330 ? 0.03 : 0, cards: [sti, mich, toby] };
    }
    case 7: { // granja: gallinas y vaca flotan
      const cows: Card[] = [[2.6, -3], [-2.6, -4], [0.2, -6.5]].map(([x, z], i) => flo({ kind: "cow", o: { coat: "#fff", mood: "scared" }, x: FA[0] + x, z: FA[2] + z, s: 0.95, mirror: i === 1, y: 0.3 }, f, 362 + i * 8, { up: 3.5 + i, spin: 1.6 }));
      const chick: Card[] = [0, 1, 2, 3].map((i) => flo({ kind: "chicken", o: { coat: "#fff", mood: "scared", walk: gait(f, 3, i * 0.3) }, x: FA[0] - 1.4 + i * 0.95, z: FA[2] - 0.6 - (i % 2), s: 0.4, mirror: i % 2 === 0, y: 0.3 }, f, 364 + i * 5, { up: 3 + i * 0.6, spin: 2 }));
      const farmer = flo(who({ ...GRANJERO, expr: "scream", arm: "fly" }, [FA[0] + 1.3, 0.3, FA[2] + 0.8]), f, 374, { up: 2.6 });
      const sti = flo(stk(f, "shock", swim(f, 2), FA[0] - 0.6, FA[2] + 2.6, 0.3), f, 366, { up: 2.2 });
      return { set: "farm", env: "day", speedLines: 0.3, shake: f < 372 ? 0.03 : 0, cards: [...cows, ...chick, farmer, sti] };
    }
    case 8: { // calle: los coches flotan como globos
      const crowd = floatPeople(band({ n: 10, seed: 23, x0: X - 9, x1: X - 3.5, z0: -1.6, z1: -11, f, cam, lead: [X - 5.6, 0], expr: () => "shock", arm: () => "down", walking: false }), f, 440, 2.4, "scream");
      const cars: Card[] = [0, 1, 2].map((k) => flo({ kind: "car", o: { body: ["#d84a3a", "#2f86d6", "#f2b632"][k], wheel: 0 }, x: X - 2.1 + (k % 2) * 4.2, z: -6 - k * 9, s: 0.95, y: 0.2, mirror: mirrorFor(cam.pos, cam.look, 0, k % 2 ? 1 : -1) }, f, 436 + k * 6, { up: 3.2 + k, dx: 0.4, spin: 0.7 }));
      const sti = flo(stk(f, "scream", swim(f), X - 5.6, 0, 0.3), f, 442, { up: 2.4 });
      return { set: "street", env: "day", speedLines: 0.3, shake: f < 446 ? 0.04 : 0, cards: [sti, ...crowd, ...cars] };
    }
    case 9: { // calle: Sticky de paseo encima de un camión flotante
      const dt = Math.max(0, f - 488) / 30, y = 0.3 + 2.4 * ease(dt * 1.2) + Math.sin(dt * 1.6) * 0.2, roll = Math.sin(dt * 1.1) * 0.12;
      const truck: Card = { kind: "car", o: { body: "#2f86d6", wheel: 0 }, x: X - 2.1, z: -3.5, y, s: 1.5, roll, mirror: mirrorFor(cam.pos, cam.look, 0, -1) };
      const sti: Card = { ...stk(f, "happy", f % 20 < 10 ? "cheer" : "wave", X - 1.8, -2.6, y + 2.5), roll };
      const p2 = flo(who({ ...OBRERO, expr: "scream", arm: "fly" }, [X - 4.4, 0.3, -5]), f, 492, { up: 3.5 });
      const side = floatPeople(band({ n: 6, seed: 25, x0: X - 9.5, x1: X - 6, z0: -14, z1: 4, f, cam, expr: () => "shock", walking: false }), f, 490, 2.5);
      return { set: "street", env: "day", speedLines: 0.4, shake: f < 496 ? 0.03 : 0, cards: [truck, sti, p2, ...side] };
    }
    case 10: case 11: { // playa: el mar se hace burbujas (peces flotando) y la gente vuela
      const crowd = floatPeople(band({ n: 8, seed: 27, x0: BX - 6, x1: BX + 5, z0: 4, z1: 11, f, cam, lead: [BX, 9], expr: () => "scream", arm: () => "fly" }), f, 536, 2.6);
      const fish: Card[] = Array.from({ length: 9 }, (_, i) => flo({ kind: "fish", o: { coat: ["#3fa3ff", "#ffb347", "#ff6fa3"][i % 3] }, x: BX - 6 + hh(i, 41) * 12, z: 0.5 + hh(i, 42) * 4, y: 0.2, s: 0.5 + hh(i, 43) * 0.3, mirror: i % 2 === 0 }, f, 536 + i * 4, { up: 2 + hh(i, 44) * 3.5, spin: 1.8, dx: 0.5 }));
      const sti = flo(stk(f, id === 10 ? "shock" : "happy", swim(f, 3), BX, 9, 0.3), f, 538, { up: 2.4 });
      return { set: "beach", env: "day", tide: 0.2, flow: 0, speedLines: 0.3, shake: f < 546 ? 0.03 : 0, cards: [sti, ...crowd, ...fish] };
    }
    case 12: case 13: case 14: { // gimnasio: las pesas no pesan nada
      const fuerte = id === 14;
      const sti = id === 13 ? flo(stk(f, "shock", "up", GY[0] + 2.3, GY[2] + 1.4, 0.125), f, 695, { up: 2.6, dx: 0.1 }) : id === 12
        ? flo(stk(f, f < 650 ? "happy" : "shock", f < 650 ? "curl" : swim(f), GY[0] - 1.2, GY[2] - 1.2, 0.3), f, 636, { up: 2.2 })
        : flo(stk(f, "happy", "flex", GY[0] - 1.0, GY[2] - 1.6, 0.3, 7), f, 745, { up: 1.6, spin: 0.5 });
      const people: Card[] = id === 13 ? [] : [who({ ...OBRERO, expr: "scream", arm: "fly" }, [GY[0] - 2.4, 0.3, GY[2] - 2.7]), who({ ...NINO, expr: "scream", arm: "up" }, [GY[0] + 0.1, 0.3, GY[2] - 2.4], ESCALA.nino), who({ ...CIENTIFICA, expr: "shock", arm: "fly" }, [GY[0] - 3.4, 0.3, GY[2] - 0.9])];
      const fl = floatPeople(people, f, id === 14 ? 745 : 640, 2.6);
      return { set: "gym", env: "day", bascula: 0, saco: fuerte ? 0.9 : 0.5, cinta: 0, speedLines: id === 14 ? 0.3 : 0, shake: id === 14 && f < 756 ? 0.05 : 0, cards: [sti, ...fl] };
    }
    case 15: case 16: { // aula: los pupitres bailan y la abuela flota con su bastón
      const f0 = id === 15 ? 790 : 842;
      const kids: Card[] = ([[-3.3, 0.6], [-1.1, 0.6], [1.1, 0.6], [-2.2, 2.2], [2.2, 2.2]] as const).map(([x, z], i) => flo({ kind: "person", o: { ...NINO, hat: (["cap", "bow", "hair", "pony", "beanie"] as const)[i], hatCol: ["#ffd23f", "#ff6fa3", "#2b2b33", "#9b6bff", "#2ed3c6"][i], expr: "happy", arm: i % 2 ? "wave" : "cheer" }, x: CL[0] + x, z: CL[2] + z, y: 0.2, s: ESCALA.nino }, f, 790 + i * 4, { up: 2.2 + i * 0.5, spin: 1.5 }));
      const prof = flo(who({ ...PROFE, expr: "scream", arm: "fly" }, [CL[0] - 2.6, 0.3, CL[2] - 3.0]), f, 792, { up: 2.8 });
      const abu = flo(who({ ...ABUELA, expr: id === 16 ? "happy" : "shock", arm: "fly" }, [CL[0] + (id === 16 ? 0.5 : 1.3), 0.3, CL[2] - (id === 16 ? 1.0 : 1.8)]), f, id === 16 ? 842 : 800, { up: id === 16 ? 3.2 : 2.0, dx: 0.2 });
      const sti = flo(stk(f, id === 15 ? "happy" : "worried", id === 15 ? swim(f) : "up", CL[0] + (id === 15 ? -0.8 : -0.9), id === 15 ? CL[2] - 0.4 : CL[2] - 1.5, 0.3), f, f0, { up: 1.8 });
      return { set: "classroom", env: "day", shake: f === 790 ? 0.03 : 0, speedLines: 0.2, cards: [sti, abu, prof, ...kids].map((c) => c) };
    }
    case 17: { // espacio: la Tierra gira a 1,670 km/h
      const spS = { ...stk(f, "happy", swim(f), 0.5, 28.5, 1.3, undefined, Math.sin(f / 12) * 0.3) };
      return { set: "space", env: "space", cards: [spS], space: { earth: { pos: [0, 0, 0], r: 10, rot: f * 0.12, axis: true }, lightDir: [-1, 0.3, 0.6] } };
    }
    case 18: { // parque: todo flota; Sticky mira abajo
      const cards = FORM.slice(0, 8).map((m) => fm({ ...m, yh: m.yh + 1 }, f, "shock", swim(f)));
      return { set: "park", env: "day", speedLines: 0.5, shake: 0.02, cards };
    }
    case 19: { // Sticky disparado en línea recta
      const sx = -2.0 + 0.133 * (f - 1020);
      return { set: "park", env: "dusk", speedLines: 1, shake: 0.03, cards: [{ ...stk(f, "scream", "fly", sx, 0, 5.0, undefined, 1.35), mirror: false }] };
    }
    case 20: { // se aleja y se hace chiquito
      const dt = (f - 1075) / 30;
      return { set: "park", env: "dusk", speedLines: 0.8, cards: [{ ...stk(f, "scream", "fly", 0, -0.5 - dt * dt * 4 - dt * 3, 5.0 + dt * 0.5), roll: 0.3 }] };
    }
    case 21: case 22: case 23: case 24: { // por suerte son 5 segundos... 3, 2, 1... ¡PUM!
      const ex: Expr = id === 21 ? "relief" : id === 22 ? (f < 1230 ? "worried" : "shock") : f < FALL + 30 ? "scream" : "sad";
      const arm: Arm = id === 21 ? "wave" : id === 22 ? "up" : f < FALL ? "up" : "down";
      const cards = FORM.map((m) => fm(m, f, ex, arm));
      const pum = f >= FALL && f < FALL + 22, fall = f >= FALL && f < FALL + 34;
      return { set: "park", env: "day", speedLines: id === 22 ? 0.2 : fall ? 1 : 0, shake: id === 22 ? Math.max(0, (f - 1200) / 46) * 0.06 : pum ? 0.15 : f >= FALL + 22 && f < FALL + 50 ? 0.06 : 0, cards };
    }
    case 25: { // casa: Toby aterriza sobre Sticky
      const t0 = 1358, tl = 26, dt = Math.max(0, f - t0), land = f >= t0 + tl;
      const ty = land ? 1.05 + 0.25 * Math.exp(-(f - t0 - tl) / 5) * Math.abs(Math.sin((f - t0 - tl) / 2.5)) : 4.8 - 4.2 * (dt / tl) ** 2;
      const toby: Card = { kind: "dog", o: { ...TOBY, mood: land ? "bark" : "scared" }, x: at(HO, -2.4, 0, 0)[0] + 0.05, y: ty, z: HO[2] + 2.4, s: ESCALA.perro, roll: land ? 0.1 : Math.sin(dt / 4) * 0.4 };
      const sti = stk(f, land ? "scream" : "sad", land ? "cover" : "down", HO[0] - 2.4, HO[2] + 2.5, 0, undefined, land ? 0 : 0);
      return { set: "house", env: "day", tv: true, shake: f >= t0 + tl && f < t0 + tl + 12 ? 0.1 : 0, cards: [sti, toby] };
    }
    case 26: { // cierre: Sticky guiña y pregunta
      const jump = Math.abs(Math.sin((f - 1415) / 7)) * 0.12 * (f > 1440 ? 1 : 0);
      const sti = stk(f, f < 1440 ? "smile" : "happy", f < 1440 ? "wave" : "point", 0, 0, jump);
      const t = dog(f, 1.15, 0.2, "bark", Math.abs(Math.sin(f / 5)) * 0.2);
      return { set: "park", env: "day", cards: [sti, { ...t, mirror: true }, cat(-1.1, 0.4, "calm", Math.abs(Math.sin(f / 6)) * 0.18)] };
    }
    default: return { set: "park", env: "day", cards: [] };
  }
};

const dofAt = (_id: number, _f: number) => ({ cInf: 3 });

export const GRAVEDAD: Story = {
  voz: VOZ,
  TOTAL, camAt, layersAt, dofAt, state,
  MARKS: [
    { a: 56, b: 114, label: "¡NO BAJA!", sub: "sin gravedad", col: PALETA.titulo.dato },
    { a: 118, b: 166, label: "5 SEGUNDOS", sub: "sin gravedad", col: "#ffffff" },
    { a: 170, b: 220, label: "¡TODO FLOTA!", sub: "", col: PALETA.titulo.calma },
    { a: 294, b: 360, label: "¡MICHI FURIOSA!", sub: "", col: PALETA.titulo.alerta },
    { a: 366, b: 434, label: "VACA VOLADORA", sub: "", col: PALETA.titulo.dato },
    { a: 440, b: 520, label: "COCHES-GLOBO", sub: "", col: PALETA.titulo.espacio },
    { a: 580, b: 634, label: "¡MAR EN BURBUJAS!", sub: "", col: PALETA.titulo.espacio },
    { a: 640, b: 690, label: "PESAS: 0 kg", sub: "no pesan nada", col: PALETA.titulo.dato },
    { a: 748, b: 790, label: "¡SÚPER FUERZA!", sub: "", col: PALETA.titulo.alerta },
    { a: 800, b: 896, label: "AULA FLOTANTE", sub: "", col: PALETA.titulo.calma },
    { a: 902, b: 1012, label: "1,670 km/h", sub: "gira el suelo en el ecuador", col: PALETA.titulo.dato },
    { a: 1030, b: 1120, label: "EN LÍNEA RECTA", sub: "¡adiós!", col: PALETA.titulo.alerta },
    { a: 1126, b: 1176, label: "SOLO 5 SEGUNDOS", sub: "", col: PALETA.titulo.calma },
    { a: 1196, b: 1214, label: "3", sub: "", col: "#ffffff" },
    { a: 1215, b: 1229, label: "2", sub: "", col: PALETA.titulo.dato },
    { a: 1230, b: 1258, label: "1", sub: "", col: PALETA.titulo.alerta },
    { a: 1262, b: 1330, label: "¡PUM!", sub: "la gravedad vuelve", col: PALETA.titulo.alerta },
    { a: 1334, b: 1356, label: "¡AUCH!", sub: "", col: PALETA.titulo.dato },
    { a: 1430, b: TOTAL + 10, label: "¿Y TÚ?", sub: "¿qué harías?", col: PALETA.titulo.dato },
  ],
};
// bocaAt/mirrorFor se importan por si se necesitan al ajustar
void bocaAt;
