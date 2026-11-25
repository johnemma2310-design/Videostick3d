// The stickman cast, all drawn on the 600 x 1000 card design (soles at y = 975) or the 2000 x 1400 wide design
// (ground at y = 1375). Sticky is the lead: biggest head, blue scarf. Everyone else: smaller white heads, varied
// hats, moustaches, beards, glasses, bows; dogs, cats, birds, turtles, penguins, cartoon cars, a giant wave.
import { Pen, INK } from "./toon";

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
export type StickyOpts = { expr: Expr; arm?: Arm; look?: Look; blink?: number; scarf?: number; walk?: number; ang?: number };
// Sticky v2 (nov 2026): head ovalada blanca con sombra gris de un lado, cejas gruesas expresivas, ojitos negros,
// torso en cápsula blanca con contorno grueso, brazos y piernas de palito, y su bufanda azul anudada al cuello.
const SH_L: P2 = [234, 572], SH_R: P2 = [366, 572], SHADE = "#dfe3ea", BLUE = "#2f86d6", BLUE_D = "#1f5f9e";
export const stickyHand = (o: StickyOpts): P2 => (o.arm === "up" ? [395 + 25 * Math.cos(o.ang ?? 0), 300 + 12 * Math.sin(o.ang ?? 0)] : rightArm(o.arm ?? "down", SH_R, 1, 0)[1]);
/** cara expresiva de Sticky: cejas gruesas, ojitos negros con brillo, boca grande */
const browFace = (p: Pen, cx: number, cy: number, expr: Expr, look: Look = [0, 0], blink = 0) => {
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
  const legA = wk === undefined ? 0 : Math.sin(wk * Math.PI * 2) * 50, bob = wk === undefined ? 0 : Math.abs(Math.cos(wk * Math.PI * 2)) * 8;
  p.g.save(); p.g.translate(0, -bob);
  // piernas de palito y zapatitos
  p.stroke([[274, 750], [252 + legA, 966 + bob]], lw); p.stroke([[326, 750], [348 - legA, 966 + bob]], lw);
  p.ell(248 + legA, 968 + bob, 28, 13, INK, 0); p.ell(352 - legA, 968 + bob, 28, 13, INK, 0);
  // cuello + torso en cápsula blanca con sombra a la derecha
  p.stroke([[300, 450], [300, 520]], lw);
  p.poly(capsule(222, 378, 496, 772), WHITE, 0);
  p.poly(capsule(300, 378, 510, 760).map(([x, y]) => [Math.max(x, 350), y] as P2), SHADE, 0);
  p.poly(capsule(222, 378, 496, 772), null, 13);
  // cola de la bufanda que ondea (detrás de los brazos)
  const tail: P2[] = [[322, 508]];
  for (let i = 1; i <= 6; i++) tail.push([322 + i * 13 + Math.sin(ph + i * 0.8) * 9 * (i / 6), 508 + i * 24]);
  p.poly([...tail.map(([x, y]) => [x - 17, y] as P2), ...tail.slice().reverse().map(([x, y]) => [x + 17, y + 4] as P2)], BLUE, 8);
  p.stroke([[322 + 6 * 13 - 14, 508 + 6 * 24 - 2], [322 + 6 * 13 + 14, 508 + 6 * 24 + 2]], 4, BLUE_D);
  // brazos de palito
  const arm = o.arm ?? "down";
  const [le, lh] = arm === "fly" || arm === "cheer" || arm === "cover" || arm === "hug" ? armPose(arm, SH_L, -1, wk ?? 0, 1) : armPose("down", SH_L, -1, wk ?? 0, 1);
  p.stroke([SH_L, le, lh], lw); p.dot(lh[0], lh[1], 13);
  let re: P2, rh: P2;
  if (arm === "up") { rh = stickyHand(o); re = [392, 440]; } else [re, rh] = rightArm(arm, SH_R, 1, wk ?? 0);
  p.stroke([SH_R, re, rh], lw);
  // cabeza ovalada blanca con sombra gris (lado derecho y abajo)
  p.ell(300, 292, 150, 162, SHADE, 0);
  p.ell(288, 280, 136, 150, WHITE, 0);
  p.ell(300, 292, 150, 162, null, 14);
  browFace(p, 292, 300, o.expr, o.look, o.blink ?? 0);
  // bufanda: vuelta al cuello + nudo + punta corta al frente
  p.ell(300, 490, 78, 30, BLUE, 9);
  p.arc(300, 478, 66, 20, 20, 160, 5, BLUE_D);
  p.poly([[276, 500], [304, 504], [296, 600], [264, 592]], BLUE, 8);
  p.stroke([[268, 582], [298, 588]], 4, BLUE_D);
  p.ell(286, 506, 22, 18, BLUE, 8);
  if (arm !== "up" && arm !== "down") held(p, arm, rh, 1); else p.dot(rh[0], rh[1], 13);
  p.g.restore();
};

// ---------------- background people ----------------
export type Hat = "none" | "cap" | "tophat" | "bowler" | "beanie" | "cowboy" | "bow" | "hair" | "pony" | "helmet" | "chef";
export type PersonOpts = {
  hat?: Hat; hatCol?: string; stache?: "thick" | "curly" | "thin"; beard?: string; glasses?: boolean; tie?: string; bag?: string; cane?: boolean;
  expr: Expr; arm?: Arm; look?: Look; walk?: number; blink?: number; skin?: string;
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
export const person = (p: Pen, o: PersonOpts) => {
  const lw = 12, R = 110, HY = 380, NECK: P2 = [300, HY + R + 2], HIP: P2 = [300, 750], SHO: P2 = [300, 560], wk = o.walk;
  const legA = wk === undefined ? 0 : Math.sin(wk * Math.PI * 2) * 50, bob = wk === undefined ? 0 : Math.abs(Math.cos(wk * Math.PI * 2)) * 8;
  p.g.save(); p.g.translate(0, -bob);
  p.stroke([HIP, [250 + legA, 968 + bob]], lw); p.stroke([HIP, [350 - legA, 968 + bob]], lw);
  p.ell(240 + legA, 970 + bob, 26, 11, INK, 0); p.ell(360 - legA, 970 + bob, 26, 11, INK, 0);
  p.stroke([NECK, HIP], lw);
  if (o.tie) p.poly([[300, NECK[1] + 6], [314, NECK[1] + 30], [306, NECK[1] + 120], [300, NECK[1] + 135], [294, NECK[1] + 120], [286, NECK[1] + 30]], o.tie, 5);
  if (o.bag) { p.stroke([[300, NECK[1] + 20], [380, 700]], 6, o.bag); p.poly([[360, 690], [430, 690], [430, 760], [360, 760]], o.bag, 7); }
  const arm = o.arm ?? "down";
  const [le, lh] = armPose(arm === "cheer" || arm === "fly" || arm === "up" || arm === "cover" || arm === "hug" ? arm : "down", SHO, -1, wk ?? 0, 0.9);
  p.stroke([SHO, le, lh], lw); p.dot(lh[0], lh[1], 11);
  const [re, rh] = rightArm(arm, SHO, 0.9, wk ?? 0);
  p.stroke([SHO, re, rh], lw);
  if (o.cane) { p.stroke([[rh[0], rh[1]], [rh[0] + 10, 968]], 9, "#7a4b2a"); p.arc(rh[0] - 14, rh[1], 22, 18, 180, 360, 9, "#7a4b2a"); }
  if (o.hat === "pony" || o.hat === "bow") {} // drawn on top
  p.ell(300, HY, R, R * 0.96, o.skin ?? WHITE, 13);
  p.arc(318, HY + 22, R * 0.86, R * 0.8, 10, 120, 8, "#d8dde8");
  face(p, 300, HY, R, o.expr, o.look, o.blink ?? 0);
  const k = R / 150;
  if (o.glasses) { for (const sx of [-1, 1]) p.ell(300 + sx * 52 * k, HY - 30 * k, 46 * k, 40 * k, null, 7); p.stroke([[300 - 8 * k, HY - 32 * k], [300 + 8 * k, HY - 32 * k]], 6); }
  if (o.beard) p.ell(300, HY + 72 * k, 80 * k, 46 * k, o.beard, 7, 0, 180);
  if (o.stache) {
    const my = HY + 30 * k;
    if (o.stache === "curly") { p.arc(300 - 30 * k, my, 30 * k, 16 * k, 0, 200, 12 * k); p.arc(300 + 30 * k, my, 30 * k, 16 * k, -20, 180, 12 * k); }
    else p.poly([[300, my - 10 * k], [300 + 52 * k, my - 2 * k], [300 + 46 * k, my + 14 * k], [300, my + 6 * k], [300 - 46 * k, my + 14 * k], [300 - 52 * k, my - 2 * k]], INK, o.stache === "thin" ? 2 : 4);
  }
  hatDraw(p, o, 300, HY, R);
  if (arm !== "down" && arm !== "up" && arm !== "cheer" && arm !== "fly" && arm !== "wave" && arm !== "point" && arm !== "cover" && arm !== "hug") held(p, arm, rh, 0.9); else p.dot(rh[0], rh[1], 11);
  p.g.restore();
};

// ---------------- animals (side view, facing screen-right) ----------------
export type AnimalOpts = { coat: string; walk?: number; mood?: "calm" | "scared" | "howl" | "sleep" | "bark"; spot?: string };
const legs4 = (p: Pen, x0: number, x1: number, y: number, ph: number | undefined, len: number, w: number) => {
  const a = ph === undefined ? 0 : Math.sin(ph * Math.PI * 2) * 30;
  for (const [x, s] of [[x0, 1], [x0 + 30, -1], [x1, -1], [x1 + 30, 1]] as const) p.stroke([[x, y], [x + a * s, y + len]], w);
};
export const dog = (p: Pen, o: AnimalOpts) => {
  const y = 780, ph = o.walk;
  legs4(p, 150, 360, y, ph, 190, 12);
  p.stroke([[140, y], [420, y - 10]], 22); // body
  const wag = ph === undefined ? 0 : Math.sin(ph * 12.6) * 20;
  p.stroke([[140, y], [100 + wag, y - 80]], 11);
  const hx = 470, hy = y - (o.mood === "howl" ? 150 : 90);
  p.ell(hx, hy, 72, 64, o.coat, 11);
  if (o.spot) p.ell(hx - 20, hy - 18, 26, 22, o.spot, 0);
  p.ell(hx - 40, hy - 10, 26, 50, o.spot ?? "#6b4a2a", 8, 0, 360, 15); // ear
  p.dot(hx + 70, hy + (o.mood === "howl" ? -20 : 6), 13); // nose
  if (o.mood === "sleep") p.arc(hx + 22, hy - 12, 16, 10, 20, 160, 7); else p.dot(hx + 22, hy - 16, o.mood === "scared" ? 8 : 11);
  if (o.mood === "scared") p.ell(hx + 22, hy - 16, 18, 20, null, 6);
  if (o.mood === "bark" || o.mood === "howl") p.ell(hx + 46, hy + 34, 18, 14, MOUTH, 6);
  else p.arc(hx + 40, hy + 26, 20, 12, 20, 160, 7);
  p.poly([[440, y - 50], [500, y - 40], [500, y - 26], [440, y - 34]], "#d84a3a", 5); // collar
};
export const cat = (p: Pen, o: AnimalOpts) => {
  const y = 840, ph = o.walk;
  legs4(p, 200, 340, y, ph, 130, 10);
  p.stroke([[190, y], [380, y - 6]], 18);
  const curl: P2[] = []; for (let i = 0; i <= 12; i++) { const t = i / 12; curl.push([190 - 40 * t - Math.sin(t * 5) * 20, y - 140 * t]); }
  p.stroke(curl, 10);
  const hx = 420, hy = y - 70, up = o.mood === "scared" ? -20 : 0;
  p.poly([[hx - 50, hy - 30 + up], [hx - 40, hy - 95 + up], [hx - 10, hy - 50 + up]], o.coat, 8);
  p.poly([[hx + 10, hy - 50 + up], [hx + 40, hy - 95 + up], [hx + 50, hy - 30 + up]], o.coat, 8);
  p.ell(hx, hy + up, 58, 52, o.coat, 10);
  for (const sx of [-1, 1]) { p.ell(hx + sx * 22, hy - 8 + up, 11, o.mood === "scared" ? 16 : 13, "#f3e06a", 5); p.ell(hx + sx * 22, hy - 8 + up, 3, 9, INK, 0); }
  p.dot(hx, hy + 14 + up, 6, "#e86e78");
  for (const sx of [-1, 1]) for (const dy of [-6, 8]) p.stroke([[hx + sx * 24, hy + 20 + up], [hx + sx * 80, hy + 14 + dy + up]], 3);
};
export const bird = (p: Pen, o: AnimalOpts & { fly?: boolean }) => {
  const y = o.fly ? 700 : 900;
  if (!o.fly) { p.stroke([[290, y + 30], [280, 972]], 6); p.stroke([[320, y + 30], [330, 972]], 6); }
  p.ell(300, y, 70, 46, o.coat, 9);
  p.ell(360, y - 46, 34, 32, o.coat, 8);
  p.poly([[390, y - 50], [430, y - 42], [390, y - 36]], "#f2a03a", 5);
  p.dot(368, y - 52, 7);
  const flap = o.fly ? Math.sin((o.walk ?? 0) * 6.28) * 60 : 0;
  p.poly([[280, y - 10], [340, y - 10], [300, y - 70 - flap]], o.spot ?? "#8a8fa0", 7);
};
export const turtle = (p: Pen, o: AnimalOpts) => {
  const y = 900, ph = o.walk ?? 0, a = Math.sin(ph * 6.28) * 14;
  for (const [x, s] of [[230, 1], [360, -1]] as const) { p.ell(x + a * s, y + 40, 26, 18, "#7fbf6a", 6); }
  p.ell(420, y + 4, 40, 30, "#7fbf6a", 7); p.dot(436, y - 2, 6);
  p.ell(300, y + 10, 110, 70, o.coat, 9, 180, 360);
  p.stroke([[190, y + 10], [410, y + 10]], 9);
  for (const x of [250, 300, 350]) p.stroke([[x, y - 50], [x, y + 10]], 5, "#2e5a2a");
};
export const penguin = (p: Pen, o: AnimalOpts) => {
  const y = 760, a = o.walk === undefined ? 0 : Math.sin(o.walk * 6.28) * 0.08;
  p.g.save(); p.g.translate(300, 975); p.g.rotate(a); p.g.translate(-300, -975);
  p.ell(300, y, 120, 190, "#20202a", 10);
  p.ell(300, y + 30, 82, 150, "#ffffff", 0);
  p.ell(300, y - 130, 80, 74, "#20202a", 0);
  for (const sx of [-1, 1]) { p.ell(300 + sx * 28, y - 140, 16, 18, "#ffffff", 4); p.dot(300 + sx * 28, y - 138, 7); }
  p.poly([[280, y - 112], [320, y - 112], [300, y - 86]], "#f2a03a", 5);
  for (const sx of [-1, 1]) p.ell(300 + sx * 118, y + 10, 26, 90, "#20202a", 8, 0, 360, sx * -15);
  for (const sx of [-1, 1]) p.ell(300 + sx * 46, 960, 40, 16, "#f2a03a", 6);
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
  const y = 640, ph = o.walk;
  legs4(p, 150, 380, y + 60, ph, 270, 16);
  p.ell(280, y, 200, 110, "#ffffff", 12);
  for (const [x, yy, r] of [[220, y - 30, 50], [330, y + 30, 40], [380, y - 50, 30]]) p.ell(x, yy, r, r * 0.8, "#2a2a32", 0);
  p.ell(280, y, 200, 110, null, 12);
  p.stroke([[90, y - 20], [60, y + 120]], 10); p.ell(58, y + 132, 14, 20, "#2a2a32", 0);
  const hx = 500, hy = y - 70 - (o.mood === "scared" ? 20 : 0);
  p.ell(hx, hy, 80, 70, "#ffffff", 11);
  p.ell(hx + 30, hy + 40, 55, 36, "#f7b6c8", 9);
  p.dot(hx + 14, hy + 40, 7); p.dot(hx + 46, hy + 40, 7);
  p.dot(hx - 10, hy - 18, o.mood === "scared" ? 8 : 12);
  for (const s of [-1, 1]) p.poly([[hx - 30 + s * 30, hy - 60], [hx - 20 + s * 40, hy - 110], [hx - 4 + s * 30, hy - 58]], "#f2e6c8", 6);
  p.ell(hx - 70, hy - 30, 34, 16, "#ffffff", 8);
};
export const chicken = (p: Pen, o: AnimalOpts) => {
  const y = 860, ph = o.walk ?? 0, a = Math.sin(ph * 6.28) * 20;
  p.stroke([[290, y + 40], [280 + a, 972]], 8, "#f2a03a"); p.stroke([[320, y + 40], [330 - a, 972]], 8, "#f2a03a");
  p.ell(300, y, 80, 62, "#ffffff", 9);
  p.poly([[230, y - 30], [190, y - 70], [200, y - 10]], "#ffffff", 7);
  p.ell(370, y - 64, 40, 38, "#ffffff", 8);
  p.poly([[402, y - 70], [440, y - 60], [402, y - 52]], "#f2a03a", 5);
  p.poly([[355, y - 100], [368, y - 124], [380, y - 102], [392, y - 122], [398, y - 96]], "#e62117", 5);
  p.ell(398, y - 40, 10, 14, "#e62117", 4);
  p.dot(378, y - 70, o.mood === "scared" ? 5 : 7);
};
export const pig = (p: Pen, o: AnimalOpts) => {
  const y = 820;
  legs4(p, 200, 350, y + 40, o.walk, 110, 13);
  p.ell(290, y, 150, 90, "#f7a8c0", 11);
  const curl: P2[] = []; for (let i = 0; i <= 10; i++) curl.push([140 - i * 4, y - 20 - Math.sin(i * 0.9) * 16]); p.stroke(curl, 7);
  p.ell(430, y - 20, 66, 58, "#f7a8c0", 10);
  p.ell(480, y - 6, 26, 20, "#f48aa8", 7); p.dot(474, y - 6, 4); p.dot(488, y - 6, 4);
  p.dot(440, y - 40, 9);
  p.poly([[400, y - 70], [420, y - 110], [440, y - 70]], "#f48aa8", 6);
};
export const fishCard = (p: Pen, o: AnimalOpts) => {
  const y = 500;
  p.ell(280, y, 170, 100, o.coat, 11);
  if (o.spot) for (const x of [220, 290]) p.poly([[x, y - 96], [x + 30, y - 96], [x + 20, y + 96], [x - 10, y + 96]], o.spot, 0);
  p.ell(280, y, 170, 100, null, 11);
  p.poly([[440, y], [560, y - 90], [560, y + 90]], o.coat, 10);
  p.poly([[260, y - 90], [320, y - 160], [340, y - 92]], o.coat, 8);
  p.ell(180, y - 20, 28, 28, "#ffffff", 7); p.dot(172, y - 20, 13);
  p.arc(150, y + 30, 20, 12, 20, 160, 6);
};
export const beetle = (p: Pen, o: AnimalOpts) => {
  const y = 900, a = Math.sin((o.walk ?? 0) * 6.28) * 14;
  for (const [x, s] of [[230, 1], [300, -1], [370, 1]] as const) { p.stroke([[x, y], [x - 30 + a * s, 972]], 6); p.stroke([[x, y], [x + 30 - a * s, 972]], 6); }
  p.ell(300, y - 20, 110, 70, o.coat, 9);
  p.stroke([[300, y - 88], [300, y + 48]], 5);
  p.ell(420, y - 10, 36, 30, "#2a2a32", 7);
  p.stroke([[440, y - 34], [470, y - 70]], 5); p.stroke([[450, y - 26], [490, y - 50]], 5);
  p.ell(260, y - 46, 24, 12, "rgba(255,255,255,0.5)", 0);
  // its dung ball
  p.ell(150, y + 10, 64, 62, "#8a5a34", 8);
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
