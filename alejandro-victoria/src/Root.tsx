import React from "react";
import { Composition } from "remotion";
import { AlexShort } from "./videos/alejandro/Alex";
import { TOTAL, FPS } from "./videos/alejandro/story";
export const Root: React.FC = () => (
  <>
    <Composition id="AlejandroVictoria" component={AlexShort} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
  </>
);
