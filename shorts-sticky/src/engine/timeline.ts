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
