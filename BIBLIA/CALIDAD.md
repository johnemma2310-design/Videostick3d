# Estándar de calidad (no se negocia)

Todos los videos tienen que salir **con esta calidad**. Las fotos de referencia están en [`fotos/`](fotos/): `apagon.jpg`, `luna.jpg`, `rotacion.jpg`, `sol.jpg`, `subtitulos.jpg` y `cierre.jpg`. Si un render nuevo se ve peor que esas fotos, no está listo.

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

## Formato horizontal (videos largos)

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
| Música y efectos | `audio/mezcla.py`: punteos, golpes, whooshes y pads; la música baja cuando habla la voz |
| Volumen | loudnorm **-14 LUFS** |

## Subtítulos

- Quemados en el video, palabra por palabra, con Arial Black 84, borde 8 y centrados a y = 1390.
- La palabra que se está diciendo va en amarillo y un 12 % más grande.
- Máximo 3 palabras por grupo, que nunca se pisan entre sí (`subtitulos.py`).

## Guion

- Entre 45 y 60 segundos más el cierre.
- Gancho en la primera frase (la pregunta del título).
- Datos reales y verificables, y al menos un dato sorprendente.
- **Termina siempre con el cierre:** "Si quieres saber más, suscríbete y déjame en los comentarios qué más quieres saber". El cierre ya está hecho en `shorts-sticky/out/outro_final.mp4` y `RENDERIZAR.bat` lo pega solo.

## Revisión antes de dar un video por terminado

- [ ] 6 o más escenarios distintos y cambio de ambiente (día, noche, espacio, agua...)
- [ ] Sticky se ve en cada escena y nada lo tapa
- [ ] Personajes del elenco fijo (`elenco.ts`) más extras variados, sin que estén todos en todas las escenas
- [ ] Nadie aparece hundido en el suelo, cortado o tapando la cámara
- [ ] Revisar fotos sueltas con `node scripts/fotos.mjs <Comp> rev <frames>` y una hoja de contacto
- [ ] Subtítulos sin solaparse y bien sincronizados con la voz
- [ ] Volumen en -14 LUFS (`ffmpeg -i video.mp4 -af ebur128 -f null -`)
- [ ] El cierre "suscríbete y comenta" está al final
- [ ] La carpeta del video tiene el `.mp4` y el `PUBLICAR.txt` (título calificado en vidIQ, descripción, hashtags y tags)
- [ ] Código y `PUBLICAR.txt` subidos a GitHub (`SINCRONIZAR.bat`)
