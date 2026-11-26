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

// Ficha de movimiento: fila 1 Sticky camina, fila 2 Sticky corre, fila 3 Papá camina, fila 4 Niño corre, fila 5 bocas al hablar.
// node scripts/fotos.mjs FichaMovimiento out/mov_ 0 0.3
const PH = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];
export const FichaMovimiento: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    g.fillStyle = "#e8f4ff"; g.fillRect(0, 0, c.width, c.height);
    const cell = (col: number, row: number, d: (p: Pen) => void) => { g.save(); g.translate(col * 600, row * 1000); d(new Pen(g)); g.restore(); };
    PH.forEach((w, i) => {
      cell(i, 0, (p) => sticky(p, { expr: "smile", arm: "down", walk: w, scarf: w }));
      cell(i, 1, (p) => sticky(p, { expr: "shock", arm: "down", walk: w, run: true, scarf: w }));
      cell(i, 2, (p) => person(p, { ...PAPA, arm: "down", walk: w }));
      cell(i, 3, (p) => person(p, { ...NINO, arm: "down", walk: w, run: true }));
    });
    [["neutral", 1], ["neutral", 2], ["neutral", 3], ["smile", 1], ["smile", 3], ["worried", 2], ["happy", 2], ["shock", 2]].forEach(([e, l], i) =>
      cell(i, 4, (p) => sticky(p, { expr: e as Expr, arm: "down", talk: l as number })));
  }, []);
  return <AbsoluteFill><canvas ref={ref} width={4800} height={5000} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};

// Ficha de Sticky musculoso: columnas musc 0, 2, 4, 6, 8, 10 (tarjeta ancha de 1000). Fila 1 parado, fila 2 saca bíceps,
// fila 3 camina / corre / habla / mancuerna. node scripts/fotos.mjs FichaMusculo out/musc_ 0 0.2
const MUSC = [0, 2, 4, 6, 8, 10];
export const FichaMusculo: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    g.fillStyle = "#e8f4ff"; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "#9cb4d0"; g.lineWidth = 4;
    for (let r = 0; r < 3; r++) { g.beginPath(); g.moveTo(0, r * 1060 + 995); g.lineTo(c.width, r * 1060 + 995); g.stroke(); }
    const ROW3: { o: Partial<import("../engine/stick").StickyOpts> }[] = [
      { o: { walk: 0.25 } }, { o: { walk: 0.5 } }, { o: { walk: 0.25, run: true, expr: "shock" } }, { o: { walk: 0.75, run: true, expr: "shock" } }, { o: { talk: 2, expr: "smile" } }, { o: { arm: "curl", expr: "happy" } },
    ];
    MUSC.forEach((mu, i) => {
      const cell = (row: number, o: Partial<import("../engine/stick").StickyOpts>) => {
        g.save(); g.translate(i * 1000 + 200, row * 1060 + 20);
        sticky(new Pen(g), { expr: "smile", arm: "down", scarf: 0.3, musc: mu, ...o });
        g.restore();
      };
      cell(0, {});
      cell(1, { arm: "flex", expr: "happy" });
      cell(2, ROW3[i].o);
      g.fillStyle = "#241726"; g.font = "bold 56px Arial"; g.textAlign = "center"; g.fillText(`musc ${mu}`, i * 1000 + 500, 3240);
    });
  }, []);
  return <AbsoluteFill><canvas ref={ref} width={6000} height={3280} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
