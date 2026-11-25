// «Cómo ganó Alejandro en Gaugamela» — 9.8 s, solo animación (sin voz). Misma duración que el short de ejemplo.
// 1 Alejandro y sus 47,000 · 2 Darío y sus 100,000 · 3 la carga por el hueco del centro (cámara lenta al cruzar
// los carros) · 4 Darío da la vuelta y huye, su ejército se rompe · 5 victoria: Alejandro y sus hombres gritan.
export const FPS = 30;
export const TOTAL = 295;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

type Key = { f: number; pos: V3; look: V3; fov: number; glide?: boolean };
type Cam = { pos: V3; look: V3; fov: number };
export type ShotDef = { id: number; a: number; b: number; keys: Key[]; fog: [number, number]; dyn?: (f: number) => Cam };

// ---- slow motion while the charge crosses the line of scythed chariots: the world clock runs at 22 % ----
const SLOW = { in0: 174, in1: 181, out0: 196, out1: 206, rate: 0.22 };
const rateAt = (f: number) => 1 - (1 - SLOW.rate) * (smooth((f - SLOW.in0) / (SLOW.in1 - SLOW.in0)) - smooth((f - SLOW.out0) / (SLOW.out1 - SLOW.out0)));
const WF = (() => { const a = [0]; for (let f = 1; f <= TOTAL + 2; f++) a.push(a[f - 1] + rateAt(f - 0.5)); return a; })();
/** world-clock frame (fractional) for an output frame */
export const worldF = (f: number) => { const i = Math.max(0, Math.min(TOTAL + 1, Math.floor(f))); return WF[i] + (WF[i + 1] - WF[i]) * (f - i); };
const tOf = (f: number) => worldF(f) / FPS;

// ---- the battle (world seconds) ----
export const T_CHARGE = 4.3; // Alexander's wedge sets off
export const T_FLEE = 6.2;   // Darius turns his chariot and runs
const V_CHARGE = 19, V_PURSUE = 10;
/** Alexander's z during the charge and the pursuit (he rides at x = ALEX_X) */
export const ALEX_X = -3;
export const alexZ = (t: number) => {
  const zf = V_CHARGE * (T_FLEE - T_CHARGE);
  return t < T_FLEE ? V_CHARGE * Math.max(0, t - T_CHARGE) : zf + V_PURSUE * (t - T_FLEE);
};
/** Darius' chariot: still at z = 47 until he flees, then it accelerates away */
export const dariusZ = (t: number) => { const d = Math.max(0, t - T_FLEE); return 47 + (13 * d * d) / (d + 0.35); };
/** everything Persian that charged turns round and runs once Darius flees */
const flee = (zAtFlee: number, t: number, v: number) => zAtFlee + v * Math.max(0, t - T_FLEE);
export const elephantZ = (t: number) => (t < T_FLEE ? 44 - 1.7 * (t - 3.5) : flee(44 - 1.7 * (T_FLEE - 3.5), t, 3));
export const chariotZ = (t: number) => (t < T_FLEE ? 31 - 7.5 * (t - 5.9) : flee(31 - 7.5 * (T_FLEE - 5.9), t, 9));
export const cavalryZ = (t: number) => (t < T_FLEE ? 46 - 3.2 * (t - 3.5) : flee(46 - 3.2 * (T_FLEE - 3.5), t, 8));
/** -1 = charging toward the Macedonians (-z), +1 = running away (+z) */
export const persDir = (t: number) => (t < T_FLEE ? -1 : 1);
export const gait = (t: number, hz: number) => Math.floor(((((t * hz) % 1) + 1) % 1) * 8) / 8;

export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 78, fog: [120, 1500], keys: [
    { f: 0, pos: [0.25, 2.0, 4.9], look: [0, 2.3, 0], fov: 40 }, // Alexander face on, his men behind him
    { f: 12, pos: [0.2, 2.0, 4.5], look: [0, 2.3, 0], fov: 40 },
    { f: 36, pos: [-2.7, 2.3, -1.3], look: [0.5, 1.8, -9], fov: 44, glide: true }, // past him, into his ranks
    { f: 70, pos: [0, 44, 12], look: [0, 0, -30], fov: 56, glide: true }, // up: all 47,000 of them
    { f: 78, pos: [0, 45, 13], look: [0, 0, -30], fov: 56 },
  ] },
  { id: 2, a: 72, b: 138, fog: [260, 1100], keys: [
    { f: 72, pos: [0.4, 2.3, 40.5], look: [0, 2.5, 47], fov: 40 }, // Darius in his chariot, face on
    { f: 80, pos: [0.35, 2.3, 41.1], look: [0, 2.5, 47], fov: 40 },
    { f: 100, pos: [3.3, 3.0, 49.8], look: [-1, 2.2, 63], fov: 46, glide: true }, // past him, into the host
    { f: 130, pos: [0, 60, -110], look: [0, 0, 90], fov: 58, glide: true }, // up and back: it never ends
    { f: 138, pos: [0, 61.5, -113], look: [0, 0, 90], fov: 58 },
  ] },
  // the charge: tracking alongside the wedge, low; it rises at the end to show Darius dead ahead
  { id: 3, a: 132, b: 212, fog: [120, 1500], keys: [{ f: 132, pos: [0, 0, 0], look: [0, 0, 0], fov: 42 }], dyn: (f) => {
    const z = alexZ(tOf(f)), up = smoother((f - 192) / 20), push = smooth((f - 132) / 60);
    return { pos: [-15 + 3 * push + 1 * up, 1.8 + 3.0 * up, z - 2.2 - 3 * up], look: [ALEX_X + 1, 2.0 + 0.2 * up, z + 0.2 + 12 * up], fov: 42 - 2 * push + 4 * up };
  } },
  // Darius flees: behind Alexander's shoulder, the royal chariot runs into its own breaking host
  { id: 4, a: 206, b: 256, fog: [120, 1500], keys: [{ f: 206, pos: [0, 0, 0], look: [0, 0, 0], fov: 44 }], dyn: (f) => {
    const t = tOf(f), zd = dariusZ(t), u = smooth((f - 206) / 50);
    return { pos: [-11 + 2 * u, 2.1 + 0.5 * u, zd - 3.2 - 1.5 * u], look: [0, 2.0, zd + 0.3], fov: 42 + 3 * u };
  } },
  // victory: Alexander rears with his sword up, his men roar; the camera slides back and rises
  { id: 5, a: 250, b: TOTAL, fog: [120, 1500], keys: [
    { f: 250, pos: [0.4, 1.9, 4.7], look: [0, 2.5, 0], fov: 40 },
    { f: 262, pos: [0.35, 1.95, 4.95], look: [0, 2.5, 0], fov: 40 },
    { f: TOTAL, pos: [2.2, 4.6, 10.5], look: [0, 2.0, -5], fov: 46, glide: true },
  ] },
];
export const XFADE = 6;

export const camAt = (id: number, f: number): Cam => {
  const s = SHOTS[id - 1];
  if (s.dyn) return s.dyn(f);
  const k = s.keys;
  if (f <= k[0].f) return { pos: k[0].pos, look: k[0].look, fov: k[0].fov };
  for (let i = 1; i < k.length; i++) if (f <= k[i].f) {
    const u = (f - k[i - 1].f) / (k[i].f - k[i - 1].f), t = k[i].glide ? smoother(u) : u;
    return { pos: lerp3(k[i - 1].pos, k[i].pos, t), look: lerp3(k[i - 1].look, k[i].look, t), fov: lerp(k[i - 1].fov, k[i].fov, t) };
  }
  const l = k[k.length - 1];
  return { pos: l.pos, look: l.look, fov: l.fov };
};

/** one or two layers: each next shot fades in over the previous one for XFADE frames */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (let i = SHOTS.length - 1; i > 0; i--) {
    const a = SHOTS[i].a;
    if (f >= a + XFADE) return [{ id: i + 1, alpha: 1 }];
    if (f >= a) return [{ id: i, alpha: 1 }, { id: i + 1, alpha: (f - a + 1) / (XFADE + 1) }];
  }
  return [{ id: 1, alpha: 1 }];
};

/** thin-lens depth of field: cInf = blur at infinity (px at 1080p); focus point (default = camera look) */
export const dofAt = (id: number, f: number): { cInf: number; focus?: V3 } => {
  if (id === 1) return f < 14 ? { cInf: 14, focus: [0, 2.35, 0] } : { cInf: lerp(10, 0, smooth((f - 26) / 30)) };
  if (id === 2) return f < 82 ? { cInf: 12, focus: [0, 2.4, 47] } : { cInf: lerp(9, 0, smooth((f - 94) / 26)) };
  if (id === 3) return { cInf: lerp(10, 5, smooth((f - 192) / 20)), focus: [ALEX_X, 2.3, alexZ(tOf(f))] };
  if (id === 4) return { cInf: 9, focus: [0, 2.2, dariusZ(tOf(f))] };
  return f < 266 ? { cInf: 14, focus: [0, 2.4, 0] } : { cInf: lerp(14, 6, smooth((f - 266) / 24)), focus: [0, 2.4, 0] };
};

// ---- titles: small, at the top of the frame, never on anybody ----
export const MARKS = [
  { a: 46, b: 76, label: "47,000", sub: "de Alejandro", col: "#ffffff" },
  { a: 110, b: 136, label: "100,000", sub: "persas", col: "#ffd23f" },
  { a: 146, b: 204, label: "¡A la carga!", sub: "directo a Darío", col: "#ffffff" },
  { a: 214, b: 252, label: "Darío huyó", sub: "y su ejército se rompió", col: "#ffd23f" },
  { a: 258, b: TOTAL + 10, label: "¡VICTORIA!", sub: "Gaugamela, 331 a. C.", col: "#ffd23f" },
];
