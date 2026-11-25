// Sticky: big round white head, googly eyes, stick body and limbs, blue scarf. Design space 600 x 1000 (soles at y = 975),
// same as the toon cards, so it plugs into the card pool. Our own drawing of the channel's host.
import { Pen, INK } from "./toon";

type P2 = [number, number];
export type StickyExpr = "smile" | "lick" | "shock" | "sad" | "shiver" | "relief" | "frozen";
export type StickyOpts = {
  expr: StickyExpr;
  arm?: "icecream" | "up" | "down" | "point";
  look?: [number, number]; // pupils offset, -1..1
  blink?: number;          // 0 open .. 1 closed
  scarf?: number;          // scarf-tail wave phase 0..1
  ang?: number;            // raised-arm angle (radians, for twirling the rope)
};
const SCARF = "#2f86d6", SCARF_D = "#1f5f9e", WHITE = "#ffffff", MOUTH = "#5a1e28";
const HX = 300, HY = 330, HR = 150; // head
const NECK: P2 = [300, 482], HIP: P2 = [300, 740], SHO: P2 = [300, 548];

export const stickyHand = (o: StickyOpts): P2 => {
  if (o.arm === "up") { const a = o.ang ?? 0; return [395 + 25 * Math.cos(a), 300 + 12 * Math.sin(a)]; }
  if (o.arm === "point") return [470, 520];
  if (o.arm === "icecream") return [370, 600];
  return [380, 700];
};

export const sticky = (p: Pen, o: StickyOpts) => {
  const lw = 14, ph = (o.scarf ?? 0) * Math.PI * 2;
  // legs, body, arms: thick ink sticks
  p.stroke([HIP, [242, 968]], lw); p.stroke([HIP, [358, 968]], lw);
  p.ell(232, 970, 30, 12, INK, 0); p.ell(368, 970, 30, 12, INK, 0);
  p.stroke([NECK, HIP], lw);
  const shiver = o.expr === "shiver" ? 10 : 0;
  p.stroke([SHO, [238 - shiver, 640], [214, 720]], lw); // left arm hangs (or hugs itself when cold)
  const hand = stickyHand(o);
  const elbow: P2 = o.arm === "up" ? [380, 430] : o.arm === "point" ? [400, 530] : o.arm === "icecream" ? [395, 650] : [355, 640];
  p.stroke([SHO, elbow, hand], lw);
  p.dot(hand[0], hand[1], 12); p.dot(214, 720, 12);
  // scarf: wrap at the neck and a tail that waves
  const tail: P2[] = [[318, 492]];
  for (let i = 1; i <= 6; i++) tail.push([318 + i * 14 + Math.sin(ph + i * 0.8) * 8 * (i / 6), 492 + i * 26]);
  const tw: P2[] = [...tail.map(([x, y]) => [x - 18, y] as P2), ...tail.slice().reverse().map(([x, y]) => [x + 18, y + 4] as P2)];
  p.poly(tw, SCARF, 8);
  p.stroke([[300, 560], [345, 640]], 0.1, SCARF);
  p.poly([[218, 462], [384, 462], [392, 512], [210, 512]], SCARF, 9);
  p.stroke([[226, 488], [376, 488]], 5, SCARF_D);
  // head
  p.ell(HX, HY, HR, HR * 0.96, WHITE, 15);
  p.arc(HX + 25, HY + 30, HR * 0.86, HR * 0.8, 10, 120, 10, "#d8dde8"); // painted shade crescent
  // eyes
  const [lx, ly] = o.look ?? [0, 0], blink = o.blink ?? 0;
  const eyeW = o.expr === "shock" ? 48 : 40, eyeH = o.expr === "shock" ? 60 : 52;
  for (const ex of [248, 352]) {
    const ey = 300;
    if (o.expr === "relief" || o.expr === "smile" && blink > 0.5) { p.arc(ex, ey + 10, 30, 22, 200, 340, 9); continue; }
    if (o.expr === "frozen") { p.ell(ex, ey, eyeW, eyeH, WHITE, 9); p.stroke([[ex - 30, ey], [ex + 30, ey]], 8); continue; }
    p.ell(ex, ey, eyeW, eyeH * (1 - 0.9 * blink), WHITE, 9);
    if (blink < 0.6) p.dot(ex + lx * 16, ey + ly * 22, o.expr === "shock" ? 13 : 17);
    if (o.expr === "sad") p.stroke([[ex - 34, ey - 62 - (ex < 300 ? -10 : 10)], [ex + 34, ey - 62 + (ex < 300 ? -10 : 10)]].map(([x, y]) => [x, y] as P2), 9);
  }
  // mouth
  const mx = HX, my = HY + 85;
  switch (o.expr) {
    case "smile": p.arc(mx, my - 18, 42, 26, 20, 160, 9); break;
    case "relief": p.arc(mx, my - 20, 52, 34, 15, 165, 10); break;
    case "lick": p.arc(mx, my - 18, 40, 22, 20, 160, 9); p.ell(mx + 26, my + 6, 13, 16, "#e86e78", 6); break;
    case "shock": p.ell(mx, my, 26, 32, MOUTH, 9); break;
    case "sad": p.arc(mx, my + 18, 34, 18, 200, 340, 9); break;
    case "shiver": case "frozen": {
      const pts: P2[] = []; for (let i = 0; i <= 8; i++) pts.push([mx - 40 + i * 10, my + (i % 2 ? 8 : -8)]);
      p.poly([[mx - 44, my - 14], [mx + 44, my - 14], [mx + 44, my + 14], [mx - 44, my + 14]], WHITE, 8); p.stroke(pts, 5);
      break;
    }
  }
  // the ice cream, in front of everything
  if (o.arm === "icecream") {
    const [x, y] = hand;
    p.poly([[x - 26, y - 34], [x + 26, y - 34], [x, y + 30]], "#e0a35a", 6);
    p.stroke([[x - 16, y - 20], [x + 8, y + 4]], 3, "#b77a3a");
    p.ell(x, y - 56, 34, 30, "#f7c6d9", 7);
    p.ell(x - 10, y - 66, 8, 6, "#ffffff", 0);
    p.dot(x, y, 12);
  }
};

/** the dropped ice cream (on the ground, 256 x 256) */
export const iceDrop = (p: Pen) => {
  p.ell(128, 150, 70, 40, "#f7c6d9", 7);
  p.poly([[150, 140], [230, 110], [214, 160]], "#e0a35a", 6);
};
/** a small fish card for under the ice (256 x 128) */
export const fish = (col: string) => (p: Pen) => {
  p.ell(110, 64, 70, 38, col, 7);
  p.poly([[175, 64], [236, 30], [236, 98]], col, 7);
  p.ell(72, 56, 10, 10, "#ffffff", 4); p.dot(70, 56, 5);
};
