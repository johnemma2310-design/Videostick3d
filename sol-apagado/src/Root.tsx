import React from "react";
import { Composition } from "remotion";
import { SolShort } from "./videos/sol/Sol";
import { TOTAL, FPS } from "./videos/sol/story";
export const Root: React.FC = () => (
  <>
    <Composition id="SolApagado" component={SolShort} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
  </>
);
