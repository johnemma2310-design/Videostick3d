import VOZ from "../../voz/gallinas/palabras.json";
// «¿Por qué las gallinas se tragan piedras?» — SHORT PARA NIÑOS (BIBLIA/SHORTS_NINOS.md), 47.8 s (1434 cuadros), 31 tomas,
// 6 lugares: granja → gallinero → mercado → veterinaria → cocina → parque (atardecer) con la bandada.
// Paca (la gallina, elenco.ts) picotea con `pica`, camina con `walk` y se traga las piedritas. Capas de pasto cerca de la cámara.
// words: GLUP 72 · ve a Paca 114 · picar 127 · toc 155 · toc 168 · traga 200 · piedrita 214 | corre 262 · gallinero 271 · pan 289 ·
// Tendrá hambre 318 | Paca come 360 · otra piedra 400 · Glup 439 | mercado 476 · compra 506 · Cling 553 | veterinaria 589 ·
// dientes 659 · Ni uno 694 | molleja 763 · músculos 804 | aprieta 859 · chas 877 · chas 892 · muele 928 | cocina 979 · maíz 1015 ·
// molcajete 1031 · Chas 1068 · digieren 1112 | parque 1163 · riega 1191 · Ploc 1238 · Todas 1269 · corriendo 1301 | piedra 1361 · tampoco 1398
import type { Story, SceneState, Card, V3, Cam } from "../engine/types";
import type { Portada } from "../engine/portada";
import { makeTimeline, smooth, hh, gait, caraEn, conSalto, lerp } from "../engine/timeline";
import { ORIGIN } from "../engine/sets";
import { band } from "../engine/crowd";
import type { Expr, Arm, StickyOpts } from "../engine/stick";
import { sticky, who, cameo, PALETA, PACA, ESCALA_ANIMAL, TENDERO, DOCTORA, NINO, ESCALA } from "../engine/elenco";
import { prop, capaCerca } from "../engine/props";
import { at, K, withPunch, keyCam, armarTomas, vuela, brinca } from "../engine/tomas";
import CAMEO_ACTUAL from "./cameo_actual.json";

const TOTAL = 1434;
const FA = ORIGIN.farm, GA = ORIGIN.gallinero, MK = ORIGIN.mercado, HS = ORIGIN.hospital, HO = ORIGIN.house;
const INVITADO_ESPECIAL = { foto: CAMEO_ACTUAL.foto, nombre: CAMEO_ACTUAL.nombre };
const CUTS = [0, 40, 76, 118, 160, 196, 246, 290, 354, 396, 432, 468, 510, 550, 584, 626, 680, 726, 780, 838, 896, 966, 1020, 1064, 1100, 1152, 1196, 1232, 1268, 1330, 1390, TOTAL];

// ---------- cámaras (todas se mueven; zoom de golpe en las palabras fuertes) ----------
type C = Parameters<typeof armarTomas>[2][number];
const P = (keys: ReturnType<typeof K>[], hits: [number, number][]): C => withPunch(keyCam(keys), hits);
const SHOTCAM: C[] = [
  /* 1 granja: Paca picotea */ [K(0, at(FA, 1.0, 0.6, 2.9), at(FA, 0.0, 0.62, -0.4), 50), K(46, at(FA, 0.6, 0.62, 2.2), at(FA, 0.05, 0.62, -0.4), 46, true)],
  /* 2 ¡GLUP! */ P([K(40, at(FA, 0.55, 0.7, 2.7), at(FA, 0.15, 0.68, 0.0), 44), K(82, at(FA, 0.45, 0.72, 2.4), at(FA, 0.15, 0.7, 0.0), 42, true)], [[72, 10]]),
  /* 3 Sticky mira a Paca (vuelta) */ (f) => { const u = smooth((f - 76) / 48), a = lerp(-0.5, 0.35, u); return { pos: [FA[0] + 0.1 + Math.sin(a) * 3.1, 1.15, FA[2] + 0.3 + Math.cos(a) * 3.1], look: [FA[0] + 0.05, 0.85, FA[2] + 0.3], fov: 48 }; },
  /* 4 toc */ P([K(118, at(FA, 0.9, 0.65, 2.8), at(FA, 0.25, 0.68, 0.0), 46), K(166, at(FA, 0.8, 0.65, 2.5), at(FA, 0.25, 0.7, 0.0), 42, true)], [[155, 8]]),
  /* 5 toc (Sticky imita) */ P([K(160, at(FA, -0.2, 1.0, 2.6), at(FA, 0.2, 0.75, 0.2), 48), K(202, at(FA, 0.2, 1.1, 2.3), at(FA, 0.2, 0.8, 0.2), 46, true)], [[168, 8]]),
  /* 6 se la traga */ P([K(196, at(FA, 0.7, 0.7, 2.9), at(FA, 0.2, 0.7, 0.0), 46), K(252, at(FA, 0.55, 0.72, 2.5), at(FA, 0.2, 0.72, 0.0), 42, true)], [[214, 10]]),
  /* 7 corre con el pan (travelling) */ (f) => { const x = runX(f); return { pos: [x + 0.4, 1.2, FA[2] + 4.0], look: [x + 0.6, 0.9, FA[2] + 1.0], fov: 52 }; },
  /* 8 gallinero */ [K(290, at(GA, 0.9, 1.5, 3.4), at(GA, 0.3, 0.85, -0.4), 54), K(360, at(GA, 0.5, 1.35, 3.0), at(GA, 0.2, 0.85, -0.4), 50, true)],
  /* 9 Paca come el pan */ [K(354, at(GA, -0.7, 0.7, 2.4), at(GA, 0.0, 0.55, 0.3), 46), K(402, at(GA, -0.4, 0.75, 2.0), at(GA, 0.05, 0.55, 0.3), 44, true)],
  /* 10 otra piedra */ P([K(396, at(GA, 0.8, 0.9, 2.6), at(GA, 0.1, 0.78, 0.0), 46), K(438, at(GA, 0.65, 0.9, 2.3), at(GA, 0.1, 0.8, 0.0), 44, true)], [[407, 8]]),
  /* 11 ¡Glup! */ P([K(432, at(GA, 0.3, 0.9, 2.5), at(GA, 0.1, 0.8, 0.0), 44), K(474, at(GA, 0.25, 0.9, 2.2), at(GA, 0.1, 0.82, 0.0), 42, true)], [[439, 12]]),
  /* 12 mercado (travelling) */ (f) => { const x = mkX(f); return { pos: [x + 1.6, 1.5, MK[2] + 1.8], look: [x + 0.2, 1.1, MK[2] - 2.6], fov: 54 }; },
  /* 13 compra piedritas */ [K(510, at(MK, 1.4, 1.35, 0.6), at(MK, 0.3, 1.15, -3.4), 50), K(556, at(MK, 1.0, 1.3, 0.1), at(MK, 0.3, 1.15, -3.4), 46, true)],
  /* 14 ¡cling! */ P([K(550, at(MK, -1.2, 1.2, -0.1), at(MK, 0.5, 1.2, -3.6), 50), K(590, at(MK, -0.9, 1.25, -0.4), at(MK, 0.5, 1.2, -3.6), 48, true)], [[553, 8]]),
  /* 15 veterinaria */ [K(584, at(HS, 0.4, 1.7, 2.6), at(HS, -1.3, 1.1, -2.0), 56), K(632, at(HS, 0.0, 1.55, 2.1), at(HS, -1.3, 1.05, -2.2), 52, true)],
  /* 16 sin dientes (lupa) */ P([K(626, at(HS, -0.6, 1.25, 0.2), at(HS, -1.15, 1.05, -2.3), 44), K(686, at(HS, -0.7, 1.2, -0.2), at(HS, -1.15, 1.05, -2.3), 40, true)], [[659, 9]]),
  /* 17 ¡ni uno! */ P([K(680, at(HS, 0.1, 1.25, 0.7), at(HS, -0.4, 1.15, -1.3), 46), K(732, at(HS, 0.05, 1.2, 0.4), at(HS, -0.4, 1.12, -1.3), 42, true)], [[694, 12]]),
  /* 18 rayos X */ P([K(726, at(HS, 2.0, 1.45, 1.6), at(HS, 1.85, 1.2, -1.9), 52), K(786, at(HS, 1.9, 1.4, 1.1), at(HS, 1.85, 1.2, -1.9), 50, true)], [[763, 9]]),
  /* 19 con músculos */ [K(780, at(HS, 3.6, 1.3, 1.5), at(HS, 2.1, 1.15, -1.6), 50), K(844, at(HS, 3.0, 1.35, 1.2), at(HS, 2.0, 1.15, -1.6), 48, true)],
  /* 20 ¡chas, chas! */ P([K(838, at(HS, 2.0, 1.3, 1.1), at(HS, 1.95, 1.15, -1.9), 48), K(902, at(HS, 2.0, 1.3, 0.9), at(HS, 1.95, 1.15, -1.9), 46, true)], [[877, 8], [892, 8]]),
  /* 21 muele la comida (se aleja) */ [K(896, at(HS, 2.0, 1.3, 0.3), at(HS, 2.2, 1.2, -1.9), 44), K(972, at(HS, 1.4, 1.5, 1.8), at(HS, 2.3, 1.1, -1.9), 52, true)],
  /* 22 cocina */ [K(966, at(HO, -2.7, 1.55, 0.8), at(HO, -4.3, 1.05, -2.2), 52), K(1026, at(HO, -2.9, 1.45, 0.5), at(HO, -4.3, 1.05, -2.2), 48, true)],
  /* 23 muele maíz */ [K(1020, at(HO, -3.2, 1.35, 0.3), at(HO, -4.32, 1.05, -2.2), 48), K(1070, at(HO, -3.35, 1.3, 0.0), at(HO, -4.32, 1.05, -2.2), 46, true)],
  /* 24 ¡chas! */ P([K(1064, at(HO, -3.5, 1.45, 0.0), at(HO, -4.5, 1.05, -2.15), 46), K(1106, at(HO, -3.55, 1.4, -0.2), at(HO, -4.5, 1.05, -2.15), 44, true)], [[1068, 12]]),
  /* 25 digieren mejor */ [K(1100, at(HO, -0.2, 1.45, 2.6), at(HO, -1.4, 0.95, -0.6), 50), K(1158, at(HO, -0.4, 1.4, 2.3), at(HO, -1.4, 0.95, -0.6), 47, true)],
  /* 26 parque: llega con el costal */ (f) => { const z = parkZ(f); return { pos: [0.9, 1.3, z + 3.4], look: [0.0, 0.95, z], fov: 50 }; },
  /* 27 riega piedritas */ [K(1196, [-1.6, 1.0, 2.8], [0.2, 0.8, -0.8], 50), K(1238, [-1.3, 1.1, 2.4], [0.2, 0.8, -0.8], 48, true)],
  /* 28 ¡ploc! */ P([K(1232, [0.9, 0.5, 2.2], [0.2, 0.5, -0.8], 48), K(1274, [0.8, 0.55, 2.0], [0.2, 0.5, -0.8], 46, true)], [[1238, 10]]),
  /* 29 la bandada llega (grúa) */ [K(1268, [0.4, 1.1, 4.4], [0, 0.6, -0.8], 54), K(1336, [0.3, 2.4, 4.8], [0, 0.4, -0.8], 58, true)],
  /* 30 ¿tú te comerías una piedra? */ P([K(1330, [0.25, 1.2, 2.6], [0.05, 1.05, 0.2], 46), K(1396, [0.2, 1.15, 2.2], [0.05, 1.05, 0.2], 42, true)], [[1361, 9]]),
  /* 31 ¡yo tampoco! + cameo */ [K(1390, [0.8, 1.45, 5.4], [0.4, 1.05, -0.2], 52), K(TOTAL, [0.5, 1.4, 4.7], [0.35, 1.0, -0.2], 50, true)],
];
const SHOTS = armarTomas(CUTS, TOTAL, SHOTCAM);
const { camAt: camBase, layersAt } = makeTimeline(SHOTS);
/** saltito de cámara en los golpes y carteles grandes (conSalto) */
const GOLPES: (number | [number, number])[] = [[72, 0.12], [155, 0.08], [168, 0.08], [214, 0.1], [439, 0.12], [553, 0.1], [694, 0.14], [877, 0.12], [892, 0.12], [1068, 0.14], [1238, 0.16], [1301, 0.18], [1398, 0.12]];
const camAt = (id: number, f: number): Cam => conSalto(camBase(id, f), f, GOLPES);
type M = ([string | number, Expr] | [string, Expr, number])[];
const cara = (f: number, mapa: M, base: Expr): Expr => caraEn<Expr>(VOZ, f, mapa, base);

// ---------- ayudas ----------
function runX(f: number) { return FA[0] - 3.6 + 0.117 * Math.max(0, f - 246); }
function mkX(f: number) { return MK[0] - 3.2 + 0.042 * Math.max(0, f - 468); }
function parkZ(f: number) { return 2.0 - 0.043 * Math.max(0, f - 1152); }
const stk = (f: number, expr: Expr, arm: Arm, p: V3, o: Partial<StickyOpts> & { walk?: number; run?: boolean; musc?: number; roll?: number } = {}): Card => {
  const c = sticky(f, expr, arm, p, [0, 0], o.walk, o.musc);
  const { roll, musc: _m, walk: _w, ...rest } = o;
  return { ...c, o: { ...(c as { o: StickyOpts }).o, ...rest }, roll } as Card;
};
/** picoteo en bucle (0..1) con período `per` cuadros */
const picoteo = (f: number, ph = 0, per = 22) => Math.pow(Math.max(0, Math.sin(((f / per) + ph) * Math.PI * 2)), 3);
/** un picotazo centrado en el cuadro f0 */
const picaEn = (f: number, f0: number) => Math.max(0, 1 - Math.abs(f - f0) / 6);
type G = { pica?: number; walk?: number; mood?: "calm" | "scared" | "bark" | "sleep"; paca?: boolean; s?: number; mirror?: boolean; y?: number; i?: number };
const PLUMAS = ["#ffffff", "#f4f1ea", "#c98f5a", "#8a5a34", "#ffffff", "#2b2b33", "#e8c27a"];
const gal = (p: V3, o: G = {}): Card => ({
  kind: "chicken", x: p[0], y: (o.y ?? p[1]) || undefined, z: p[2], s: (o.s ?? 1) * ESCALA_ANIMAL.gallina * (o.paca ? 1.12 : 1), mirror: o.mirror,
  o: o.paca ? { ...PACA, pica: o.pica, walk: o.walk, mood: o.mood } : { coat: "#ffffff", pluma: PLUMAS[(o.i ?? 0) % PLUMAS.length], pica: o.pica, walk: o.walk, mood: o.mood },
});
/** gallinas de fondo picoteando alrededor de (cx, cz) */
const corral = (f: number, o: readonly number[], pts: [number, number][], seed = 0): Card[] =>
  pts.map(([x, z], i) => gal(at(o, x, 0, z), { pica: picoteo(f, hh(i, seed + 3), 18 + (i % 3) * 5), mirror: hh(i, seed + 5) < 0.5, i: i + seed }));
const pasto = (cam: Cam, sube = 0.6) => [capaCerca(cam, "pasto", -1, { sube }), capaCerca(cam, "pasto", 1, { sube: sube * 0.8, d: 1.35 })];
const piedrita = (p: V3, s = 0.18) => prop("piedrita", p, s);
const PAN_Y = 0.42; // el pan en el pecho de Sticky (brazos "hug")

// ---------- estado por toma ----------
const state = (id: number, f: number): SceneState => {
  const cam = camAt(id, f);
  switch (id) {
    case 1: case 2: { // granja: Paca picotea y ¡GLUP! se traga la piedra
      const sw = id === 1 ? false : f >= 64, pk = id === 1 ? picoteo(f, 0.1) : picaEn(f, 60);
      const paca = gal(at(FA, 0.3, 0, 0.3), { paca: true, pica: pk, mood: f >= 72 ? "scared" : undefined, y: brinca(f, 72, 0.12, 8) * (f < 90 ? 1 : 0) });
      const s = stk(f, cara(f, [[20, "sorpresa"], ["glup", "susto"]], "feliz"), f < 72 ? "point" : "cover", at(FA, id === 1 ? -0.75 : -0.3, 0, id === 1 ? -0.5 : -0.35));
      const extras = corral(f, FA, [[-2.2, -2.4], [1.8, -2.8], [2.8, -1.4]]);
      return { set: "farm", env: "day", shake: f >= 72 && f < 80 ? 0.03 : 0, cards: [s, paca, ...(sw ? [] : [piedrita(at(FA, 0.6, 0, 0.32))]), ...extras, ...pasto(cam)] };
    }
    case 3: case 4: case 5: case 6: { // granja: picar la tierra ¡toc, toc! y traga una piedrita
      const px = id === 3 ? 0.4 + 0.3 * smooth((f - 80) / 30) : 0.7;
      const pk = id === 3 ? picoteo(f) : id === 4 ? picaEn(f, 155) + picoteo(f, 0.3, 30) * 0.3 : id === 5 ? picaEn(f, 168) : picaEn(f, 205);
      const paca = gal(at(FA, id === 3 || id === 5 ? px : 0.45, 0, 0.4), { paca: true, pica: pk, walk: id === 3 && f < 110 ? gait(f, 3) : undefined, mood: id === 6 && f >= 214 ? "scared" : undefined, y: id === 6 ? brinca(f, 214, 0.1, 8) * (f < 232 ? 1 : 0) : 0 });
      const ex = id === 3 ? cara(f, [["picar", "sorpresa"]], "susto") : id === 4 ? cara(f, [[153, "sorpresa"]], "susto") : id === 5 ? "feliz" : cara(f, [["traga", "sorpresa"], ["piedrita", "susto"]], "susto");
      const sRoll = id === 5 ? -picaEn(f, 172) * 0.35 - picaEn(f, 184) * 0.35 : 0; // Sticky imita el picotazo
      const s = stk(f, ex, id === 3 ? "point" : id === 6 ? "cover" : "down", id === 3 || id === 5 ? at(FA, -0.45, 0, -0.05) : at(FA, -0.15, 0, -0.35), { roll: sRoll });
      const sx0 = id === 3 || id === 5 ? px : 0.45, stones = id === 6 && f >= 214 ? [] : [piedrita(at(FA, sx0 + 0.32, 0, 0.42)), piedrita(at(FA, sx0 - 0.5, 0, 0.7), 0.14)];
      return { set: "farm", env: "day", shake: id === 6 && f >= 214 && f < 222 ? 0.03 : 0, cards: [s, paca, ...stones, ...corral(f, FA, [[-2.0, -2.0], [2.2, -2.6]], 4), ...pasto(cam, 0.3)] };
    }
    case 7: { // corre al gallinero con pan
      const x = runX(f), s = stk(f, cara(f, [["pan", "sorpresa"]], "feliz"), "hug", [x, 0, FA[2] + 1.0], { walk: gait(f, 2.4), run: true });
      const pan = prop("pan", [x + 0.02, PAN_Y, FA[2] + 1.06], 0.3);
      return { set: "farm", env: "day", speedLines: 0.4, cards: [s, pan, ...corral(f, FA, [[-1.5, -2.4], [1.0, -3.0], [3.0, -2.2]], 7), ...pasto(cam, 0.45)] };
    }
    case 8: case 9: case 10: case 11: { // gallinero: Paca come el pan... y otra piedra ¡Glup!
      const hens = corral(f, GA, [[-1.6, -1.2], [1.3, -1.7], [-0.3, -2.0], [1.7, 0.4]], 11);
      if (id === 8) {
        const u = smooth((f - 290) / 50), x = lerp(0.95, 0.45, u);
        const s = stk(f, cara(f, [["tendra", "susto"]], "feliz"), "hug", at(GA, x, 0, 1.2), { walk: u < 1 ? gait(f, 1.1) : undefined });
        const paca = gal(at(GA, -0.6, 0, 0.3), { paca: true, pica: picoteo(f, 0.2), walk: f > 330 ? gait(f, 2) : undefined });
        return { set: "gallinero", env: "day", cards: [s, prop("pan", at(GA, x + 0.02, PAN_Y, 1.26), 0.3), paca, ...hens, capaCerca(cam, "planta", -1, { sube: 0.45 })] };
      }
      const panS = id === 9 ? 0.3 * (1 - smooth((f - 362) / 30)) : 0;
      const pk = id === 9 ? picoteo(f, 0, 14) : id === 10 ? picaEn(f, 407) : picaEn(f, 437);
      const paca = gal(at(GA, -0.15, 0, 0.3), { paca: true, pica: pk, mood: id === 11 && f >= 439 ? "scared" : undefined, y: id === 11 ? brinca(f, 439, 0.14, 7) * (f < 460 ? 1 : 0) : 0 });
      const ex = id === 9 ? cara(f, [["come", "feliz"]], "sorpresa") : id === 10 ? cara(f, [["piedra", "susto"]], "feliz") : cara(f, [["glup", "sorpresa"]], "susto");
      const s = stk(f, ex, id === 9 ? "cheer" : id === 10 ? "point" : "cover", at(GA, 0.4, 0, -0.35), { roll: id === 11 ? Math.sin(f / 3) * 0.04 : 0 });
      const extra: Card[] = id === 9 && panS > 0.02 ? [prop("pan", at(GA, 0.15, 0, 0.32), panS)] : id === 10 || (id === 11 && f < 437) ? [piedrita(at(GA, 0.18, 0, 0.32))] : [];
      return { set: "gallinero", env: "day", shake: id === 11 && f >= 439 && f < 447 ? 0.03 : 0, cards: [s, paca, ...extra, ...hens.slice(0, 3)] };
    }
    case 12: case 13: case 14: { // mercado: compra piedritas, ¡cling!
      const crowd = band({ n: 10, seed: 41, x0: MK[0] - 7, x1: MK[0] + 7, z0: MK[2] - 1.5, z1: MK[2] - 2.6, f, cam, lead: [MK[0], MK[2] - 2.6], expr: () => "smile", walking: true, wander: 1.2 });
      const tend = who({ ...TENDERO, expr: id === 14 ? "happy" : "smile", arm: id === 13 ? "wave" : id === 14 && f < 560 ? "point" : "down" }, at(MK, 0.1, 0, -5.3));
      if (id === 12) {
        const x = mkX(f), s = stk(f, cara(f, [["mercado", "sorpresa"]], "feliz"), "point", [x, 0, MK[2] - 2.6], { walk: gait(f, 1.1) });
        return { set: "mercado", env: "day", cards: [s, tend, ...crowd, ...pasto(cam, 0.3).slice(0, 1)] };
      }
      const s = stk(f, id === 13 ? cara(f, [["piedritas", "sorpresa"]], "feliz") : f < 572 ? "sorpresa" : "feliz", id === 13 ? "point" : f < 556 ? "wave" : "hug", at(MK, 0.55, 0, -2.7));
      const coin = vuela(prop("moneda", [0, 0, 0], 0.16), f, 550, 562, at(MK, 0.75, 1.3, -2.7), at(MK, 0.2, 1.4, -5.1), 0.4, 6);
      const bag = f < 560 ? prop("costal", at(MK, 0.05, 0.96, -4.4), 0.32) : vuela(prop("costal", [0, 0, 0], 0.32), f, 560, 574, at(MK, 0.05, 0.96, -4.4), at(MK, 0.55, 0.28, -2.62), 0.35);
      return { set: "mercado", env: "day", shake: id === 14 && f >= 553 && f < 560 ? 0.025 : 0, cards: [s, tend, bag, ...(id === 14 && f < 563 ? [coin] : []), ...crowd.slice(0, 5)] };
    }
    case 15: case 16: case 17: { // veterinaria: ¡no tienen dientes! ¡ni uno!
      const bedY = 0.91;
      const paca = gal(at(HS, -1.1, bedY, -2.45), { paca: true, mood: id === 16 ? (Math.floor(f / 8) % 2 ? "bark" : undefined) : id === 17 ? "scared" : undefined, pica: id === 15 ? picoteo(f, 0, 30) * 0.4 : 0 });
      const doc = who({ ...DOCTORA, expr: id === 17 ? "shock" : "smile", arm: "point" }, at(HS, -2.3, 0, -1.6));
      const lupaX = id === 16 ? -1.0 + Math.sin(f / 10) * 0.08 : -2.0;
      const lupa = prop("lupa", at(HS, lupaX, id === 16 ? 0.82 : 0.75, id === 16 ? -2.1 : -1.45), id === 16 ? 0.28 : 0.22);
      const ex = id === 15 ? cara(f, [["explica", "susto"]], "sorpresa") : id === 16 ? cara(f, [["dientes", "sorpresa"]], "susto") : cara(f, [["ni uno", "sorpresa"]], "sorpresa");
      const s = stk(f, ex, id === 17 ? "cheer" : id === 16 ? "point" : "down", id === 17 ? at(HS, -0.45, 0, -1.3) : at(HS, -0.2, 0, -1.4), { roll: id === 17 ? Math.sin(f / 4) * 0.06 : 0 });
      const sign = prop("letrero", at(HS, -3.0, 1.0, -3.65), 1.3, { txt: "VETERINARIA", col: "#3fa34d" });
      return { set: "hospital", env: "day", pisos: [bedY], shake: id === 17 && f >= 694 && f < 702 ? 0.035 : 0, cards: [s, paca, doc, lupa, sign, capaCerca(cam, "planta", -1, { sube: 0.45 })] };
    }
    case 18: case 19: case 20: case 21: { // rayos X de la molleja: se aprieta ¡chas, chas! y muele
      const pulse = (f0: number) => Math.max(0, 1 - Math.abs(f - f0) / 7);
      const k = id === 20 ? 0.5 * Math.max(pulse(877), pulse(892)) + 0.08 * Math.sin(f / 4) : id === 21 ? ((f - 896) / 14) % 1 : 0.06 * Math.sin(f / 6);
      const xr = prop("rayosx", at(HS, 2.1, 0.55, -1.95), 0.8, { k });
      const doc = who({ ...DOCTORA, expr: "smile", arm: "point" }, at(HS, 3.35, 0, -1.3));
      const ex = id === 18 ? cara(f, [["molleja", "sorpresa"]], "susto") : id === 19 ? "feliz" : id === 20 ? cara(f, [["chas", "furioso", 860], [905, "sorpresa"]], "sorpresa") : "feliz";
      const musc = id === 19 ? 2 + 3 * smooth((f - 790) / 16) : id === 20 ? 2 : undefined;
      const arm: Arm = id === 18 ? "point" : id === 19 ? "flex" : id === 20 ? "flex" : f % 24 < 12 ? "cheer" : "wave";
      const sx = id === 19 ? 1.15 : 1.6;
      const s = stk(f, ex, arm, at(HS, sx, 0, -1.2), { musc, roll: id === 20 ? Math.sin(f / 3) * 0.03 : 0 });
      return { set: "hospital", env: "day", shake: id === 20 && (pulse(877) > 0.5 || pulse(892) > 0.5) ? 0.03 : 0, cards: [s, xr, ...(id === 20 ? [] : [doc])] };
    }
    case 22: case 23: case 24: case 25: { // cocina: muele maíz en el molcajete ¡chas! y así digieren mejor
      const grind = id === 23 || id === 24 ? (f / 9) % 1 : 0.2;
      const mol = prop("molcajete", at(HO, -4.82, 0.96, -2.0), 0.34, { k: grind });
      const maiz = id === 24 && f >= 1068 ? vuela(prop("maiz", [0, 0, 0], 0.18), f, 1068, 1088, at(HO, -4.8, 1.2, -2.0), at(HO, -3.7, 0.0, -1.2), 0.5, 5) : prop("maiz", at(HO, -4.85, 0.96, -2.7), 0.2, {}, 1.2);
      if (id === 25) {
        const paca = gal(at(HO, -1.8, 0.82, -0.95), { paca: true, pica: picoteo(f, 0, 12) });
        const s = stk(f, cara(f, [["digieren", "feliz"]], "sorpresa"), f % 24 < 12 ? "cheer" : "wave", at(HO, -0.75, 0, 0.4));
        return { set: "house", env: "day", pisos: [0.82], cards: [s, paca, prop("piedras", at(HO, -1.55, 0.82, -0.85), 0.12, { col: "#ffd23f" })] };
      }
      const ex = id === 22 ? cara(f, [["cocina", "feliz"]], "sorpresa") : id === 23 ? cara(f, [["muele", "furioso"], ["molcajete", "susto"]], "feliz") : cara(f, [["chas", "sorpresa"]], "furioso");
      const s = stk(f, ex, id === 22 ? "point" : "hug", at(HO, -3.95, 0, -2.35), { roll: id === 23 ? Math.sin(f / 3) * 0.05 : 0 });
      return { set: "house", env: "day", shake: id === 24 && f >= 1068 && f < 1076 ? 0.035 : 0, cards: [s, mol, maiz, capaCerca(cam, "planta", 1, { sube: 0.4 })] };
    }
    case 26: case 27: case 28: case 29: { // parque al atardecer: riega piedritas ¡ploc! y llega la bandada
      const pile = f >= 1238 ? [prop("piedras", [0.1, 0, -0.7], 0.3), prop("piedras", [-0.6, 0, -0.4], 0.22), prop("piedras", [0.8, 0, -0.3], 0.22)] : [];
      if (id === 26) {
        const z = parkZ(f), s = stk(f, cara(f, [["parque", "feliz"]], "sorpresa"), "hug", [0, 0, z], { walk: gait(f, 1.1) });
        return { set: "park", env: "dusk", sunDisc: true, cards: [s, prop("costal", [0.02, 0.28, z + 0.06], 0.32), ...pasto(cam, 0.6)] };
      }
      const throwing = id === 27, s = stk(f, id === 27 ? cara(f, [["riega", "feliz"]], "sorpresa") : id === 28 ? cara(f, [["ploc", "sorpresa"]], "feliz") : cara(f, [["todas", "sorpresa"], ["corriendo", "feliz"]], "sorpresa"),
        throwing ? (f % 16 < 8 ? "wave" : "cheer") : id === 28 ? "point" : f % 24 < 12 ? "cheer" : "wave", [-0.9, 0, 0.6]);
      const flying = throwing ? [0, 1, 2, 3, 4].map((i) => vuela(piedrita([0, 0, 0], 0.16), f, 1204 + i * 6, 1236 + i * 3, [-0.6, 1.3, 0.6], [-0.6 + i * 0.35, 0, -0.4 - (i % 2) * 0.4], 0.6, 4)) : [];
      // la bandada: 12 gallinas que llegan corriendo de los dos lados y picotean
      const flock: Card[] = id === 29 ? Array.from({ length: 12 }, (_, i) => {
        const side = i % 2 ? 1 : -1, tx = -0.9 + (i % 6) * 0.38, tz = -0.2 - Math.floor(i / 6) * 0.7 - (i % 3) * 0.15, t0 = 1270 + i * 3, u = smooth((f - t0) / 26);
        const x = lerp(side * 6, tx + 0.4, u), z = lerp(tz - 1.5, tz, u);
        return gal([x, 0, z], { walk: u < 1 ? gait(f, 4, i * 0.2) : undefined, pica: u >= 1 ? picoteo(f, i * 0.17, 14) : 0, mirror: side > 0, i, paca: i === 4 });
      }) : [];
      return { set: "park", env: "dusk", sunDisc: true, speedLines: id === 29 && f < 1300 ? 0.35 : 0, shake: id === 28 && f >= 1238 && f < 1246 ? 0.035 : id === 29 && f >= 1301 && f < 1308 ? 0.03 : 0, cards: [s, ...pile, ...flying, ...flock, ...pasto(cam, 0.5)] };
    }
    case 30: { // ¿tú te comerías una piedra?
      const s = stk(f, cara(f, [["comerias", "sorpresa"], ["piedra", "susto"]], "feliz"), "point", [0, 0, 0.2]);
      const paca = gal([0.55, 0, 0.35], { paca: true, pica: picoteo(f, 0, 16) });
      return { set: "park", env: "dusk", sunDisc: true, cards: [s, paca, piedrita([0.85, 0, 0.4], 0.14), ...corral(f, [0, 0, 0], [[-1.5, -1.6], [1.4, -2.0], [-0.6, -2.6]], 20), ...pasto(cam, 0.45)] };
    }
    case 31: { // ¡yo tampoco! + cameo del invitado especial
      const jump = brinca(f, 1398, 0.12, 7);
      const s = stk(f, cara(f, [["tampoco", "feliz"]], "furioso"), f < 1398 ? "cover" : "wave", [-0.25, 0, 1.0]);
      (s as { y?: number }).y = jump || undefined;
      const inv = cameo(f, INVITADO_ESPECIAL, [0.85, 0, -0.5], undefined, { saluda: f % 30 < 15 });
      const flock = Array.from({ length: 6 }, (_, i) => gal([-1.6 + i * 0.6, 0, 0.3 - (i % 2) * 0.5 - 1.2], { pica: picoteo(f, i * 0.2, 15), mirror: i % 2 === 0, i, paca: i === 2 }));
      return { set: "park", env: "dusk", sunDisc: true, cards: [s, inv, ...flock, ...pasto(cam, 0.4)] };
    }
    default: return { set: "park", env: "day", cards: [] };
  }
};
const dofAt = (_id: number, _f: number) => ({ cInf: 5 });

/** portada: Sticky enorme con cara de susto, Paca con una piedra en el pico y texto gigante */
const PORTADA: Portada = {
  texto: ["¡TRAGA", "PIEDRAS!"], textoH: ["¡TRAGA PIEDRAS!"], col: "#ffd23f",
  expr: "susto", arm: "cover", set: "farm", env: "day", flota: 0, blur: 12,
  sticky: { head: [400, 1.1, 450], roll: 0 }, cam: { pos: [400.25, 1.1, 452.2], look: [400.25, 0.82, 450], fov: 56 },
  stickyH: { head: [399.3, 1.1, 450], roll: 0 }, camH: { pos: [399.9, 1.0, 452.1], look: [399.9, 0.8, 450], fov: 44 },
  cosas: [{ kind: "chicken", o: { ...PACA, mood: "scared" }, x: 400.2, z: 450.7, s: 1.1, roll: -0.15 }, { kind: "prop", o: { tipo: "piedrita" }, x: 400.58, y: 0.36, z: 450.72, s: 0.2 }],
  cosasH: [{ kind: "chicken", o: { ...PACA, mood: "scared" }, x: 400.25, z: 450.6, s: 1.3, roll: -0.15 }, { kind: "prop", o: { tipo: "piedrita" }, x: 400.66, y: 0.44, z: 450.62, s: 0.2 }],
};

export const GALLINAS: Story = {
  voz: VOZ, cameo: INVITADO_ESPECIAL, portada: PORTADA,
  TOTAL, camAt, layersAt, dofAt, state,
  MARKS: [
    { a: 6, b: 44, label: "¿PIEDRAS?", sub: "¿por qué?", col: PALETA.titulo.dato },
    { a: 72, b: 104, label: "¡GLUP!", sub: "", col: PALETA.titulo.alerta },
    { a: 155, b: 194, label: "¡TOC, TOC!", sub: "", col: PALETA.titulo.dato },
    { a: 214, b: 246, label: "¡SE LA TRAGA!", sub: "", col: PALETA.titulo.alerta },
    { a: 318, b: 352, label: "¿TENDRÁ HAMBRE?", sub: "", col: PALETA.titulo.calma },
    { a: 439, b: 466, label: "¡GLUP!", sub: "", col: PALETA.titulo.alerta },
    { a: 553, b: 582, label: "¡CLING!", sub: "", col: PALETA.titulo.dato },
    { a: 659, b: 692, label: "SIN DIENTES", sub: "", col: PALETA.titulo.alerta },
    { a: 694, b: 724, label: "¡NI UNO!", sub: "", col: PALETA.titulo.alerta },
    { a: 763, b: 836, label: "LA MOLLEJA", sub: "un estómago con músculos", col: PALETA.titulo.dato },
    { a: 877, b: 922, label: "¡CHAS, CHAS!", sub: "muele la comida", col: PALETA.titulo.alerta },
    { a: 1068, b: 1098, label: "¡CHAS!", sub: "", col: PALETA.titulo.dato },
    { a: 1112, b: 1150, label: "¡DIGIEREN MEJOR!", sub: "", col: PALETA.titulo.calma },
    { a: 1238, b: 1266, label: "¡PLOC!", sub: "", col: PALETA.titulo.dato },
    { a: 1270, b: 1328, label: "¡LA BANDADA!", sub: "", col: PALETA.titulo.calma },
    { a: 1338, b: 1392, label: "¿Y TÚ?", sub: "¿te comerías una piedra?", col: PALETA.titulo.dato },
    { a: 1398, b: TOTAL + 10, label: "¡YO TAMPOCO!", sub: "", col: PALETA.titulo.alerta },
  ],
};
void NINO; void ESCALA; void hh;
