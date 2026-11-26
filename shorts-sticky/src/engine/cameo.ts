// Tarjeta de CAMEO: un stickman sostiene un marco dorado grande con la foto de perfil de un invitado (un usuario de
// YouTube), con su @nombre en un cartel debajo y una cinta dorada "INVITADO ESPECIAL" con estrella arriba.
// Va en la tarjeta ancha (WIDE, 2000 x 1400, piso en y = 1375). La foto se lee de public/<foto> (p. ej. "cameo/ganador.jpg");
// si no existe se dibuja un "?" sobre un círculo de color. Uso: ver BIBLIA/PERSONAJES.md (sección Cameo).
import { staticFile } from "remotion";
import type { Pen } from "./toon";
import { person, type PersonOpts, type Expr, type Arm } from "./stick";

export type CameoOpts = {
  /** ruta dentro de public/, p. ej. "cameo/ejemplo.jpg" */
  foto: string;
  /** nombre que sale en el cartel, p. ej. "@usuario" */
  nombre: string;
  /** quién sostiene el marco (por defecto INVITADO de elenco.ts) */
  quien: PersonOpts;
  expr?: Expr;
  /** true = la persona saluda con la mano (wave); false = apunta/sostiene el borde del marco (point) */
  saluda?: boolean;
  /** brillo de la estrella 0..1 (para animarla) */
  brillo?: number;
};

// ---------- fotos precargadas (Short.tsx llama a cargarFoto antes de pintar) ----------
const FOTOS = new Map<string, HTMLImageElement | null>();
export const fotoEstado = (foto: string): "ok" | "falta" | "cargando" => (!FOTOS.has(foto) ? "cargando" : FOTOS.get(foto) ? "ok" : "falta");
export const cargarFoto = (foto: string): Promise<void> =>
  new Promise((res) => {
    if (FOTOS.has(foto)) return res();
    const im = new Image();
    im.onload = () => { FOTOS.set(foto, im); res(); };
    im.onerror = () => { FOTOS.set(foto, null); res(); };
    im.src = staticFile(foto);
  });

const INKC = "#241726", ORO = "#ffc83a", ORO2 = "#e09a1a";
const colorDe = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return ["#ff6fa3", "#2f86d6", "#3fa34d", "#8a4fc9", "#f08a2c", "#18a3a3"][h % 6]; };
const estrella = (g: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string) => {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 12; g.strokeStyle = INKC; g.lineJoin = "round"; g.stroke();
};
const texto = (g: CanvasRenderingContext2D, t: string, cx: number, cy: number, maxW: number, size: number, fill: string, stroke = 0) => {
  let s = size; g.font = `bold ${s}px 'Arial Black', Arial`;
  while (g.measureText(t).width > maxW && s > 20) { s -= 4; g.font = `bold ${s}px 'Arial Black', Arial`; }
  g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INKC; g.lineJoin = "round"; g.strokeText(t, cx, cy); }
  g.fillStyle = fill; g.fillText(t, cx, cy);
};

/** dibuja la tarjeta de cameo (diseño 2000 x 1400) */
export const cameoDraw = (p: Pen, o: CameoOpts) => {
  const g = p.g;
  // marco: centro y radio de la foto
  const FX = 1180, FY = 720, R = 285, RING = 44;
  // patas del caballete (detrás de todo)
  g.lineCap = "round";
  for (const [x0, x1] of [[FX - 120, FX - 330], [FX + 120, FX + 330]]) {
    g.beginPath(); g.moveTo(x0, FY + R); g.lineTo(x1, 1370); g.lineWidth = 46; g.strokeStyle = INKC; g.stroke();
    g.lineWidth = 26; g.strokeStyle = "#b97d4a"; g.stroke();
  }
  // persona que lo sostiene (a la izquierda; la mano derecha toca el borde del marco)
  g.save(); g.translate(390, 400);
  person(p, { ...o.quien, expr: o.expr ?? "happy", arm: (o.saluda ? "wave" : "point") as Arm });
  g.restore();
  // aro dorado con sombra de corte duro
  g.beginPath(); g.arc(FX, FY, R + RING, 0, Math.PI * 2); g.fillStyle = ORO; g.fill();
  g.save(); g.beginPath(); g.arc(FX, FY, R + RING, 0, Math.PI * 2); g.clip();
  g.beginPath(); g.arc(FX - 40, FY - 40, R + RING, 0, Math.PI * 2); g.rect(FX - 800, FY - 800, 1600, 1600); g.fillStyle = ORO2; g.fill("evenodd"); g.restore();
  g.lineWidth = 14; g.strokeStyle = INKC; g.beginPath(); g.arc(FX, FY, R + RING, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.beginPath(); g.arc(FX + Math.cos(a) * (R + RING / 2), FY + Math.sin(a) * (R + RING / 2), 7, 0, 6.3); g.fillStyle = "#fff3b0"; g.fill(); }
  // foto recortada en círculo (o "?" si falta)
  g.save(); g.beginPath(); g.arc(FX, FY, R, 0, Math.PI * 2); g.clip();
  const im = FOTOS.get(o.foto);
  if (im) {
    const k = Math.max((2 * R) / im.width, (2 * R) / im.height), w = im.width * k, h = im.height * k;
    g.drawImage(im, FX - w / 2, FY - h / 2, w, h);
  } else {
    g.fillStyle = colorDe(o.nombre); g.fillRect(FX - R, FY - R, 2 * R, 2 * R);
    texto(g, "?", FX, FY + 20, 2 * R, 380, "#ffffff", 22);
  }
  g.restore();
  g.lineWidth = 12; g.strokeStyle = INKC; g.beginPath(); g.arc(FX, FY, R, 0, Math.PI * 2); g.stroke();
  // estrella dorada arriba y cinta "INVITADO ESPECIAL"
  const b = o.brillo ?? 0;
  if (b > 0) for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + b; g.beginPath(); g.moveTo(FX + Math.cos(a) * 150, FY - R - 150 + Math.sin(a) * 150); g.lineTo(FX + Math.cos(a) * (190 + 30 * b), FY - R - 150 + Math.sin(a) * (190 + 30 * b)); g.lineWidth = 14; g.strokeStyle = "#fff3b0"; g.stroke(); }
  const RY = FY - R - 30, RW = 780, RH = 120;
  for (const s of [-1, 1]) { // colas de la cinta
    g.beginPath(); const x0 = FX + s * (RW / 2 - 30);
    g.moveTo(x0, RY - RH / 2 + 30); g.lineTo(x0 + s * 120, RY - RH / 2 + 30); g.lineTo(x0 + s * 80, RY + 20); g.lineTo(x0 + s * 120, RY + RH / 2 + 20); g.lineTo(x0, RY + RH / 2 + 20); g.closePath();
    g.fillStyle = ORO2; g.fill(); g.lineWidth = 11; g.strokeStyle = INKC; g.stroke();
  }
  g.beginPath(); g.rect(FX - RW / 2, RY - RH / 2, RW, RH); g.fillStyle = ORO; g.fill(); g.lineWidth = 12; g.strokeStyle = INKC; g.stroke();
  texto(g, "INVITADO ESPECIAL", FX, RY + 4, RW - 70, 74, "#7a2e00");
  estrella(g, FX, RY - RH / 2 - 95, 120, "#ffd23f");
  // cartel con el @nombre debajo del marco
  const NY = FY + R + RING + 95, NW = 840, NH = 140;
  g.beginPath(); g.roundRect(FX - NW / 2, NY - NH / 2, NW, NH, 30); g.fillStyle = "#2f86d6"; g.fill(); g.lineWidth = 12; g.strokeStyle = INKC; g.stroke();
  g.beginPath(); g.roundRect(FX - NW / 2 + 18, NY - NH / 2 + 16, NW - 36, NH - 32, 20); g.fillStyle = "#ffffff"; g.fill();
  texto(g, o.nombre, FX, NY + 4, NW - 90, 84, INKC);
};
