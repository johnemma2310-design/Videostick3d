// OBJETOS (props) como tarjetas: satélites, celular, cono, reloj, letrero, muñeco de nieve, oso polar, paraguas, mapa, nube,
// planeta, linterna, foco, pasto, arbusto, pino, poste... Van en la tarjeta normal (600 x 1000 de diseño, piso en y = 975)
// con el mismo cel-shading del elenco. Uso en una historia:
//   { kind: "prop", o: { tipo: "cono" }, x, z, s: 0.5 }      (s = escala; con s = 1 la tarjeta mide 1.3 x 2.16 m)
// Con `y` > 0 flotan (y no proyectan sombra); en el piso proyectan su silueta como el resto.
// capaCerca(): pone pasto, arbustos, pinos o postes MUY cerca de la cámara en una esquina para que el desenfoque de lente los
// borre y den profundidad (ver BIBLIA/ESCENARIOS.md «Objetos (props)» y «Profundidad»).
import { Pen, INK, shade, mix } from "./toon";
import { cel, celPaint, sombra } from "./stick";
import type { Cam, Card, V3 } from "./types";

type P2 = [number, number];
const WHITE = "#ffffff";
export type PropTipo =
  | "satelite" | "celular" | "cono" | "reloj" | "letrero" | "muneco" | "oso" | "bola" | "paraguas" | "mapa" | "nube"
  | "planeta" | "linterna" | "foco" | "router" | "zzz" | "rayo" | "moneda" | "papel"
  | "pasto" | "arbusto" | "pino" | "poste" | "planta" | "charco"
  | "lupa" | "rayosx" | "molcajete" | "maiz" | "pan" | "piedras" | "costal" | "pecera" | "branquias" | "tanque" | "burbujas" | "mesa" | "piedrita";
export type PropOpts = {
  tipo: PropTipo;
  /** encendido (satélite, foco, router, linterna, nube con lluvia, poste con luz) */
  on?: boolean;
  /** número libre: derretido del muñeco 0..1, ángulo del minutero del reloj (rad), giro del planeta, paso del oso */
  k?: number;
  /** texto (letrero) o pantalla del celular: "mapa" | "blanco" | "senal" | "negro" */
  txt?: string;
  /** color principal (letrero, paraguas, planeta, pasto...) */
  col?: string;
  /** planeta: con anillos (Urano) */
  anillos?: boolean;
};

const EP = (cx: number, cy: number, rx: number, ry: number, rot = 0): P2[] => {
  const o: P2[] = [], c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180);
  for (let a = 0; a < 360; a += 8) { const x = rx * Math.cos((a * Math.PI) / 180), y = ry * Math.sin((a * Math.PI) / 180); o.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return o;
};
const celE = (p: Pen, cx: number, cy: number, rx: number, ry: number, col: string, ol = 10, rot = 0) => cel(p, EP(cx, cy, rx, ry, rot), col, ol, 0.1);
const rect = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const rrect = (x0: number, y0: number, x1: number, y1: number, r: number): P2[] => {
  const o: P2[] = [];
  const c = (cx: number, cy: number, a0: number) => { for (let a = a0; a <= a0 + 90; a += 15) o.push([cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)]); };
  c(x1 - r, y0 + r, 270); c(x1 - r, y1 - r, 0); c(x0 + r, y1 - r, 90); c(x0 + r, y0 + r, 180);
  return o;
};
const text = (p: Pen, s: string, x: number, y: number, size: number, fill: string, w = 10) => {
  const g = p.g; g.save(); g.font = `900 ${size}px 'Arial Black', Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = w; g.strokeStyle = INK; g.strokeText(s, x, y); g.fillStyle = fill; g.fillText(s, x, y); g.restore();
};

// ---------- pantalla del celular ----------
const pantalla = (p: Pen, x0: number, y0: number, x1: number, y1: number, modo: string) => {
  const g = p.g, w = x1 - x0, h = y1 - y0;
  g.save(); p.path(rect(x0, y0, x1, y1), true); g.clip();
  if (modo === "negro") { g.fillStyle = "#101018"; g.fillRect(x0, y0, w, h); }
  else if (modo === "blanco") { g.fillStyle = "#f4f6fa"; g.fillRect(x0, y0, w, h); text(p, "?", x0 + w / 2, y0 + h * 0.45, h * 0.42, "#ff4d4d", 14); text(p, "SIN GPS", x0 + w / 2, y0 + h * 0.8, h * 0.1, "#ff4d4d", 8); }
  else {
    g.fillStyle = "#cfeec0"; g.fillRect(x0, y0, w, h);
    g.fillStyle = "#8fd0ff"; p.path([[x0, y0 + h * 0.62], [x0 + w * 0.4, y0 + h * 0.7], [x0 + w * 0.6, y0 + h], [x0, y0 + h]], true); g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = w * 0.07; g.lineCap = "round";
    for (const [a, b, c, d] of [[0, 0.3, 1, 0.42], [0.35, 0, 0.55, 1], [0.1, 0.9, 0.9, 0.12]]) { g.beginPath(); g.moveTo(x0 + a * w, y0 + b * h); g.lineTo(x0 + c * w, y0 + d * h); g.stroke(); }
    if (modo === "senal") { // pin rojo en "tú estás aquí" + barras de señal
      const px = x0 + w * 0.46, py = y0 + h * 0.42;
      p.poly([[px, py + h * 0.1], [px - w * 0.12, py - h * 0.02], [px, py - h * 0.12], [px + w * 0.12, py - h * 0.02]], "#e8263a", 6);
      p.ell(px, py - h * 0.03, w * 0.05, w * 0.05, WHITE, 0);
      for (let i = 0; i < 4; i++) p.poly(rect(x0 + w * (0.62 + i * 0.08), y0 + h * (0.14 - i * 0.025), x0 + w * (0.68 + i * 0.08), y0 + h * 0.17), "#3fa34d", 3);
    }
  }
  g.restore(); p.poly(rect(x0, y0, x1, y1), null, 6);
};

/** dibuja un objeto en la tarjeta de 600 x 1000 (piso en y = 975) */
export const drawProp = (p: Pen, o: PropOpts) => {
  const g = p.g, k = o.k ?? 0;
  switch (o.tipo) {
    case "satelite": { // cuerpo dorado, dos paneles solares, antena con plato y foquito
      const on = !!o.on, pan = on ? "#2f6fd6" : "#4a4a58", grid = on ? "#9fd4ff" : "#6a6a78";
      for (const sx of [-1, 1]) {
        p.stroke([[300 + sx * 70, 500], [300 + sx * 110, 500]], 12);
        const x0 = sx < 0 ? 20 : 410, x1 = sx < 0 ? 190 : 580;
        celPaint(p, rect(x0, 420, x1, 580), (lit) => {
          g.fillStyle = lit ? pan : shade(pan, 0.75); g.fillRect(-2000, -2000, 6000, 6000);
          g.strokeStyle = grid; g.lineWidth = 6; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x0 + ((x1 - x0) * i) / 4, 420); g.lineTo(x0 + ((x1 - x0) * i) / 4, 580); g.stroke(); }
          g.beginPath(); g.moveTo(x0, 500); g.lineTo(x1, 500); g.stroke();
        }, 9, 0.08);
      }
      cel(p, rrect(225, 420, 375, 590, 22), on ? "#f2b632" : "#a8946a", 11, 0.12);
      for (let i = 0; i < 3; i++) p.stroke([[240, 450 + i * 45], [360, 450 + i * 45]], 4, on ? "#c98a1a" : "#7a6a4a");
      p.stroke([[300, 420], [300, 340]], 9);
      cel(p, [[230, 330], [370, 330], [340, 290], [260, 290]], "#e4e8f0", 8, 0.06);
      p.ell(300, 280, 16, 16, on ? (Math.floor(k * 2) % 2 ? "#3aff6a" : "#c8ffd8") : "#3a3a44", 6);
      if (!on) { p.stroke([[262, 470], [288, 496]], 9); p.stroke([[288, 470], [262, 496]], 9); p.stroke([[312, 470], [338, 496]], 9); p.stroke([[338, 470], [312, 496]], 9); p.arc(300, 552, 26, 12, 200, 340, 7); }
      else { p.dot(275, 482, 10); p.dot(325, 482, 10); p.arc(300, 532, 24, 14, 20, 160, 7); }
      return;
    }
    case "celular": { // teléfono grande de frente; txt = pantalla
      cel(p, rrect(140, 120, 460, 900, 46), "#2a2a36", 12, 0.08);
      pantalla(p, 166, 190, 434, 820, o.txt ?? "mapa");
      p.ell(300, 860, 22, 22, "#4a4a58", 5); p.stroke([[262, 156], [338, 156]], 8, "#4a4a58");
      return;
    }
    case "cono": {
      const c = o.col ?? "#f27a1a";
      cel(p, [[120, 975], [480, 975], [460, 925], [140, 925]], "#2a2a32", 9, 0.06);
      celPaint(p, [[175, 925], [425, 925], [320, 420], [280, 420]], (lit) => {
        g.fillStyle = lit ? c : sombra(c); g.fillRect(-2000, -2000, 6000, 6000);
        g.fillStyle = lit ? WHITE : "#dfe3ea"; g.fillRect(0, 560, 600, 70); g.fillRect(0, 730, 600, 80);
      }, 11, 0.12);
      return;
    }
    case "reloj": { // reloj de pared: el minutero apunta a k (rad), la aguja corta a k / 12
      celE(p, 300, 500, 250, 250, o.col ?? "#e8402e", 13);
      celE(p, 300, 500, 205, 205, "#fff8e6", 9);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? 178 : 160; p.stroke([[300 + Math.sin(a) * r0, 500 - Math.cos(a) * r0], [300 + Math.sin(a) * 195, 500 - Math.cos(a) * 195]], i % 3 ? 7 : 13); }
      const h = k / 12;
      p.stroke([[300, 500], [300 + Math.sin(h) * 105, 500 - Math.cos(h) * 105]], 20);
      p.stroke([[300, 500], [300 + Math.sin(k) * 165, 500 - Math.cos(k) * 165]], 12);
      p.ell(300, 500, 18, 18, INK, 0);
      for (const sx of [-1, 1]) { p.ell(300 + sx * 150, 270, 40, 40, "#ffd23f", 8); }
      return;
    }
    case "letrero": { // cartel con texto (k = 1: con postes hasta el piso)
      const c = o.col ?? "#2f86d6", t = o.txt ?? "";
      if (k > 0.5) for (const x of [150, 450]) cel(p, rect(x - 14, 520, x + 14, 975), "#8a6a4a", 8, 0.05);
      cel(p, rrect(10, 300, 590, 560, 30), c, 13, 0.06);
      p.poly(rrect(34, 322, 566, 538, 20), null, 5);
      text(p, t, 300, 432, Math.min(150, 900 / Math.max(3, [...t].length)), WHITE, 14);
      return;
    }
    case "muneco": { // muñeco de nieve; k = derretido 0..1 (se hunde y queda un charco)
      const m = Math.min(1, Math.max(0, k)), sq = 1 - 0.75 * m, wx = 1 + 0.35 * m;
      celE(p, 300, 965, 150 + 150 * m, 22 + 10 * m, "#bfe6ff", 8);
      const y2 = 975 - 150 * sq, y1 = y2 - 230 * sq * 0.9, y0 = y1 - 170 * sq * 0.9;
      celE(p, 300, y2 + 10 * m, 165 * wx, 150 * sq, WHITE, 12);
      if (m < 0.85) celE(p, 300, y1, 125 * wx, 115 * sq, WHITE, 11);
      if (m < 0.7) {
        celE(p, 300, y0, 95, 90 * (1 - 0.3 * m), WHITE, 10);
        for (const sx of [-1, 1]) p.dot(300 + sx * 32, y0 - 18, 11);
        cel(p, [[300, y0 + 4], [392, y0 + 22], [300, y0 + 30]], "#f27a1a", 6, 0.05);
        p.arc(300, y0 + 42, 36, 16, 20, 160, 6);
        cel(p, [[220, y0 + 70], [380, y0 + 70], [380, y0 + 96], [220, y0 + 96]], "#e8263a", 7, 0.05);
        if (m < 0.4) { p.stroke([[300 - 120 * wx, y1], [300 - 210, y1 - 90]], 10, "#7a5236"); p.stroke([[300 + 120 * wx, y1], [300 + 210, y1 - 90]], 10, "#7a5236"); }
        for (let i = 0; i < 3; i++) p.dot(300, y1 - 50 + i * 50, 10);
      }
      if (m > 0.15) for (let i = 0; i < 5; i++) celE(p, 180 + i * 60, y2 - 60 + ((i * 37) % 50), 9, 15, "#8fd8ff", 4);
      return;
    }
    case "oso": { // oso polar de lado (mira a la derecha); k = paso; on = de pie y feliz
      const sw = Math.sin(k * Math.PI * 2) * 26, coat = "#f4f7fb";
      for (const [x, s] of [[150, 1], [205, -1], [380, -1], [430, 1]] as const) { cel(p, rrect(x - 30 + sw * s * 0.5, 800, x + 30 + sw * s * 0.5, 960, 26), sombra(coat, 0.9), 9, 0.05); }
      celE(p, 290, 760, 210, 120, coat, 12);
      const hx = 500, hy = o.on ? 600 : 660;
      for (const sx of [-1, 1]) celE(p, hx + sx * 40 - 10, hy - 64, 24, 22, coat, 8);
      celE(p, hx, hy, 82, 72, coat, 11);
      celE(p, hx + 64, hy + 18, 44, 32, mix(coat, "#e8eef8", 0.5), 8);
      p.ell(hx + 100, hy + 6, 16, 13, INK, 0);
      p.ell(hx + 16, hy - 18, 10, 13, INK, 0); p.ell(hx + 12, hy - 23, 3.5, 3.5, WHITE, 0);
      p.arc(hx + 70, hy + 36, 22, 14, 20, 160, 7);
      if (o.on) p.ell(hx + 72, hy + 42, 16, 12, "#5a1e28", 5);
      return;
    }
    case "bola": celE(p, 300, 500, 120, 115, WHITE, 11); p.ell(260, 460, 30, 22, "#eef6ff", 0); return;
    case "paraguas": { // abierto, con mango en J (el mango llega a y = 860)
      const c = o.col ?? "#e8263a";
      p.stroke([[300, 330], [300, 820]], 14); p.arc(330, 820, 30, 34, 0, 180, 14);
      const can: P2[] = [[20, 340]];
      for (let a = 180; a <= 360; a += 10) can.push([300 + 280 * Math.cos((a * Math.PI) / 180), 340 + 230 * Math.sin((a * Math.PI) / 180)]);
      for (let i = 0; i < 4; i++) { const x0 = 580 - i * 140; for (let a = 0; a <= 180; a += 30) can.push([x0 - 70 + 70 * Math.cos((a * Math.PI) / 180), 340 + 26 * Math.sin((a * Math.PI) / 180)]); }
      celPaint(p, can, (lit) => {
        g.fillStyle = lit ? c : sombra(c); g.fillRect(-2000, -2000, 6000, 6000);
        g.fillStyle = lit ? WHITE : "#dfe3ea"; for (const x of [160, 440]) { p.path([[300, 110], [x - 60, 370], [x + 60, 370]], true); g.fill(); }
      }, 12, 0.1);
      p.ell(300, 108, 12, 14, INK, 0);
      return;
    }
    case "mapa": { // mapa de papel desplegado y arrugado
      const pts: P2[] = [[20, 120], [210, 150], [400, 110], [580, 140], [570, 860], [390, 890], [200, 850], [30, 880]];
      celPaint(p, pts, (lit) => {
        g.fillStyle = lit ? "#fbf3d6" : "#e6d9b0"; g.fillRect(-2000, -2000, 6000, 6000);
        g.fillStyle = lit ? "#9fd4ff" : "#7fb4df"; p.path([[30, 600], [200, 560], [320, 700], [200, 850], [30, 880]], true); g.fill();
        g.fillStyle = lit ? "#a8dd8a" : "#88bd6a"; p.path([[380, 200], [540, 230], [520, 420], [400, 400]], true); g.fill();
        g.strokeStyle = "#e8402e"; g.lineWidth = 16; g.lineCap = "round"; g.setLineDash([30, 26]);
        g.beginPath(); g.moveTo(80, 300); g.bezierCurveTo(250, 200, 300, 600, 470, 520); g.stroke(); g.setLineDash([]);
        g.strokeStyle = "#c9b98a"; g.lineWidth = 6; for (const x of [210, 400]) { g.beginPath(); g.moveTo(x, 110); g.lineTo(x - 10, 890); g.stroke(); }
      }, 11, 0.1);
      text(p, "X", 470, 520, 120, "#e8263a", 12);
      text(p, "CASA", 300, 200, 70, "#2f86d6", 9);
      return;
    }
    case "nube": { // nube gorda (gris si llueve); on = con gotas
      const c = o.col ?? (o.on ? "#9aa4b8" : "#ffffff");
      const pts: P2[] = [];
      const bumps: [number, number, number][] = [[110, 560, 100], [220, 470, 130], [360, 450, 140], [490, 540, 100], [300, 600, 150]];
      for (let a = 0; a < 360; a += 6) {
        const r = (a * Math.PI) / 180; let best = 0;
        for (const [bx, by, br] of bumps) { const dx = Math.cos(r), dy = Math.sin(r), ox = bx - 300, oy = by - 540, b = ox * dx + oy * dy, c2 = ox * ox + oy * oy - br * br, d = b * b - c2; if (d >= 0) best = Math.max(best, b + Math.sqrt(d)); }
        pts.push([300 + Math.cos(r) * best, 540 + Math.sin(r) * Math.min(best, 160)]);
      }
      cel(p, pts, c, 12, 0.08);
      if (o.on) for (let i = 0; i < 9; i++) { const x = 90 + i * 52, y = 760 + ((i * 53 + Math.floor(k * 40)) % 180); p.poly([[x, y - 26], [x + 12, y], [x, y + 12], [x - 12, y]], "#5fb8ff", 4); }
      return;
    }
    case "planeta": { // Tierra (por defecto) o Urano (col celeste + anillos); k = giro de los continentes
      const c = o.col ?? "#2f7fd0", R = 250, cy = 500;
      if (o.anillos) p.ell(300, cy, 40, 290, null, 14, 90, 270);
      celPaint(p, EP(300, cy, R, R), (lit) => {
        g.fillStyle = lit ? c : shade(c, 0.6); g.fillRect(-2000, -2000, 6000, 6000);
        if (!o.anillos) {
          g.fillStyle = lit ? "#5fb34e" : "#3f8a3a";
          for (let i = 0; i < 5; i++) { const x = 300 + ((((i * 170 + k * 200) % 700) + 700) % 700) - 350, y = cy - 150 + i * 70; p.path(EP(x, y, 70 + (i % 2) * 30, 40 + (i % 3) * 14, i * 20), true); g.fill(); }
          g.fillStyle = lit ? WHITE : "#dfe3ea"; p.path(EP(300, cy - R + 20, 120, 40), true); g.fill(); p.path(EP(300, cy + R - 20, 120, 40), true); g.fill();
        } else { g.fillStyle = lit ? "#bff4f4" : "#7fc8cc"; for (let i = -2; i <= 2; i++) g.fillRect(-2000, cy + i * 70 - 12, 6000, 24); }
      }, 12, 0.18);
      p.stroke([[300, cy - R - 80], [300, cy + R + 80]], 10, "#ff5a4a");
      if (o.anillos) p.ell(300, cy, 40, 290, null, 14, -90, 90);
      return;
    }
    case "linterna": { // linterna tirada en el piso; on = con haz de luz
      if (o.on) cel(p, [[330, 870], [600, 760], [600, 975], [330, 920]], "#fff3a8", 0, 0);
      cel(p, rrect(60, 850, 300, 940, 30), "#d84a3a", 10, 0.1);
      cel(p, [[290, 830], [350, 810], [350, 980], [290, 960]], "#9aa4b4", 9, 0.06);
      p.ell(350, 895, 18, 82, o.on ? "#fff6b0" : "#3a3a44", 7);
      p.stroke([[120, 870], [240, 870]], 6, "#8a2a20");
      return;
    }
    case "foco": { // foco colgando del techo (cable desde arriba)
      p.stroke([[300, 0], [300, 420]], 8);
      cel(p, rect(262, 420, 338, 500), "#9aa4b4", 8, 0.05);
      celE(p, 300, 590, 100, 110, o.on ? "#fff07a" : "#6a6a78", 11);
      if (o.on) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; p.stroke([[300 + Math.cos(a) * 140, 590 + Math.sin(a) * 150], [300 + Math.cos(a) * 190, 590 + Math.sin(a) * 200]], 10, "#ffd23f"); }
      return;
    }
    case "router": { // cajita con antenas y foquitos
      for (const x of [200, 400]) p.stroke([[x, 800], [x + (x - 300) * 0.3, 600]], 12);
      cel(p, rrect(100, 790, 500, 960, 24), "#2a2a36", 10, 0.08);
      for (let i = 0; i < 4; i++) p.ell(180 + i * 80, 875, 18, 18, o.on ? ["#3aff6a", "#3aff6a", "#ffd23f", "#3aff6a"][i] : "#4a4a58", 5);
      return;
    }
    case "zzz": text(p, "Z", 230, 760, 160, "#9fd4ff", 12); text(p, "z", 350, 600, 120, "#9fd4ff", 10); text(p, "z", 440, 470, 90, "#9fd4ff", 9); return;
    case "rayo": { // señal del satélite al celular: rayita amarilla punteada con ondas
      g.save(); g.strokeStyle = INK; g.lineWidth = 30; g.setLineDash([60, 40]); g.lineCap = "round"; g.beginPath(); g.moveTo(300, 20); g.lineTo(300, 960); g.stroke();
      g.strokeStyle = "#ffd23f"; g.lineWidth = 18; g.stroke(); g.restore();
      for (let i = 0; i < 4; i++) { const y = 120 + ((i * 230 + k * 230) % 900); p.arc(300, y, 80, 30, 200, 340, 10, "#ffd23f"); }
      return;
    }
    case "moneda": celE(p, 300, 500, 110, 110, "#ffc83a", 11); text(p, "$", 300, 505, 130, "#e09a1a", 8); return;
    case "papel": cel(p, [[150, 300], [440, 330], [430, 720], [140, 690]], WHITE, 10, 0.06); for (let i = 0; i < 6; i++) p.stroke([[190, 380 + i * 50], [390, 400 + i * 50]], 7, "#8a94a8"); return;
    case "pasto": { // mata de pasto (o de nieve con col blanco) para el primer plano
      const c = o.col ?? "#4fae4a";
      for (let i = 0; i < 15; i++) { const x = 20 + i * 40, h = 220 + ((i * 97) % 160), lean = ((i * 53) % 60) - 30; cel(p, [[x - 22, 975], [x + 22, 975], [x + lean, 975 - h]], i % 2 ? c : mix(c, "#2f6a30", 0.25), 7, 0.1); }
      return;
    }
    case "arbusto": { const c = o.col ?? "#4fae4a"; for (const [x, y, r] of [[170, 780, 150], [430, 790, 140], [300, 660, 180]] as const) celE(p, x, y, r, r * 0.9, c, 11); celE(p, 300, 900, 260, 90, c, 0); return; }
    case "pino": { // pino nevado (col = color de las hojas)
      const c = o.col ?? "#2f7a4a";
      cel(p, rect(270, 840, 330, 975), "#7a5236", 8, 0.05);
      for (let i = 0; i < 3; i++) { const y = 860 - i * 230, w = 270 - i * 60; celPaint(p, [[300 - w, y], [300 + w, y], [300, y - 330]], (lit) => { g.fillStyle = lit ? c : sombra(c); g.fillRect(-2000, -2000, 6000, 6000); g.fillStyle = WHITE; p.path([[300 - w * 0.5, y - 160], [300 + w * 0.5, y - 160], [300, y - 330]], true); g.fill(); }, 11, 0.1); }
      return;
    }
    case "poste": { // poste de luz (con foco encendido si on)
      cel(p, rect(280, 60, 320, 975), "#3a3a48", 8, 0.04);
      p.stroke([[300, 70], [420, 70]], 14);
      celE(p, 430, 100, 50, 34, o.on ? "#fff07a" : "#6a6a78", 9);
      return;
    }
    case "planta": { // planta en maceta (interiores)
      for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; celE(p, 300 + Math.sin(a) * 120, 560 - Math.cos(a) * 160, 50, 110, i % 2 ? "#4fae4a" : "#3f8a3a", 9, (a * 180) / Math.PI); }
      cel(p, [[190, 700], [410, 700], [380, 975], [220, 975]], "#d8653a", 11, 0.1);
      return;
    }
    case "lupa": { // lupa grande con brillo
      p.line([[380, 640], [520, 900]], "#8a5a34", 46);
      celE(p, 300, 470, 190, 190, "#9aa4b4", 12);
      g.save(); g.globalAlpha = 0.3; p.ell(300, 470, 160, 160, "#cfefff", 0); g.restore();
      p.arc(300, 470, 120, 120, 200, 260, 14, WHITE); p.ell(300, 470, 160, 160, null, 9);
      return;
    }
    case "rayosx": { // placa de rayos X: gallina con la molleja (k = apretón 0..1) y piedritas dentro
      const sq = Math.abs(Math.sin(k * Math.PI)), cx = 300, cy = 500;
      cel(p, rrect(20, 150, 580, 850, 24), "#7a8aa8", 12, 0.04);
      p.poly(rrect(50, 180, 550, 820, 16), "#0d1f3a", 0);
      g.save(); g.strokeStyle = "#cfefff"; g.lineWidth = 12; g.lineJoin = "round";
      g.beginPath(); g.ellipse(cx - 10, cy + 60, 190, 150, 0, 0, 6.3); g.stroke();           // cuerpo
      g.beginPath(); g.ellipse(cx + 150, cy - 160, 70, 64, 0, 0, 6.3); g.stroke();             // cabeza
      g.beginPath(); g.moveTo(cx + 120, cy - 100); g.quadraticCurveTo(cx + 60, cy - 40, cx + 30, cy + 20); g.stroke(); // tubo
      for (const sx of [-30, 40]) { g.beginPath(); g.moveTo(cx + sx, cy + 200); g.lineTo(cx + sx - 10, cy + 300); g.stroke(); }
      g.restore();
      const mr = 92 - 26 * sq;
      celE(p, cx + 20, cy + 70, mr * 1.15, mr, "#ff7a8a", 9);                                     // molleja
      for (let i = 0; i < 7; i++) { const a = i * 0.9 + k * 3, r = (mr - 26) * ((i % 3) / 3 + 0.3); celE(p, cx + 20 + Math.cos(a) * r, cy + 70 + Math.sin(a) * r * 0.8, 15, 12, "#c9c4bc", 5); }
      text(p, "MOLLEJA", cx, 760, 58, "#ffd23f", 9);
      return;
    }
    case "molcajete": { // molcajete de piedra con tejolote que muele (k = fase) y maíz
      const a = Math.sin(k * Math.PI * 2);
      for (const sx of [-1, 0, 1]) cel(p, [[300 + sx * 120 - 30, 900], [300 + sx * 120 + 30, 900], [300 + sx * 110 + 20, 975], [300 + sx * 110 - 20, 975]], "#6a6a74", 8, 0.05);
      celPaint(p, [[90, 700], [510, 700], [470, 820], [400, 910], [200, 910], [130, 820]], (lit) => { g.fillStyle = lit ? "#7a7a84" : "#5a5a66"; g.fillRect(-2000, -2000, 6000, 6000); g.fillStyle = "rgba(40,40,50,0.35)"; for (let i = 0; i < 30; i++) { p.path(EP(120 + ((i * 97) % 360), 730 + ((i * 53) % 160), 6, 5), true); g.fill(); } }, 12, 0.1);
      p.ell(300, 700, 210, 40, "#4a4a56", 10);
      for (let i = 0; i < 9; i++) celE(p, 170 + i * 32, 690 + (i % 2) * 8, 16, 12, "#ffd23f", 4);
      g.save(); g.translate(300 + a * 60, 690); g.rotate(-0.5 + a * 0.25); cel(p, rrect(-34, -250, 34, 10, 30), "#8a8a94", 10, 0.08); g.restore();
      return;
    }
    case "maiz": { // mazorca
      cel(p, [[300, 230], [380, 330], [390, 700], [300, 780], [210, 700], [220, 330]], "#ffd23f", 11, 0.12);
      for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) p.ell(245 + c * 37, 330 + r * 48, 14, 18, null, 4);
      cel(p, [[300, 780], [200, 620], [150, 900]], "#6bbf4a", 9, 0.08); cel(p, [[300, 780], [400, 620], [450, 900]], "#4f9a3c", 9, 0.08);
      return;
    }
    case "pan": { celE(p, 300, 800, 220, 130, "#e0a35a", 12); for (const x of [210, 300, 390]) p.arc(x, 770, 40, 30, 200, 340, 9, "#a8643a"); return; }
    case "piedras": { const C = ["#9aa0a8", "#b8b0a4", "#7a7a84", "#c9c4bc"]; for (let i = 0; i < 9; i++) celE(p, 150 + ((i * 71) % 300), 930 - (i % 3) * 40, 46 - (i % 3) * 8, 34 - (i % 3) * 6, C[i % 4], 8, i * 25); return; }
    case "costal": { // costal de piedritas con etiqueta
      cel(p, [[150, 975], [450, 975], [470, 600], [400, 470], [200, 470], [130, 600]], "#d9b26a", 12, 0.1);
      p.stroke([[200, 500], [400, 500]], 12, "#8a5a34");
      for (let i = 0; i < 6; i++) celE(p, 230 + i * 28, 450 - (i % 2) * 20, 24, 18, ["#9aa0a8", "#b8b0a4", "#7a7a84"][i % 3], 6);
      text(p, o.txt ?? "PIEDRITAS", 300, 760, 66, WHITE, 9);
      return;
    }
    case "pecera": { // pecera redonda con agua, piedritas, alga y un pez naranja (k = fase de nado y burbujas)
      const cx = 300, cy = 560, R = 250, fx = cx + Math.sin(k * 2) * 80, fy = cy + Math.sin(k * 3) * 30, dir = Math.cos(k * 2) > 0 ? -1 : 1;
      g.save(); p.path(EP(cx, cy, R, R * 0.92), true); g.clip();
      g.fillStyle = "#e8f6ff"; g.fillRect(0, 0, 600, 1000); g.fillStyle = "#7fd0f5"; g.fillRect(0, cy - R * 0.55, 600, 1000);
      for (let i = 0; i < 12; i++) celE(p, 90 + i * 38, cy + R * 0.82 - (i % 2) * 14, 24, 16, ["#ff6fa3", "#ffd23f", "#9aa0a8", "#2ed3c6"][i % 4], 4);
      p.line([[200, cy + 200], [180 + Math.sin(k * 4) * 10, cy + 60], [205, cy - 40]], "#3fa34d", 22);
      g.save(); g.translate(fx, fy); g.scale(dir, 1);
      cel(p, [[60, 0], [120, -50], [120, 50]], "#ff8a2a", 8, 0.05); celE(p, 0, 0, 80, 54, "#ff8a2a", 9); p.stroke([[10, -50], [10, 50]], 8, WHITE);
      p.ell(-44, -12, 14, 14, WHITE, 5); p.dot(-46, -12, 7); p.ell(-74, 16, 10, Math.abs(Math.sin(k * 8)) * 12 + 3, "#5a1e28", 4);
      g.restore();
      for (let i = 0; i < 5; i++) { const by = fy - 40 - (((k * 140 + i * 60) % 300)), bx = fx - 80 * dir + Math.sin(i + k * 5) * 12; p.ell(bx, by, 12 + i * 2, 12 + i * 2, "#ffffff", 4); }
      g.restore();
      p.ell(cx, cy, R, R * 0.92, null, 12); p.ell(cx, cy - R * 0.9, R * 0.55, 32, "#e8f6ff", 10);
      g.save(); g.globalAlpha = 0.6; p.arc(cx - 60, cy - 30, 150, 160, 200, 250, 16, WHITE); g.restore();
      return;
    }
    case "branquias": { // esquema: cabeza de pez de cerca; el agua entra por la boca y sale por las branquias (k = fase)
      const c = o.col ?? "#ff8a2a", open = Math.abs(Math.sin(k * Math.PI * 2));
      celE(p, 330, 500, 260, 220, c, 13);
      p.ell(190, 400, 40, 40, WHITE, 8); p.dot(184, 400, 18);
      p.ell(100, 540, 30, 20 + open * 40, "#5a1e28", 8);                                                 // boca
      for (let i = 0; i < 3; i++) { const x = 330 + i * 46; p.arc(x, 500, 60 + open * 10, 150, 300, 420, 12, "#e8263a"); }    // branquias
      g.save(); g.strokeStyle = "#2f86d6"; g.lineWidth = 16; g.setLineDash([26, 18]); g.lineDashOffset = -k * 160; g.lineCap = "round";
      g.beginPath(); g.moveTo(10, 540); g.lineTo(150, 540); g.quadraticCurveTo(300, 540, 470, 380); g.stroke();
      g.beginPath(); g.moveTo(150, 540); g.quadraticCurveTo(300, 560, 470, 620); g.stroke(); g.restore();
      for (let i = 0; i < 4; i++) { const t = (k * 2 + i / 4) % 1; celE(p, 480 + t * 100, 360 + i * 90, 13, 13, "#e8263a", 4); }       // O2 que sale a la sangre
      text(p, "O₂", 520, 250, 80, "#ffd23f", 9);
      return;
    }
    case "tanque": { // tanque de buceo amarillo
      cel(p, rrect(200, 260, 400, 975, 80), "#ffd23f", 12, 0.14);
      cel(p, rect(270, 180, 330, 270), "#9aa4b4", 9, 0.05); p.stroke([[300, 200], [380, 170]], 14);
      p.stroke([[210, 520], [390, 520]], 10, "#2f86d6"); text(p, "AIRE", 300, 700, 70, WHITE, 9);
      return;
    }
    case "burbujas": { for (let i = 0; i < 9; i++) { const y = 900 - (((k * 400 + i * 110) % 900)), x = 300 + Math.sin(i * 1.7 + k * 4) * 120, r = 18 + (i % 4) * 12; p.ell(x, y, r, r, "#dff6ff", 6); p.arc(x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.4, 200, 280, 4, WHITE); } return; }
    case "piedrita": celE(p, 300, 930, 70, 46, o.col ?? "#9aa0a8", 9, -12); p.arc(285, 915, 30, 16, 200, 300, 6, "#d4d8de"); return;
    case "mesa": { const c = o.col ?? "#c98f5a"; cel(p, rect(40, 560, 560, 620), c, 11, 0.04); for (const x of [80, 520]) cel(p, rect(x - 18, 620, x + 18, 975), sombra(c, 0.85), 8, 0.04); return; }
    case "charco":celE(p, 300, 955, 290, 30, "#7fc8ff", 8); for (let i = 0; i < 5; i++) celE(p, 120 + i * 90, 900 - ((i * 41 + Math.floor(k * 30)) % 80), 14, 20, "#8fd8ff", 5); return;
  }
};

/** tarjeta de un objeto */
export const prop = (tipo: PropTipo, pos: V3, s = 0.5, extra: Partial<PropOpts> = {}, roll?: number, mirror?: boolean): Card =>
  ({ kind: "prop", o: { tipo, ...extra }, x: pos[0], y: pos[1] || undefined, z: pos[2], s, roll, mirror });

/** PROFUNDIDAD: un objeto muy cerca de la cámara, en una esquina de abajo (lado -1 izquierda, +1 derecha), para que el
 *  desenfoque de lente lo borre. d = distancia (m, 0.9–1.6), sube = cuánto entra desde abajo (0..1), ancho = cuánto entra
 *  desde el lado (0..1). No tapa el centro: Sticky queda libre. Úsalo con dofAt cInf 5–7. */
export const capaCerca = (cam: Cam, tipo: PropTipo, lado: -1 | 1, o: { d?: number; s?: number; sube?: number; ancho?: number; col?: string; on?: boolean } = {}): Card => {
  const d = o.d ?? 1.2, s = o.s ?? 0.55, fov = (cam.fov * Math.PI) / 180, tv = Math.tan(fov / 2), th = tv * (9 / 16);
  const f = norm([cam.look[0] - cam.pos[0], cam.look[1] - cam.pos[1], cam.look[2] - cam.pos[2]]);
  const r = norm([-f[2], 0, f[0]]), u: V3 = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const lat = lado * th * d * (1.05 - 0.6 * (o.ancho ?? 0.5)), down = -tv * d;
  const P: V3 = [cam.pos[0] + f[0] * d + r[0] * lat + u[0] * down, cam.pos[1] + f[1] * d + r[1] * lat + u[1] * down, cam.pos[2] + f[2] * d + r[2] * lat + u[2] * down];
  const H = 2.16 * s * (tipo === "pasto" ? 0.38 : tipo === "arbusto" ? 0.42 : 0.9);
  return { kind: "prop", o: { tipo, col: o.col, on: o.on }, x: P[0], y: P[1] - H * (1 - (o.sube ?? 0.6)), z: P[2], s, mirror: lado < 0 };
};
const norm = (v: V3): V3 => { const n = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / n, v[1] / n, v[2] / n]; };
