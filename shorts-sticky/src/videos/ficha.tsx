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

// Hoja del elenco completo (BIBLIA/fotos/elenco_ficha.jpg): node scripts/fotos.mjs FichaElenco out/elenco_ 0 0.5
import { person } from "../engine/stick";
import { MAMA, PAPA, NINO, ABUELA, GRANJERO, CIENTIFICA, PROFE, DOCTORA, TENDERO, OBRERO, SENOR } from "../engine/elenco";
const CAST = [
  { n: "STICKY", o: null }, { n: "MAMÁ", o: MAMA }, { n: "PAPÁ", o: PAPA }, { n: "NIÑO", o: NINO },
  { n: "ABUELA", o: ABUELA }, { n: "GRANJERO", o: GRANJERO }, { n: "CIENTÍFICA", o: CIENTIFICA }, { n: "PROFE", o: PROFE },
  { n: "DOCTORA", o: DOCTORA }, { n: "TENDERO", o: TENDERO }, { n: "OBRERO", o: OBRERO }, { n: "SEÑOR", o: SENOR },
];
export const FichaElenco: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    g.fillStyle = "#cfeaff"; g.fillRect(0, 0, c.width, c.height);
    CAST.forEach((m, i) => {
      const cx = (i % 4) * 600, cy = Math.floor(i / 4) * 1080;
      g.save(); g.translate(cx, cy + 20);
      if (m.o) person(new Pen(g), { ...m.o, arm: m.o.arm ?? "down" }); else sticky(new Pen(g), { expr: "smile", arm: "wave", scarf: 0.3 });
      g.restore();
      g.fillStyle = "#241726"; g.font = "bold 46px Arial"; g.textAlign = "center"; g.fillText(m.n, cx + 300, cy + 1060);
    });
  }, []);
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={2400} height={3240} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

// Hoja de animales (BIBLIA/fotos/animales_ficha.jpg): node scripts/fotos.mjs FichaAnimales out/animales_ 0 0.4
import { dog, cat, bird, turtle, penguin, cow, chicken, pig, fishCard, beetle } from "../engine/stick";
const ANIM: { n: string; d: (p: Pen) => void }[] = [
  { n: "TOBY (PERRO)", d: (p) => dog(p, { coat: "#c98f5a", spot: "#3a2c24" }) }, { n: "PERRO LADRA", d: (p) => dog(p, { coat: "#f4f1ea", mood: "bark" }) },
  { n: "MICHI (GATA)", d: (p) => cat(p, { coat: "#8a8a94" }) }, { n: "GATO ASUSTADO", d: (p) => cat(p, { coat: "#f08a2c", mood: "scared" }) },
  { n: "PÁJARO", d: (p) => bird(p, { coat: "#7ab8ff", spot: "#2f86d6" }) }, { n: "TORTUGA", d: (p) => turtle(p, { coat: "#3fa34d" }) },
  { n: "PINGÜINO", d: (p) => penguin(p, { coat: "#000000" }) }, { n: "VACA", d: (p) => cow(p, { coat: "#ffffff" }) },
  { n: "GALLINA", d: (p) => chicken(p, { coat: "#ffffff" }) }, { n: "CERDO", d: (p) => pig(p, { coat: "#f7a8c0" }) },
  { n: "PEZ", d: (p) => fishCard(p, { coat: "#f2b632", spot: "#f4f1ea" }) }, { n: "ESCARABAJO", d: (p) => beetle(p, { coat: "#8a4fc9" }) },
];
export const FichaAnimales: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    g.fillStyle = "#d8f0d0"; g.fillRect(0, 0, c.width, c.height);
    ANIM.forEach((m, i) => {
      const cx = (i % 4) * 600, cy = Math.floor(i / 4) * 1080;
      g.save(); g.translate(cx, cy + 20); m.d(new Pen(g)); g.restore();
      g.fillStyle = "#241726"; g.font = "bold 46px Arial"; g.textAlign = "center"; g.fillText(m.n, cx + 300, cy + 1060);
    });
  }, []);
  return <AbsoluteFill><canvas ref={ref} width={2400} height={3240} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
