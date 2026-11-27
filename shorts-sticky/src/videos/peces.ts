import VOZ from "../../voz/peces/palabras.json";
// «¿Por qué los peces respiran en el agua?» — SHORT PARA NIÑOS (BIBLIA/SHORTS_NINOS.md), 46.2 s (1386 cuadros), 29 tomas,
// 7 lugares: lago con muelle → bajo el agua del lago → orilla → casa con pecera → arrecife → tienda de buceo → playa → arrecife.
// Burbu (el pez, elenco.ts) nada, salta y burbujea; la pecera (props.ts) abre y cierra la boca; el esquema `branquias` explica el dato.
// words: BLUB 76 · se lanza 121 · lago 132 · ahoga 155 · Glu 186 · glu 199 | tosiendo 237 · pez 277 · mira 285 · ríe 306 | casa 359 ·
// nariz 396 · pecera 414 | boca 478 · plop 495 · plop 509 | dato 547 · oxígeno 580 · escondido 592 · poquito 611 | sacarlo 667 ·
// peces sí 696 | entra 742 · boca 755 · branquias 789 | atrapan 857 · oxígeno 871 · Zas 907 | arrecife 951 · bombean 986 · plop 1010 ·
// plop 1024 · plop 1038 | buceo 1085 · tanque 1126 · Ding 1167 | mar 1208 · burbujea 1214 · Blub 1278 · blub 1293 | bajo el agua 1349
import type { Story, SceneState, Card, V3, Cam } from "../engine/types";
import type { Portada } from "../engine/portada";
import { makeTimeline, smooth, gait, caraEn, conSalto, lerp } from "../engine/timeline";
import { ORIGIN } from "../engine/sets";
import { BEACH_X } from "../engine/world";
import type { Expr, Arm, StickyOpts } from "../engine/stick";
import { sticky, who, cameo, PALETA, BURBU, ESCALA_ANIMAL, TENDERO } from "../engine/elenco";
import { prop, capaCerca } from "../engine/props";
import { at, K, withPunch, keyCam, armarTomas, vuela, brinca } from "../engine/tomas";
import CAMEO_ACTUAL from "./cameo_actual.json";

const TOTAL = 1386;
const LG = ORIGIN.lago, RF = ORIGIN.reef, HO = ORIGIN.house, ST = ORIGIN.store, BX = BEACH_X;
const INVITADO_ESPECIAL = { foto: CAMEO_ACTUAL.foto, nombre: CAMEO_ACTUAL.nombre };
const CUTS = [0, 40, 80, 120, 160, 222, 266, 300, 350, 404, 444, 490, 534, 590, 640, 686, 728, 776, 822, 862, 904, 940, 1004, 1064, 1110, 1162, 1196, 1250, 1316, TOTAL];
const DOCK = 0.39; // altura de las tablas del muelle
const AGUA = -0.25; // nivel del agua del lago

type C = Parameters<typeof armarTomas>[2][number];
const P = (keys: ReturnType<typeof K>[], hits: [number, number][]): C => withPunch(keyCam(keys), hits);
const BOWL: V3 = at(HO, -1.38, 0.82, -0.62);
const SHOTCAM: C[] = [
  /* 1 muelle: Burbu salta */ [K(0, at(LG, 2.0, 1.25, -3.4), at(LG, 0.3, 0.95, -7.3), 50), K(46, at(LG, 1.6, 1.2, -4.0), at(LG, 0.3, 0.95, -7.3), 46, true)],
  /* 2 ¡BLUB! cerca del agua */ P([K(40, at(LG, 2.6, 1.15, -4.5), at(LG, 0.2, 0.95, -7.4), 48), K(86, at(LG, 2.4, 1.1, -4.9), at(LG, 0.2, 0.95, -7.4), 46, true)], [[76, 10]]),
  /* 3 corre por el muelle (de lado) */ (f) => { const z = dockZ(f); return { pos: [LG[0] + 3.4, 1.3, z + 0.8], look: [LG[0], 0.95, z - 0.4], fov: 50 }; },
  /* 4 ¡se lanza! */ P([K(120, at(LG, 3.2, 1.1, -6.2), at(LG, 0.0, 0.9, -7.8), 50), K(166, at(LG, 2.8, 0.9, -6.6), at(LG, 0.0, 0.2, -8.2), 54, true)], [[146, 8]]),
  /* 5 bajo el agua: casi se ahoga (sigue a Sticky) */ withPunch((f) => { const y = hundeY(f) + 0.75; return { pos: [LG[0] + 0.7 - (f - 160) * 0.004, y + 0.05, LG[2] - 5.6], look: [LG[0] - 0.05, y, LG[2] - 8.6], fov: 50 }; }, [[186, 7], [199, 7]]),
  /* 6 orilla: sale tosiendo */ [K(222, at(LG, -1.0, 1.0, 4.4), at(LG, -2.2, 0.55, 0.6), 50), K(272, at(LG, -1.4, 0.9, 3.7), at(LG, -2.2, 0.55, 0.6), 46, true)],
  /* 7 un pez lo mira */ P([K(266, at(LG, -0.3, 0.55, 2.0), at(LG, -1.8, 0.25, -0.4), 48), K(306, at(LG, -0.5, 0.55, 1.6), at(LG, -1.8, 0.25, -0.4), 44, true)], [[285, 8]]),
  /* 8 se ríe en burbujas */ [K(300, at(LG, -0.5, 0.9, 3.1), at(LG, -2.0, 0.5, 0.2), 50), K(356, at(LG, -0.7, 0.85, 2.7), at(LG, -2.0, 0.5, 0.2), 46, true)],
  /* 9 casa: va a la pecera */ [K(350, at(HO, 1.0, 1.5, 3.2), at(HO, -0.7, 1.0, -0.4), 54), K(410, at(HO, 0.5, 1.4, 2.3), at(HO, -0.9, 1.05, -0.4), 50, true)],
  /* 10 la nariz en la pecera */ P([K(404, at(HO, -1.75, 1.3, 1.4), at(HO, -1.15, 1.15, -0.42), 48), K(450, at(HO, -1.7, 1.25, 1.1), at(HO, -1.15, 1.15, -0.42), 44, true)], [[414, 9]]),
  /* 11 el pez abre y cierra la boca */ [K(444, at(HO, -1.8, 1.3, 0.95), at(HO, -1.2, 1.2, -0.45), 50), K(496, at(HO, -1.75, 1.28, 0.8), at(HO, -1.2, 1.2, -0.45), 48, true)],
  /* 12 ¡plop, plop! */ P([K(490, at(HO, -1.55, 1.25, 1.05), at(HO, -1.15, 1.2, -0.42), 50), K(540, at(HO, -1.5, 1.25, 0.9), at(HO, -1.15, 1.2, -0.42), 48, true)], [[495, 6], [509, 6]]),
  /* 13 el agua guarda oxígeno */ [K(534, at(LG, 1.2, -1.3, -5.8), at(LG, 0.0, -1.4, -8.6), 52), K(596, at(LG, 0.6, -1.4, -6.4), at(LG, 0.0, -1.45, -8.6), 48, true)],
  /* 14 ¡poquito! */ P([K(590, at(LG, 0.3, -1.35, -5.8), at(LG, -0.3, -1.5, -8.6), 48), K(646, at(LG, 0.2, -1.35, -6.1), at(LG, -0.3, -1.5, -8.6), 44, true)], [[611, 10]]),
  /* 15 Sticky no puede sacarlo */ [K(640, at(HO, -1.85, 1.3, 1.2), at(HO, -1.15, 1.15, -0.42), 48), K(692, at(HO, -1.8, 1.25, 1.0), at(HO, -1.15, 1.15, -0.42), 46, true)],
  /* 16 los peces sí */ P([K(686, at(HO, -1.6, 1.3, 0.9), at(HO, -1.15, 1.2, -0.5), 48), K(734, at(HO, -1.55, 1.3, 0.7), at(HO, -1.15, 1.2, -0.5), 46, true)], [[696, 8]]),
  /* 17 esquema: entra por la boca */ [K(728, at(HO, 0.6, 1.4, 1.8), at(HO, 0.4, 1.1, -2.0), 52), K(782, at(HO, 0.5, 1.35, 1.2), at(HO, 0.45, 1.1, -2.0), 48, true)],
  /* 18 sale por las branquias */ P([K(776, at(HO, 0.9, 1.25, 1.7), at(HO, 1.0, 1.05, -2.0), 50), K(828, at(HO, 0.9, 1.25, 1.4), at(HO, 1.0, 1.05, -2.0), 48, true)], [[789, 8]]),
  /* 19 atrapan */ [K(822, at(HO, 0.1, 1.3, 0.4), at(HO, 0.5, 1.15, -2.0), 50), K(868, at(HO, 0.2, 1.3, 0.1), at(HO, 0.5, 1.15, -2.0), 46, true)],
  /* 20 el oxígeno */ P([K(862, at(HO, 0.95, 1.3, 1.6), at(HO, 1.0, 1.05, -2.0), 50), K(910, at(HO, 0.95, 1.3, 1.3), at(HO, 1.0, 1.05, -2.0), 46, true)], [[871, 9]]),
  /* 21 ¡zas! */ P([K(904, at(HO, -0.2, 1.2, 1.6), at(HO, -0.2, 1.1, -1.2), 50), K(946, at(HO, -0.2, 1.25, 1.3), at(HO, -0.2, 1.1, -1.2), 48, true)], [[907, 12]]),
  /* 22 arrecife: mil peces (vuelta) */ (f) => { const u = smooth((f - 940) / 70), a = lerp(-0.3, 0.25, u); return { pos: [RF[0] + Math.sin(a) * 4.4, 1.9, RF[2] - 3 + Math.cos(a) * 4.4], look: [RF[0], 1.6, RF[2] - 3], fov: 54 }; },
  /* 23 ¡plop, plop, plop! */ P([K(1004, at(RF, 0.6, 1.8, 0.6), at(RF, 0.0, 1.7, -3.0), 48), K(1070, at(RF, 0.4, 2.2, 0.3), at(RF, 0.0, 2.3, -3.0), 46, true)], [[1010, 6], [1024, 6], [1038, 6]]),
  /* 24 tienda de buceo */ [K(1064, at(ST, 0.4, 1.5, 2.2), at(ST, 0.0, 1.15, -3.5), 54), K(1116, at(ST, 0.2, 1.4, 1.4), at(ST, 0.0, 1.1, -3.5), 50, true)],
  /* 25 compra el tanque */ [K(1110, at(ST, -0.9, 1.35, 0.6), at(ST, 0.1, 1.1, -3.2), 50), K(1168, at(ST, -0.6, 1.3, 0.2), at(ST, 0.1, 1.1, -3.2), 46, true)],
  /* 26 ¡ding! */ P([K(1162, at(ST, 0.0, 1.25, 0.2), at(ST, -0.2, 1.1, -1.8), 46), K(1202, at(ST, 0.0, 1.25, 0.0), at(ST, -0.2, 1.1, -1.8), 44, true)], [[1167, 12]]),
  /* 27 vuelve al mar (playa) */ (f) => { const z = beachZ(f); return { pos: [BX + 1.2, 1.6 + 0.045 * (z + 3.6), z + 3.6], look: [BX, 0.9 + 0.045 * z, z - 1.0], fov: 52 }; },
  /* 28 arrecife: burbujea con Burbu */ P([K(1250, at(RF, 0.9, 1.9, 0.8), at(RF, 0.1, 1.7, -2.2), 50), K(1322, at(RF, 0.6, 1.8, 0.2), at(RF, 0.1, 1.7, -2.2), 46, true)], [[1278, 8], [1293, 8]]),
  /* 29 cierre + cameo */ [K(1316, at(RF, 0.9, 1.6, 3.8), at(RF, 0.4, 1.2, -1.2), 52), K(TOTAL, at(RF, 0.6, 1.5, 3.0), at(RF, 0.35, 1.15, -1.2), 50, true)],
];
const SHOTS = armarTomas(CUTS, TOTAL, SHOTCAM);
const { camAt: camBase, layersAt } = makeTimeline(SHOTS);
const GOLPES: (number | [number, number])[] = [[76, 0.12], [146, 0.2], [186, 0.08], [199, 0.08], [237, 0.08], [495, 0.06], [509, 0.06], [611, 0.1], [907, 0.14], [1010, 0.1], [1024, 0.1], [1038, 0.1], [1167, 0.14], [1278, 0.1], [1293, 0.1]];
const camAt = (id: number, f: number): Cam => conSalto(camBase(id, f), f, GOLPES);
type M = ([string | number, Expr] | [string, Expr, number])[];
const cara = (f: number, mapa: M, base: Expr): Expr => caraEn<Expr>(VOZ, f, mapa, base);

function hundeY(f: number) { return -1.5 - 0.8 * smooth((f - 160) / 60); }
function dockZ(f: number) { return LG[2] - 2.2 - 0.117 * Math.max(0, Math.min(40, f - 80)); }
function beachZ(f: number) { return 9.5 - 0.11 * Math.max(0, f - 1196); }
const stk = (f: number, expr: Expr, arm: Arm, p: V3, o: Partial<StickyOpts> & { walk?: number; musc?: number; roll?: number } = {}): Card => {
  const c = sticky(f, expr, arm, p, [0, 0], o.walk);
  const { roll, musc: _m, walk: _w, ...rest } = o;
  return { ...c, o: { ...(c as { o: StickyOpts }).o, ...rest }, roll } as Card;
};
/** pez (mira a la izquierda; mirror = a la derecha). Se mece al nadar */
const pez = (f: number, p: V3, o: { mirror?: boolean; s?: number; coat?: string; spot?: string; ph?: number } = {}): Card =>
  ({ kind: "fish", o: { coat: o.coat ?? BURBU.coat, spot: o.spot ?? BURBU.spot }, x: p[0], y: p[1], z: p[2], s: o.s ?? ESCALA_ANIMAL.pez, mirror: o.mirror, roll: Math.sin(f / 5 + (o.ph ?? 0)) * 0.12 });
/** burbujas que suben desde p (k avanza con el cuadro) */
const burb = (f: number, p: V3, s = 0.3, vel = 1) => prop("burbujas", p, s, { k: (f / 90) * vel });
/** Sticky aguantando la respiración bajo el agua (cachetes = cara "shock") con los brazos nadando */
const nada = (f: number): Arm => (["fly", "up", "cheer", "up"] as const)[Math.floor(f / 7) % 4];
const COLS = ["#ff6fa3", "#ffd23f", "#2ed3c6", "#9b6bff", "#3fa3ff", "#ff9a3c"];
/** cardumen que gira alrededor de c */
const cardumen = (f: number, c: V3, n: number, r = 2.4, pulso = 0): Card[] => Array.from({ length: n }, (_, i) => {
  const a = f / 45 + i * ((Math.PI * 2) / n), dx = -Math.sin(a), y = c[1] + (i % 4) * 0.42 - 0.6 + Math.sin(f / 20 + i) * 0.1;
  return pez(f, [c[0] + Math.cos(a) * r * (1 + (i % 3) * 0.12), y, c[2] + Math.sin(a) * r * 0.55], { mirror: dx > 0, coat: COLS[i % COLS.length], spot: i % 2 ? "#ffffff" : undefined, s: 0.5 * (1 + pulso * 0.15), ph: i });
});
const pulso = (f: number, hits: number[]) => Math.max(0, ...hits.map((h) => 1 - Math.abs(f - h) / 6));

// ---------- estado por toma ----------
const state = (id: number, f: number): SceneState => {
  const cam = camAt(id, f);
  switch (id) {
    case 1: case 2: { // muelle: Burbu salta del agua ¡BLUB!
      const jump = vuela(pez(f, [0, 0, 0]), f, 8, 34, at(LG, 1.2, AGUA - 0.6, -7.8), at(LG, 0.2, AGUA - 0.6, -8.2), 0.75, 0.8);
      const fish = id === 1 ? (f < 8 || f > 34 ? null : jump) : pez(f, at(LG, 0.55, AGUA - 0.42 + Math.sin(f / 6) * 0.05, -7.5), { mirror: false });
      const s = stk(f, cara(f, [[10, "sorpresa"], ["blub", "feliz"]], "feliz"), id === 1 ? "point" : "cheer", at(LG, -0.1, DOCK, -6.9));
      const cards = [s, ...(fish ? [fish] : []), ...(id === 2 && f > 66 ? [burb(f, at(LG, 0.35, AGUA + 0.1, -7.45), 0.22, 2)] : [])];
      return { set: "lago", env: "day", pisos: [DOCK], cards: [...cards, ...(id === 1 ? [capaCerca(cam, "pasto", 1, { sube: 0.5 })] : [])] };
    }
    case 3: { // corre por el muelle
      const z = dockZ(f), s = stk(f, cara(f, [["lanza", "sorpresa"]], "feliz"), "down", [LG[0], DOCK, z], { walk: gait(f, 2.4), run: true } as never);
      return { set: "lago", env: "day", pisos: [DOCK], speedLines: 0.4, cards: [s, capaCerca(cam, "pasto", -1, { sube: 0.55 })] };
    }
    case 4: { // ¡se lanza al lago!
      const jumping = f >= 124, s0 = stk(f, cara(f, [[124, "feliz"], [146, "sorpresa"], ["ahoga", "susto"]], "feliz"), jumping ? "up" : "cheer", at(LG, 0, DOCK, -7.0));
      const s = jumping ? vuela(s0, f, 124, 146, at(LG, 0, DOCK, -7.0), at(LG, 0, -1.25, -8.4), 0.55, 0) : s0;
      const splash = f >= 146 ? [burb(f, at(LG, 0, AGUA, -8.4), 0.6, 3), prop("charco", at(LG, 0, AGUA + 0.02, -8.3), 0.5, { k: f / 30 })] : [];
      return { set: "lago", env: "day", pisos: [DOCK], shake: f >= 146 && f < 156 ? 0.05 : 0, speedLines: jumping && f < 146 ? 0.5 : 0, cards: [f > 152 ? { ...s, y: -1.6 } as Card : s, ...splash] };
    }
    case 5: case 13: case 14: { // bajo el agua del lago: casi se ahoga · el agua guarda oxígeno escondido, ¡poquito!
      const y = id === 5 ? hundeY(f) : -2.3 + Math.sin(f / 14) * 0.08;
      const ex: Expr = id === 5 ? cara(f, [["glu", "scream", 180], [195, "susto"], [205, "llora"]], "susto") : id === 13 ? cara(f, [["oxigeno", "sorpresa"]], "shock") : cara(f, [["poquito", "sorpresa"]], "susto");
      const s = stk(f, ex, id === 5 ? nada(f) : "point", at(LG, -0.1, y, -8.6), { roll: Math.sin(f / 9) * 0.15 });
      const fish = pez(f, at(LG, id === 14 ? -0.9 : 1.4 - ((f - CUTS[id - 1]) / 60) * 2.6, -1.6 + Math.sin(f / 10) * 0.1, -8.9), { mirror: id === 14 });
      const bubs = id === 5 ? [burb(f, at(LG, -0.15, y + 0.9, -8.5), 0.35, 2)] : [0, 1, 2, 3].map((i) => burb(f + i * 23, at(LG, -1.3 + i * 0.8, -2.9, -9.4 - (i % 2)), 0.14, 0.6));
      const lupa = id === 14 ? [prop("lupa", at(LG, -0.55, -1.75, -8.4), 0.28)] : [];
      return { set: "lago", env: "underwater", shake: id === 5 && (Math.abs(f - 186) < 3 || Math.abs(f - 199) < 3) ? 0.03 : 0, cards: [s, fish, ...bubs, ...lupa] };
    }
    case 6: case 7: case 8: { // orilla: sale tosiendo; el pez lo mira y se ríe en burbujas
      const tos = [237, 250, 262].some((h) => f >= h && f < h + 5);
      const ex: Expr = id === 6 ? (tos ? "scream" : "llora") : id === 7 ? cara(f, [["mira", "sorpresa"]], "llora") : cara(f, [["rie", "furioso"]], "sorpresa");
      const s = stk(f, ex, id === 6 ? "cover" : id === 7 ? "point" : "down", id === 8 ? at(LG, -2.1, 0, 0.9) : at(LG, -2.25, 0, 1.2), { roll: id === 6 ? (tos ? -0.12 : 0) : 0 });
      const fy = AGUA - 0.42 + (id === 8 ? Math.abs(Math.sin(f / 4)) * 0.06 : Math.sin(f / 8) * 0.04);
      const fish = { ...pez(f, at(LG, -1.6, fy, -0.7), { mirror: false }), roll: id === 8 ? Math.sin(f / 2.5) * 0.25 : 0 } as Card;
      const drops = id === 6 ? [prop("charco", at(LG, -2.25, 0.01, 1.25), 0.32, { k: f / 30 })] : [];
      return { set: "lago", env: "day", shake: tos ? 0.025 : 0, cards: [s, fish, ...drops, ...(id === 8 ? [burb(f, at(LG, -1.75, AGUA + 0.05, -0.65), 0.3, 1.6)] : []), capaCerca(cam, "pasto", id === 8 ? 1 : -1, { sube: 0.5 })] };
    }
    case 9: case 10: case 11: case 12: case 15: case 16: { // casa: la pecera
      const k = f / 26;
      const bowl = prop("pecera", BOWL, 0.5, { k });
      let s: Card;
      if (id === 9) {
        const u = smooth((f - 352) / 50), p: V3 = [lerp(HO[0] + 1.2, HO[0] - 0.95, u), 0, lerp(HO[2] + 0.9, HO[2] - 0.2, u)];
        s = stk(f, cara(f, [["casa", "feliz"]], "sorpresa"), "point", p, { walk: u < 1 ? gait(f, 1.1) : undefined });
      } else {
        const ex: Expr = id === 10 ? cara(f, [["pecera", "sorpresa"]], "feliz") : id === 11 ? cara(f, [["abre", "sorpresa"], ["cierra", "shock"]], "susto")
          : id === 12 ? (Math.floor((f - 490) / 7) % 2 ? "scream" : "shock") : id === 15 ? cara(f, [["sacarlo", "llora"]], "shock") : cara(f, [["peces", "furioso"]], "llora");
        s = stk(f, ex, id === 15 ? "cover" : id === 16 ? "point" : "down", at(HO, -0.95, 0, -0.2), { roll: id === 10 || id === 15 ? 0.15 : 0 });
      }
      return { set: "house", env: "day", tv: false, pisos: [0.82], cards: [s, bowl, capaCerca(cam, "planta", -1, { sube: 0.4 })] };
    }
    case 17: case 18: case 19: case 20: case 21: { // esquema de las branquias (en la sala)
      const k = (f / 40) % 1;
      const br = prop("branquias", at(HO, 0.75, 0.45, -2.1), id === 17 ? 0.85 : 0.8, { k });
      const ex: Expr = id === 17 ? cara(f, [["entra", "sorpresa"]], "feliz") : id === 18 ? cara(f, [["branquias", "sorpresa"]], "susto") : id === 19 ? cara(f, [["atrapan", "sorpresa"]], "susto") : id === 20 ? "sorpresa" : "feliz";
      const sx = id === 21 ? -0.2 : id === 17 ? 0.0 : id === 19 ? -0.05 : 1.35;
      const jump = id === 21 ? brinca(f, 907, 0.15, 8) : 0;
      const s = stk(f, ex, id === 21 ? "cheer" : "point", at(HO, sx, jump, id === 18 || id === 20 ? -1.5 : -1.0));
      return { set: "house", env: "day", tv: true, cards: [s, br, capaCerca(cam, "planta", -1, { sube: 0.4 })] };
    }
    case 22: case 23: { // arrecife: mil peces bombean agua ¡plop, plop, plop!
      const pl = pulso(f, [1010, 1024, 1038]);
      const sub = id === 23 && f > 1040 ? smooth((f - 1040) / 24) * 1.6 : 0;
      const ex: Expr = id === 22 ? cara(f, [["mil", "sorpresa"]], "shock") : cara(f, [[1040, "llora"]], "shock");
      const s = stk(f, ex, id === 23 && f > 1040 ? "up" : nada(f), at(RF, -0.3, 1.1 + sub + Math.sin(f / 12) * 0.08, -1.6), { roll: Math.sin(f / 10) * 0.12 });
      const fish = cardumen(f, at(RF, 0, 1.9, -3.4), 14, 2.6, pl);
      const bubs = [0, 1, 2].map((i) => burb(f + i * 30, at(RF, -1.6 + i * 1.6, 1.0, -3.2), 0.3 + pl * 0.15, 1.4));
      return { set: "reef", env: "underwater", shake: pl > 0.6 ? 0.02 : 0, cards: [s, ...fish, ...bubs, ...(id === 23 && f > 1040 ? [burb(f, at(RF, 0, 2.1 + sub, -1.5), 0.3, 3)] : [])] };
    }
    case 24: case 25: case 26: { // tienda de buceo: compra un tanque de aire ¡ding!
      const sign = prop("letrero", at(ST, 0, 1.25, -5.2), 1.0, { txt: "BUCEO", col: "#18a3a3" });
      const tanks = [-1.25, 1.25].flatMap((x) => [0, 1].map((j) => prop("tanque", at(ST, x, 0, -3.0 - j * 1.4), 0.42)));
      const tend = who({ ...TENDERO, expr: "happy", arm: id === 25 && f < 1130 ? "point" : "wave" }, at(ST, 0.55, 0, -3.6));
      const buzo = id === 26 && f >= 1167;
      const ex: Expr = id === 24 ? cara(f, [["buceo", "sorpresa"]], "feliz") : id === 25 ? cara(f, [["tanque", "sorpresa"], ["aire", "feliz"]], "susto") : buzo ? (f < 1180 ? "sorpresa" : "feliz") : "susto";
      const p: V3 = id === 24 ? [ST[0] - 0.3, 0, lerp(ST[2] + 1.0, ST[2] - 1.6, smooth((f - 1066) / 40))] : at(ST, -0.25, 0, -1.8);
      const s = stk(f, ex, id === 24 ? "down" : id === 25 ? (f < 1140 ? "point" : "hug") : buzo ? "cheer" : "hug", p, { walk: id === 24 && f < 1104 ? gait(f, 1.1) : undefined, buzo });
      if (id === 26 && buzo) (s as { y?: number }).y = brinca(f, 1167, 0.12, 8) || undefined;
      const tank = id === 25 ? [vuela(prop("tanque", [0, 0, 0], 0.32), f, 1132, 1150, at(ST, 0.45, 0.8, -3.5), at(ST, -0.25, 0.22, -1.72), 0.3)] : id === 26 && !buzo ? [prop("tanque", at(ST, -0.25, 0.22, -1.72), 0.32)] : [];
      return { set: "store", env: "day", shake: buzo && f < 1175 ? 0.03 : 0, cards: [s, tend, sign, ...tanks, ...tank] };
    }
    case 27: { // playa: vuelve al mar corriendo con su tanque
      const z = beachZ(f), s = stk(f, cara(f, [["mar", "feliz"]], "sorpresa"), "cheer", [BX, 0, z], { walk: gait(f, 2.4), run: true, buzo: true } as never);
      return { set: "beach", env: "day", tide: 0.1, cards: [s] };
    }
    case 28: case 29: { // arrecife: burbujea feliz junto a Burbu ¡blub, blub! · ¿te quedarías un día bajo el agua?
      const y = 0.9 + Math.sin(f / 14) * 0.08;
      const ex: Expr = id === 28 ? cara(f, [["burbujea", "feliz"], ["blub", "sorpresa", 1270], [1285, "feliz"]], "feliz") : cara(f, [["quedarias", "sorpresa"], ["agua", "feliz"]], "feliz");
      const s = stk(f, ex, id === 29 ? "wave" : nada(f), at(RF, 0, y, id === 29 ? -0.2 : -1.6), { buzo: true, roll: Math.sin(f / 12) * 0.08 } as never);
      const bur = pez(f, at(RF, id === 29 ? 0.55 : 0.75, y + 0.55, id === 29 ? -0.3 : -1.7), { mirror: false, s: 0.5 });
      const bubs = [burb(f, at(RF, id === 29 ? -0.1 : 0.2, y + 1.3, id === 29 ? 0.55 : -1.6), 0.3, 1.5), burb(f + 40, at(RF, id === 29 ? 0.3 : 0.55, y + 0.75, id === 29 ? 0.45 : -1.75), 0.2, 2)];
      const extra = id === 29 ? [cameo(f, INVITADO_ESPECIAL, at(RF, 1.2, 0, -1.9), undefined, { saluda: f % 30 < 15 })] : [];
      return { set: "reef", env: "underwater", spawn: id === 28 ? 0.25 : 0, cards: [s, bur, ...bubs, ...extra, ...cardumen(f, at(RF, 0, 2.6, -5.5), 8, 3.4)] };
    }
    default: return { set: "park", env: "day", cards: [] };
  }
};
const dofAt = (_id: number, _f: number) => ({ cInf: 5 });

/** portada: Sticky con cara de susto junto a la pecera, Burbu grande y burbujas, texto gigante */
const PORTADA: Portada = {
  texto: ["¿RESPIRA", "EN EL AGUA?"], textoH: ["¿RESPIRA EN EL AGUA?"], col: "#7fd0ff",
  expr: "sorpresa", arm: "cover", set: "reef", env: "underwater", flota: 0, blur: 12,
  sticky: { head: [-400.35, 1.6, 449], roll: 0.12 }, cam: { pos: [-400.05, 1.5, 451.3], look: [-400.05, 1.3, 449], fov: 56 },
  stickyH: { head: [-400.9, 1.6, 449], roll: 0.12 }, camH: { pos: [-400.3, 1.45, 451.1], look: [-400.3, 1.3, 449], fov: 46 },
  cosas: [{ kind: "fish", o: { ...BURBU }, x: -399.7, y: 0.75, z: 449.3, s: 0.6, roll: 0.1 }, { kind: "prop", o: { tipo: "burbujas", k: 0.3 }, x: -399.6, y: 1.15, z: 449.2, s: 0.45 }],
  cosasH: [{ kind: "fish", o: { ...BURBU }, x: -399.6, y: 0.8, z: 449.3, s: 0.62, roll: 0.1 }, { kind: "prop", o: { tipo: "burbujas", k: 0.3 }, x: -399.5, y: 1.2, z: 449.2, s: 0.45 }],
};

export const PECES: Story = {
  voz: VOZ, cameo: INVITADO_ESPECIAL, portada: PORTADA,
  TOTAL, camAt, layersAt, dofAt, state,
  MARKS: [
    { a: 6, b: 44, label: "¿RESPIRAN?", sub: "¿en el agua?", col: PALETA.titulo.espacio },
    { a: 76, b: 110, label: "¡BLUB!", sub: "", col: PALETA.titulo.espacio },
    { a: 146, b: 176, label: "¡SPLASH!", sub: "", col: PALETA.titulo.dato },
    { a: 186, b: 220, label: "¡GLU, GLU!", sub: "", col: PALETA.titulo.alerta },
    { a: 237, b: 264, label: "¡COF, COF!", sub: "", col: PALETA.titulo.dato },
    { a: 306, b: 348, label: "¡JA, JA!", sub: "", col: PALETA.titulo.calma },
    { a: 495, b: 532, label: "¡PLOP, PLOP!", sub: "", col: PALETA.titulo.espacio },
    { a: 547, b: 608, label: "OXÍGENO", sub: "escondido en el agua", col: PALETA.titulo.dato },
    { a: 611, b: 638, label: "¡POQUITO!", sub: "", col: PALETA.titulo.alerta },
    { a: 742, b: 820, label: "LAS BRANQUIAS", sub: "boca → branquias", col: PALETA.titulo.calma },
    { a: 857, b: 902, label: "ATRAPAN O₂", sub: "", col: PALETA.titulo.dato },
    { a: 907, b: 938, label: "¡ZAS!", sub: "", col: PALETA.titulo.alerta },
    { a: 1010, b: 1062, label: "¡PLOP, PLOP, PLOP!", sub: "", col: PALETA.titulo.espacio },
    { a: 1167, b: 1194, label: "¡DING!", sub: "tanque de aire", col: PALETA.titulo.dato },
    { a: 1278, b: 1314, label: "¡BLUB, BLUB!", sub: "", col: PALETA.titulo.espacio },
    { a: 1324, b: TOTAL + 10, label: "¿Y TÚ?", sub: "¿un día bajo el agua?", col: PALETA.titulo.dato },
  ],
};
