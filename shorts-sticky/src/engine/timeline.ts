import type { Cam, V3 } from "./types";
export const FPS = 30;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const add3 = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

export type Key = { f: number; pos: V3; look: V3; fov: number; glide?: boolean };
export type Shot = { id: number; a: number; b: number; keys?: Key[]; dyn?: (f: number) => Cam };

export const makeTimeline = (SHOTS: Shot[], XFADE = 6) => {
  const camAt = (id: number, f: number): Cam => {
    const s = SHOTS[id - 1];
    if (s.dyn) return s.dyn(f);
    const k = s.keys!;
    if (f <= k[0].f) return { pos: k[0].pos, look: k[0].look, fov: k[0].fov };
    for (let i = 1; i < k.length; i++) if (f <= k[i].f) {
      const u = (f - k[i - 1].f) / (k[i].f - k[i - 1].f), t = k[i].glide ? smoother(u) : u;
      return { pos: lerp3(k[i - 1].pos, k[i].pos, t), look: lerp3(k[i - 1].look, k[i].look, t), fov: lerp(k[i - 1].fov, k[i].fov, t) };
    }
    const l = k[k.length - 1];
    return { pos: l.pos, look: l.look, fov: l.fov };
  };
  const layersAt = (f: number) => {
    for (let i = SHOTS.length - 1; i > 0; i--) {
      const a = SHOTS[i].a;
      if (f >= a + XFADE) return [{ id: i + 1, alpha: 1 }];
      if (f >= a) return [{ id: i, alpha: 1 }, { id: i + 1, alpha: (f - a + 1) / (XFADE + 1) }];
    }
    return [{ id: 1, alpha: 1 }];
  };
  return { camAt, layersAt };
};

/** quantised gait phase for walking cards */
/** fase del paso 0..1 en 16 dibujos por ciclo (antes 8) */
export const gait = (f: number, hz: number, off = 0) => Math.floor((((f / FPS) * hz + off) % 1) * 16) / 16;
/** una palabra de palabras.json (edge-tts): texto, inicio y duración en segundos */
export type Palabra = { w: string; t: number; d: number };
/** apertura de boca 0..3 para el frame f: abre y cierra una vez por sílaba mientras dura cada palabra */
export const bocaAt = (voz: Palabra[], f: number): number => {
  const t = f / FPS;
  for (const p of voz) {
    if (t < p.t) return 0;
    if (t < p.t + Math.max(p.d, 0.08)) {
      const syl = Math.max(1, (p.w.toLowerCase().match(/[aeiouáéíóúü]+/g) || []).length);
      const u = ((t - p.t) / Math.max(p.d, 0.08)) * syl;
      return Math.max(1, Math.round(Math.abs(Math.sin(u * Math.PI)) * 3));
    }
  }
  return 0;
};
export const blinkAt = (f: number, seed: number) => { const k = (f + Math.floor(hh(seed, 9) * 70)) % 71; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };

// ---------------- cara al ritmo de la voz ----------------
/** quita acentos, signos y mayúsculas para comparar palabras ("¡PUM!" == "pum", "bastón" == "baston") */
const norm = (w: string) => w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ ]/g, "").trim();
/** cuadro en que empieza `palabra` en palabras.json (la 1.ª vez a partir del cuadro `desde`); acepta frases ("no vuelve").
 *  Si no la encuentra regresa -1. */
export const palabraEn = (voz: Palabra[], palabra: string, desde = 0): number => {
  const ws = norm(palabra).split(/\s+/);
  for (let i = 0; i < voz.length; i++) {
    if (voz[i].t * FPS < desde - 0.5) continue;
    if (ws.every((w, j) => voz[i + j] && norm(voz[i + j].w) === w)) return Math.round(voz[i].t * FPS);
  }
  return -1;
};
/** cuántos cuadros antes de la palabra cambia la cara (la cara se adelanta: así se ve que el personaje "lo piensa") */
export const CARA_ANTES = 2;
/** expresión que toca en el cuadro f: cada entrada es [palabra | cuadro, expr] o [palabra, expr, desde]. La cara cambia
 *  CARA_ANTES (2) cuadros antes de que empiece la palabra y se queda hasta la siguiente entrada. Antes de la primera: `base`.
 *  Ej.: caraEn(VOZ, f, [["furiosa", "furioso"], ["pum", "susto"], [1300, "llora"]], "shock") */
export const caraEn = <E extends string>(voz: Palabra[], f: number, mapa: ([string | number, E] | [string, E, number])[], base: E): E => {
  let best = -Infinity, e = base;
  for (const m of mapa) {
    const f0 = typeof m[0] === "number" ? m[0] : palabraEn(voz, m[0], m.length > 2 ? (m[2] as number) : 0);
    if (f0 < 0) continue;
    const ini = f0 - CARA_ANTES;
    if (f >= ini && ini >= best) { best = ini; e = m[1]; }
  }
  return e;
};

// ---------------- saltito de cámara en los golpes ----------------
/** salto corto y seco de la imagen en un golpe (además del `shake`): en los 4 cuadros desde f0 la cámara entera (posición
 *  y mira) baja de golpe, rebota arriba y vuelve; amp en metros (0.10–0.25 según el golpe y lo cerca que esté la cámara). */
const SALTO = [-1, 0.55, -0.25, 0.08];
export const saltoAt = (f: number, golpes: (number | [number, number])[], amp = 0.14): number => {
  let dy = 0;
  for (const g of golpes) {
    const [f0, a] = typeof g === "number" ? [g, amp] : g, k = Math.floor(f - f0);
    if (k >= 0 && k < SALTO.length) dy += SALTO[k] * a;
  }
  return dy;
};
/** aplica el saltito a una cámara: mueve posición y mira juntas (la imagen salta sin girar) */
export const conSalto = (c: Cam, f: number, golpes: (number | [number, number])[], amp = 0.14): Cam => {
  const dy = saltoAt(f, golpes, amp);
  return dy ? { ...c, pos: [c.pos[0], c.pos[1] + dy, c.pos[2]], look: [c.look[0], c.look[1] + dy, c.look[2]] } : c;
};
