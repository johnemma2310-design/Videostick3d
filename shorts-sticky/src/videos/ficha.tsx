// Hoja de personaje: Sticky con varias expresiones y poses (referencia para BIBLIA/fotos/sticky_ficha.jpg).
// node scripts/fotos.mjs FichaSticky ../BIBLIA/fotos/sticky_ficha_ 0 0.5
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { Pen } from "../engine/toon";
import { sticky, type Expr, type Arm } from "../engine/stick";

const POSES: { expr: Expr; arm: Arm; look?: [number, number]; name: string }[] = [
  { expr: "neutral", arm: "down", name: "neutral" },
  { expr: "smile", arm: "wave", name: "smile + wave" },
  { expr: "happy", arm: "cheer", name: "happy + cheer" },
  { expr: "shock", arm: "cover", name: "shock + cover" },
  { expr: "worried", arm: "phone", look: [0.6, 0.3], name: "worried + phone" },
  { expr: "scream", arm: "fly", name: "scream + fly" },
  { expr: "sad", arm: "candle", name: "sad + candle" },
  { expr: "shiver", arm: "hug", name: "shiver + hug" },
  { expr: "sleep", arm: "down", name: "sleep" },
];

export const FichaSticky: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    g.fillStyle = "#bfe3ff"; g.fillRect(0, 0, c.width, c.height);
    POSES.forEach((po, i) => {
      const cx = (i % 3) * 600, cy = Math.floor(i / 3) * 1060;
      g.save(); g.translate(cx, cy + 20);
      sticky(new Pen(g), { expr: po.expr, arm: po.arm, look: po.look, scarf: i / 9 });
      g.restore();
      g.fillStyle = "#241726"; g.font = "bold 40px Arial"; g.textAlign = "center"; g.fillText(po.name, cx + 300, cy + 1050);
    });
  }, []);
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={1800} height={3200} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
