// Prueba del formato horizontal 1920x1080 (no se publica): gimnasio con Sticky normal y musculoso, báscula y la calle.
// node scripts/fotos.mjs PruebaH out/ph_ 30,90,150,210 0.35
import type { Story, SceneState, Card, V3 } from "../engine/types";
import { makeTimeline, Shot, gait } from "../engine/timeline";
import { ORIGIN } from "../engine/sets";
import { STREET_X } from "../engine/world";
import { sticky, who, OBRERO, NINO, ESCALA } from "../engine/elenco";
import { band } from "../engine/crowd";

const TOTAL = 240, GY = ORIGIN.gym, SX = STREET_X;
const at = (o: readonly number[], x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
const SHOTS: Shot[] = [
  { id: 1, a: 0, b: 60, keys: [{ f: 0, pos: at(GY, 0.4, 1.7, 6.8), look: at(GY, 0, 1.1, -1.5), fov: 44 }, { f: 60, pos: at(GY, 0.2, 1.6, 6.2), look: at(GY, 0, 1.0, -1.5), fov: 44, glide: true }] },
  { id: 2, a: 60, b: 120, keys: [{ f: 60, pos: at(GY, -0.6, 1.4, 4.6), look: at(GY, -0.4, 1.0, -0.5), fov: 42 }, { f: 120, pos: at(GY, -0.3, 1.4, 4.2), look: at(GY, -0.2, 1.0, -0.5), fov: 42, glide: true }] },
  { id: 3, a: 120, b: 180, keys: [{ f: 120, pos: at(GY, 4.2, 1.45, 4.2), look: at(GY, 2.0, 1.2, 0.6), fov: 42 }, { f: 180, pos: at(GY, 4.0, 1.45, 3.8), look: at(GY, 2.0, 1.2, 0.6), fov: 42, glide: true }] },
  { id: 4, a: 180, b: TOTAL, keys: [{ f: 180, pos: [SX + 0.8, 1.6, 8], look: [SX, 1.1, -2], fov: 44 }, { f: TOTAL, pos: [SX + 0.6, 1.5, 7], look: [SX, 1.0, -2], fov: 44, glide: true }] },
];
const { camAt, layersAt } = makeTimeline(SHOTS);
const state = (id: number, f: number): SceneState => {
  const c = camAt(id, f);
  if (id === 1) {
    const x = -2.2 + (f / 30) * 1.3;
    return { set: "gym", env: "day", cinta: 1.3, saco: 0.6, cards: [
      sticky(f, "smile", "down", at(GY, x, 0, 0.6), [0.4, 0], gait(f, 1.1), 0),
      who({ ...NINO, arm: "down", walk: gait(f, 1.1), expr: "happy" }, at(GY, 5.3, 0.22, -2.95), ESCALA.nino, { mirror: true }),
      who({ ...OBRERO, arm: "curl", expr: "worried" }, at(GY, -3.4, 0, -2.0)),
    ] };
  }
  if (id === 2) {
    const x = -1.6 + ((f - 60) / 30) * 1.2;
    return { set: "gym", env: "day", saco: 0.3, cards: [sticky(f, "happy", "down", at(GY, x, 0, 0.4), [0.3, 0], gait(f, 1.0), 8), who({ ...OBRERO, arm: "cheer", expr: "shock" }, at(GY, -3.4, 0, -2.0))] };
  }
  if (id === 3) {
    const card: Card = sticky(f, "happy", "flex", at(GY, 2.3, 0.125, 0.95), [0, 0], undefined, 10);
    if (card.kind === "sticky") card.o = { ...card.o, talk: Math.floor(f / 4) % 4 };
    return { set: "gym", env: "day", bascula: Math.min(0.85, (f - 120) / 40), cards: [card] };
  }
  const x = SX - 1.6 + ((f - 180) / 30) * 1.0;
  const crowd = band({ n: 30, seed: 7, x0: SX - 8, x1: SX + 8, z0: -3, z1: -16, f, cam: c, lead: [x, 0], expr: () => "shock", wander: 0.3 });
  return { set: "street", env: "day", cards: [sticky(f, "shock", "down", [x, 0, 1.0], [0.5, 0], gait(f, 2.4), 4), ...crowd].map((cd) => (cd.kind === "sticky" ? { ...cd, o: { ...cd.o, run: true } } : cd)) };
};
export const PRUEBAH: Story = {
  formato: "horizontal", TOTAL, camAt, layersAt, dofAt: () => ({ cInf: 10 }), state,
  MARKS: [{ a: 0, b: 58, label: "1 KG POR HORA", sub: "prueba horizontal", col: "#ffd23f" }],
};
