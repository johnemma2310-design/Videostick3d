# Estándar de calidad (no se negocia)

Todos los videos tienen que salir **con esta calidad**. Las fotos de referencia están en [`fotos/`](fotos/): `apagon.jpg`, `luna.jpg`, `rotacion.jpg`, `sol.jpg`, `subtitulos.jpg` y `cierre.jpg`. Si un render nuevo se ve peor que esas fotos, no está listo.

> Para el ritmo, el movimiento y las paredes manda [SHORTS_NINOS.md](SHORTS_NINOS.md). La duración allí es 35–50 s más el cierre.

## Imagen

| Cosa | Valor |
|---|---|
| Formato | Vertical 1080×1920, 30 fps (shorts). Horizontal 1920×1080 para videos largos (ver abajo) |
| Render | `npx remotion render ... --codec h264 --crf 18 --gl=angle --concurrency=3 --timeout=240000` |
| Postproceso | Tinta (contornos) → desenfoque de lente → brillo (bloom) → tono NEUTRAL → gradación de color, con MSAA 4 |
| Cámara | Tomas con keyframes suaves (`glide`) y fundido de 6 frames entre tomas |
| Enfoque | Siempre en Sticky; el fondo un poco desenfocado |
| Colores | Saturados y alegres; la noche es azul, nunca negra |
| Personajes | Estilo v2: cuerpo con ropa y sombra de corte duro (ver `fotos/elenco_ficha.jpg`) |
| Sombras | Cada personaje proyecta su silueta en el piso (la tarjeta se gira hacia el sol solo para la sombra) |

### Cara al ritmo de la voz (`caraEn`)

La cara cambia **2 cuadros antes** de la palabra clave (así se ve que el personaje reacciona a lo que dice). En la historia:

```ts
import { caraEn } from "../engine/timeline";
// [palabra | cuadro, expr] o [palabra, expr, buscarDesde]; antes de la primera entrada va la cara base
const ex = caraEn<Expr>(VOZ, f, [["no vuelve", "susto"], ["gravedad", "sorpresa"], ["pum", "scream", 1250], [1291, "llora"]], "feliz");
```

La palabra se busca en `palabras.json` sin acentos ni signos ("¡PUM!" = "pum") y acepta frases ("sin gravedad").
`palabraEn(VOZ, "vaca")` da el cuadro de una palabra. Pon 6–10 cambios de cara por short, en las palabras fuertes.

### Saltito de cámara en los golpes (`conSalto`)

Además del `shake`, cada golpe (choque, ¡PUM!, aterrizaje) lleva un **salto corto y seco** de la imagen: en 4 cuadros la
cámara entera (posición y mira) baja de golpe, rebota y vuelve. Se pone una sola vez envolviendo `camAt`:

```ts
const { camAt: camBase, layersAt } = makeTimeline(SHOTS);
const GOLPES: (number | [number, number])[] = [1138, [1261, 0.26], 1277];   // cuadro del impacto o [cuadro, amp en m]
const camAt = (id: number, f: number) => conSalto(camBase(id, f), f, GOLPES);  // amp por defecto 0.14 m
```

Usa 0.10–0.16 m si la cámara está cerca (interiores) y 0.2–0.3 m en los golpes grandes vistos de lejos.

### Carteles 3D legibles

- Un cartel que hay que **leer** va a la misma distancia de la cámara que el personaje enfocado: si queda muy cerca o muy
  lejos de la cámara, el desenfoque de lente lo borra. Si es solo decoración, da igual.
- Si la cámara mira hacia el otro lado (de -z hacia +z), lo que estaba a la derecha queda a la izquierda y un cartel plano se
  ve por detrás (al revés, o ni se ve). Los carteles de los escenarios miran hacia +z (o hacia el centro del cuarto si están
  en una pared de lado): para leerlos, la cámara tiene que estar del lado al que miran. Y una tarjeta con letras (`cameo`)
  nunca lleva `mirror`.
- Los títulos que siempre se tienen que leer van como `MARKS` (2D), no como carteles 3D.

## Portada (miniatura)

Una portada se tiene que entender **en 1 segundo**: personajes reconocibles y GRANDES (Sticky enorme), **una sola idea**,
texto corto (máx. 3 palabras) **gigante con borde grueso** y algo de **miedo o sorpresa** en la cara (`sorpresa`, `susto`).

- Cada historia exporta `portada: Portada` en su `Story` (ver `src/engine/portada.tsx`): `texto` (líneas en vertical),
  `textoH` (horizontal), `col`, `expr`, `arm`, `set`, `sticky: { head, roll }` (`roll: Math.PI` = de cabeza), `cosas` /
  `cosasH` (tarjetas flotando), `cam` / `camH` y `blur` (desenfoque del fondo).
- Para una historia nueva agrégala en `HISTORIAS` de `src/Root.tsx`.
- Comandos (en `shorts-sticky/`, cambia la carpeta y la historia):

```
npx remotion still src/index.ts Portada  "../<carpeta del video>/portada.png"   --props="{\"historia\":\"gravedad\"}" --gl=angle
npx remotion still src/index.ts PortadaH "../<carpeta del video>/portada_h.png" --props="{\"historia\":\"gravedad\"}" --gl=angle --scale=0.6667
```

`Portada` sale a 1080×1920 (shorts) y `PortadaH` a 1920×1080, que con `--scale=0.6667` queda en 1280×720 (YouTube).
Revisa que el texto no tape la cara de Sticky y que todo se lea en chiquito (mira la foto a escala 0.2).

## Formato horizontal (videos largos, retirado: solo referencia)

- La historia declara `formato: "horizontal"` (`types.ts`) y en `Root.tsx` se registra con `{...dims(HISTORIA)}` → 1920×1080.
  Sin `formato` todo sigue vertical, igual que antes.
- Cámara: el `fov` de three es **vertical**; en horizontal usa **40–45** para encuadres equivalentes (el cuadro ya es ancho).
  Deja a Sticky en un tercio (izquierdo o derecho) y nunca en la franja de abajo (y > 900), que es de los subtítulos.
- Lo que se ajusta solo: canvas, títulos (`MARKS` arriba a y = 150, letra 80), líneas de velocidad, tinta / desenfoque / brillo
  (todo se escala con la altura de salida), resolución de las tarjetas (como hay menos pixeles de alto se dibujan más chicas)
  y la caja de sombras del sol (1.6× más ancha y mapa 4096 para que no se corten a los lados).
- Los `overlay` SVG propios de cada historia deben ser de 1920×1080.
- Subtítulos: `subtitulos.py` detecta la orientación con ffprobe → Arial Black 64, borde 6, centrados en y = 960,
  máximo 5 palabras / 28 caracteres por grupo. El resultado vertical no cambia.
- Cierre: composición `OutroH` (misma voz `voz/outro`, mismo TOTAL 170) → `out/outro_final_h.mp4`. `RENDERIZAR.bat` lo usa
  solo en los videos marcados `H=1` (hoy `musculo`). Si un video nuevo no tiene entrada en `audio/mezcla.py`, usa la mezcla genérica.
- Prueba: composición `PruebaH` (`src/videos/pruebaH.ts`), `node scripts/fotos.mjs PruebaH out/ph_ 30,90,160,215 0.35`.
  Referencia: `fotos/gym_horizontal.jpg`.

## Sonido y voz

| Cosa | Valor |
|---|---|
| Voz | edge-tts `es-MX-JorgeNeural` a `+24%` (`python -I ../tts.py es-MX-JorgeNeural +24%` dentro de `voz/<video>/`) |
| Tiempos | `palabras.json` (cada palabra con su tiempo, frame = t·30) |
| Música y efectos | `audio/mezcla.py`: punteos, golpes y whooshes; la música baja cuando habla la voz |
| Mezcla | La voz va **+12 dB sobre la música** mientras habla (`mezcla.py` lo calcula y lo imprime: `voz-musica 12.0 dB`); en pausas la música sube un poco |
| Efectos | Golpes **cortos** y audibles (whoosh, pop, boing, golpe) en los cortes |
| Ambiente | **Nada de ambiente sintético en bucle** (pads o zumbidos largos): un pad solo es un acento de 1-3 s con entrada y salida |
| Volumen | loudnorm **-14 LUFS** |
| Limpieza | `RENDERIZAR.bat` borra al terminar `%TEMP%\remotion-webpack-bundle-*` (cada render deja ~70 MB) |

## Subtítulos

- Quemados en el video, palabra por palabra, con Arial Black 84, borde 8 y centrados a y = 1390.
- La palabra que se está diciendo va en amarillo y un 12 % más grande.
- Máximo 3 palabras por grupo, que nunca se pisan entre sí (`subtitulos.py`).

## Guion

- Entre 45 y 60 segundos más el cierre.
- Gancho en la primera frase (la pregunta del título).
- Datos reales y verificables, y al menos un dato sorprendente.
- **Termina siempre con el cierre:** "Si quieres saber más, suscríbete, dale like y déjame en los comentarios qué más quieres saber. ¡Y el último en comentar en mi video largo sale en el próximo short, con su foto y su nombre!". El cierre ya está hecho en `shorts-sticky/out/outro_final.mp4` y `RENDERIZAR.bat` lo pega solo.

## Revisión antes de dar un video por terminado

- [ ] 6 o más escenarios distintos y cambio de ambiente (día, noche, espacio, agua...)
- [ ] Sticky se ve en cada escena y nada lo tapa
- [ ] Personajes del elenco fijo (`elenco.ts`) más extras variados, sin que estén todos en todas las escenas
- [ ] Nadie aparece hundido en el suelo, cortado o tapando la cámara
- [ ] Revisar fotos sueltas con `node scripts/fotos.mjs <Comp> rev <frames>` y una hoja de contacto
- [ ] Subtítulos sin solaparse y bien sincronizados con la voz
- [ ] Volumen en -14 LUFS (`ffmpeg -i video.mp4 -af ebur128 -f null -`)
- [ ] El cierre (suscríbete, like, comenta y cameo) está al final
- [ ] `portada.png` (1080×1920) y `portada_h.png` (1280×720) en la carpeta del video
- [ ] La carpeta del video tiene el `.mp4` y el `PUBLICAR.txt` (título calificado en vidIQ, descripción, hashtags y tags)
- [ ] Código y `PUBLICAR.txt` subidos a GitHub (`SINCRONIZAR.bat`)
