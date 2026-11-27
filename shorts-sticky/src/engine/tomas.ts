// Ayudas de CÁMARA y MOVIMIENTO que comparten los shorts (antes vivían copiadas dentro de gravedad.ts).
// Ver BIBLIA/CALIDAD.md («Cámara») y BIBLIA/ESCENARIOS.md («Objetos que flotan o caen»).
import type { Card, Cam, V3 } from "./types";
import { type Key, type Shot, smooth, smoother, lerp, hh } from "./timeline";
import { flotaCae } from "./sets";

/** posición dentro de un escenario: at(ORIGIN.house, x, y, z) */
export const at = (o: readonly number[], x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
/** llave de cámara */
export const K = (f: number, pos: V3, look: V3, fov: number, glide = false): Key => ({ f, pos, look, fov, glide });
/** cámara que orbita alrededor de c (radio r, altura h sobre c[1]) del ángulo a0 al a1 entre los cuadros a y b */
export const orbit = (a: number, b: number, c: V3, r: number, h: number, a0: number, a1: number, fov: number, lookDy = 0): ((f: number) => Cam) => (f) => {
  const u = smoother((f - a) / (b - a)), th = lerp(a0, a1, u);
  return { pos: [c[0] + Math.sin(th) * r, c[1] + h, c[2] + Math.cos(th) * r], look: [c[0], c[1] + lookDy, c[2]], fov };
};
/** zoom de golpe: el fov baja `d` grados en 6 cuadros a partir de f0 */
export const punch = (f: number, f0: number, d = 10) => (f < f0 ? 0 : -d * smooth((f - f0) / 6));
/** cámara dinámica + zooms de golpe [cuadro, grados] */
export const withPunch = (fn: (f: number) => Cam, hits: [number, number][]) => (f: number): Cam => { const c = fn(f); return { ...c, fov: c.fov + hits.reduce((s, [f0, d]) => s + punch(f, f0, d), 0) }; };
/** llaves + zooms de golpe (para tomas con llaves): convierte las llaves en una cámara dinámica */
export const keysPunch = (keys: Key[], hits: [number, number][]) => withPunch(keyCam(keys), hits);
/** llaves -> cámara dinámica (igual que makeTimeline) */
export const keyCam = (k: Key[]) => (f: number): Cam => {
  if (f <= k[0].f) return { pos: k[0].pos, look: k[0].look, fov: k[0].fov };
  for (let i = 1; i < k.length; i++) if (f <= k[i].f) {
    const u = (f - k[i - 1].f) / (k[i].f - k[i - 1].f), t = k[i].glide ? smoother(u) : u, L = (a: V3, b: V3): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
    return { pos: L(k[i - 1].pos, k[i].pos), look: L(k[i - 1].look, k[i].look), fov: lerp(k[i - 1].fov, k[i].fov, t) };
  }
  const l = k[k.length - 1];
  return { pos: l.pos, look: l.look, fov: l.fov };
};
/** entrada con energía: los primeros 7 cuadros de la toma la cámara llega de un empujón (fov +9 y un poco de lado) */
export const entra = (keys: Key[], dir = 1): Key[] => {
  const k0 = keys[0], k1 = keys[1];
  if (!k1 || k1.f - k0.f < 14) return keys;
  const fx = k0.look[0] - k0.pos[0], fz = k0.look[2] - k0.pos[2], n = Math.hypot(fx, fz) || 1, rx = (-fz / n) * 0.35 * dir, rz = (fx / n) * 0.35 * dir;
  const u = 7 / (k1.f - k0.f), mid: Key = { f: k0.f + 7, pos: [lerp(k0.pos[0], k1.pos[0], u), lerp(k0.pos[1], k1.pos[1], u), lerp(k0.pos[2], k1.pos[2], u)], look: [lerp(k0.look[0], k1.look[0], u), lerp(k0.look[1], k1.look[1], u), lerp(k0.look[2], k1.look[2], u)], fov: lerp(k0.fov, k1.fov, u), glide: true };
  return [{ ...k0, pos: [k0.pos[0] + rx, k0.pos[1], k0.pos[2] + rz], fov: k0.fov + 9 }, mid, ...keys.slice(1)];
};
/** arma las tomas a partir de los cortes y de una cámara por toma (llaves o función); se enciman 6 cuadros (fundido) */
export const armarTomas = (CUTS: number[], TOTAL: number, SHOTCAM: (Key[] | ((f: number) => Cam))[]): Shot[] =>
  SHOTCAM.map((c, i) => {
    const a = CUTS[i], b = i === SHOTCAM.length - 1 ? TOTAL : CUTS[i + 1] + 6;
    return typeof c === "function" ? { id: i + 1, a, b, dyn: c } : { id: i + 1, a, b, keys: entra(c, i % 2 ? 1 : -1) };
  });

const ease = (x: number) => 1 - Math.exp(-Math.max(0, x));
/** hace flotar una tarjeta desde el cuadro f0: sube suave, se mece y gira */
export const flo = (c: Card, f: number, f0: number, o: { up?: number; ph?: number; dx?: number; spin?: number } = {}): Card => {
  if (f < f0) return c;
  const dt = (f - f0) / 30, ph = o.ph ?? hh(c.x * 3.1 + c.z * 1.7, 5) * 6.28, up = o.up ?? 2.5;
  const y = (c.y ?? 0) + up * ease(dt * 1.3) + 0.12 * dt + Math.sin(dt * 1.7 + ph) * 0.18;
  return { ...c, y, x: c.x + Math.sin(dt * 0.9 + ph) * (o.dx ?? 0.25), roll: (c.roll ?? 0) + (o.spin ?? 1) * (Math.sin(dt * 1.2 + ph) * 0.5 + dt * 0.12 * (hh(ph, 2) < 0.5 ? 1 : -1)) } as Card;
};
/** una tarjeta que estaba a la altura yA y cae al piso (y0) con rebote desde el cuadro f0 (lie = giro final al quedar tirada) */
export const cae = (c: Card, f: number, f0: number, yA: number, y0 = 0, lie = 0): Card => {
  const k = flotaCae(f, f0, Math.round(Math.sqrt((2 * Math.max(0.05, yA - y0)) / 9.8) * 30));
  const ph = hh(c.x + c.z, 3) * 6.28, r0 = Math.sin(f / 15 + ph) * 0.4;
  return { ...c, y: y0 + (yA - y0) * k + (f < f0 ? Math.sin(f / 13 + ph) * 0.12 : 0), roll: f < f0 ? r0 : lerp(lie, r0, Math.min(1, k)) } as Card;
};
/** tiro parabólico: la tarjeta sale de A en el cuadro f0 y llega a B en f1 (altura extra `alto` a la mitad), girando `giro` */
export const vuela = (c: Card, f: number, f0: number, f1: number, A: V3, B: V3, alto = 1, giro = 0): Card => {
  const u = Math.max(0, Math.min(1, (f - f0) / (f1 - f0)));
  return { ...c, x: lerp(A[0], B[0], u), y: lerp(A[1], B[1], u) + 4 * alto * u * (1 - u), z: lerp(A[2], B[2], u), roll: (c.roll ?? 0) + giro * u } as Card;
};
/** gira una tarjeta alrededor de su centro (cx, cy) y no de los pies; half = media altura de la tarjeta (m) */
export const spinC = (c: Card, cx: number, cy: number, r: number, half: number): Card => ({ ...c, x: cx + Math.sin(r) * half, y: cy - Math.cos(r) * half, roll: r }) as Card;
/** rebote de alegría o susto: saltitos de `alto` m cada `per` cuadros desde f0 */
export const brinca = (f: number, f0: number, alto = 0.12, per = 12) => (f < f0 ? 0 : Math.abs(Math.sin(((f - f0) / per) * Math.PI)) * alto);
