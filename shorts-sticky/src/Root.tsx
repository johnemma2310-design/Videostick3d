import React from "react";
import { Composition } from "remotion";
import { makeShort } from "./engine/Short";
import { APAGON } from "./videos/apagon";
import { LUNA } from "./videos/luna";
import { ROTACION } from "./videos/rotacion";
import { OUTRO } from "./videos/outro";
import { OUTRO_H } from "./videos/outroH";
import { PRUEBAH } from "./videos/pruebaH";
import { MUSCULO } from "./videos/musculo";
import { GRAVEDAD } from "./videos/gravedad";
import { GALLINAS } from "./videos/gallinas";
import { PECES } from "./videos/peces";
import { dims, type Story } from "./engine/types";
import { portadaStory } from "./engine/portada";
import { getInputProps } from "remotion";
import { FichaSticky, FichaElenco, FichaAnimales, FichaMovimiento, FichaMusculo, FichaCaras } from "./videos/ficha";
const Apagon = makeShort(APAGON);
const Luna = makeShort(LUNA);
const Rotacion = makeShort(ROTACION);
const Outro = makeShort(OUTRO);
const OutroH = makeShort(OUTRO_H);
const PruebaH = makeShort(PRUEBAH);
const Musculo = makeShort(MUSCULO);
const Gravedad = makeShort(GRAVEDAD);
const Gallinas = makeShort(GALLINAS);
const Peces = makeShort(PECES);
// Portada (miniatura) de la historia elegida con --props='{"historia":"gravedad"}' (por defecto la del último short)
const HISTORIAS: Record<string, Story> = { gravedad: GRAVEDAD, gallinas: GALLINAS, peces: PECES };
const portadaDe = (hz: boolean) => {
  const cache: Record<string, React.FC> = {};
  return () => {
    const h = (getInputProps() as { historia?: string }).historia ?? "gravedad", S = HISTORIAS[h];
    if (!S?.portada) throw new Error(`la historia «${h}» no tiene portada`);
    const C = (cache[h] ??= makeShort(portadaStory(S.portada, hz ? "horizontal" : "vertical")));
    return <C />;
  };
};
const Portada = portadaDe(false), PortadaH = portadaDe(true);
export const Root: React.FC = () => (
  <>
    <Composition id="Apagon" component={Apagon} durationInFrames={APAGON.TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Luna" component={Luna} durationInFrames={LUNA.TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Rotacion" component={Rotacion} durationInFrames={ROTACION.TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Gravedad" component={Gravedad} durationInFrames={GRAVEDAD.TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Gallinas" component={Gallinas} durationInFrames={GALLINAS.TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Peces" component={Peces} durationInFrames={PECES.TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Portada" component={Portada} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="PortadaH" component={PortadaH} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Outro" component={Outro} durationInFrames={OUTRO.TOTAL} fps={30} width={1080} height={1920} />
    {/* horizontales 1920x1080 (videos largos): el tamaño sale del `formato` de la historia */}
    <Composition id="OutroH" component={OutroH} durationInFrames={OUTRO_H.TOTAL} fps={30} {...dims(OUTRO_H)} />
    <Composition id="PruebaH" component={PruebaH} durationInFrames={PRUEBAH.TOTAL} fps={30} {...dims(PRUEBAH)} />
    <Composition id="Musculo" component={Musculo} durationInFrames={MUSCULO.TOTAL} fps={30} {...dims(MUSCULO)} />
    <Composition id="FichaSticky" component={FichaSticky} durationInFrames={1} fps={30} width={1800} height={3200} />
    <Composition id="FichaElenco" component={FichaElenco} durationInFrames={1} fps={30} width={2400} height={3240} />
    <Composition id="FichaAnimales" component={FichaAnimales} durationInFrames={1} fps={30} width={2400} height={3240} />
    <Composition id="FichaMusculo" component={FichaMusculo} durationInFrames={1} fps={30} width={6000} height={3280} />
    <Composition id="FichaCaras" component={FichaCaras} durationInFrames={1} fps={30} width={3000} height={4320} />
    <Composition id="FichaMovimiento" component={FichaMovimiento} durationInFrames={1} fps={30} width={4800} height={5000} />
  </>
);
