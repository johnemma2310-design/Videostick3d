import React from "react";
import { Composition } from "remotion";
import { makeShort } from "./engine/Short";
import { APAGON } from "./videos/apagon";
import { LUNA } from "./videos/luna";
import { ROTACION } from "./videos/rotacion";
import { OUTRO } from "./videos/outro";
const Apagon = makeShort(APAGON);
const Luna = makeShort(LUNA);
const Rotacion = makeShort(ROTACION);
const Outro = makeShort(OUTRO);
export const Root: React.FC = () => (
  <>
    <Composition id="Apagon" component={Apagon} durationInFrames={APAGON.TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Luna" component={Luna} durationInFrames={LUNA.TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Rotacion" component={Rotacion} durationInFrames={ROTACION.TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Outro" component={Outro} durationInFrames={OUTRO.TOTAL} fps={30} width={1080} height={1920} />
  </>
);
