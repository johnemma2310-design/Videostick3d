// «¿Y si el Sol se apaga de repente?» — 56.9 s (1707 frames), timed to public/voz.wav (voz/palabras.json, 30 fps).
// words (frames): Si 3 · Sol 12 · no 57 · cuenta 74 · ocho 92 minutos 98 | Su luz 134 · ocho minutos 154 · veinte segundos 174 ·
// cruzar 197 · ciento cincuenta millones 210 · kilómetros 243 · separan 265 | Así 299 · todo sigue igual 350 · cielo azul 379 ·
// calorcito 401 · y tú 423 · tranquilo 440 · helado 467 | golpe 520 · noche 551 · Luna 589 · apaga 608 · refleja 665 · Sol 689 |
// Por suerte 717 · estrellas 743 · Por desgracia 793 · todo 830 | Tierra 864 · amarrada 895 · disparada 930 · recta 954 ·
// ciento siete mil 966 · hora 1010 | Fíjate 1037 · piedra 1082 · girar 1103 · cuerda 1121 | semana 1162 · bajo cero 1208 |
// año 1253 · setenta y tres 1269 · bajo cero 1299 | plantas 1341 · mueren 1352 · mares 1366 · congelan 1375 | debajo del hielo
// 1414 · agua 1447 · líquida 1462 · años 1495 | Lo bueno 1528 · no puede apagarse 1559 · Todavía 1618 · cinco mil millones 1646 · años 1674
export const FPS = 30;
export const TOTAL = 1707;
export type V3 = [number, number, number];
export type Env = "day" | "night" | "space" | "spaceDark" | "frozen";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const norm = (a: V3): V3 => { const n = Math.hypot(...a) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
const toward = (pos: V3, target: V3, d = 20): V3 => add(pos, norm(add(target, pos, -1)), d);

// ---- the park sky: the Sun and the Moon as far billboards ----
export const SUN_POS: V3 = [-120, 330, -620];
export const MOON_POS: V3 = [210, 260, -560];
export const NIGHT_AT = 520; // "de golpe"
export const MOON_OFF = [600, 616] as const; // "se apaga"
// ---- the stone on a rope (the analogy) ----
export const ROPE = { c: [0.32, 2.0, 0.0] as V3, r: 0.85, w: 0.397, release: 1121 }; // released at 3pi/2: flies to screen right
// ---- space: the Sun at the origin, the Earth on a circle of radius ORBIT ----
export const SUN_R = 40, EARTH_R = 6, ORBIT = 300;
export const pulseX = (f: number) => SUN_R + (ORBIT - EARTH_R - SUN_R) * smooth((f - 140) / (262 - 140));
export const RELEASE = 923; // "sale disparada"
const W_ORB = 0.011, TH0 = -0.62;
/** Earth position (space shots). Before RELEASE it orbits; after, it keeps its velocity in a straight line. */
export const earthAt = (f: number): V3 => {
  const th = (g: number) => TH0 + W_ORB * (g - 854);
  if (f <= RELEASE) return [ORBIT * Math.cos(th(f)), 0, ORBIT * Math.sin(th(f))];
  const a = th(RELEASE), v = ORBIT * W_ORB, d = f - RELEASE;
  return [ORBIT * Math.cos(a) - Math.sin(a) * v * d, 0, ORBIT * Math.sin(a) + Math.cos(a) * v * d];
};
// ---- frozen park ----
export const ICE_AT = [1270, 1292] as const;   // Sticky freezes in a block of ice ("setenta y tres")
export const DEAD_AT = [1336, 1356] as const;  // the trees die ("plantas mueren")
export const LAKE = { x0: 12, x1: 24, z0: -14, z1: -2, depth: 4.5 };

type Key = { f: number; pos: V3; look: V3; fov: number; glide?: boolean };
type Cam = { pos: V3; look: V3; fov: number };
export type ShotDef = { id: number; a: number; b: number; env: (f: number) => Env; keys: Key[]; dyn?: (f: number) => Cam };
const C0: V3 = [0.6, 1.35, 6.4];
const C8: V3 = [0.95, 1.0, 4.6];
export const SHOTS: ShotDef[] = [
  // 1 hook: from the Sun down to Sticky with his ice cream
  { id: 1, a: 0, b: 132, env: () => "day", keys: [
    { f: 0, pos: C0, look: toward(C0, SUN_POS), fov: 44 },
    { f: 14, pos: [0.58, 1.35, 6.2], look: toward([0.58, 1.35, 6.2], SUN_POS), fov: 44 },
    { f: 52, pos: [0.5, 1.25, 3.6], look: [0, 1.0, 0], fov: 40, glide: true },
    { f: 132, pos: [0.32, 1.2, 2.9], look: [0, 1.02, 0], fov: 40 },
  ] },
  // 2 space: a pulse of light leaves the Sun and crosses to the Earth
  { id: 2, a: 126, b: 297, env: () => "space", keys: [{ f: 126, pos: [0, 0, 0], look: [0, 0, 0], fov: 46 }], dyn: (f) => {
    const px = pulseX(f), u = smoother((f - 134) / 30), e = smoother((f - 258) / 36);
    const intro = { pos: [24, 16, 150] as V3, look: [0, 0, 0] as V3 };
    const track = { pos: [px - 6, 16, 92] as V3, look: [px + 14, 0, 0] as V3 };
    const end = { pos: [ORBIT - 26, 6, 34] as V3, look: [ORBIT, 0, 0] as V3 };
    const p1 = lerp3(intro.pos, track.pos, u), l1 = lerp3(intro.look, track.look, u);
    return { pos: lerp3(p1, end.pos, e), look: lerp3(l1, end.look, e), fov: 46 - 6 * e };
  } },
  // 3 back in the park: nothing has changed (blue sky, warmth, the ice cream)
  { id: 3, a: 291, b: 500, env: () => "day", keys: [
    { f: 291, pos: [3.4, 1.6, 4.4], look: [0, 1.0, 0], fov: 40 },
    { f: 345, pos: [2.3, 1.25, 3.2], look: [0, 1.0, 0], fov: 40, glide: true },
    { f: 378, pos: [1.9, 1.0, 3.4], look: [-1.6, 6.2, -8], fov: 44, glide: true },
    { f: 408, pos: [1.7, 1.0, 3.35], look: [-1.7, 6.6, -8], fov: 44 },
    { f: 438, pos: [-0.8, 1.2, 2.5], look: [0, 1.04, 0], fov: 40, glide: true },
    { f: 500, pos: [-0.62, 1.2, 2.15], look: [0, 1.04, 0], fov: 40 },
  ] },
  // 4 night falls all at once; the Moon goes dark too; the stars stay; Sticky alone in the dark
  { id: 4, a: 494, b: 860, env: (f) => (f < NIGHT_AT ? "day" : "night"), keys: [
    { f: 494, pos: [0.6, 1.25, 2.6], look: [0, 1.0, 0], fov: 42 },
    { f: 540, pos: [0.42, 1.2, 2.2], look: [0, 1.0, 0], fov: 42 },
    { f: 580, pos: [0.9, 0.9, 3.3], look: toward([0.9, 0.9, 3.3], MOON_POS), fov: 40, glide: true },
    { f: 690, pos: [0.85, 0.92, 3.1], look: toward([0.85, 0.92, 3.1], MOON_POS), fov: 37 },
    { f: 722, pos: [0.8, 0.9, 3.2], look: [0.2, 14, -5], fov: 56, glide: true },
    { f: 785, pos: [0.75, 0.9, 3.1], look: [0.3, 14, -4.5], fov: 54 },
    { f: 815, pos: [2.6, 2.3, 5.4], look: [0, 0.85, 0], fov: 42, glide: true },
    { f: 860, pos: [3.0, 2.7, 6.3], look: [0, 0.8, 0], fov: 42 },
  ] },
  // 5 space, the Sun dark: the Earth was tied to it, now it flies off in a straight line
  { id: 5, a: 854, b: 1036, env: () => "spaceDark", keys: [{ f: 854, pos: [0, 0, 0], look: [0, 0, 0], fov: 50 }], dyn: (f) => {
    const e = earthAt(f), u = smoother((f - 930) / 50);
    const wide = { pos: [0, 330, 360] as V3, look: [40, 0, 40] as V3 };
    const chase = { pos: add(e, [-16, 8, -26]) as V3, look: add(e, [10, 0, 30]) as V3 };
    const creep = 1 - 0.08 * smooth((f - 854) / 70);
    return { pos: lerp3([wide.pos[0], wide.pos[1] * creep, wide.pos[2] * creep], chase.pos, u), look: lerp3(wide.look, chase.look, u), fov: 50 - 6 * u };
  } },
  // 6 the analogy: a stone twirled on a rope flies off straight when it is let go
  { id: 6, a: 1030, b: 1152, env: () => "day", keys: [
    { f: 1030, pos: [0.3, 1.55, 4.6], look: [0, 1.5, 0], fov: 44 },
    { f: 1110, pos: [0.15, 1.6, 4.0], look: [0, 1.55, 0], fov: 44 },
    { f: 1121, pos: [0.12, 1.6, 3.95], look: [0, 1.6, 0], fov: 44 },
    { f: 1150, pos: [-0.6, 1.8, 4.8], look: [9.5, 2.7, -0.9], fov: 50, glide: true },
    { f: 1152, pos: [-0.62, 1.8, 4.82], look: [9.8, 2.7, -0.9], fov: 50 },
  ] },
  // 7 the frozen park: shivering, then frozen solid; the trees die; under the lake ice the water is still liquid
  { id: 7, a: 1146, b: 1525, env: () => "frozen", keys: [
    { f: 1146, pos: [3.6, 2.2, 5.6], look: [0, 1.0, 0], fov: 44 },
    { f: 1200, pos: [1.25, 1.3, 3.0], look: [0, 1.0, 0], fov: 42, glide: true },
    { f: 1262, pos: [1.0, 1.25, 2.75], look: [0, 1.0, 0], fov: 42 },
    { f: 1310, pos: [1.5, 1.5, 3.6], look: [0, 1.0, 0], fov: 44, glide: true },
    { f: 1345, pos: [5.5, 3.2, 8.5], look: [15, 0.5, -6], fov: 48, glide: true },
    { f: 1398, pos: [10.5, 2.0, 3.5], look: [18, -0.2, -7], fov: 46, glide: true },
    { f: 1440, pos: [18, -1.7, -2.6], look: [18, -2.3, -9], fov: 50, glide: true },
    { f: 1525, pos: [18, -1.8, -4.0], look: [18, -2.1, -10], fov: 48 },
  ] },
  // 8 the good news: daylight again, Sticky relieved, up to the Sun
  { id: 8, a: 1519, b: TOTAL, env: () => "day", keys: [
    { f: 1519, pos: [0.5, 1.2, 2.6], look: [0, 1.04, 0], fov: 42 },
    { f: 1590, pos: [0.42, 1.25, 2.95], look: [0, 1.04, 0], fov: 42 },
    { f: 1640, pos: C8, look: toward(C8, SUN_POS), fov: 46, glide: true },
    { f: TOTAL, pos: [1.0, 1.0, 4.85], look: toward([1.0, 1.0, 4.85], SUN_POS), fov: 46 },
  ] },
];
export const XFADE = 6;

export const camAt = (id: number, f: number): Cam => {
  const s = SHOTS[id - 1];
  let c: Cam;
  if (s.dyn) c = s.dyn(f);
  else {
    const k = s.keys;
    c = { pos: k[k.length - 1].pos, look: k[k.length - 1].look, fov: k[k.length - 1].fov };
    if (f <= k[0].f) c = { pos: k[0].pos, look: k[0].look, fov: k[0].fov };
    else for (let i = 1; i < k.length; i++) if (f <= k[i].f) {
      const u = (f - k[i - 1].f) / (k[i].f - k[i - 1].f), t = k[i].glide ? smoother(u) : u;
      c = { pos: lerp3(k[i - 1].pos, k[i].pos, t), look: lerp3(k[i - 1].look, k[i].look, t), fov: lerp(k[i - 1].fov, k[i].fov, t) };
      break;
    }
  }
  // impact shake when night falls: alternating sign, dies out in 8 frames
  if (id === 4 && f >= NIGHT_AT && f < NIGHT_AT + 8) {
    const k = (1 - (f - NIGHT_AT) / 8) * 0.05 * (f % 2 ? 1 : -1);
    c = { ...c, pos: [c.pos[0] + k, c.pos[1] - k * 0.6, c.pos[2]] };
  }
  return c;
};

export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (let i = SHOTS.length - 1; i > 0; i--) {
    const a = SHOTS[i].a;
    if (f >= a + XFADE) return [{ id: i + 1, alpha: 1 }];
    if (f >= a) return [{ id: i, alpha: 1 }, { id: i + 1, alpha: (f - a + 1) / (XFADE + 1) }];
  }
  return [{ id: 1, alpha: 1 }];
};

const FACE: V3 = [0, 1.05, 0];
export const dofAt = (id: number, f: number): { cInf: number; focus?: V3 } => {
  switch (id) {
    case 1: return f < 40 ? { cInf: 4 } : { cInf: 12, focus: FACE };
    case 3: return f > 362 && f < 425 ? { cInf: 4 } : { cInf: 12, focus: FACE };
    case 4: return f > 565 && f < 800 ? { cInf: 3 } : { cInf: f > 800 ? 8 : 12, focus: FACE };
    case 6: return { cInf: 10, focus: [0, 1.6, 0] };
    case 7: return f < 1320 ? { cInf: 10, focus: FACE } : f < 1420 ? { cInf: 4 } : { cInf: 8 };
    case 8: return f > 1620 ? { cInf: 4 } : { cInf: 12, focus: FACE };
    default: return { cInf: 0 };
  }
};

// ---- titles: a quiet line at the top of the frame ----
export type Mark = { a: number; b: number; label: string; sub: string; col: string };
export const MARKS: Mark[] = [
  { a: 86, b: 130, label: "8 minutos", sub: "sin darte cuenta", col: "#ffd23f" },
  { a: 150, b: 212, label: "8 min 20 s", sub: "tarda la luz del Sol", col: "#ffffff" },
  { a: 214, b: 294, label: "150,000,000 km", sub: "del Sol a la Tierra", col: "#ffd23f" },
  { a: 962, b: 1030, label: "107,000 km/h", sub: "en línea recta", col: "#ffffff" },
  { a: 1205, b: 1244, label: "-18 °C", sub: "en una semana", col: "#bfe6ff" },
  { a: 1284, b: 1332, label: "-73 °C", sub: "en un año", col: "#bfe6ff" },
  { a: 1642, b: TOTAL + 10, label: "5,000 millones", sub: "de años más de Sol", col: "#ffd23f" },
];
/** the countdown while nothing has changed yet: 8:20 left at "Así" (299) down to 0:00 at "golpe" (520) */
export const COUNT = { a: 300, b: NIGHT_AT, hide: NIGHT_AT + 14, from: 500 };
