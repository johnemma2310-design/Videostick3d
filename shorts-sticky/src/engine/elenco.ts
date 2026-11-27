// ELENCO FIJO de "Curiosidades con Sticky".
// Personajes que se repiten entre videos: úsalos SIEMPRE desde aquí (no los redefinas en cada video)
// para que se vean idénticos en todos los shorts. Si agregas uno nuevo, agrégalo aquí y en BIBLIA/PERSONAJES.md.
import type { Card, V3 } from "./types";
import type { Expr, Arm, PersonOpts, Look } from "./stick";
import { CARAS_V3 } from "./stick";
import { blinkAt } from "./timeline";

/** Escalas estándar (alto relativo de la tarjeta). No las cambies entre videos. */
export const ESCALA = { sticky: 0.75, adulto: 0.74, nino: 0.54, perro: 0.62, gato: 0.5, ave: 0.35 } as const;

/** Paleta de la marca: colores que se repiten en ropa, gorros y carteles. */
export const PALETA = {
  rojo: "#d84a3a", azulSticky: "#2f86d6", verde: "#3fa34d", amarillo: "#f2b632", morado: "#8a4fc9",
  rosa: "#e36fa8", negro: "#2b2b33", naranja: "#f08a2c", turquesa: "#18a3a3",
  // colores de los carteles de título (MARKS)
  titulo: { alerta: "#ff4d4d", dato: "#ffd23f", espacio: "#7fd0ff", calma: "#7dff9a" },
} as const;

/** La bufanda de Sticky ondea a 1.3 Hz en 8 pasos (igual en todos los videos). */
export const bufanda = (f: number) => Math.floor((((f / 30) * 1.3) % 1) * 8) / 8;

/** Sticky, el protagonista: cabeza blanca grande y bufanda azul. Siempre al frente y sin nada tapándolo. */
export const sticky = (f: number, expr: Expr, arm: Arm, pos: V3, look: Look = [0, 0], walk?: number, musc?: number): Card => ({
  kind: "sticky",
  o: { expr, arm, look, walk, blink: expr === "shock" || expr === "scream" || CARAS_V3.includes(expr) ? 0 : blinkAt(f, 1), scarf: bufanda(f), musc },
  x: pos[0], z: pos[2], y: pos[1] || undefined, s: ESCALA.sticky,
});

/** Una persona del elenco en una posición. */
export const who = (o: PersonOpts, pos: V3, s: number = ESCALA.adulto, extra: Partial<Card> = {}): Card =>
  ({ kind: "person", o, x: pos[0], z: pos[2], y: pos[1] || undefined, s, ...extra } as Card);

// ---------- La familia (aparece en casa, cocina, ascensor...) ----------
/** Mamá: coleta rosa. */
export const MAMA: PersonOpts = { expr: "smile", hat: "pony", hatCol: "#ff6fa3", ropa: "dress", shirt: "#18a3a3", trim: "#ffd23f", shoes: "#d84a3a" };
/** Papá: bigote grueso, lentes y corbata azul. */
export const PAPA: PersonOpts = { expr: "smile", hat: "none", stache: "thick", glasses: true, tie: "#2f86d6", ropa: "shirt", shirt: "#cfe3ff", pants: "#3b3f52", shoes: "#3a2c24" };
/** El niño: gorra amarilla (usar con ESCALA.nino). */
export const NINO: PersonOpts = { expr: "happy", hat: "cap", hatCol: "#ffd23f", ropa: "tee", shirt: "#f08a2c", pants: "#3b5b9a", shoes: "#f4f1ea" };
/** La abuela: moño morado, lentes y bastón. */
export const ABUELA: PersonOpts = { expr: "smile", hat: "bow", hatCol: "#9b6bff", glasses: true, cane: true, ropa: "dress", shirt: "#b49be0", trim: "#f4f1ea", shoes: "#5a3b2a" };

// ---------- Personajes de oficio (uno por escenario) ----------
/** El granjero: sombrero vaquero, bigote y barba (granja). */
export const GRANJERO: PersonOpts = { expr: "worried", hat: "cowboy", hatCol: "#d9b26a", stache: "thick", beard: "#7a5236", arm: "candle", ropa: "overall", shirt: "#d84a3a", pants: "#3b5b9a", shoes: "#5a3b2a", trim: "#f2b632" };
/** La científica: lentes, coleta morada (observatorio, aula, laboratorio). */
export const CIENTIFICA: PersonOpts = { expr: "smile", hat: "pony", hatCol: "#8a4fc9", glasses: true, ropa: "coat", shirt: "#f7f7fb", trim: "#8a4fc9", pants: "#3b3f52", shoes: "#2b2b33" };
/** El profe: calvo con bigote rizado, lentes y corbata roja (aula). */
export const PROFE: PersonOpts = { expr: "smile", hat: "none", stache: "curly", glasses: true, tie: "#d84a3a", ropa: "jacket", shirt: "#8a6a4a", pants: "#4a3a2a", shoes: "#2b2b33" };
/** La doctora: gorro blanco tipo cofia y bolso rojo (hospital). */
export const DOCTORA: PersonOpts = { expr: "worried", hat: "chef", glasses: true, ropa: "coat", shirt: "#f7f7fb", trim: "#5fc9b0", pants: "#5fc9b0", shoes: "#f4f1ea" };
/** El tendero: gorra verde y bigote fino (tienda). */
export const TENDERO: PersonOpts = { expr: "smile", hat: "cap", hatCol: "#3fa34d", stache: "thin", ropa: "apron", shirt: "#3fa34d", pants: "#3b3f52", shoes: "#5a3b2a" };
/** El obrero: casco amarillo y barba (calle, obras). */
export const OBRERO: PersonOpts = { expr: "neutral", hat: "helmet", hatCol: "#f2b632", beard: "#4a3426", ropa: "vest", shirt: "#f08a2c", pants: "#3b5b9a", shoes: "#5a3b2a", trim: "#f4f1ea" };
/** El señor elegante: sombrero de copa, bigote rizado y bastón (calle, parque). */
export const SENOR: PersonOpts = { expr: "neutral", hat: "tophat", hatCol: "#2b2b33", stache: "curly", cane: true, ropa: "jacket", shirt: "#2b2b33", pants: "#2b2b33", shoes: "#1a1a22", tie: "#d84a3a" };

// ---------- Mascotas fijas ----------
/** Toby, el perro de la familia: café con mancha oscura. */
export const TOBY = { coat: "#c98f5a", spot: "#3a2c24" } as const;
/** Michi, la gata de la familia: gris. */
export const MICHI = { coat: "#8a8a94" } as const;

// Nombres cortos que ya usaban los primeros videos (no borrar).
export const MOM = MAMA, DAD = PAPA, KID = NINO, GRANNY = ABUELA, FARMER = GRANJERO;

// ---------- Cameo: invitado especial (ver engine/cameo.ts y BIBLIA/PERSONAJES.md) ----------
/** quien sostiene el marco del cameo por defecto: playera amarilla, gorra roja, alegre */
export const INVITADO: PersonOpts = { expr: "happy", hat: "cap", hatCol: "#d84a3a", ropa: "tee", shirt: "#f2b632", pants: "#3b5b9a", shoes: "#d84a3a" };
/** tarjeta de cameo (tarjeta ancha): una persona del elenco sostiene el marco con la foto y el @nombre del invitado.
 *  `pos` es el centro de la tarjeta en el piso; ocupa ~2.9 m de ancho (escala adulto). */
export const cameo = (f: number, c: { foto: string; nombre: string }, pos: V3, quien: PersonOpts = INVITADO, o: { expr?: Expr; saluda?: boolean } = {}): Card => ({
  kind: "cameo", o: { foto: c.foto, nombre: c.nombre, quien: { ...quien, blink: blinkAt(f, 7) }, expr: o.expr, saluda: o.saluda, brillo: Math.floor(f / 3) % 4 / 4 + 0.1 },
  x: pos[0], z: pos[2], y: pos[1] || undefined, s: ESCALA.adulto,
});

// ---------- Animales con nombre (shorts "¿por qué...?") ----------
/** Paca, la gallina protagonista: plumas canela con moño rojo (tarjeta "chicken"; usa pica 0..1 para picotear). */
export const PACA = { coat: "#ffffff", pluma: "#e0a060", lazo: "#e8263a" } as const;
/** Burbu, el pez amigo de Sticky: naranja con rayas blancas (tarjeta "fish"). */
export const BURBU = { coat: "#ff8a2a", spot: "#ffffff" } as const;
/** escala de la gallina y del pez */
export const ESCALA_ANIMAL = { gallina: 0.8, pez: 0.5 } as const;
