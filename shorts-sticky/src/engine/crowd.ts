// Background cast: deterministic variety (hats, moustaches, beards, glasses, ties, bags, canes, kids, pets).
import type { Card } from "./types";
import type { PersonOpts, Expr, Arm, Hat, Ropa } from "./stick";
import { hh, gait } from "./timeline";

const HATS: Hat[] = ["none", "cap", "tophat", "bowler", "beanie", "cowboy", "bow", "hair", "pony", "helmet", "chef", "none", "hair"];
const COLS = ["#d84a3a", "#2f86d6", "#3fa34d", "#f2b632", "#8a4fc9", "#e36fa8", "#2b2b33", "#f08a2c", "#18a3a3"];
const ROPAS: Ropa[] = ["tee", "shirt", "vest", "jacket", "overall", "tee", "dress", "shirt", "jacket"];
const SHIRTS = ["#d84a3a", "#2f86d6", "#3fa34d", "#f2b632", "#8a4fc9", "#e36fa8", "#f08a2c", "#18a3a3", "#cfe3ff", "#f4f1ea", "#7ab8ff", "#ffb3c7"];
const PANTS = ["#3b3f52", "#3b5b9a", "#4a3a2a", "#2b2b33", "#6b6f7e", "#7a5236"];
const SHOES = ["#5a3b2a", "#2b2b33", "#d84a3a", "#f4f1ea", "#3b5b9a"];
const COATS = ["#c98f5a", "#f4f1ea", "#3a2c24", "#e8c27a", "#8a8a94", "#b05a2a"];

export type Extra = { i: number; type: "person" | "kid" | "dog" | "cat" | "bird"; look: PersonOpts; coat: string; spot?: string };
export const extra = (i: number, seed = 1): Extra => {
  const r = (k: number) => hh(i * 7 + seed * 131, k);
  const roll = r(1), type = roll < 0.62 ? "person" : roll < 0.74 ? "kid" : roll < 0.86 ? "dog" : roll < 0.95 ? "cat" : "bird";
  const look: PersonOpts = {
    expr: "neutral", hat: HATS[Math.floor(r(2) * HATS.length)], hatCol: COLS[Math.floor(r(3) * COLS.length)],
    stache: type === "person" && r(4) < 0.35 ? (["thick", "curly", "thin"] as const)[Math.floor(r(5) * 3)] : undefined,
    beard: type === "person" && r(6) < 0.15 ? "#4a3426" : undefined, glasses: r(7) < 0.3,
    tie: type === "person" && r(8) < 0.25 ? COLS[Math.floor(r(9) * COLS.length)] : undefined,
    bag: r(10) < 0.18 ? COLS[Math.floor(r(11) * COLS.length)] : undefined, cane: type === "person" && r(12) < 0.08,
    ropa: ROPAS[Math.floor(r(15) * ROPAS.length)], shirt: SHIRTS[Math.floor(r(16) * SHIRTS.length)],
    pants: PANTS[Math.floor(r(17) * PANTS.length)], shoes: SHOES[Math.floor(r(18) * SHOES.length)], trim: COLS[Math.floor(r(19) * COLS.length)],
  };
  return { i, type, look, coat: COATS[Math.floor(r(13) * COATS.length)], spot: r(14) < 0.4 ? "#3a2c24" : undefined };
};

/** make a card for an extra at (x, z): expr/arm for people, mood for animals, walking phase when moving */
export const card = (e: Extra, x: number, z: number, f: number, o: { expr?: Expr; arm?: Arm; walking?: boolean; dir?: number; y?: number; roll?: number; look?: [number, number]; s?: number; mood?: "calm" | "scared" | "howl" | "sleep" | "bark" }): Card => {
  const walk = o.walking ? gait(f, e.type === "dog" || e.type === "cat" ? 1.8 : 1.1, hh(e.i, 3)) : undefined;
  const s = o.s ?? 1, mirror = (o.dir ?? 1) < 0;
  switch (e.type) {
    case "person": return { kind: "person", o: { ...e.look, expr: o.expr ?? "neutral", arm: o.arm ?? "down", walk, look: o.look }, x, z, y: o.y, s: 0.74 * s, roll: o.roll };
    case "kid": return { kind: "person", o: { ...e.look, stache: undefined, beard: undefined, tie: undefined, cane: false, expr: o.expr ?? "smile", arm: o.arm ?? "down", walk, look: o.look }, x, z, y: o.y, s: 0.54 * s, roll: o.roll };
    case "dog": return { kind: "dog", o: { coat: e.coat, spot: e.spot, walk, mood: o.mood ?? (o.expr === "shock" || o.expr === "scream" ? "scared" : "calm") }, x, z, y: o.y, s: 0.62 * s, mirror, roll: o.roll };
    case "cat": return { kind: "cat", o: { coat: e.coat, walk, mood: o.mood ?? (o.expr === "shock" || o.expr === "scream" ? "scared" : "calm") }, x, z, y: o.y, s: 0.5 * s, mirror, roll: o.roll };
    default: return { kind: "bird", o: { coat: "#9aa0b0", spot: "#7a8090", fly: !!o.walking, walk: gait(f, 3, hh(e.i, 4)) }, x, z, y: o.y ?? (o.walking ? 2.5 : 0), s: 0.35 * s, mirror, roll: o.roll };
  }
};

/** true when (x, z) sits between the camera and the lead (so it would cover him): keep that corridor clear */
export const blocksLead = (cam: [number, number, number], lead: [number, number], x: number, z: number, pad = 1.0) => {
  const vx = lead[0] - cam[0], vz = lead[1] - cam[2], L = Math.hypot(vx, vz) || 1, ux = vx / L, uz = vz / L;
  const px = x - cam[0], pz = z - cam[2], along = px * ux + pz * uz, perp = Math.abs(px * uz - pz * ux);
  return along > 0 && along < L + 0.9 && perp < pad;
};

/** card art faces screen-right: mirror when moving (dx, dz) points screen-left for this camera */
export const mirrorFor = (pos: [number, number, number], look: [number, number, number], dx: number, dz: number) => {
  const fx = look[0] - pos[0], fz = look[2] - pos[2]; // right = (-fz, 0, fx)
  return dx * -fz + dz * fx < 0;
};
export type BandOpts = {
  n: number; seed: number; x0: number; x1: number; z0: number; z1: number; f: number;
  cam: { pos: [number, number, number]; look: [number, number, number] }; lead?: [number, number];
  expr: (i: number) => Expr; arm?: (i: number) => Arm; look?: [number, number]; walking?: boolean; wander?: number; mood?: (i: number) => "calm" | "scared" | "howl" | "sleep" | "bark" | undefined;
};
/** a band of varied extras in a rectangle, never between the camera and the lead */
export const band = (o: BandOpts): Card[] => {
  const out: Card[] = [], t = o.f / 30;
  for (let i = 0; i < o.n; i++) {
    const e = extra(i, o.seed);
    let x = o.x0 + hh(i, o.seed + 2) * (o.x1 - o.x0), z = o.z0 + hh(i, o.seed + 4) * (o.z1 - o.z0);
    const dir = hh(i, o.seed + 5) < 0.5 ? 1 : -1;
    if (o.wander) { x += Math.sin(t * 0.4 + i * 1.7) * o.wander; z += dir * Math.cos(t * 0.35 + i) * o.wander; }
    if (Math.hypot(x - o.cam.pos[0], z - o.cam.pos[2]) < 1.8) continue;
    if (o.lead && blocksLead(o.cam.pos, o.lead, x, z)) continue;
    out.push(card(e, x, z, o.f, { expr: o.expr(i), arm: o.arm ? o.arm(i) : "down", walking: !!o.walking, dir: mirrorFor(o.cam.pos, o.cam.look, dir, 0) ? -1 : 1, look: o.look, mood: o.mood ? o.mood(i) : undefined }));
  }
  return out;
};
