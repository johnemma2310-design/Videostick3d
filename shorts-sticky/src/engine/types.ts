import type { ReactNode } from "react";
import type { StickyOpts, PersonOpts, AnimalOpts, CarOpts } from "./stick";
import type { CameoOpts } from "./cameo";
export type V3 = [number, number, number];
export type Env = "day" | "dusk" | "night" | "space" | "underwater";
export type SetName = "park" | "street" | "beach" | "space" | "house" | "elevator" | "hospital" | "store" | "classroom" | "desert" | "reef" | "farm" | "gym";
export type Card =
  | { kind: "sticky"; o: StickyOpts; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean }
  | { kind: "person"; o: PersonOpts; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean }
  | { kind: "dog" | "cat" | "turtle" | "penguin"; o: AnimalOpts; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean }
  | { kind: "bird"; o: AnimalOpts & { fly?: boolean }; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean }
  | { kind: "car"; o: CarOpts; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean }
  | { kind: "wave"; o: { t: number }; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean }
  | { kind: "cow" | "chicken" | "pig" | "fish" | "beetle"; o: AnimalOpts; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean }
  | { kind: "top"; o: { col: string; t: number; tilt: number }; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean }
  | { kind: "plane"; o: { body: string }; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean }
  /** tarjeta de cameo: una persona sostiene el marco con la foto de un invitado (ver engine/cameo.ts) */
  | { kind: "cameo"; o: CameoOpts; x: number; y?: number; z: number; s?: number; roll?: number; mirror?: boolean };
export type SpaceState = {
  sun?: { pos: V3; r: number; lit: boolean };
  earth?: { pos: V3; r: number; rot: number; tilt?: number; prec?: number; axis?: boolean };
  moon?: { pos: V3; r: number; show: number };
  lightDir?: V3; // direction the sunlight comes FROM (when there is no sun ball)
};
export type SceneState = {
  set: SetName; env: Env; cards: Card[];
  lights?: number;                       // street: windows, lamps, traffic lights 0..1
  stars?: number; milky?: number;        // night sky
  sunDisc?: boolean; moonDisc?: { show: number; bright: number };
  tide?: number;                          // beach: sea level (m)
  flow?: number;                          // beach: sea rushing sideways (m/s)
  space?: SpaceState;
  speedLines?: number;                    // 2D overlay
  shake?: number;
  snow?: boolean;  // park: snowy pole look
  fridge?: number; // house: fridge door open 0..1
  tv?: boolean;    // house: TV on
  water?: number;  // house: tap running 0..1
  spawn?: number;  // reef: coral spawning 0..1
  bascula?: number; // gym: aguja de la báscula grande 0..1 (0 = 0 kg, 1 = vuelta casi completa)
  saco?: number;    // gym: cuánto se balancea el saco de boxeo 0..1
  cinta?: number;   // gym: velocidad de la banda de la caminadora (m/s)
  /** sin gravedad 0..1: los objetos sueltos del escenario (muebles, pesas, pacas, bancas, productos, agua) se elevan y giran.
   *  0 = todo en su lugar (por defecto). Para que caigan con rebote usa flotaCae() de sets.ts. */
  flota?: number;
};
export type Cam = { pos: V3; look: V3; fov: number };
export type Mark = { a: number; b: number; label: string; sub: string; col: string };
/** vertical 1080x1920 (shorts, por defecto) u horizontal 1920x1080 (videos largos) */
export type Formato = "vertical" | "horizontal";
export const dims = (s: { formato?: Formato }) => (s.formato === "horizontal" ? { width: 1920, height: 1080 } : { width: 1080, height: 1920 });
export type Story = {
  TOTAL: number;
  /** formato del video; si falta es vertical (shorts) */
  formato?: Formato;
  camAt: (id: number, f: number) => Cam;
  layersAt: (f: number) => { id: number; alpha: number }[];
  dofAt: (id: number, f: number) => { cInf: number; focus?: V3 };
  state: (id: number, f: number) => SceneState;
  MARKS: Mark[];
  overlay?: (f: number) => ReactNode;
  /** palabras de la voz: si está, la boca de Sticky se mueve sola con el narrador */
  voz?: { w: string; t: number; d: number }[];
  /** invitado especial (cameo): la foto se precarga antes de renderizar. foto = ruta dentro de public/ */
  cameo?: { foto: string; nombre: string };
};
