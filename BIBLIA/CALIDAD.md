# Estándar de calidad (no se negocia)

Todos los videos tienen que salir **con esta calidad**. Las fotos de referencia están en [`fotos/`](fotos/): `apagon.jpg`, `luna.jpg`, `rotacion.jpg`, `sol.jpg`, `subtitulos.jpg` y `cierre.jpg`. Si un render nuevo se ve peor que esas fotos, no está listo.

## Imagen

| Cosa | Valor |
|---|---|
| Formato | Vertical 1080×1920, 30 fps |
| Render | `npx remotion render ... --codec h264 --crf 18 --gl=angle --concurrency=3 --timeout=240000` |
| Postproceso | Tinta (contornos) → desenfoque de lente → brillo (bloom) → tono NEUTRAL → gradación de color, con MSAA 4 |
| Cámara | Tomas con keyframes suaves (`glide`) y fundido de 6 frames entre tomas |
| Enfoque | Siempre en Sticky; el fondo un poco desenfocado |
| Colores | Saturados y alegres; la noche es azul, nunca negra |

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
