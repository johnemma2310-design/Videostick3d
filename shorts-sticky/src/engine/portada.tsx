// PORTADA (miniatura) de cada short: una imagen fija que se entiende en 1 segundo.
// Reglas (BIBLIA/CALIDAD.md, «Portada»): personajes reconocibles y GRANDES, una sola idea, texto corto enorme con borde
// grueso y algo de miedo o sorpresa. Cada historia exporta `portada: Portada` en su Story y Root.tsx arma dos
// composiciones: Portada (1080x1920, shorts) y PortadaH (1920x1080; se saca a 1280x720 con --scale).
import React from "react";
import type { Card, Cam, Env, SetName, Story, Formato, V3 } from "./types";
import type { Arm, Expr } from "./stick";
import { ESCALA } from "./elenco";

export type Portada = {
  /** líneas del texto gigante en vertical (máx. 3 palabras en total; cada línea se ajusta sola al ancho) */
  texto: string[];
  /** líneas del texto en horizontal (si falta, se usa `texto`) */
  textoH?: string[];
  /** color del texto (relleno); el borde siempre es casi negro y grueso */
  col?: string;
  /** cara y brazos de Sticky (mejor sorpresa, susto o furioso: algo de miedo o sorpresa) */
  expr: Expr; arm?: Arm;
  /** escenario y luz del mundo; el fondo sale muy desenfocado para que quede de color simple */
  set: SetName; env?: Env; flota?: number;
  /** Sticky: centro de la CABEZA (m), giro (rad; Math.PI = de cabeza) y escala extra */
  sticky?: { head?: V3; roll?: number; s?: number };
  /** Sticky en horizontal (si falta se usa `sticky`) */
  stickyH?: { head?: V3; roll?: number; s?: number };
  /** otras cosas flotando (vaca, coche, Toby...) en vertical y en horizontal (si falta `cosasH` se usan `cosas`) */
  cosas?: Card[]; cosasH?: Card[];
  /** cámaras (por defecto, de frente a 3 m de la cabeza de Sticky) */
  cam?: Cam; camH?: Cam;
  /** desenfoque del fondo (cInf de la lente; 6 por defecto) */
  blur?: number;
};

const FONT = "'Arial Black', 'Arial Rounded MT Bold', Arial, sans-serif";
/** ancho aproximado de Arial Black en mayúsculas (em por letra) */
const EM = 0.78;
const Titulo: React.FC<{ lineas: string[]; col: string; W: number; H: number }> = ({ lineas, col, W, H }) => {
  const hz = W > H, maxW = W * (hz ? 0.94 : 0.92), top = hz ? 40 : 90, gap = 0.96;
  let y = top;
  const rows = lineas.map((t) => { const fs = Math.min(hz ? 230 : 330, maxW / (Math.max(3, [...t].length) * EM)); y += fs * gap; return { t, fs, y }; });
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`rotate(-4 ${W / 2} ${top + (y - top) / 2})`}>
        {rows.map((r) => (
          <g key={r.t + r.y}>
            {/* sombra dura debajo del texto, borde grueso y relleno de color */}
            <text x={W / 2 + r.fs * 0.06} y={r.y + r.fs * 0.07} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r.fs} fill="#1a1010" stroke="#1a1010" strokeWidth={r.fs * 0.2} strokeLinejoin="round">{r.t}</text>
            <text x={W / 2} y={r.y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r.fs} fill={col} stroke="#1a1010" strokeWidth={r.fs * 0.17} strokeLinejoin="round" paintOrder="stroke">{r.t}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

/** convierte la portada de una historia en una Story de 1 cuadro (sirve para makeShort) */
export const portadaStory = (P: Portada, formato: Formato): Story => {
  const hz = formato === "horizontal", W = hz ? 1920 : 1080, H = hz ? 1080 : 1920;
  const st = (hz ? P.stickyH : undefined) ?? P.sticky ?? {}, head = st.head ?? [0, 1.4, 0], roll = st.roll ?? Math.PI, s = ESCALA.sticky * (st.s ?? 1);
  // la tarjeta gira sobre los pies: los ponemos donde haga falta para que la cabeza quede en `head`
  const hh = 1.106 * (s / ESCALA.sticky);
  const sti: Card = {
    kind: "sticky", o: { expr: P.expr, arm: P.arm ?? "fly", blink: 0, scarf: 0.35, t: 9 },
    x: head[0] + Math.sin(roll) * hh, y: head[1] - Math.cos(roll) * hh, z: head[2], s, roll,
  };
  const cam: Cam = (hz ? P.camH : P.cam) ?? { pos: [head[0], head[1] + 0.1, head[2] + (hz ? 3.4 : 3.2)], look: [head[0], head[1] - (hz ? 0.1 : 0.35), head[2]], fov: hz ? 44 : 52 };
  const cosas = (hz ? P.cosasH ?? P.cosas : P.cosas) ?? [];
  return {
    TOTAL: 1, formato,
    camAt: () => cam,
    layersAt: () => [{ id: 1, alpha: 1 }],
    dofAt: () => ({ cInf: P.blur ?? 6, focus: head }),
    state: () => ({ set: P.set, env: P.env ?? "day", flota: P.flota ?? 1, cards: [...cosas, sti] }),
    MARKS: [],
    overlay: () => <Titulo lineas={(hz ? P.textoH : undefined) ?? P.texto} col={P.col ?? "#ffd23f"} W={W} H={H} />,
  };
};
