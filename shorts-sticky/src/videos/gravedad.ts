import VOZ from "../../voz/gravedad/palabras.json";
// «¿Y si la gravedad se apagara 5 segundos?» — SHORT PARA NIÑOS (BIBLIA/SHORTS_NINOS.md), 49.4 s (1483 frames), 34 tomas, 11 escenarios.
// v2: los OBJETOS también flotan (S.flota: pupitres, globo, pesas, muebles, pacas, bancas, productos, agua del mar) y caen con
// rebote al volver la gravedad (flotaCae). Al final, plano de CAMEO (invitado especial con foto) mientras dice «¿Y tú...?».
// words: Sticky 3 · no vuelve a bajar 45 · gravedad 94 · cinco segundos 120 · Todo empieza a flotar 166 | Toby 217 · nada en el
// aire 253 · Michi 281 · furiosa 324 | granja 366 · gallinas 387 · vaca 406 | calle 453 · coches 473 · globos 498 | playa 540 ·
// mar 560 · burbujas 576 | gimnasio 635 · pesas 661 · no pesan nada 671 · levanta 727 · elefante 743 | aula 786 · pupitres 805 ·
// bailan 818 · abuela 840 · bastón 865 | Dato real 898 · mil seiscientos 943 · Sin gravedad 1024 · disparado 1064 · línea recta
// 1080 | Por suerte 1120 · cinco segundos 1155 · Tres 1200 · dos 1218 · uno 1232 · PUM 1261 · vuelve 1307 · todo cae 1319 |
// Toby aterriza 1356 · sobre Sticky 1376 | ¿Y tú...? 1416 · sin gravedad 1444
import type { Story, SceneState, Card, V3, Cam } from "../engine/types";
import { makeTimeline, Shot, Key, smooth, smoother, hh, gait, bocaAt, lerp } from "../engine/timeline";
import { STREET_X, BEACH_X } from "../engine/world";
import { band, mirrorFor, extra, card as exCard } from "../engine/crowd";
import { ORIGIN, flotaSube, flotaCae } from "../engine/sets";
import type { Expr, Arm } from "../engine/stick";
import { sticky, who, cameo, ESCALA, TOBY, MICHI, ABUELA, GRANJERO, PROFE, OBRERO, NINO, CIENTIFICA, PALETA, MAMA, PAPA, DOCTORA, TENDERO, SENOR } from "../engine/elenco";

const TOTAL = 1483, X = STREET_X, BX = BEACH_X;
const FA = ORIGIN.farm, CL = ORIGIN.classroom, HO = ORIGIN.house, GY = ORIGIN.gym, EL = ORIGIN.elevator, ST = ORIGIN.store, HS = ORIGIN.hospital;
const FALL = 1261; // ¡PUM! la gravedad vuelve
/** invitado especial del cameo (cambiar por el ganador: scripts/cameo.py baja su foto a public/cameo/ganador.jpg) */
const INVITADO_ESPECIAL = { foto: "cameo/ejemplo.jpg", nombre: "TU NOMBRE AQUÍ" };
const at = (o: readonly number[], x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
const K = (f: number, pos: V3, look: V3, fov: number, glide = false): Key => ({ f, pos, look, fov, glide });

// cortes: 34 tomas de 1.2 a 2.4 s
const CUTS = [0, 40, 80, 118, 165, 215, 250, 284, 320, 358, 398, 440, 488, 533, 575, 628, 668, 712, 778, 822, 860, 898, 945, 1000, 1048, 1085, 1120, 1160, 1198, 1252, 1290, 1325, 1360, 1410, TOTAL];
const parkY = (f: number) => { // Sticky salta y ya no baja: sube y se queda flotando
  const dt = (f - 8) / 30;
  if (dt < 0) return 0;
  if (f < 20) return 5 * dt - 4.9 * dt * dt;
  return 1.22 + (4.0 - 1.22) * (1 - Math.exp(-((f - 20) / 30) * 0.8)) + Math.sin(f / 14) * 0.12;
};
const HEAD = 1.06; // alto de la cara de Sticky sobre sus pies (m)
/** cámara que orbita alrededor de c (radio r, altura h sobre c[1]) del ángulo a0 al a1 */
const orbit = (a: number, b: number, c: V3, r: number, h: number, a0: number, a1: number, fov: number, lookDy = 0): ((f: number) => Cam) => (f) => {
  const u = smoother((f - a) / (b - a)), th = lerp(a0, a1, u);
  return { pos: [c[0] + Math.sin(th) * r, c[1] + h, c[2] + Math.cos(th) * r], look: [c[0], c[1] + lookDy, c[2]], fov };
};
/** zoom de golpe: el fov baja `d` grados en 6 cuadros a partir de f0 */
const punch = (f: number, f0: number, d = 10) => (f < f0 ? 0 : -d * smooth((f - f0) / 6));
/** entrada con energía: los primeros 7 cuadros de cada toma la cámara llega de un empujón (fov +9 y un poco de lado) */
const entra = (keys: Key[], dir = 1): Key[] => {
  const k0 = keys[0], k1 = keys[1];
  if (!k1 || k1.f - k0.f < 14) return keys;
  const fx = k0.look[0] - k0.pos[0], fz = k0.look[2] - k0.pos[2], n = Math.hypot(fx, fz) || 1, rx = (-fz / n) * 0.35 * dir, rz = (fx / n) * 0.35 * dir;
  const u = 7 / (k1.f - k0.f), mid: Key = { f: k0.f + 7, pos: [lerp(k0.pos[0], k1.pos[0], u), lerp(k0.pos[1], k1.pos[1], u), lerp(k0.pos[2], k1.pos[2], u)], look: [lerp(k0.look[0], k1.look[0], u), lerp(k0.look[1], k1.look[1], u), lerp(k0.look[2], k1.look[2], u)], fov: lerp(k0.fov, k1.fov, u), glide: true };
  return [{ ...k0, pos: [k0.pos[0] + rx, k0.pos[1], k0.pos[2] + rz], fov: k0.fov + 9 }, mid, ...keys.slice(1)];
};
const withPunch = (fn: (f: number) => Cam, hits: [number, number][]) => (f: number): Cam => { const c = fn(f); return { ...c, fov: c.fov + hits.reduce((s, [f0, d]) => s + punch(f, f0, d), 0) }; };

// ---------- cámaras de cada toma ----------
const SHOTCAM: (Key[] | ((f: number) => Cam))[] = [
  /* 1 parque: salta */ [K(0, [0.6, 1.0, 4.4], [0, 1.2, 0], 50), K(20, [0.5, 1.4, 4.6], [0, 1.9, 0], 52, true), K(46, [0.3, 2.0, 4.8], [0, 2.9, 0], 54, true)],
  /* 2 cara: no vuelve a bajar (la sigue) */ withPunch((f) => { const r = Math.sin(f / 9) * 0.35, hx = -Math.sin(r) * HEAD, hy = parkY(f) + Math.cos(r) * HEAD; return { pos: [hx + 0.4 - (f - 40) * 0.006, hy - 0.05, 3.1], look: [hx, hy - 0.3, 0], fov: 40 }; }, [[45, 9]]),
  /* 3 general bajo: orbita */ orbit(80, 124, [0, 3.0, 0], 7.8, -2.3, 0.55, -0.45, 58, 0.4),
  /* 4 cinco segundos: vuelta alrededor */ withPunch(orbit(118, 171, [0, 4.55, 0], 3.3, 0.05, 0.9, -0.35, 46), [[120, 8], [129, 6]]),
  /* 5 todo flota: grúa */ [K(165, [0, 1.4, 9.5], [0, 1.6, -3], 56), K(221, [0.6, 3.6, 10.5], [0, 3.4, -3], 60, true)],
  /* 6 casa: Toby */ [K(215, at(HO, -1.0, 1.5, 4.2), at(HO, -1.5, 1.4, -0.5), 58), K(256, at(HO, -1.5, 2.0, 3.8), at(HO, -1.5, 1.8, -0.5), 54, true)],
  /* 7 casa: nada en el aire (travelling) */ (f) => { const sx = swimX(f); return { pos: [sx + 0.9, 2.05, HO[2] + 4.2], look: [sx + 0.7, 1.75, HO[2] + 1.5], fov: 50 }; },
  /* 8 casa: Michi */ [K(284, at(HO, 0.2, 1.5, 4.2), at(HO, -0.2, 1.75, 0.8), 54), K(326, at(HO, -0.1, 1.8, 3.9), at(HO, -0.25, 1.9, 0.8), 50, true)],
  /* 9 casa: atrapa a Michi (primer plano) */ withPunch((f) => ({ pos: [HO[0] - 0.05 + Math.sin(f / 9) * 0.05, 2.05, HO[2] + 4.2 - (f - 320) * 0.006], look: [HO[0] - 0.05, 1.95, HO[2] + 2.0], fov: 48 }), [[324, 10]]),
  /* 10 granja: grúa */ [K(358, at(FA, -2.0, 1.3, 8.4), at(FA, 0, 2.4, -6), 56), K(404, at(FA, -0.8, 3.4, 7.4), at(FA, 0, 4.4, -6), 58, true)],
  /* 11 granja: la vaca pasa */ withPunch((f) => ({ pos: [FA[0] + 0.4 - (f - 398) * 0.008, 2.1, FA[2] + 8.6], look: [FA[0] + 0.1, 2.7, FA[2] + 1.5], fov: 52 }), [[406, 10]]),
  /* 12 calle: coches flotan */ [K(440, [X + 1.6, 0.7, 6.5], [X - 0.8, 3.2, -8], 58), K(494, [X + 0.6, 1.1, 5.0], [X - 0.6, 3.8, -8], 54, true)],
  /* 13 calle: Sticky en el coche-globo */ [K(488, [X + 7.2, 2.4, -2.0], [X - 2.1, 2.2, -3.5], 54), K(539, [X + 6.0, 3.8, -0.6], [X - 2.1, 3.8, -3.5], 56, true)],
  /* 14 playa general */ [K(533, [BX + 4, 2.0, 16.5], [BX, 2.0, 5], 54), K(581, [BX + 2, 3.2, 15], [BX, 3.4, 4], 58, true)],
  /* 15 playa: burbujas gigantes (vuelta) */ withPunch(orbit(575, 634, [BX, 3.35, 9.3], 3.4, 0.2, -0.55, 0.5, 48, -0.05), [[576, 8]]),
  /* 16 gimnasio general */ [K(628, at(GY, 1.2, 1.7, 4.2), at(GY, -4.0, 1.4, -1.8), 60), K(674, at(GY, 0.2, 2.2, 3.9), at(GY, -3.6, 1.9, -2.2), 56, true)],
  /* 17 báscula 0 kg */ [K(668, at(GY, 2.3, 1.4, 4.2), at(GY, 2.3, 1.5, 0.4), 50), K(718, at(GY, 2.3, 1.9, 3.3), at(GY, 2.3, 2.1, 0.4), 46, true)],
  /* 18 súper fuerza */ withPunch((f) => { const u = smoother((f - 712) / 72); return { pos: [GY[0] - 3.0 + u * 1.4, 1.2 + u * 0.3, GY[2] + 3.4 - u * 0.4], look: [GY[0] - 1.0, 1.65 + u * 0.2, GY[2] - 1.6], fov: 54 }; }, [[743, 12]]),
  /* 19 aula general */ [K(778, at(CL, 0.05, 2.0, 4.3), at(CL, 0.0, 1.5, -1), 58), K(828, at(CL, 0.0, 2.8, 4.0), at(CL, 0.0, 2.2, -1), 54, true)],
  /* 20 aula: la abuela */ withPunch((f) => { const u = smoother((f - 822) / 44); return { pos: [CL[0] + 0.15 - u * 0.15, 1.9 + u * 0.4, CL[2] + 4.2], look: [CL[0] + 0.05, 2.0 + u * 0.3, CL[2] - 0.3], fov: 54 }; }, [[840, 8]]),
  /* 21 aula: el bastón (primer plano) */ [K(860, at(CL, -0.1, 2.3, 4.1), at(CL, 0.0, 2.15, -0.2), 50), K(904, at(CL, 0.1, 2.4, 3.7), at(CL, 0.0, 2.2, -0.2), 46, true)],
  /* 22 espacio */ [K(898, [4, 6, 40], [0, 0, 0], 42), K(904, [3.5, 5.5, 37], [0, 0, 0], 36), K(951, [0, 3, 33], [0, 0, 0], 40, true)],
  /* 23 parque: ecuador (vuelta rápida) */ orbit(945, 1006, [0, 0.6, 0.5], 7.2, 0, 0.7, -0.7, 58, 5.2),
  /* 24 cara preocupada */ withPunch((f) => ({ pos: [0.35 - (f - 1000) * 0.004, 5.75, 4.0 - (f - 1000) * 0.01], look: [0, 5.5, 1.5], fov: 44 }), [[1024, 12]]),
  /* 25 disparado */ [K(1048, [-1.5, 5.0, 9], [-1.5, 5.0, 0], 52), K(1091, [3.5, 5.2, 9], [4.0, 5.0, 0], 46, true)],
  /* 26 línea recta */ [K(1085, [0.5, 3.5, 10], [0, 5, -30], 50), K(1126, [0.3, 3.8, 9], [0, 5.5, -40], 40, true)],
  /* 27 elevador: ¡toc! */ [K(1120, at(EL, 0.25, 1.5, 3.4), at(EL, 0, 1.75, 0), 50), K(1166, at(EL, 0.05, 1.65, 2.8), at(EL, 0, 1.85, 0), 47, true)],
  /* 28 súper: todo vuela */ [K(1160, at(ST, 0.5, 1.5, 3.4), at(ST, 0, 1.9, -5), 54), K(1204, at(ST, 0.1, 2.0, 2.3), at(ST, 0, 2.1, -5), 50, true)],
  /* 29 cuenta atrás */ [K(1198, [0.4, 3.6, 7.4], [0, 3.8, 1.5], 52), K(1200, [0.4, 3.7, 6.6], [0, 3.8, 1.5], 52), K(1206, [0.3, 4.0, 6.0], [0, 4.2, 1.5], 44),
    K(1218, [0.3, 4.1, 5.6], [0, 4.25, 1.5], 44), K(1224, [0.3, 4.2, 5.3], [0, 4.3, 1.5], 38), K(1232, [0.3, 4.2, 5.0], [0, 4.3, 1.5], 38), K(1238, [0.3, 4.3, 4.8], [0, 4.35, 1.5], 30), K(1258, [0.3, 4.3, 4.6], [0, 4.35, 1.5], 30)],
  /* 30 ¡PUM! */ [K(1252, [0, 2.6, 10.2], [0, 4, -2], 55), K(1261, [0, 2.5, 9.8], [0, 4, -2], 55), K(1264, [0, 2.1, 10.2], [0, 3, -2], 70), K(1296, [0, 1.5, 9.2], [0, 1.3, -2], 60, true)],
  /* 31 aula: los pupitres caen */ [K(1290, at(CL, 0.1, 2.6, 4.3), at(CL, 0, 1.6, -0.6), 58), K(1300, at(CL, 0.05, 2.5, 4.2), at(CL, 0, 1.4, -0.6), 58, true), K(1331, at(CL, 0.0, 2.0, 4.0), at(CL, 0, 0.9, -0.6), 56, true)],
  /* 32 hospital: la doctora cae en la cama */ [K(1325, at(HS, 0.0, 2.2, 3.4), at(HS, -0.8, 1.5, -1.4), 56), K(1366, at(HS, -0.4, 1.8, 3.1), at(HS, -0.8, 1.1, -1.4), 54, true)],
  /* 33 casa: Toby cae sobre Sticky */ [K(1360, at(HO, -2.4, 1.4, 4.2), at(HO, -2.4, 1.0, 1.2), 58), K(1384, at(HO, -2.4, 1.4, 4.0), at(HO, -2.4, 1.0, 1.2), 56, true), K(1388, at(HO, -2.4, 1.4, 3.95), at(HO, -2.4, 0.95, 1.2), 48), K(1416, at(HO, -2.4, 1.4, 3.8), at(HO, -2.4, 0.95, 1.2), 50, true)],
  /* 34 cameo: invitado especial */ [K(1410, [0.8, 1.5, 5.4], [0.45, 1.25, -0.2], 52), K(1446, [0.55, 1.45, 4.7], [0.45, 1.2, -0.2], 50, true), K(TOTAL, [0.35, 1.45, 4.5], [0.35, 1.2, -0.2], 50, true)],
];
const SHOTS: Shot[] = SHOTCAM.map((c, i) => {
  const a = CUTS[i], b = i === SHOTCAM.length - 1 ? TOTAL : CUTS[i + 1] + 6;
  return typeof c === "function" ? { id: i + 1, a, b, dyn: c } : { id: i + 1, a, b, keys: entra(c, i % 2 ? 1 : -1) };
});
const { camAt, layersAt } = makeTimeline(SHOTS);
function swimX(f: number) { return HO[0] - 2.6 + 3.2 * smoother((f - 250) / 44); }

// ---------- ayudas ----------
const ease = (x: number) => 1 - Math.exp(-Math.max(0, x));
const setO = (c: Card, p: Record<string, unknown>): Card => ({ ...c, o: { ...(c as { o: object }).o, ...p } }) as Card;
const SW: Arm[] = ["up", "fly", "cheer", "fly"];
/** Sticky nadando en el aire */
const swim = (f: number, k = 0): Arm => SW[(Math.floor(f / 6) + k) % 4];
/** hace flotar una tarjeta desde el cuadro f0: sube suave, se mece y gira */
const flo = (c: Card, f: number, f0: number, o: { up?: number; ph?: number; dx?: number; spin?: number } = {}): Card => {
  if (f < f0) return c;
  const dt = (f - f0) / 30, ph = o.ph ?? hh(c.x * 3.1 + c.z * 1.7, 5) * 6.28, up = o.up ?? 2.5;
  const y = (c.y ?? 0) + up * ease(dt * 1.3) + 0.12 * dt + Math.sin(dt * 1.7 + ph) * 0.18;
  return { ...c, y, x: c.x + Math.sin(dt * 0.9 + ph) * (o.dx ?? 0.25), roll: (c.roll ?? 0) + (o.spin ?? 1) * (Math.sin(dt * 1.2 + ph) * 0.5 + dt * 0.12 * (hh(ph, 2) < 0.5 ? 1 : -1)) } as Card;
};
/** una tarjeta que flotaba a la altura yA y cae al piso (y0) con rebote cuando vuelve la gravedad en f0 */
const cae = (c: Card, f: number, f0: number, yA: number, y0 = 0, lie = 0): Card => {
  const k = flotaCae(f, f0, Math.round(Math.sqrt((2 * yA) / 9.8) * 30));
  const ph = hh(c.x + c.z, 3) * 6.28, r0 = Math.sin(f / 15 + ph) * 0.4;
  return { ...c, y: y0 + (yA - y0) * k + (f < f0 ? Math.sin(f / 13 + ph) * 0.12 : 0), roll: f < f0 ? r0 : lerp(lie, r0, Math.min(1, k)) } as Card;
};
/** gira una tarjeta alrededor de su centro (cx, cy) y no de los pies; half = media altura de la tarjeta (m) */
const spinC = (c: Card, cx: number, cy: number, r: number, half: number): Card => ({ ...c, x: cx + Math.sin(r) * half, y: cy - Math.cos(r) * half, roll: r }) as Card;
/** Sticky: siempre hace algo y con la boca de la voz */
const stk = (f: number, expr: Expr, arm: Arm, x: number, z: number, y = 0, musc?: number, roll?: number): Card =>
  ({ ...sticky(f, expr, arm, [x, y, z], [0, 0], undefined, musc), roll });
const dog = (x: number, z: number, mood: "calm" | "scared" | "bark" | "howl" = "scared", y = 0): Card => ({ kind: "dog", o: { ...TOBY, mood }, x, z, y: y || undefined, s: ESCALA.perro });
const cat = (x: number, z: number, mood: "calm" | "scared" | "bark" | "howl" = "howl", y = 0): Card => ({ kind: "cat", o: { ...MICHI, mood }, x, z, y: y || undefined, s: ESCALA.gato });
const floatPeople = (cs: Card[], f: number, f0: number, up = 2.4, expr: Expr = "scream"): Card[] =>
  cs.map((c, i) => {
    const g = flo(c, f, f0 + (i % 5) * 4, { up: up + hh(i, 71) * 2 });
    return f >= f0 && (c.kind === "person" || c.kind === "sticky") ? setO(g, { expr, arm: i % 2 ? "fly" : "up", walk: undefined }) : g.kind === "dog" || g.kind === "cat" ? setO(g, { mood: "scared", walk: undefined }) : g;
  });
const parkCrowd = (id: number, f: number, seed: number, n = 12) =>
  band({ n, seed, x0: -4.5, x1: 4.5, z0: -1.6, z1: -9, f, cam: camAt(id, f), lead: [0, 0], expr: () => "shock", arm: () => "down", wander: 0, walking: false });

// ---------- formación del parque (tomas 23-24 y 29-30): todos flotando juntos, y al ¡PUM! todo cae ----------
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
    case "dog": return { kind: "dog", o: { ...TOBY, mood: air === "fall" ? "howl" : "scared" }, s: ESCALA.perro, ...base };
    case "cat": return { kind: "cat", o: { ...MICHI, mood: "howl" }, s: ESCALA.gato, ...base };
    case "cow": return { kind: "cow", o: { coat: "#ffffff", mood: "scared" }, s: 0.95, ...base, mirror: true };
    case "chicken": return { kind: "chicken", o: { coat: "#ffffff", mood: "scared", walk: gait(f, 3, m.i * 0.3) }, s: 0.4, ...base };
    case "granny": return { kind: "person", o: { ...ABUELA, expr, arm: air === "float" ? "fly" : "up" }, s: ESCALA.adulto, ...base };
    case "kid": return { kind: "person", o: { ...NINO, expr, arm: air === "float" ? "cheer" : "up" }, s: ESCALA.nino, ...base };
    default: return exCard(extra(m.i, 31), m.x, m.z, f, { expr, arm: air === "land" ? "down" : "fly", y, roll });
  }
};
// aula: niños en los pasillos entre pupitres
const KIDS = ([[-2.2, 0.6], [-1.1, -1.2], [2.2, 0.6], [-3.3, 2.2], [2.2, 2.2]] as const);
const kidCard = (i: number, x: number, z: number, y: number, expr: Expr, arm: Arm): Card =>
  ({ kind: "person", o: { ...NINO, hat: (["cap", "bow", "hair", "pony", "beanie"] as const)[i], hatCol: ["#ffd23f", "#ff6fa3", "#2b2b33", "#9b6bff", "#2ed3c6"][i], shirt: ["#f08a2c", "#e36fa8", "#3fa34d", "#2f86d6", "#d84a3a"][i], expr, arm }, x, z, y, s: ESCALA.nino });

// ---------- estado por toma ----------
const state = (id: number, f: number): SceneState => {
  const cam = camAt(id, f);
  switch (id) {
    case 1: case 2: case 3: case 4: { // parque: Sticky salta y NO baja
      const ex: Expr = f < 24 ? "happy" : f < 80 ? "shock" : id === 4 ? (f < 140 ? "worried" : "shock") : "scream";
      const arm: Arm = f < 24 ? "up" : id === 4 ? (f < 150 ? "cheer" : "wave") : swim(f);
      const s = stk(f, ex, arm, 0, 0, parkY(f), undefined, f < 24 ? 0 : Math.sin(f / 9) * 0.35);
      const crowd = floatPeople(parkCrowd(id, f, 21), f, 70, 2.2);
      return { set: "park", env: "day", shake: f >= 20 && f < 28 ? 0.04 : f >= 45 && f < 52 ? 0.03 : 0, speedLines: id === 2 ? 0.6 : id === 3 ? 0.25 : 0, cards: [s, ...crowd] };
    }
    case 5: { // todo empieza a flotar: bancas, gente y perros
      const s = stk(f, "scream", swim(f), 0, 0, parkY(f), undefined, Math.sin(f / 9) * 0.35);
      const crowd = floatPeople(parkCrowd(id, f, 21, 16), f, 168, 2.6);
      return { set: "park", env: "day", flota: flotaSube(f, 166, 16), shake: f >= 166 && f < 176 ? 0.04 : 0, speedLines: 0.3, cards: [s, ...crowd] };
    }
    case 6: { // casa: Toby y los muebles suben
      const toby = flo(dog(HO[0] - 0.8, HO[2] + 0.9, "scared", 0.0), f, 217, { up: 1.6, spin: 1.6 });
      const sti = flo(stk(f, f < 232 ? "happy" : "shock", swim(f), HO[0] - 1.8, HO[2] + 1.6, 0.0), f, 220, { up: 1.1 });
      const mich = flo(cat(HO[0] + 0.1, HO[2] + 0.6, "scared", 0), f, 224, { up: 1.5 });
      return { set: "house", env: "day", tv: true, flota: flotaSube(f, 216, 12), shake: f < 226 ? 0.03 : 0, cards: [sti, toby, mich] };
    }
    case 7: { // casa: Sticky nada en el aire de punta a punta de la sala
      const sx = swimX(f), y = 1.25 + Math.sin(f / 8) * 0.08;
      const sti: Card = { ...stk(f, "happy", swim(f), sx, HO[2] + 1.5, y), roll: -1.25 + Math.sin(f / 5) * 0.08 };
      const toby = { ...dog(HO[0] + 2.4, HO[2] - 0.8, "bark", 1.9 + Math.sin(f / 11) * 0.15), roll: Math.sin(f / 13) * 0.6 } as Card;
      return { set: "house", env: "day", tv: true, flota: 1, speedLines: 0.25, cards: [sti, toby] };
    }
    case 8: { // casa: Michi gira y Sticky estira la mano
      const mich = { ...spinC(cat(0, 0, "howl"), HO[0] + 0.15 - (f - 284) * 0.004, 1.9 + Math.sin(f / 9) * 0.1, (f - 284) / 7, 0.3), z: HO[2] + 0.6 } as Card;
      const sti = stk(f, "worried", "up", HO[0] - 0.6, HO[2] + 1.0, 0.95 + Math.sin(f / 10) * 0.06, undefined, Math.sin(f / 12) * 0.15);
      const toby = { ...dog(HO[0] - 2.8, HO[2] - 0.5, "scared", 2.1), roll: Math.sin(f / 10) * 0.5 } as Card;
      return { set: "house", env: "day", tv: true, flota: 1, cards: [sti, mich, toby] };
    }
    case 9: { // casa: la atrapa... ¡y está furiosa!
      const y = 0.95 + Math.sin(f / 10) * 0.05, grab = f >= 323;
      const sti = stk(f, grab ? (f < 336 ? "shock" : "scream") : "happy", grab ? "hug" : "up", HO[0] - 0.2, HO[2] + 2.0, y, undefined, grab ? Math.sin(f / 3) * 0.06 : 0);
      const mich: Card = grab ? { ...cat(HO[0] + 0.2, HO[2] + 1.95, "howl", y + 0.55 + Math.abs(Math.sin(f / 2.5)) * 0.05), roll: Math.sin(f / 2) * 0.25 } : { ...spinC(cat(0, 0, "howl"), HO[0] + 0.35, 1.85, (f - 284) / 7, 0.3), z: HO[2] + 1.9 } as Card;
      return { set: "house", env: "day", tv: true, flota: 1, shake: grab && f < 336 ? 0.035 : 0, cards: [sti, mich] };
    }
    case 10: { // granja: pacas y gallinas suben
      const chick: Card[] = [0, 1, 2, 3, 4].map((i) => flo({ kind: "chicken", o: { coat: i === 2 ? "#c98f5a" : "#fff", mood: "scared", walk: gait(f, 4, i * 0.3) }, x: FA[0] - 1.8 + i * 0.95, z: FA[2] - 0.2 - (i % 2) * 0.9, s: 0.4, mirror: i % 2 === 0, y: 0 }, f, 380 + i * 3, { up: 2.4 + i * 0.5, spin: 2 }));
      const farmer = flo(who({ ...GRANJERO, expr: "scream", arm: "fly" }, [FA[0] + 1.6, 0, FA[2] + 0.6]), f, 370, { up: 2.2 });
      const sti = flo(stk(f, "happy", swim(f, 2), FA[0] - 0.4, FA[2] + 2.8, 0.0), f, 362, { up: 1.8 });
      const pig = flo({ kind: "pig", o: { coat: "#ffb3c7", mood: "scared" }, x: FA[0] + 3.2, z: FA[2] - 1.0, s: 0.5 }, f, 376, { up: 3.2, spin: 1.8 });
      return { set: "farm", env: "day", flota: flotaSube(f, 360, 18), speedLines: 0.25, shake: f < 368 ? 0.03 : 0, cards: [...chick, farmer, pig, sti] };
    }
    case 11: { // granja: la vaca vuela junto a la cámara
      const u = (f - 398) / 30;
      const vaca: Card = { kind: "cow", o: { coat: "#fff", mood: "scared" }, x: FA[0] - 0.75 + u * 0.4, z: FA[2] + 2.0, y: 1.6 + Math.sin(u * 2) * 0.2, s: 0.95, roll: -0.25 + u * 0.18 };
      const sti = stk(f, f < 410 ? "shock" : "happy", f < 410 ? "point" : "cheer", FA[0] + 0.85, FA[2] + 2.9, 1.15 + Math.sin(f / 9) * 0.1);
      const farmer = { ...who({ ...GRANJERO, expr: "scream", arm: "up" }, [FA[0] - 1.6 + u * 0.5, 3.2 + Math.sin(u * 2.3) * 0.15, FA[2] - 0.6]), roll: 0.4 } as Card;
      return { set: "farm", env: "day", flota: 1, shake: f >= 406 && f < 414 ? 0.04 : 0, speedLines: 0.2, cards: [vaca, farmer, sti] };
    }
    case 12: { // calle: los coches flotan como globos
      const crowd = floatPeople(band({ n: 12, seed: 23, x0: X - 9, x1: X - 5.2, z0: -1.6, z1: -14, f, cam, expr: () => "shock", arm: () => "down", walking: false }), f, 446, 2.6, "scream");
      const cars: Card[] = [0, 1, 2, 3].map((k) => flo({ kind: "car", o: { body: ["#d84a3a", "#2f86d6", "#f2b632", "#3fa34d"][k], wheel: 0 }, x: X - 2.1 + (k % 2) * 4.2, z: -6 - k * 7, s: 0.95, y: 0, mirror: mirrorFor(cam.pos, cam.look, 0, k % 2 ? 1 : -1) }, f, 444 + k * 6, { up: 2.6 + k * 0.9, dx: 0.4, spin: 0.7 }));
      const senor = flo(who({ ...SENOR, expr: "shock", arm: "up" }, [X + 6.2, 0.16, -4]), f, 452, { up: 2.4 });
      const sti = flo(stk(f, "happy", f % 24 < 12 ? "cheer" : "point", X + 0.2, 2.0, 0.0), f, 442, { up: 1.3, dx: 0.1 });
      return { set: "street", env: "day", speedLines: 0.3, shake: f < 450 ? 0.03 : 0, cards: [sti, senor, ...crowd, ...cars] };
    }
    case 13: { // calle: Sticky de paseo encima de un coche-globo
      const dt = Math.max(0, f - 488) / 30, y = 0.5 + 2.2 * ease(dt * 1.2) + Math.sin(dt * 1.6) * 0.2, roll = Math.sin(dt * 1.1) * 0.12;
      const truck: Card = { kind: "car", o: { body: "#2f86d6", wheel: 0 }, x: X - 2.1, z: -3.5, y, s: 1.5, roll, mirror: mirrorFor(cam.pos, cam.look, 0, -1) };
      const sti: Card = { ...stk(f, "happy", f % 20 < 10 ? "cheer" : "wave", X - 1.8, -2.6, y + 2.5), roll };
      const p2 = flo(who({ ...OBRERO, expr: "scream", arm: "fly" }, [X - 4.4, 0.3, -5]), f, 492, { up: 3.5 });
      const side = floatPeople(band({ n: 6, seed: 25, x0: X - 9.5, x1: X - 6, z0: -14, z1: 4, f, cam, expr: () => "shock", walking: false }), f, 490, 2.5);
      return { set: "street", env: "day", speedLines: 0.4, shake: f < 496 ? 0.03 : 0, cards: [truck, sti, p2, ...side] };
    }
    case 14: case 15: { // playa: el mar sube en gotas y burbujas gigantes; peces y gente flotan
      const crowd = floatPeople(band({ n: 9, seed: 27, x0: BX - 7, x1: BX + 6, z0: 3.5, z1: 12, f, cam, lead: [BX, 9], expr: () => "scream", arm: () => "fly" }), f, 538, 2.6);
      const fish: Card[] = Array.from({ length: 10 }, (_, i) => flo({ kind: "fish", o: { coat: ["#3fa3ff", "#ffb347", "#ff6fa3"][i % 3] }, x: BX - 5 + hh(i, 41) * 10, z: 4 + hh(i, 42) * 6, y: 0.1, s: 0.5 + hh(i, 43) * 0.3, mirror: i % 2 === 0 }, f, 540 + i * 3, { up: 1.5 + hh(i, 44) * 3, spin: 1.8, dx: 0.5 }));
      const sti = id === 14 ? flo(stk(f, "shock", swim(f, 3), BX, 9, 0.0), f, 540, { up: 2.0 }) : stk(f, "happy", swim(f, 1), BX, 9.3, 2.25 + Math.sin(f / 10) * 0.12, undefined, Math.sin(f / 11) * 0.3);
      return { set: "beach", env: "day", tide: 0.2, flow: 0, flota: id === 14 ? flotaSube(f, 548, 22) : 1, speedLines: 0.2, shake: f >= 556 && f < 564 ? 0.03 : 0, cards: [sti, ...crowd, ...fish] };
    }
    case 16: case 17: case 18: { // gimnasio: las pesas no pesan nada
      const fl = id === 16 ? flotaSube(f, 632, 14) : 1;
      const people: Card[] = [flo(who({ ...OBRERO, expr: "scream", arm: "fly" }, [GY[0] - 3.4, 0, GY[2] - 0.6]), f, 638, { up: 1.6 }),
        flo(who({ ...NINO, expr: "happy", arm: "cheer" }, [GY[0] + 0.6, 0, GY[2] - 2.6], ESCALA.nino), f, 640, { up: 2.0 }),
        flo(who({ ...CIENTIFICA, expr: "shock", arm: "fly" }, [GY[0] + 4.2, 0, GY[2] - 1.6]), f, 636, { up: 1.5 })];
      if (id === 16) {
        const sti = flo(stk(f, f < 645 ? "happy" : "shock", f < 640 ? "curl" : swim(f), GY[0] - 2.0, GY[2] + 0.6, 0), f, 638, { up: 1.2 });
        return { set: "gym", env: "day", flota: fl, bascula: 0, saco: 0.6, cinta: 0, shake: f >= 632 && f < 640 ? 0.03 : 0, cards: [sti, ...people] };
      }
      if (id === 17) {
        const sti = flo(stk(f, f < 690 ? "shock" : "happy", f < 690 ? "up" : "cheer", GY[0] + 2.3, GY[2] + 1.0, 0.125), f, 672, { up: 0.9, dx: 0.06 });
        return { set: "gym", env: "day", flota: 1, bascula: 0, saco: 0.5, cinta: 0, cards: [sti] };
      }
      // 18: ¡súper fuerza! levanta al obrero (que no pesa nada) con una mano
      const big = f >= 727, y0 = 0.35 + Math.sin(f / 10) * 0.05;
      const sti = stk(f, big ? "happy" : "shock", big ? (f < 740 ? "flex" : "up") : "curl", GY[0] - 1.0, GY[2] - 1.6, y0, big ? 7 : undefined);
      const lift = f >= 740 ? smooth((f - 740) / 6) : 0;
      const obr = { ...spinC(who({ ...OBRERO, expr: f >= 743 ? "happy" : "scream", arm: "cheer" }, [0, 0, 0]), GY[0] - 0.75, lerp(2.9 + Math.sin(f / 10) * 0.2, y0 + 1.72, lift), lerp(Math.sin(f / 14) * 0.8, -1.5, lift), 0.75), z: GY[2] - 1.75 } as Card; // acostado en su mano como charola
      const kid = flo(who({ ...NINO, expr: "happy", arm: "cheer" }, [GY[0] - 3.4, 0, GY[2] - 2.9], ESCALA.nino), f, 700, { up: 2.4 });
      return { set: "gym", env: "day", flota: 1, bascula: 0, saco: 0.9, cinta: 0, speedLines: f >= 743 ? 0.3 : 0, shake: f >= 743 && f < 752 ? 0.05 : 0, cards: [sti, obr, kid] };
    }
    case 19: case 20: case 21: { // aula: los pupitres bailan y la abuela flota con su bastón
      const kids: Card[] = KIDS.map(([x, z], i) => flo(kidCard(i, CL[0] + x, CL[2] + z, 0, "happy", i % 2 ? "wave" : "cheer"), f, 792 + i * 4, { up: 1.2 + i * 0.25, spin: 1.5 }));
      const prof = flo(who({ ...PROFE, expr: "scream", arm: "fly" }, [CL[0] - 3.6, 0, CL[2] - 2.6]), f, 794, { up: 1.6 });
      const abY = id === 19 ? 0 : 0.6 + 1.0 * smooth((f - 830) / 30);
      const abuO = { ...ABUELA, expr: (id === 21 ? "happy" : "shock") as Expr, arm: (id === 21 ? "cheer" : "fly") as Arm };
      const abu: Card = id === 19 ? who({ ...ABUELA, expr: "shock", arm: "down" }, [CL[0] + 0.5, 0, CL[2] - 1.0])
        : id === 20 ? { ...who(abuO, [CL[0] + 0.5, abY + Math.sin(f / 10) * 0.1, CL[2] - 1.0]), roll: Math.sin(f / 12) * 0.4 } as Card
        : { ...spinC(who(abuO, [0, 0, 0]), CL[0] + 0.5, 2.3 + Math.sin(f / 10) * 0.1, (f - 860) / 6, 0.8), z: CL[2] - 1.0 } as Card; // gira como hélice con su bastón
      const sti = id === 19 ? flo(stk(f, "happy", swim(f), CL[0] + 0.0, CL[2] + 0.6, 0), f, 784, { up: 1.1 })
        : id === 20 ? stk(f, "shock", "point", CL[0] - 0.5, CL[2] + 0.6, 1.25 + Math.sin(f / 9) * 0.08, undefined, Math.sin(f / 11) * 0.2)
        : stk(f, "happy", f % 20 < 10 ? "cheer" : "wave", CL[0] - 0.5, CL[2] + 0.6, 1.3 + Math.sin(f / 8) * 0.08, undefined, Math.sin(f / 11) * 0.25);
      return { set: "classroom", env: "day", flota: id === 19 ? flotaSube(f, 800, 14) : 1, shake: f >= 805 && f < 812 ? 0.03 : 0, speedLines: id === 21 ? 0.25 : 0, cards: [sti, abu, ...(id === 21 ? [] : [prof, ...kids])] };
    }
    case 22: { // espacio: la Tierra gira a 1,670 km/h
      const spS = { ...stk(f, "happy", swim(f), 0.5, 28.5, 1.3, undefined, Math.sin(f / 12) * 0.3) };
      return { set: "space", env: "space", cards: [spS], space: { earth: { pos: [0, 0, 0], r: 10, rot: f * 0.12, axis: true }, lightDir: [-1, 0.3, 0.6] } };
    }
    case 23: { // parque: todo flota (también las bancas); vuelta rápida
      const cards = FORM.map((m) => fm({ ...m, yh: m.yh + 1 }, f, "shock", swim(f)));
      return { set: "park", env: "day", flota: 1, speedLines: 0.5, shake: 0.02, cards };
    }
    case 24: { // cara: ¡sin gravedad saldrías disparado!
      const sti = stk(f, f < 1024 ? "worried" : "scream", f < 1024 ? swim(f) : "cover", 0, 1.5, 4.6 + Math.sin(f / 12) * 0.08, undefined, Math.sin(f / 14) * 0.12);
      return { set: "park", env: "day", flota: 1, shake: f >= 1024 && f < 1032 ? 0.04 : 0, cards: [sti, ...FORM.slice(1, 6).map((m) => fm({ ...m, yh: m.yh + 1 }, f, "shock", "fly"))] };
    }
    case 25: { // Sticky disparado en línea recta
      const sx = -2.0 + 0.133 * (f - 1048);
      return { set: "park", env: "dusk", speedLines: 1, shake: 0.03, flota: 1, cards: [{ ...stk(f, "scream", "fly", sx, 0, 5.0, undefined, 1.35), mirror: false }] };
    }
    case 26: { // se aleja y se hace chiquito
      const dt = (f - 1085) / 30;
      return { set: "park", env: "dusk", speedLines: 0.8, cards: [{ ...stk(f, "scream", "fly", 0, -0.5 - dt * dt * 4 - dt * 3, 5.0 + dt * 0.5), roll: 0.3 }] };
    }
    case 27: { // elevador: Sticky sube y choca de cabeza con el techo: ¡toc!
      const u = f - 1122, TOP = 1.27;
      const y = u < 0 ? 0 : u < 16 ? (u / 16) * TOP : TOP - 0.35 * Math.abs(Math.sin(((u - 16) / 14) * Math.PI));
      const hit = u >= 16 && ((u - 16) % 14 < 3);
      const sti = stk(f, u < 16 ? "happy" : hit ? "scream" : "worried", u < 16 ? "up" : "cover", EL[0] - 0.4, EL[2] + 0.15, y, undefined, Math.sin(f / 7) * 0.08);
      const papa = { ...spinC(who({ ...PAPA, expr: "shock", arm: "fly" }, [0, 0, 0]), EL[0] + 0.45, 1.65 + Math.sin(f / 9) * 0.08, 2.9 + Math.sin(f / 15) * 0.15, 0.8), z: EL[2] - 0.35 } as Card;
      return { set: "elevator", env: "day", shake: hit ? 0.05 : 0, cards: [sti, papa] };
    }
    case 28: { // súper: los productos salen volando y la gente flota entre los pasillos
      const fl = flotaSube(f, 1156, 10);
      const mama = flo(who({ ...MAMA, expr: "happy", arm: "cheer" }, [ST[0] - 0.7, 0, ST[2] - 4.6]), f, 1158, { up: 1.8, dx: 0.1 });
      const tend = flo(who({ ...TENDERO, expr: "scream", arm: "fly" }, [ST[0] + 0.7, 0, ST[2] - 7.2]), f, 1160, { up: 2.2, dx: 0.1 });
      const kid = flo(who({ ...NINO, expr: "happy", arm: "up" }, [ST[0] + 0.5, 0, ST[2] - 2.8], ESCALA.nino), f, 1162, { up: 1.1, dx: 0.1 });
      const sti = stk(f, "happy", swim(f), ST[0] - 0.35, ST[2] - 1.5, 1.0 + Math.sin(f / 9) * 0.1, undefined, Math.sin(f / 10) * 0.3);
      return { set: "store", env: "day", flota: fl, speedLines: 0.2, cards: [sti, mama, tend, kid] };
    }
    case 29: case 30: { // 3, 2, 1... ¡PUM!
      const ex: Expr = id === 29 ? (f < 1230 ? "worried" : "shock") : f < FALL + 30 ? "scream" : "sad";
      const arm: Arm = id === 29 ? "up" : f < FALL ? "up" : "down";
      const cards = FORM.map((m) => fm(m, f, ex, arm));
      const pum = f >= FALL && f < FALL + 22, fall = f >= FALL && f < FALL + 34;
      return { set: "park", env: "day", flota: flotaCae(f, FALL + 1, 16), speedLines: id === 29 ? 0.2 : fall ? 1 : 0, shake: id === 29 ? Math.max(0, (f - 1200) / 46) * 0.06 : pum ? 0.15 : f >= FALL + 22 && f < FALL + 50 ? 0.06 : 0, cards };
    }
    case 31: { // aula: los pupitres caen y rebotan; los niños aterrizan sentados
      const T0 = 1297;
      const kids = KIDS.map(([x, z], i) => cae(kidCard(i, CL[0] + x, CL[2] + z, 0, f < T0 + 8 ? "scream" : "sad", f < T0 ? "cheer" : "up"), f, T0 + (i % 3), 1.6 + i * 0.25, 0, i % 2 ? 0.25 : -0.25));
      const sti = cae(stk(f, f < T0 + 10 ? "scream" : "sad", f < T0 ? swim(f) : "up", CL[0] + 0.0, CL[2] + 0.6, 0), f, T0 + 1, 1.5, 0, 0);
      const land = f >= T0 + 14 && f < T0 + 24;
      return { set: "classroom", env: "day", flota: flotaCae(f, T0, 14), shake: land ? 0.08 : 0, speedLines: f >= T0 && f < T0 + 14 ? 0.6 : 0, cards: [sti, ...kids] };
    }
    case 32: { // hospital: la cama cae y la doctora aterriza encima
      const T0 = 1332;
      const doc = cae(who({ ...DOCTORA, expr: f < T0 + 14 ? "scream" : "relief", arm: f < T0 + 14 ? "up" : "down" }, [HS[0] - 1.4, 0, HS[2] - 2.2]), f, T0 + 2, 2.4, 0.92, 1.45);
      const sti = cae(stk(f, f < T0 + 14 ? "shock" : "sad", f < T0 ? swim(f) : "up", HS[0] - 0.2, HS[2] - 0.2, 0), f, T0 + 1, 1.3, 0, 0);
      return { set: "hospital", env: "day", flota: flotaCae(f, T0, 14), shake: f >= T0 + 14 && f < T0 + 22 ? 0.07 : 0, cards: [sti, doc] };
    }
    case 33: { // casa: los muebles caen y Toby aterriza sobre Sticky
      const t0 = 1358, tl = 26, dt = Math.max(0, f - t0), land = f >= t0 + tl;
      const ty = land ? 1.05 + 0.25 * Math.exp(-(f - t0 - tl) / 5) * Math.abs(Math.sin((f - t0 - tl) / 2.5)) : 4.8 - 4.2 * (dt / tl) ** 2;
      const toby: Card = { kind: "dog", o: { ...TOBY, mood: land ? "bark" : "scared" }, x: HO[0] - 2.35, y: ty, z: HO[2] + 1.7, s: ESCALA.perro, roll: land ? 0.1 : Math.sin(dt / 4) * 0.4 };
      const sti = stk(f, land ? "scream" : f < 1372 ? "relief" : "shock", land ? "cover" : f < 1372 ? "wave" : "up", HO[0] - 2.4, HO[2] + 1.8, 0);
      return { set: "house", env: "day", tv: true, flota: flotaCae(f, 1362, 13), shake: (f >= 1375 && f < 1381) || (f >= t0 + tl && f < t0 + tl + 12) ? 0.1 : 0, cards: [sti, toby] };
    }
    case 34: { // CAMEO: Sticky saluda al invitado especial
      const jump = f > 1440 ? Math.abs(Math.sin((f - 1440) / 6)) * 0.14 : 0;
      const sti = stk(f, f < 1430 ? "smile" : "happy", f < 1432 ? "point" : "wave", -0.2, 1.0, jump);
      const inv = cameo(f, INVITADO_ESPECIAL, [0.75, 0, -0.4], undefined, { saluda: f >= 1426 && f % 30 < 15 });
      const toby = { ...dog(-0.75, -0.3, "bark", Math.abs(Math.sin(f / 5)) * 0.15), mirror: false };
      return { set: "park", env: "day", cards: [sti, inv, toby] };
    }
    default: return { set: "park", env: "day", cards: [] };
  }
};

const dofAt = (_id: number, _f: number) => ({ cInf: 3 });

export const GRAVEDAD: Story = {
  voz: VOZ,
  cameo: INVITADO_ESPECIAL,
  TOTAL, camAt, layersAt, dofAt, state,
  MARKS: [
    { a: 44, b: 80, label: "¡NO BAJA!", sub: "sin gravedad", col: PALETA.titulo.dato },
    { a: 120, b: 164, label: "5 SEGUNDOS", sub: "sin gravedad", col: "#ffffff" },
    { a: 168, b: 214, label: "¡TODO FLOTA!", sub: "", col: PALETA.titulo.calma },
    { a: 254, b: 282, label: "¡A NADAR!", sub: "", col: PALETA.titulo.espacio },
    { a: 324, b: 358, label: "¡MICHI FURIOSA!", sub: "", col: PALETA.titulo.alerta },
    { a: 404, b: 440, label: "VACA VOLADORA", sub: "", col: PALETA.titulo.dato },
    { a: 474, b: 532, label: "COCHES-GLOBO", sub: "", col: PALETA.titulo.espacio },
    { a: 578, b: 628, label: "¡MAR EN BURBUJAS!", sub: "", col: PALETA.titulo.espacio },
    { a: 664, b: 708, label: "PESAS: 0 kg", sub: "no pesan nada", col: PALETA.titulo.dato },
    { a: 744, b: 776, label: "¡SÚPER FUERZA!", sub: "", col: PALETA.titulo.alerta },
    { a: 806, b: 858, label: "AULA FLOTANTE", sub: "", col: PALETA.titulo.calma },
    { a: 902, b: 998, label: "1,670 km/h", sub: "gira el suelo en el ecuador", col: PALETA.titulo.dato },
    { a: 1062, b: 1118, label: "EN LÍNEA RECTA", sub: "¡adiós!", col: PALETA.titulo.alerta },
    { a: 1138, b: 1160, label: "¡TOC!", sub: "", col: PALETA.titulo.alerta },
    { a: 1164, b: 1196, label: "SOLO 5 SEGUNDOS", sub: "", col: PALETA.titulo.calma },
    { a: 1199, b: 1214, label: "3", sub: "", col: "#ffffff" },
    { a: 1215, b: 1229, label: "2", sub: "", col: PALETA.titulo.dato },
    { a: 1230, b: 1258, label: "1", sub: "", col: PALETA.titulo.alerta },
    { a: 1262, b: 1294, label: "¡PUM!", sub: "la gravedad vuelve", col: PALETA.titulo.alerta },
    { a: 1300, b: 1356, label: "¡TODO CAE!", sub: "", col: PALETA.titulo.dato },
    { a: 1386, b: 1410, label: "¡AUCH!", sub: "", col: PALETA.titulo.dato },
    { a: 1418, b: TOTAL + 10, label: "¿Y TÚ?", sub: "¿qué harías?", col: PALETA.titulo.dato },
  ],
};
// bocaAt se importa por si se necesita al ajustar
void bocaAt;
