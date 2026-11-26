import VOZ from "../../voz/outro/palabras.json";
// Cierre fijo de cada short (concurso de cameo): «…suscríbete, dale like y déjame en los comentarios… ¡Y el último en comentar en mi video largo sale en el próximo short!»
// cuadros: suscríbete 37 · like 60 · comentarios 92 · «Y el último en comentar en mi video largo» 158 · fin de voz 290 (+0.8 s de cola)
import React from "react";
import type { Story, SceneState, Card, V3 } from "../engine/types";
import { who, NINO, ESCALA } from "../engine/elenco";
import { makeTimeline, Shot, smooth, blinkAt, gait } from "../engine/timeline";
import { band } from "../engine/crowd";

const TOTAL = 326;
const SHOTS: Shot[] = [{ id: 1, a: 0, b: TOTAL, keys: [
  { f: 0, pos: [0.2, 1.6, 6.4], look: [0, 1.1, -1.2], fov: 50 },
  { f: TOTAL, pos: [0.15, 1.45, 4.6], look: [0, 1.05, -0.8], fov: 48, glide: true },
] }];
const { camAt, layersAt } = makeTimeline(SHOTS);
const state = (id: number, f: number): SceneState => {
  const sticky: Card = { kind: "sticky", o: { expr: f > 60 ? "happy" : "smile", arm: f < 152 ? "wave" : "cheer", look: [0, 0], blink: blinkAt(f, 1), scarf: Math.floor((f / 30 * 1.3 % 1) * 8) / 8, walk: undefined }, x: 0, z: 0, s: 0.75 };
  const crowd = band({ n: 40, seed: 41, x0: -7, x1: 7, z0: -1.6, z1: -12, f, cam: camAt(id, f), lead: [0, 0], expr: (i) => (i % 3 ? "happy" : "smile"), arm: (i) => (i % 3 === 0 ? "wave" : i % 3 === 1 ? "cheer" : "down"), wander: 0.2 });
  const dogs: Card[] = [{ kind: "dog", o: { coat: "#c98f5a", spot: "#3a2c24", walk: gait(f, 1.8), mood: "bark" }, x: -1.6, z: -0.6, s: 0.6 }, { kind: "cat", o: { coat: "#f2a03a", mood: "calm" }, x: 1.5, z: -0.4, s: 0.5, mirror: true }];
  const g = smooth((f - 152) / 14), hop = f > 166 ? Math.abs(Math.sin((f - 166) * 0.22)) * 0.12 * Math.max(0, 1 - (f - 166) / 90) : 0;
  const guest: Card[] = f < 152 ? [] : [who({ ...NINO, expr: "happy", arm: g < 1 ? "down" : "cheer", walk: g < 1 ? gait(f, 3) : undefined, run: g < 1 }, [0.8 + 3 * (1 - g), hop, 0.3], ESCALA.nino, { mirror: true })];
  return { set: "park", env: "day", cards: [sticky, ...guest, ...dogs, ...crowd] };
};
const FONT = "'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif";
const GX = 790, GY = 940;
const overlay = (f: number) => {
  const pop = smooth((f - 28) / 8), clicked = f > 47, cur = smooth((f - 32) / 12), bub = smooth((f - 90) / 8) * (1 - smooth((f - 152) / 6));
  const cam = smooth((f - 158) / 8), bounce = 1 + 0.18 * Math.sin(Math.max(0, f - 158) * 0.5) * Math.exp(-Math.max(0, f - 158) / 14);
  const bx = 540, by = 470, sc = 0.7 + 0.3 * pop + (f > 47 && f < 53 ? -0.06 : 0);
  return (
    <svg width={1080} height={1920}>
      <g opacity={pop} transform={`translate(${bx},${by}) scale(${sc})`}>
        <rect x={-300} y={-70} width={600} height={140} rx={70} fill={clicked ? "#5a5a66" : "#e62117"} stroke="#1a1010" strokeWidth={10} />
        <text textAnchor="middle" y={24} fontFamily={FONT} fontSize={66} fill="#fff">{clicked ? "SUSCRITO ✓" : "SUSCRIBIRSE"}</text>
        {clicked && <g transform={`translate(360,0) rotate(${Math.sin(f * 0.8) * 18 * (1 - smooth((f - 53) / 30))})`}>
          <path d="M-34,26 L34,26 L26,14 L26,-12 A26,26 0 0 0 -26,-12 L-26,14 Z" fill="#ffd23f" stroke="#1a1010" strokeWidth={8} />
          <circle cx={0} cy={36} r={10} fill="#ffd23f" stroke="#1a1010" strokeWidth={6} />
        </g>}
      </g>
      {pop > 0.5 && f < 64 && <g opacity={1 - smooth((f - 53) / 10)} transform={`translate(${bx + 260 - 120 * cur},${by + 220 - 160 * cur})`}>
        <path d="M0,0 L0,70 L18,54 L30,82 L42,76 L30,50 L54,50 Z" fill="#fff" stroke="#1a1010" strokeWidth={6} />
      </g>}
      <g opacity={bub} transform={`translate(540,${720 - 20 * bub}) scale(${0.8 + 0.2 * bub})`}>
        <path d="M-380,-80 Q-380,-120 -340,-120 L340,-120 Q380,-120 380,-80 L380,40 Q380,80 340,80 L-120,80 L-200,150 L-190,80 L-340,80 Q-380,80 -380,40 Z" fill="#ffffff" stroke="#1a1010" strokeWidth={10} />
        <text textAnchor="middle" y={-12} fontFamily={FONT} fontSize={50} fill="#1a1010">💬 ¿Qué más quieres</text>
        <text textAnchor="middle" y={50} fontFamily={FONT} fontSize={50} fill="#1a1010">saber? ¡Comenta!</text>
      </g>
      <g opacity={cam} transform={`translate(540,700) scale(${(0.5 + 0.5 * cam) * bounce}) rotate(${-4 * Math.sin(f * 0.15)})`}>
        <rect x={-420} y={-115} width={840} height={240} rx={34} fill="#ffd23f" stroke="#1a1010" strokeWidth={10} />
        <text textAnchor="middle" y={-22} fontFamily={FONT} fontSize={72} fill="#e62117" stroke="#1a1010" strokeWidth={3}>¡TU CAMEO AQUÍ!</text>
        <text textAnchor="middle" y={34} fontFamily={FONT} fontSize={30} textLength={740} lengthAdjust="spacingAndGlyphs" fill="#1a1010">tu foto y tu nombre en el próximo short</text>
        <text textAnchor="middle" x={-30} y={92} fontFamily={FONT} fontSize={40} fill="#1a1010">comenta en el video largo</text>
                <path d="M290,70 l50,0 l-25,32 z" fill="#e62117" stroke="#1a1010" strokeWidth={5}/>
        <text x={-405} y={-60} fontSize={56}>⭐</text><text x={350} y={-60} fontSize={56}>⭐</text>
      </g>
      <g opacity={cam} transform={`translate(${GX},${GY}) scale(${bounce})`}>
        <rect x={-60} y={-70} width={120} height={140} rx={10} fill="#fff7d6" stroke="#ffd23f" strokeWidth={14} />
        <rect x={-60} y={-70} width={120} height={140} rx={10} fill="none" stroke="#1a1010" strokeWidth={4} />
        <text textAnchor="middle" y={26} fontFamily={FONT} fontSize={90} fill="#1a1010">?</text>
      </g>
    </svg>
  );
};
export const OUTRO: Story = { voz: VOZ, TOTAL, camAt, layersAt, dofAt: () => ({ cInf: 10, focus: [0, 1.05, 0] as V3 }), state, MARKS: [], overlay };
