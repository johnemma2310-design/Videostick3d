// The stickman cast, all drawn on the 600 x 1000 card design (soles at y = 975) or the 2000 x 1400 wide design
// (ground at y = 1375). Sticky is the lead: biggest head, blue scarf. Everyone else: smaller white heads, varied
// hats, moustaches, beards, glasses, bows; dogs, cats, birds, turtles, penguins, cartoon cars, a giant wave.
import { Pen, INK, shade, mix } from "./toon";

type P2 = [number, number];
const WHITE = "#ffffff", MOUTH = "#5a1e28";
export type Expr = "neutral" | "smile" | "lick" | "shock" | "sad" | "scream" | "happy" | "worried" | "shiver" | "frozen" | "relief" | "sleep";
export type Arm = "down" | "icecream" | "up" | "cheer" | "wave" | "phone" | "candle" | "flash" | "point" | "fly" | "hug" | "cover";
export type Look = [number, number];

// ---------------- shared face ----------------
const face = (p: Pen, cx: number, cy: number, R: number, expr: Expr, look: Look = [0, 0], blink = 0) => {
  const k = R / 150, ew = (expr === "shock" || expr === "scream" ? 48 : 40) * k, eh = (expr === "shock" || expr === "scream" ? 60 : 52) * k;
  for (const sx of [-1, 1]) {
    const ex = cx + sx * 52 * k, ey = cy - 30 * k;
    if (expr === "happy" || expr === "relief" || expr === "sleep" || (expr === "smile" && blink > 0.5)) { p.arc(ex, ey + 10 * k, 30 * k, 22 * k, expr === "sleep" ? 20 : 200, expr === "sleep" ? 160 : 340, 9 * k); continue; }
    if (expr === "frozen") { p.ell(ex, ey, ew, eh, WHITE, 9 * k); p.stroke([[ex - 30 * k, ey], [ex + 30 * k, ey]], 8 * k); continue; }
    p.ell(ex, ey, ew, eh * (1 - 0.9 * blink), WHITE, 9 * k);
    if (blink < 0.6) p.dot(ex + look[0] * 16 * k, ey + look[1] * 22 * k, (expr === "shock" || expr === "scream" ? 13 : 17) * k);
    if (expr === "sad" || expr === "worried") p.stroke([[ex - 34 * k, ey - (62 - sx * 10) * k], [ex + 34 * k, ey - (62 + sx * 10) * k]], 9 * k);
  }
  const mx = cx, my = cy + 55 * k;
  switch (expr) {
    case "smile": p.arc(mx, my - 18 * k, 42 * k, 26 * k, 20, 160, 9 * k); break;
    case "happy": case "relief": p.arc(mx, my - 20 * k, 52 * k, 34 * k, 15, 165, 10 * k); break;
    case "lick": p.arc(mx, my - 18 * k, 40 * k, 22 * k, 20, 160, 9 * k); p.ell(mx + 26 * k, my + 6 * k, 13 * k, 16 * k, "#e86e78", 6 * k); break;
    case "shock": p.ell(mx, my, 26 * k, 32 * k, MOUTH, 9 * k); break;
    case "scream": p.ell(mx, my + 6 * k, 38 * k, 46 * k, MOUTH, 9 * k); break;
    case "sad": case "worried": p.arc(mx, my + 18 * k, 34 * k, 18 * k, 200, 340, 9 * k); break;
    case "sleep": p.stroke([[mx - 16 * k, my], [mx + 16 * k, my]], 8 * k); break;
    case "neutral": p.stroke([[mx - 24 * k, my], [mx + 24 * k, my]], 8 * k); break;
    case "shiver": case "frozen": {
      const pts: P2[] = []; for (let i = 0; i <= 8; i++) pts.push([mx - 40 * k + i * 10 * k, my + (i % 2 ? 8 : -8) * k]);
      p.poly([[mx - 44 * k, my - 14 * k], [mx + 44 * k, my - 14 * k], [mx + 44 * k, my + 14 * k], [mx - 44 * k, my + 14 * k]], WHITE, 8 * k); p.stroke(pts, 5 * k);
    }
  }
};

// ---------------- arms + held items ----------------
const armPose = (arm: Arm, sho: P2, side: number, ph: number, k: number): [P2, P2] => {
  const [sx, sy] = sho, s = side, sw = Math.sin(ph * Math.PI * 2) * 40 * k * s;
  switch (arm) {
    case "up": case "fly": return [[sx + s * 70 * k, sy - 110 * k], [sx + s * 95 * k, sy - 230 * k]];
    case "cheer": return [[sx + s * 90 * k, sy - 90 * k], [sx + s * 120 * k, sy - 200 * k + Math.sin(ph * 6.28) * 20 * k]];
    case "cover": return [[sx + s * 80 * k, sy - 20 * k], [sx + s * 20 * k, sy - 120 * k]];
    case "hug": return [[sx + s * 60 * k, sy + 70 * k], [sx - s * 40 * k, sy + 60 * k]];
    default: return [[sx + s * 50 * k + sw * 0.3, sy + 95 * k], [sx + s * 85 * k + sw, sy + 175 * k]];
  }
};
const rightArm = (arm: Arm, sho: P2, k: number, ph: number): [P2, P2] => {
  const [sx, sy] = sho;
  switch (arm) {
    case "icecream": case "candle": case "flash": return [[sx + 95 * k, sy + 100 * k], [sx + 70 * k, sy + 50 * k]];
    case "phone": return [[sx + 90 * k, sy + 90 * k], [sx + 40 * k, sy + 10 * k]];
    case "point": return [[sx + 100 * k, sy - 20 * k], [sx + 170 * k, sy - 40 * k]];
    case "wave": return [[sx + 90 * k, sy - 60 * k], [sx + 120 * k + Math.sin(ph * 6.28) * 30 * k, sy - 170 * k]];
    default: return armPose(arm, sho, 1, ph + 0.5, k);
  }
};
const held = (p: Pen, arm: Arm, h: P2, k: number) => {
  const [x, y] = h;
  if (arm === "icecream") {
    p.poly([[x - 26 * k, y - 34 * k], [x + 26 * k, y - 34 * k], [x, y + 30 * k]], "#e0a35a", 6 * k);
    p.ell(x, y - 56 * k, 34 * k, 30 * k, "#f7c6d9", 7 * k); p.ell(x - 10 * k, y - 66 * k, 8 * k, 6 * k, WHITE, 0);
  } else if (arm === "phone") {
    p.poly([[x - 22 * k, y - 40 * k], [x + 22 * k, y - 40 * k], [x + 22 * k, y + 30 * k], [x - 22 * k, y + 30 * k]], "#2a2a36", 6 * k);
    p.poly([[x - 15 * k, y - 32 * k], [x + 15 * k, y - 32 * k], [x + 15 * k, y + 20 * k], [x - 15 * k, y + 20 * k]], "#bfe6ff", 0);
  } else if (arm === "candle") {
    p.poly([[x - 14 * k, y - 70 * k], [x + 14 * k, y - 70 * k], [x + 14 * k, y + 10 * k], [x - 14 * k, y + 10 * k]], "#f4efe2", 6 * k);
    p.poly([[x, y - 120 * k], [x + 14 * k, y - 86 * k], [x, y - 72 * k], [x - 14 * k, y - 86 * k]], "#ffc23a", 4 * k);
  } else if (arm === "flash") {
    p.poly([[x - 16 * k, y - 50 * k], [x + 16 * k, y - 50 * k], [x + 12 * k, y + 20 * k], [x - 12 * k, y + 20 * k]], "#d84a3a", 6 * k);
    p.ell(x, y - 54 * k, 22 * k, 10 * k, "#fff6b0", 5 * k);
  }
  p.dot(x, y, 12 * k);
};

// ---------------- Sticky (the lead) ----------------
export type StickyOpts = { expr: Expr; arm?: Arm; look?: Look; blink?: number; scarf?: number; walk?: number; ang?: number; run?: boolean; talk?: number };
// ---------------- cel-shading (estilo v2): relleno con sombra de corte duro abajo a la derecha ----------------
/** color de sombra: más oscuro y un poco lavanda, como la sombra de la referencia */
export const sombra = (c: string, k = 0.74) => mix(shade(c, k), "#5a4a8a", 0.14);
/** cuerpo en forma de frijol: más angosto arriba (wTop) y más ancho abajo (wBot) */
export const bean = (cx: number, y0: number, y1: number, wTop: number, wBot: number): P2[] => {
  const h = y1 - y0, ryt = Math.min(wTop, h * 0.36), ryb = Math.min(wBot, h * 0.42), pts: P2[] = [];
  for (let a = 180; a <= 360; a += 9) pts.push([cx + wTop * Math.cos((a * Math.PI) / 180), y0 + ryt + ryt * Math.sin((a * Math.PI) / 180)]);
  for (let a = 0; a <= 180; a += 9) pts.push([cx + wBot * Math.cos((a * Math.PI) / 180), y1 - ryb + ryb * Math.sin((a * Math.PI) / 180)]);
  return pts;
};
const ellPtsV = (cx: number, cy: number, rx: number, ry: number): P2[] => { const o: P2[] = []; for (let a = 0; a < 360; a += 8) o.push([cx + rx * Math.cos((a * Math.PI) / 180), cy + ry * Math.sin((a * Math.PI) / 180)]); return o; };
/** rellena `pts` con sombra de corte duro: `paint(lit)` pinta las capas (lit=false sombra, lit=true luz), recortado a la forma */
export const celPaint = (p: Pen, pts: P2[], paint: (lit: boolean) => void, ol = 13, push = 0.13) => {
  const g = p.g, xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, w = Math.max(...xs) - Math.min(...xs);
  g.save(); p.path(pts, true); g.clip();
  paint(false);
  g.save(); p.path(pts.map(([x, y]) => [cx + (x - cx) * 0.9 - w * push, cy + (y - cy) * 0.94 - 10] as P2), true); g.clip(); paint(true); g.restore();
  g.restore();
  if (ol) p.poly(pts, null, ol);
};
/** relleno liso con sombra de corte duro */
export const cel = (p: Pen, pts: P2[], col: string, ol = 13, push = 0.13) =>
  celPaint(p, pts, (lit) => { const g = p.g; g.fillStyle = lit ? col : sombra(col); g.fillRect(-2000, -2000, 6000, 6000); }, ol, push);
/** cabeza ovalada con sombra suave (Sticky y todos) */
const headV2 = (p: Pen, cx: number, cy: number, rx: number, ry: number, skin = WHITE) => {
  p.ell(cx, cy, rx, ry, skin === WHITE ? "#dfe3ea" : sombra(skin, 0.86), 0);
  p.ell(cx - rx * 0.08, cy - ry * 0.075, rx * 0.91, ry * 0.92, skin, 0);
  p.ell(cx, cy, rx, ry, null, 14 * (rx / 150));
};

// Sticky v2 (nov 2026): head ovalada blanca con sombra gris de un lado, cejas gruesas expresivas, ojitos negros,
// torso en cápsula blanca con contorno grueso, brazos y piernas de palito, y su bufanda azul anudada al cuello.
const SH_L: P2 = [234, 572], SH_R: P2 = [366, 572], SHADE = "#dfe3ea", BLUE = "#2f86d6", BLUE_D = "#1f5f9e";
export const stickyHand = (o: StickyOpts): P2 => (o.arm === "up" ? [395 + 25 * Math.cos(o.ang ?? 0), 300 + 12 * Math.sin(o.ang ?? 0)] : rightArm(o.arm ?? "down", SH_R, 1, 0)[1]);
/** cara expresiva de Sticky: cejas gruesas, ojitos negros con brillo, boca grande */
const browFace = (p: Pen, cx: number, cy: number, expr: Expr, look: Look = [0, 0], blink = 0, talk = 0) => {
  const shock = expr === "shock" || expr === "scream";
  const closed = expr === "happy" || expr === "relief" || expr === "sleep" || (expr === "smile" && blink > 0.5);
  const lx = look[0] * 9, ly = look[1] * 9;
  for (const sx of [-1, 1]) {
    const ex = cx + sx * 48, ey = cy - 14;
    if (closed) p.arc(ex, ey + 8, 22, 15, expr === "sleep" ? 20 : 200, expr === "sleep" ? 160 : 340, 9);
    else if (expr === "frozen") p.stroke([[ex - 16, ey], [ex + 16, ey]], 9);
    else {
      const rx = shock ? 15 : 12, ry = (shock ? 20 : 17) * (1 - 0.88 * blink);
      if (shock) p.ell(ex + lx, ey + ly, rx + 10, 30, WHITE, 6);
      p.ell(ex + lx, ey + ly, rx, Math.max(ry, 2.5), INK, 0);
      if (blink < 0.5) p.ell(ex + lx - 4, ey + ly - 6, 4.5, 4.5, WHITE, 0);
    }
    // ceja: cuña gruesa (más gruesa por dentro); la altura de cada punta da la emoción
    let yi = -44, ym = -50, yo = -48;
    switch (expr) {
      case "shock": case "scream": yi = -72; ym = -80; yo = -70; break;
      case "sad": case "worried": case "shiver": case "frozen": yi = -64; ym = -56; yo = -42; break;
      case "smile": case "happy": case "relief": case "lick": yi = -56; ym = -64; yo = -56; break;
      case "sleep": yi = -40; ym = -42; yo = -40; break;
      default: yi = -40; ym = -48; yo = -50; // neutral: algo serio, como el estilo de referencia
    }
    const xi = ex - sx * 26, xm = ex, xo = ex + sx * 28;
    p.poly([[xi, ey + yi - 9], [xm, ey + ym - 8], [xo, ey + yo - 5], [xo, ey + yo + 4], [xm, ey + ym + 7], [xi, ey + yi + 10]], INK, 5);
  }
  const mx = cx + 4, my = cy + 64;
  // hablando: boca abierta que sube y baja por sílaba, conservando la emoción de las cejas
  if (talk > 0 && expr !== "sleep" && expr !== "scream" && expr !== "frozen" && expr !== "shiver") {
    const l = Math.min(3, talk), glad = expr === "smile" || expr === "happy" || expr === "relief" || expr === "lick";
    if (glad) { p.ell(mx, my - 10, 30 + 4 * l, 10 + 10 * l, MOUTH, 8, 0, 180); }
    else p.ell(mx, my + 2, 15 + 6 * l, 6 + 8 * l, MOUTH, 8);
    if (l >= 2) p.ell(mx + 4, my + (glad ? 4 + 6 * l : 6 + 5 * l), 10 + 2 * l, 4 + 2 * l, "#e86e78", 0);
    return;
  }
  switch (expr) {
    case "smile": p.arc(mx, my - 18, 38, 22, 20, 160, 9); break;
    case "happy": case "relief": p.ell(mx, my - 12, 44, 38, MOUTH, 8, 0, 180); p.ell(mx + 6, my + 14, 18, 9, "#e86e78", 0); break;
    case "lick": p.arc(mx, my - 18, 36, 20, 20, 160, 9); p.ell(mx + 24, my + 6, 12, 15, "#e86e78", 6); break;
    case "shock": p.ell(mx, my + 2, 20, 26, MOUTH, 8); break;
    case "scream": p.ell(mx, my + 8, 34, 44, MOUTH, 8); p.ell(mx, my + 30, 18, 10, "#e86e78", 0); break;
    case "sad": case "worried": p.arc(mx, my + 16, 30, 16, 200, 340, 9); break;
    case "sleep": p.stroke([[mx - 14, my], [mx + 14, my]], 8); break;
    case "neutral": p.stroke([[mx - 22, my + 2], [mx + 4, my], [mx + 22, my - 3]], 8); break;
    case "shiver": case "frozen": {
      const pts: P2[] = []; for (let i = 0; i <= 8; i++) pts.push([mx - 36 + i * 9, my + (i % 2 ? 7 : -7)]);
      p.poly([[mx - 40, my - 13], [mx + 40, my - 13], [mx + 40, my + 13], [mx - 40, my + 13]], WHITE, 7); p.stroke(pts, 5);
    }
  }
};
/** cara v2 a cualquier tamaño (k = 1 es la cabeza de Sticky, radio 150); `extra` dibuja antes (p. ej. la barba) */
const browFaceK = (p: Pen, cx: number, cy: number, k: number, expr: Expr, look?: Look, blink = 0, extra?: () => void, talk = 0) => {
  p.g.save(); p.g.translate(cx, cy); p.g.scale(k, k); if (extra) extra(); browFace(p, 0, 0, expr, look, blink, talk); p.g.restore();
};
// ---------------- movimiento v2: piernas con rodilla y brazos con codo ----------------
/** cuánto sube el cuerpo en esta fase del paso (más alto cuando una pierna pasa por debajo) */
export const bobOf = (walk: number | undefined, run = false) => (walk === undefined ? 0 : Math.abs(Math.sin(walk * Math.PI * 2)) * (run ? 22 : 9));
/** piernas vistas de frente: la rodilla se dobla hacia afuera y el pie se levanta al dar el paso; `foot` dibuja el zapato */
const stepLegs = (p: Pen, hips: [P2, P2], walk: number | undefined, run: boolean, lw: number, foot: (x: number, y: number, side: number) => void, ground = 962) => {
  ([[0, -1], [1, 1]] as const).forEach(([i, side]) => {
    const [hx, hy] = hips[i];
    let lift = 0, sway = 0;
    if (walk !== undefined) { const ph = walk * Math.PI * 2 + (side > 0 ? Math.PI : 0); lift = Math.max(0, Math.sin(ph)); sway = Math.cos(ph); }
    const fx = hx + side * (run ? 6 : 14) + sway * (run ? 8 : 5) * side, fy = ground - lift * (run ? 120 : 60);
    const kx = (hx + fx) / 2 + side * (6 + lift * (run ? 44 : 26)), ky = (hy + fy) / 2 - lift * (run ? 36 : 16);
    p.stroke([[hx, hy], [kx, ky], [fx, fy]], lw);
    foot(fx, fy, side);
  });
};
/** brazo que se balancea al caminar (codo apenas doblado) o que bombea al correr (codo a 90 grados) */
const swingArm = (sho: P2, side: number, walk: number, run: boolean, k: number): [P2, P2] => {
  const s = Math.sin(walk * Math.PI * 2 + (side > 0 ? 0 : Math.PI));
  if (run) return [[sho[0] + side * 62 * k, sho[1] + (78 + s * 22) * k], [sho[0] + side * 26 * k, sho[1] + (24 - s * 58) * k]];
  return [[sho[0] + side * (46 + s * 8) * k, sho[1] + 94 * k], [sho[0] + side * (64 + s * 22) * k, sho[1] + (176 - Math.max(0, s) * 46) * k]];
};
/** cápsula (torso) de x0..x1, y0..y1 */
const capsule = (x0: number, x1: number, y0: number, y1: number): P2[] => {
  const cx = (x0 + x1) / 2, rx = (x1 - x0) / 2, ry = Math.min(rx, (y1 - y0) / 2);
  const pts: P2[] = [];
  for (let a = 180; a <= 360; a += 10) pts.push([cx + rx * Math.cos((a * Math.PI) / 180), y0 + ry + ry * Math.sin((a * Math.PI) / 180)]);
  for (let a = 0; a <= 180; a += 10) pts.push([cx + rx * Math.cos((a * Math.PI) / 180), y1 - ry + ry * Math.sin((a * Math.PI) / 180)]);
  return pts;
};
export const sticky = (p: Pen, o: StickyOpts) => {
  const lw = 13, ph = (o.scarf ?? 0) * Math.PI * 2, wk = o.walk;
  const run = !!o.run, bob = bobOf(wk, run);
  // piernas con rodilla y zapatitos (los pies se quedan en el piso; el cuerpo sube y baja)
  stepLegs(p, [[274, 750 - bob], [326, 750 - bob]], wk, run, lw, (x, y, sd) => p.ell(x + sd * 10, y + 4, 28, 13, INK, 0), 964);
  p.g.save(); p.g.translate(0, -bob);
  // cuello + torso en cápsula blanca con sombra a la derecha
  p.stroke([[300, 450], [300, 520]], lw);
  celPaint(p, bean(300, 492, 776, 70, 84), (lit) => { p.g.fillStyle = lit ? WHITE : SHADE; p.g.fillRect(-2000, -2000, 6000, 6000); });
  // cola de la bufanda que ondea (detrás de los brazos)
  const tail: P2[] = [[322, 508]];
  for (let i = 1; i <= 6; i++) tail.push([322 + i * 13 + Math.sin(ph + i * 0.8) * 9 * (i / 6), 508 + i * 24]);
  p.poly([...tail.map(([x, y]) => [x - 17, y] as P2), ...tail.slice().reverse().map(([x, y]) => [x + 17, y + 4] as P2)], BLUE, 8);
  p.stroke([[322 + 6 * 13 - 14, 508 + 6 * 24 - 2], [322 + 6 * 13 + 14, 508 + 6 * 24 + 2]], 4, BLUE_D);
  // brazos de palito
  const arm = o.arm ?? "down";
  const [le, lh] = arm === "fly" || arm === "cheer" || arm === "cover" || arm === "hug" ? armPose(arm, SH_L, -1, wk ?? 0, 1) : wk !== undefined ? swingArm(SH_L, -1, wk, run, 1) : armPose("down", SH_L, -1, 0, 1);
  p.stroke([SH_L, le, lh], lw); p.dot(lh[0], lh[1], 13);
  let re: P2, rh: P2;
  if (arm === "up") { rh = stickyHand(o); re = [392, 440]; } else if (arm === "down" && wk !== undefined) [re, rh] = swingArm(SH_R, 1, wk, run, 1); else [re, rh] = rightArm(arm, SH_R, 1, wk ?? 0);
  p.stroke([SH_R, re, rh], lw);
  // cabeza ovalada blanca con sombra gris (lado derecho y abajo)
  headV2(p, 300, 292, 150, 162);
  browFace(p, 292, 300, o.expr, o.look, o.blink ?? 0, o.talk ?? 0);
  // bufanda: vuelta al cuello + nudo + punta corta al frente
  celPaint(p, ellPtsV(300, 490, 78, 30), (lit) => { p.g.fillStyle = lit ? BLUE : BLUE_D; p.g.fillRect(-2000, -2000, 6000, 6000); }, 9, 0.1);
  p.arc(300, 478, 66, 20, 20, 160, 5, BLUE_D);
  p.poly([[276, 500], [304, 504], [296, 600], [264, 592]], BLUE, 8);
  p.stroke([[268, 582], [298, 588]], 4, BLUE_D);
  p.ell(286, 506, 22, 18, BLUE, 8);
  if (arm !== "up" && arm !== "down") held(p, arm, rh, 1); else p.dot(rh[0], rh[1], 13);
  p.g.restore();
};

// ---------------- background people (v2: cuerpo con ropa y sombra de corte duro) ----------------
export type Hat = "none" | "cap" | "tophat" | "bowler" | "beanie" | "cowboy" | "bow" | "hair" | "pony" | "helmet" | "chef";
/** estilo de ropa del torso */
export type Ropa = "tee" | "shirt" | "vest" | "overall" | "jacket" | "coat" | "dress" | "apron";
export type PersonOpts = {
  hat?: Hat; hatCol?: string; stache?: "thick" | "curly" | "thin"; beard?: string; glasses?: boolean; tie?: string; bag?: string; cane?: boolean;
  expr: Expr; arm?: Arm; look?: Look; walk?: number; blink?: number; skin?: string;
  /** ropa: estilo, color de camisa, pantalón, zapatos y detalle (botones, cinta, solapa) */
  ropa?: Ropa; shirt?: string; pants?: string; shoes?: string; trim?: string;
  /** correr en vez de caminar (usa la misma fase `walk`); talk = boca abierta 0..3 */
  run?: boolean; talk?: number;
};
const hatDraw = (p: Pen, o: PersonOpts, cx: number, cy: number, R: number) => {
  const c = o.hatCol ?? "#d84a3a", top = cy - R;
  switch (o.hat) {
    case "cap": p.ell(cx, top + 30, R * 0.95, R * 0.62, c, 9, 180, 360); p.poly([[cx, top + 30], [cx + R * 1.25, top + 34], [cx + R * 1.2, top + 48], [cx, top + 44]], c, 7); break;
    case "tophat": p.poly([[cx - R * 0.6, top + 18], [cx + R * 0.6, top + 18], [cx + R * 0.55, top - R * 1.0], [cx - R * 0.55, top - R * 1.0]], c, 9); p.poly([[cx - R * 0.95, top + 10], [cx + R * 0.95, top + 10], [cx + R * 0.95, top + 28], [cx - R * 0.95, top + 28]], c, 8); p.poly([[cx - R * 0.58, top - 4], [cx + R * 0.58, top - 4], [cx + R * 0.58, top + 12], [cx - R * 0.58, top + 12]], "#d84a3a", 0); break;
    case "bowler": p.ell(cx, top + 18, R * 0.7, R * 0.6, c, 9, 180, 360); p.ell(cx, top + 22, R * 1.0, 16, c, 8); break;
    case "beanie": p.ell(cx, top + 34, R * 0.98, R * 0.7, c, 9, 180, 360); p.poly([[cx - R, top + 30], [cx + R, top + 30], [cx + R, top + 52], [cx - R, top + 52]], c, 8); p.ell(cx, top - R * 0.38, 20, 20, "#ffffff", 7); break;
    case "cowboy": p.ell(cx, top + 26, R * 1.5, 20, c, 8); p.poly([[cx - R * 0.6, top + 22], [cx + R * 0.6, top + 22], [cx + R * 0.45, top - R * 0.55], [cx, top - R * 0.4], [cx - R * 0.45, top - R * 0.55]], c, 9); break;
    case "helmet": p.ell(cx, top + 40, R * 1.05, R * 0.8, c, 9, 180, 360); p.ell(cx, top + 40, R * 1.2, 12, c, 7); break;
    case "chef": p.poly([[cx - R * 0.6, top + 30], [cx + R * 0.6, top + 30], [cx + R * 0.6, top - R * 0.4], [cx - R * 0.6, top - R * 0.4]], "#ffffff", 8); p.ell(cx, top - R * 0.55, R * 0.75, R * 0.45, "#ffffff", 8); break;
    case "bow": p.poly([[cx + R * 0.35, top + 30], [cx + R * 0.95, top - 10], [cx + R * 0.95, top + 70]], c, 7); p.poly([[cx + R * 0.35, top + 30], [cx - R * 0.2, top - 10], [cx - R * 0.2, top + 70]], c, 7); p.ell(cx + R * 0.35, top + 30, 16, 16, c, 6); break;
    case "hair": for (let i = -3; i <= 3; i++) p.stroke([[cx + i * R * 0.2, top + 22], [cx + i * R * 0.26, top - 22 - Math.abs(3 - Math.abs(i)) * 6]], 9); break;
    case "pony": p.ell(cx, top + 30, R * 1.0, R * 0.6, c, 9, 180, 360); p.ell(cx + R * 1.05, cy - R * 0.2, R * 0.3, R * 0.6, c, 8); break;
  }
};
const EARS: Hat[] = ["none", "cap", "tophat", "bowler", "helmet", "chef", "cowboy", "beanie"];
export const person = (p: Pen, o: PersonOpts) => {
  const lw = 11, R = 128, RY = 136, HY = 322, wk = o.walk, g = p.g;
  const ropa = o.ropa ?? "tee", shirt = o.shirt ?? "#2f86d6", pants = o.pants ?? "#3b3f52", shoes = o.shoes ?? "#5a3b2a", trim = o.trim ?? "#f2b632";
  const dress = ropa === "dress", coat = ropa === "coat";
  const y0 = 486, y1 = dress ? 800 : 782, wTop = 66, wBot = dress ? 104 : 82, PY = coat ? 760 : 700;
  const SHL: P2 = [238, 540], SHR: P2 = [362, 540];
  const run = !!o.run, bob = bobOf(wk, run);
  // piernas de palito y zapatos de color
  stepLegs(p, [[276, 770 - bob], [324, 770 - bob]], wk, run, lw, (x, y, d) => cel(p, ellPtsV(x + d * 8, y, 32, 15), shoes, 7, 0.05), 960);
  g.save(); g.translate(0, -bob);
  p.stroke([[300, 440], [300, 500]], lw);
  // torso con ropa (sombra de corte duro)
  const B = bean(300, y0, y1, wTop, wBot);
  celPaint(p, B, (lit) => {
    const f = (c: string) => (lit ? c : sombra(c));
    const rect = (c: string, x0: number, yA: number, x1: number, yB: number) => { g.fillStyle = f(c); g.fillRect(x0, yA, x1 - x0, yB - yA); };
    rect(shirt, 0, 0, 600, 1000);
    if (!dress) rect(pants, 0, PY, 600, 1000);
    if (ropa === "overall") rect(pants, 254, 600, 346, PY);
    if (ropa === "apron") rect("#f4f1ea", 250, 560, 350, 790);
    if (ropa === "vest" || ropa === "jacket" || coat) { // pechera interior en V
      g.fillStyle = f(coat ? trim : ropa === "jacket" ? "#f4f1ea" : "#f7f2e4");
      p.path([[268, 486], [332, 486], [300, ropa === "vest" ? 600 : 640]], true); g.fill();
    }
    if (dress) rect(trim, 0, 640, 600, 658);
  });
  // detalles de tinta: cuellos, botones, bolsillos, tirantes
  const btn = (x: number, y: number, c = "#f4f1ea") => p.ell(x, y, 7, 7, c, 3);
  switch (ropa) {
    case "tee": p.arc(300, 488, 34, 18, 20, 160, 6); p.poly([[318, 560], [348, 560], [346, 592], [320, 592]], null, 5); break;
    case "shirt":
      p.poly([[300, 496], [266, 486], [274, 528]], "#f7f2e4", 5); p.poly([[300, 496], [334, 486], [326, 528]], "#f7f2e4", 5);
      for (const y of [550, 595, 640]) btn(300, y); break;
    case "vest": p.stroke([[268, 486], [300, 600], [332, 486]], 5); for (const y of [622, 662]) btn(300, y, trim); p.stroke([[318, 650], [350, 650]], 5); p.stroke([[250, 650], [282, 650]], 5); break;
    case "overall":
      for (const sx of [-1, 1]) { p.stroke([[300 + sx * 44, 492], [300 + sx * 38, 604]], 16, pants); p.stroke([[300 + sx * 48, 496], [300 + sx * 42, 604]], 3, sombra(pants)); btn(300 + sx * 38, 608, trim); }
      p.poly([[278, 630], [322, 630], [320, 662], [280, 662]], null, 5); break;
    case "jacket": p.stroke([[268, 486], [300, 640], [332, 486]], 5); p.stroke([[300, 640], [300, PY]], 5); p.stroke([[248, 680], [282, 680]], 5); p.stroke([[318, 680], [352, 680]], 5); break;
    case "coat":
      p.stroke([[268, 486], [300, 640], [332, 486]], 5); p.stroke([[300, 640], [300, 780]], 5);
      p.poly([[316, 600], [350, 600], [348, 640], [318, 640]], null, 5); p.stroke([[326, 590], [326, 612]], 5, "#d84a3a");
      for (const y of [670, 720]) btn(286, y); break;
    case "apron":
      p.stroke([[262, 560], [282, 492]], 6, "#f4f1ea"); p.stroke([[338, 560], [318, 492]], 6, "#f4f1ea");
      p.stroke([[250, 740], [250, 560], [350, 560], [350, 740]], 5); p.poly([[274, 650], [326, 650], [326, 700], [274, 700]], null, 4); break;
    case "dress": p.stroke([[246, 658], [354, 658]], 4, sombra(trim)); break;
  }
  if (!dress && ropa !== "apron") p.stroke([[226, PY], [374, PY]], 5);
  if (o.tie) p.poly([[300, 494], [314, 512], [308, 600], [300, 616], [292, 600], [286, 512]], o.tie, 5);
  if (o.bag) { p.stroke([[262, 492], [380, 700]], 7, o.bag); cel(p, [[360, 690], [436, 690], [436, 764], [360, 764]], o.bag, 7, 0.05); }
  // brazos de palito
  const arm = o.arm ?? "down";
  const [le, lh] = arm === "cheer" || arm === "fly" || arm === "up" || arm === "cover" || arm === "hug" ? armPose(arm, SHL, -1, wk ?? 0, 0.9) : wk !== undefined ? swingArm(SHL, -1, wk, run, 0.9) : armPose("down", SHL, -1, 0, 0.9);
  p.stroke([SHL, le, lh], lw); p.dot(lh[0], lh[1], 11);
  const [re, rh] = arm === "down" && wk !== undefined ? swingArm(SHR, 1, wk, run, 0.9) : rightArm(arm, SHR, 0.9, wk ?? 0);
  p.stroke([SHR, re, rh], lw);
  if (o.cane) { p.stroke([[rh[0], rh[1]], [rh[0] + 10, 968]], 9, "#7a4b2a"); p.arc(rh[0] - 14, rh[1], 22, 18, 180, 360, 9, "#7a4b2a"); }
  // cabeza: orejas (si no hay pelo largo), óvalo sombreado, cara expresiva
  const skin = o.skin ?? WHITE, skinSh = skin === WHITE ? "#dfe3ea" : sombra(skin, 0.86);
  if (EARS.includes(o.hat ?? "none")) for (const sx of [-1, 1]) { p.ell(300 + sx * (R - 4), HY + 14, 20, 28, sx > 0 ? skinSh : skin, 9); p.arc(300 + sx * (R - 2), HY + 14, 9, 14, sx > 0 ? -60 : 120, sx > 0 ? 60 : 240, 5); }
  headV2(p, 300, HY, R, RY, skin);
  const k = R / 150;
  browFaceK(p, 296, HY + 6, k, o.expr, o.look, o.blink ?? 0, () => { if (o.beard) { p.ell(4, 96, 96, 40, o.beard, 8, 0, 180); p.ell(4, 64, 40, 22, WHITE, 0); } }, o.talk ?? 0);
  if (o.glasses) { for (const sx of [-1, 1]) p.ell(296 + sx * 48 * k, HY - 8 * k, 34 * k, 30 * k, null, 7); p.stroke([[296 - 14 * k, HY - 10 * k], [296 + 14 * k, HY - 10 * k]], 6); }
  if (o.stache) {
    const my = HY + 46 * k, mx = 300;
    if (o.stache === "curly") { p.arc(mx - 26 * k, my, 28 * k, 15 * k, 0, 200, 12 * k); p.arc(mx + 26 * k, my, 28 * k, 15 * k, -20, 180, 12 * k); }
    else p.poly([[mx, my - 10 * k], [mx + 50 * k, my - 2 * k], [mx + 44 * k, my + 14 * k], [mx, my + 6 * k], [mx - 44 * k, my + 14 * k], [mx - 50 * k, my - 2 * k]], INK, o.stache === "thin" ? 2 : 4);
  }
  hatDraw(p, o, 300, HY - (RY - R), R);
  if (arm !== "down" && arm !== "up" && arm !== "cheer" && arm !== "fly" && arm !== "wave" && arm !== "point" && arm !== "cover" && arm !== "hug") held(p, arm, rh, 0.9); else p.dot(rh[0], rh[1], 11);
  g.restore();
};

// ---------------- animals v2 (side view, facing screen-right): cuerpo relleno con sombra de corte duro ----------------
export type AnimalOpts = { coat: string; walk?: number; mood?: "calm" | "scared" | "howl" | "sleep" | "bark"; spot?: string };
/** puntos de una elipse (rot en grados) */
const EP = (cx: number, cy: number, rx: number, ry: number, rot = 0): P2[] => {
  const o: P2[] = [], c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180);
  for (let a = 0; a < 360; a += 8) { const x = rx * Math.cos((a * Math.PI) / 180), y = ry * Math.sin((a * Math.PI) / 180); o.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return o;
};
/** elipse con sombra de corte duro */
const celE = (p: Pen, cx: number, cy: number, rx: number, ry: number, col: string, ol = 10, rot = 0) => cel(p, EP(cx, cy, rx, ry, rot), col, ol, 0.1);
/** cuerpo con manchas recortadas dentro */
const celSpots = (p: Pen, pts: P2[], col: string, spots: [number, number, number, number][], spot: string, ol = 11) =>
  celPaint(p, pts, (lit) => {
    const g = p.g; g.fillStyle = lit ? col : sombra(col); g.fillRect(-2000, -2000, 6000, 6000);
    g.fillStyle = lit ? spot : sombra(spot); for (const [x, y, rx, ry] of spots) { p.path(EP(x, y, rx, ry), true); g.fill(); }
  }, ol, 0.1);
/** ojo v2: negro con brillo; asustado = con blanco alrededor; dormido = rayita */
const eyeA = (p: Pen, x: number, y: number, r: number, mood?: AnimalOpts["mood"]) => {
  if (mood === "sleep") { p.arc(x, y, r * 1.1, r * 0.7, 20, 160, r * 0.45); return; }
  if (mood === "scared") p.ell(x, y, r * 1.5, r * 1.7, WHITE, r * 0.35);
  p.ell(x, y, r * 0.72, r, INK, 0); p.ell(x - r * 0.25, y - r * 0.38, r * 0.27, r * 0.27, WHITE, 0);
};
/** ceja gruesa: inclinada hacia arriba por dentro si está asustado */
const browA = (p: Pen, x: number, y: number, r: number, mood?: AnimalOpts["mood"]) => {
  const up = mood === "scared" ? 1 : mood === "bark" ? -0.6 : 0;
  p.stroke([[x - r * 1.1, y - r * 1.5 - up * r * 0.5], [x + r * 1.1, y - r * 1.5 + up * r * 0.5]], r * 0.55);
};
/** pata de palito con patita de color */
const legA = (p: Pen, x: number, y0: number, dx: number, foot: string, w = 11) => {
  p.stroke([[x, y0], [x + dx, 962]], w); cel(p, EP(x + dx + 8, 964, 22, 11), foot, 6, 0.05);
};
const swing = (ph: number | undefined, k = 30) => (ph === undefined ? 0 : Math.sin(ph * Math.PI * 2) * k);
export const dog = (p: Pen, o: AnimalOpts) => {
  const a = swing(o.walk), coat = o.coat, dark = o.spot ?? shade(coat, 0.6);
  const wag = o.walk === undefined ? 0 : Math.sin(o.walk * 12.6) * 18;
  p.line([[140, 740], [110, 690], [96 + wag, 630]], coat, 20);
  for (const [x, s] of [[170, 1], [215, -1], [360, -1], [405, 1]] as const) legA(p, x, 800, a * s, sombra(coat, 0.85));
  celSpots(p, EP(290, 752, 170, 78), coat, o.spot ? [[220, 720, 60, 44], [340, 780, 40, 30]] : [], dark);
  cel(p, [[434, 686], [500, 704], [496, 730], [430, 716]], "#d84a3a", 5, 0.05); // collar
  const hx = 486, hy = o.mood === "howl" ? 570 : 640;
  celE(p, hx, hy, 76, 68, coat);
  celE(p, hx + 60, hy + 24, 46, 32, mix(coat, "#ffffff", 0.35), 9);
  p.ell(hx + 100, hy + (o.mood === "howl" ? 4 : 14), 15, 12, INK, 0);
  eyeA(p, hx + 18, hy - 14, 13, o.mood); if (o.mood !== "sleep") browA(p, hx + 18, hy - 14, 13, o.mood);
  if (o.mood === "bark" || o.mood === "howl") p.ell(hx + 70, hy + 46, 18, 14, MOUTH, 6);
  else if (o.mood === "scared") p.arc(hx + 64, hy + 52, 16, 9, 200, 340, 6);
  else p.arc(hx + 62, hy + 38, 18, 11, 20, 160, 6);
  celE(p, hx - 34, hy + 4, 24, 52, dark, 8, 12); // oreja caída
};
export const cat = (p: Pen, o: AnimalOpts) => {
  const a = swing(o.walk, 24), coat = o.coat, sc = o.mood === "scared";
  const tail: P2[] = []; for (let i = 0; i <= 12; i++) { const t = i / 12; tail.push(sc ? [170 - 10 * t, 790 - 190 * t] : [170 - 40 * t - Math.sin(t * 5) * 22, 800 - 150 * t]); }
  p.line(tail, coat, sc ? 22 : 16);
  for (const [x, s] of [[200, 1], [236, -1], [330, -1], [366, 1]] as const) legA(p, x, 830, a * s, sombra(coat, 0.85), 10);
  const up = sc ? -24 : 0;
  celE(p, 286, 796 + up / 2, 128, 60, coat);
  const hx = 420, hy = 726 + up;
  for (const [x0, x1, x2] of [[hx - 52, hx - 40, hx - 8], [hx + 8, hx + 40, hx + 52]]) cel(p, [[x0, hy - 26], [x1, hy - (sc ? 80 : 96)], [x2, hy - 46]], coat, 8, 0.05);
  celE(p, hx, hy, 60, 54, coat);
  for (const sx of [-1, 1]) {
    const ex = hx + sx * 22 + 6, ey = hy - 8;
    if (o.mood === "sleep") { p.arc(ex, ey, 12, 7, 20, 160, 5); continue; }
    p.ell(ex, ey, 11, sc ? 16 : 13, "#c8e85a", 5); p.ell(ex, ey, sc ? 6 : 3, 9, INK, 0); p.ell(ex - 3, ey - 5, 2.5, 2.5, WHITE, 0);
  }
  p.poly([[hx + 2, hy + 12], [hx + 14, hy + 12], [hx + 8, hy + 20]], "#e86e78", 3);
  p.arc(hx + 2, hy + 24, 8, 6, 20, 160, 4); p.arc(hx + 16, hy + 24, 8, 6, 20, 160, 4);
  for (const sx of [-1, 1]) for (const dy of [-6, 8]) p.stroke([[hx + 8 + sx * 26, hy + 18], [hx + 8 + sx * 78, hy + 12 + dy]], 3);
};
export const bird = (p: Pen, o: AnimalOpts & { fly?: boolean }) => {
  const y = o.fly ? 700 : 880;
  if (!o.fly) { p.stroke([[290, y + 40], [282, 968]], 6, "#e8902a"); p.stroke([[322, y + 40], [330, 968]], 6, "#e8902a"); }
  p.line([[240, y + 6], [196, y + 30]], o.coat, 22);
  celE(p, 300, y, 72, 50, o.coat, 9);
  celE(p, 362, y - 48, 38, 35, o.coat, 8);
  cel(p, [[396, y - 56], [440, y - 46], [396, y - 36]], "#f2a03a", 5, 0.05);
  eyeA(p, 372, y - 56, 8);
  const flap = o.fly ? Math.sin((o.walk ?? 0) * 6.28) * 60 : 0;
  cel(p, [[268, y - 6], [340, y - 8], [300, y - 72 - flap]], o.spot ?? "#8a8fa0", 7, 0.05);
};
export const turtle = (p: Pen, o: AnimalOpts) => {
  const y = 900, a = swing(o.walk, 14), skin = "#7fbf6a";
  for (const [x, s] of [[230, 1], [360, -1]] as const) celE(p, x + a * s, y + 44, 28, 18, skin, 6);
  celE(p, 420, y + 4, 42, 32, skin, 7); eyeA(p, 438, y - 4, 7);
  p.arc(436, y + 16, 12, 6, 20, 160, 4);
  celSpots(p, EP(300, y + 10, 112, 72).filter(([, yy]) => yy <= y + 10), o.coat, [[250, y - 26, 26, 18], [306, y - 40, 26, 18], [356, y - 22, 24, 16]], shade(o.coat, 0.78), 9);
  p.stroke([[188, y + 10], [412, y + 10]], 9);
};
export const penguin = (p: Pen, o: AnimalOpts) => {
  const y = 760, a = o.walk === undefined ? 0 : Math.sin(o.walk * 6.28) * 0.08;
  p.g.save(); p.g.translate(300, 975); p.g.rotate(a); p.g.translate(-300, -975);
  for (const sx of [-1, 1]) celE(p, 300 + sx * 46, 958, 40, 16, "#f2a03a", 6);
  for (const sx of [-1, 1]) celE(p, 300 + sx * 116, y + 14, 26, 90, "#2b2b38", 8, sx * -15);
  celPaint(p, EP(300, y, 120, 192), (lit) => {
    const g = p.g; g.fillStyle = lit ? "#2b2b38" : "#1a1a24"; g.fillRect(-2000, -2000, 6000, 6000);
    g.fillStyle = lit ? WHITE : "#dfe3ea"; p.path(EP(300, y + 34, 84, 150), true); g.fill();
    for (const sx of [-1, 1]) { p.path(EP(300 + sx * 30, y - 136, 24, 26), true); g.fill(); }
  }, 10, 0.1);
  for (const sx of [-1, 1]) eyeA(p, 300 + sx * 28, y - 134, 9);
  cel(p, [[278, y - 108], [322, y - 108], [300, y - 80]], "#f2a03a", 5, 0.05);
  p.g.restore();
};

// ---------------- wide cards (2000 x 1400, ground at 1375) ----------------
export type CarOpts = { body: string; lights?: boolean; wheel?: number };
export const car = (p: Pen, o: CarOpts) => {
  const G = 1375, w = o.wheel ?? 0;
  p.poly([[260, G - 120], [1740, G - 120], [1760, G - 330], [1560, G - 360], [1380, G - 560], [700, G - 560], [520, G - 360], [260, G - 330]], o.body, 14);
  p.poly([[760, G - 520], [1060, G - 520], [1060, G - 370], [620, G - 370]], "#bfe6ff", 10);
  p.poly([[1110, G - 520], [1340, G - 520], [1470, G - 370], [1110, G - 370]], "#bfe6ff", 10);
  p.ell(1730, G - 280, 34, 30, o.lights ? "#fff6b0" : "#e8e2c8", 8);
  for (const x of [560, 1440]) {
    p.ell(x, G - 120, 125, 125, "#2a2a32", 12); p.ell(x, G - 120, 60, 60, "#c9ccd6", 8);
    for (let k = 0; k < 4; k++) { const a = w + (k * Math.PI) / 2; p.stroke([[x, G - 120], [x + Math.cos(a) * 55, G - 120 + Math.sin(a) * 55]], 8); }
  }
};
export const wave = (p: Pen, o: { t: number }) => {
  const G = 1375, j = Math.sin(o.t * 3) * 20;
  p.poly([[0, G], [0, G - 600], [300, G - 900], [800, G - 1200 + j], [1300, G - 1260], [1650, G - 1100], [1760, G - 860], [1600, G - 900], [1500, G - 760], [1420, G - 900], [1250, G - 960], [1100, G - 700], [1150, G - 300], [2000, G - 120], [2000, G]], "#2f86d6", 14);
  p.poly([[1300, G - 1260], [1650, G - 1100], [1760, G - 860], [1600, G - 900], [1500, G - 760], [1420, G - 900], [1250, G - 1000], [1100, G - 1100]], "#eaf6ff", 10);
  for (let i = 0; i < 6; i++) p.arc(300 + i * 200, G - 400 - i * 120, 120, 60, 200, 330, 10, "#9fd4ff");
};

// ---------------- more animals + props (added for the multi-scene shorts) ----------------
export const cow = (p: Pen, o: AnimalOpts) => {
  const y = 640, a = swing(o.walk);
  p.stroke([[86, y - 10], [60, y + 120]], 10); celE(p, 58, y + 134, 14, 20, "#2a2a32", 5);
  for (const [x, s] of [[160, 1], [210, -1], [350, -1], [400, 1]] as const) { p.line([[x, y + 70], [x + a * s, 950]], "#ffffff", 24); celE(p, x + a * s, 952, 18, 16, "#2a2a32", 5); }
  celSpots(p, EP(280, y, 200, 110), "#ffffff", [[220, y - 30, 56, 44], [330, y + 34, 44, 34], [384, y - 54, 34, 26], [150, y + 40, 30, 24]], "#2a2a32", 12);
  const hx = 500, hy = y - 70 - (o.mood === "scared" ? 20 : 0);
  for (const s of [-1, 1]) cel(p, [[hx - 30 + s * 30, hy - 56], [hx - 20 + s * 40, hy - 112], [hx - 4 + s * 30, hy - 54]], "#f2e6c8", 6, 0.05);
  celE(p, hx - 74, hy - 30, 36, 17, "#ffffff", 8, -10);
  celE(p, hx, hy, 80, 70, "#ffffff", 11);
  celE(p, hx + 32, hy + 40, 56, 36, "#f7b6c8", 9);
  p.ell(hx + 16, hy + 40, 7, 9, INK, 0); p.ell(hx + 48, hy + 40, 7, 9, INK, 0);
  eyeA(p, hx - 8, hy - 18, 13, o.mood); if (o.mood !== "sleep") browA(p, hx - 8, hy - 18, 13, o.mood);
};
export const chicken = (p: Pen, o: AnimalOpts) => {
  const y = 860, a = swing(o.walk, 20);
  p.stroke([[290, y + 40], [280 + a, 970]], 8, "#f2a03a"); p.stroke([[320, y + 40], [330 - a, 970]], 8, "#f2a03a");
  cel(p, [[232, y - 26], [184, y - 78], [196, y - 4]], "#ffffff", 7, 0.05);
  celE(p, 300, y, 82, 62, "#ffffff", 9);
  cel(p, [[262, y - 10], [330, y - 14], [312, y + 34], [270, y + 28]], "#eef0f4", 6, 0.05); // ala
  cel(p, [[355, y - 98], [368, y - 126], [380, y - 102], [392, y - 124], [400, y - 94]], "#e62117", 5, 0.05);
  celE(p, 370, y - 64, 40, 38, "#ffffff", 8);
  cel(p, [[402, y - 72], [442, y - 60], [402, y - 50]], "#f2a03a", 5, 0.05);
  celE(p, 400, y - 38, 10, 14, "#e62117", 4);
  eyeA(p, 380, y - 70, 8, o.mood === "scared" ? "scared" : undefined);
};
export const pig = (p: Pen, o: AnimalOpts) => {
  const y = 820, a = swing(o.walk), pink = "#f7a8c0";
  const curl: P2[] = []; for (let i = 0; i <= 10; i++) curl.push([142 - i * 4, y - 20 - Math.sin(i * 0.9) * 16]); p.stroke(curl, 7);
  for (const [x, s] of [[200, 1], [240, -1], [340, -1], [380, 1]] as const) { p.line([[x, y + 40], [x + a * s * 0.6, 950]], pink, 26); celE(p, x + a * s * 0.6, 954, 16, 12, "#8a5a4a", 5); }
  celE(p, 290, y, 152, 92, pink, 11);
  celE(p, 430, y - 22, 68, 60, pink, 10);
  cel(p, [[398, y - 70], [420, y - 116], [444, y - 72]], "#f48aa8", 6, 0.05);
  celE(p, 482, y - 8, 28, 22, "#f48aa8", 7); p.ell(474, y - 8, 4, 6, INK, 0); p.ell(490, y - 8, 4, 6, INK, 0);
  eyeA(p, 444, y - 42, 10, o.mood); p.arc(452, y + 18, 14, 8, 20, 160, 5);
};
export const fishCard = (p: Pen, o: AnimalOpts) => {
  const y = 500;
  cel(p, [[440, y], [560, y - 92], [560, y + 92]], o.coat, 10, 0.05);
  cel(p, [[258, y - 92], [320, y - 162], [342, y - 94]], o.coat, 8, 0.05);
  celSpots(p, EP(280, y, 172, 102), o.coat, o.spot ? [[234, y, 16, 110], [304, y, 16, 110]] : [], o.spot ?? o.coat, 11);
  p.ell(180, y - 20, 28, 28, WHITE, 7); eyeA(p, 174, y - 20, 14);
  p.arc(146, y + 30, 20, 12, 20, 160, 6);
};
export const beetle = (p: Pen, o: AnimalOpts) => {
  const y = 900, a = swing(o.walk, 14);
  for (const [x, s] of [[230, 1], [300, -1], [370, 1]] as const) { p.stroke([[x, y], [x - 30 + a * s, 972]], 6); p.stroke([[x, y], [x + 30 - a * s, 972]], 6); }
  celE(p, 150, y + 10, 64, 62, "#8a5a34", 8); // su bola
  celE(p, 300, y - 20, 112, 72, o.coat, 9);
  p.stroke([[300, y - 90], [300, y + 50]], 5);
  p.ell(260, y - 48, 26, 12, "rgba(255,255,255,0.55)", 0);
  celE(p, 420, y - 10, 38, 32, "#2a2a32", 7); eyeA(p, 432, y - 18, 6);
  p.stroke([[440, y - 34], [470, y - 70]], 5); p.stroke([[450, y - 26], [490, y - 50]], 5);
};
export const spinTop = (p: Pen, o: { col: string; t: number; tilt: number }) => {
  p.g.save(); p.g.translate(300, 960); p.g.rotate(o.tilt); p.g.translate(-300, -960);
  p.poly([[300, 960], [180, 760], [420, 760]], o.col, 9);
  p.ell(300, 760, 120, 44, o.col, 9);
  for (let k = 0; k < 4; k++) { const x = 300 + Math.sin(o.t * 9 + k * 1.57) * 110; p.stroke([[x, 740], [x * 0.5 + 150, 900]], 8, "#ffffff"); }
  p.stroke([[300, 716], [300, 640]], 14);
  p.g.restore();
};
export const plane = (p: Pen, o: { body: string }) => {
  const G = 1375, y = G - 700;
  p.poly([[200, y - 40], [1600, y - 70], [1800, y], [1600, y + 70], [200, y + 50], [140, y]], o.body, 14);
  p.poly([[300, y - 40], [180, y - 300], [380, y - 300], [520, y - 50]], "#e62117", 12);
  p.poly([[800, y + 20], [1100, y + 330], [1250, y + 330], [1150, y + 20]], "#d8dde8", 12);
  p.poly([[800, y - 30], [1000, y - 230], [1120, y - 230], [1100, y - 40]], "#bfc6d4", 10);
  for (let i = 0; i < 9; i++) p.ell(700 + i * 100, y - 10, 24, 20, "#9fd4ff", 6);
  p.poly([[1650, y - 50], [1760, y - 10], [1700, y + 20], [1640, y - 10]], "#9fd4ff", 8);
};
