import VOZ from "../../voz/outro/palabras.json";
// Cierre horizontal (1920x1080) para los videos largos: la misma idea y la misma voz que outro.tsx
// («Si quieres saber más, suscríbete y déjame en los comentarios qué más quieres saber»). Sticky saluda a la izquierda,
// a la derecha el botón SUSCRIBIRSE -> SUSCRITO con campana y la burbuja de comentario. Mismo TOTAL (170) que el vertical.
import React from "react";
import type { Story, SceneState, Card, V3 } from "../engine/types";
import { makeTimeline, Shot, smooth, blinkAt, gait } from "../engine/timeline";
import { band } from "../engine/crowd";

const TOTAL = 170;
const SHOTS: Shot[] = [{ id: 1, a: 0, b: TOTAL, keys: [
  { f: 0, pos: [1.25, 1.55, 6.6], look: [1.45, 1.1, -1.2], fov: 42 },
  { f: TOTAL, pos: [1.05, 1.45, 5.2], look: [1.25, 1.05, -0.8], fov: 41, glide: true },
] }];
const { camAt, layersAt } = makeTimeline(SHOTS);
const state = (id: number, f: number): SceneState => {
  const sticky: Card = { kind: "sticky", o: { expr: f > 60 ? "happy" : "smile", arm: f < 100 ? "wave" : "point", look: [0.3, 0], blink: blinkAt(f, 1), scarf: Math.floor((f / 30 * 1.3 % 1) * 8) / 8, walk: undefined }, x: 0, z: 0, s: 0.75 };
  const crowd = band({ n: 60, seed: 41, x0: -9, x1: 11, z0: -1.6, z1: -13, f, cam: camAt(id, f), lead: [0, 0], expr: (i) => (i % 3 ? "happy" : "smile"), arm: (i) => (i % 3 === 0 ? "wave" : i % 3 === 1 ? "cheer" : "down"), wander: 0.2 });
  const pets: Card[] = [{ kind: "dog", o: { coat: "#c98f5a", spot: "#3a2c24", walk: gait(f, 1.8), mood: "bark" }, x: -1.7, z: -0.6, s: 0.6 }, { kind: "cat", o: { coat: "#f2a03a", mood: "calm" }, x: 3.6, z: -0.8, s: 0.5, mirror: true }];
  return { set: "park", env: "day", cards: [sticky, ...pets, ...crowd] };
};
const FONT = "'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif";
const overlay = (f: number) => {
  const pop = smooth((f - 36) / 8), clicked = f > 58, cur = smooth((f - 44) / 12), bub = smooth((f - 80) / 8);
  const bx = 1330, by = 270, sc = 0.7 + 0.3 * pop + (f > 58 && f < 64 ? -0.06 : 0);
  return (
    <svg width={1920} height={1080}>
      <g opacity={pop} transform={`translate(${bx},${by}) scale(${sc})`}>
        <rect x={-300} y={-70} width={600} height={140} rx={70} fill={clicked ? "#5a5a66" : "#e62117"} stroke="#1a1010" strokeWidth={10} />
        <text textAnchor="middle" y={24} fontFamily={FONT} fontSize={66} fill="#fff">{clicked ? "SUSCRITO ✓" : "SUSCRIBIRSE"}</text>
        {clicked && <g transform={`translate(370,0) rotate(${Math.sin(f * 0.8) * 18 * (1 - smooth((f - 64) / 30))})`}>
          <path d="M-34,26 L34,26 L26,14 L26,-12 A26,26 0 0 0 -26,-12 L-26,14 Z" fill="#ffd23f" stroke="#1a1010" strokeWidth={8} />
          <circle cx={0} cy={36} r={10} fill="#ffd23f" stroke="#1a1010" strokeWidth={6} />
        </g>}
      </g>
      {pop > 0.5 && f < 75 && <g opacity={1 - smooth((f - 64) / 10)} transform={`translate(${bx + 260 - 120 * cur},${by + 220 - 160 * cur})`}>
        <path d="M0,0 L0,70 L18,54 L30,82 L42,76 L30,50 L54,50 Z" fill="#fff" stroke="#1a1010" strokeWidth={6} />
      </g>}
      <g opacity={bub} transform={`translate(${bx},${560 - 20 * bub}) scale(${0.8 + 0.2 * bub})`}>
        <path d="M-380,-80 Q-380,-120 -340,-120 L340,-120 Q380,-120 380,-80 L380,40 Q380,80 340,80 L-120,80 L-200,150 L-190,80 L-340,80 Q-380,80 -380,40 Z" fill="#ffffff" stroke="#1a1010" strokeWidth={10} />
        <text textAnchor="middle" y={-12} fontFamily={FONT} fontSize={50} fill="#1a1010">💬 ¿Qué más quieres</text>
        <text textAnchor="middle" y={50} fontFamily={FONT} fontSize={50} fill="#1a1010">saber? ¡Comenta!</text>
      </g>
    </svg>
  );
};
export const OUTRO_H: Story = { formato: "horizontal", voz: VOZ, TOTAL, camAt, layersAt, dofAt: () => ({ cInf: 10, focus: [0, 1.05, 0] as V3 }), state, MARKS: [], overlay };
