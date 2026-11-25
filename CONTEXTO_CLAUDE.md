# Contexto para Claude: shorts animados de «Curiosidades con Sticky»

> Lee esto primero. Resume todo lo que se hizo en la otra PC (25 nov 2026) para que puedas seguir igual.

> **Después lee la carpeta [`BIBLIA/`](BIBLIA/)**: [PERSONAJES](BIBLIA/PERSONAJES.md) (elenco fijo),
> [ESCENARIOS](BIBLIA/ESCENARIOS.md), [CALIDAD](BIBLIA/CALIDAD.md) (estándar y revisión, con fotos de referencia),
> [SINCRONIZAR](BIBLIA/SINCRONIZAR.md) (cómo trabajar entre las dos PCs) y [VIDEOS](BIBLIA/VIDEOS.md) (registro).

## Qué hacemos
El usuario sube **shorts verticales para YouTube** a su canal **«Curiosidades con Sticky»** (@StickyElCurioso).
Son preguntas del tipo **«¿Qué pasaría si…?»**, animadas en estilo **stickman en un mundo 3D de colores**.
Todo se hace con código (three.js dentro de Remotion), sin generadores de video con IA.

Base: la skill gratuita de LuisPa, `https://github.com/luispablovillasenor-afk/shorts-animados-claude`
(MIT, basada en `claude-animated-shorts` de Mr omi). Su `SKILL.md` explica el estilo, pero **las reglas del
usuario (abajo) mandan sobre la skill**.

## Reglas del usuario (SIEMPRE)
1. **Sticky es el protagonista:** cabeza blanca grande, ojos saltones, cuerpo de palito y **bufanda azul**.
2. **Todos son stickman:** personas con bigote, barba, lentes y sombreros variados, niños, abuelita con bastón,
   perros, gatos, pájaros, vacas, gallinas, etc. Que haya variedad, **pero no todos en todas las escenas**:
   cada lugar lleva su propio elenco chico (la familia, el granjero, doctor y enfermera, maestro y niños…).
3. **Muchas escenas, lugares y colores distintos** (8-14 tomas, en 6 o más lugares). Que no se quede en uno solo.
4. **Voz de narrador en español** con edge-tts, voz `es-MX-JorgeNeural`, velocidad `+24%` (de 3 a 3.5 palabras por segundo).
5. **Subtítulos quemados palabra por palabra:** grupos de 2 o 3 palabras, la palabra que se está diciendo en
   amarillo y la posición a ~72 % de la altura.
6. **Títulos discretos arriba** (cifras, «HORA 0», «1,670 km/h»…), sin taparle la cara a nadie.
7. **Cierre fijo al final de cada video** (5.7 s): el narrador dice «Si quieres saber más, suscríbete, y déjame en los
   comentarios qué más quieres saber». Salen Sticky y el elenco saludando, un botón rojo SUSCRIBIRSE que se
   presiona (cambia a SUSCRITO ✓ y suena una campanita) y una burbuja «¿Qué más quieres saber? ¡Comenta!».
8. **Duración:** la misma que el video de referencia que te pase, en general unos 55 s más el cierre.
9. **Guion propio**, con datos reales y su fuente. Del video de referencia se toma el tema, nunca el texto.
10. Cada video terminado va en **su propia carpeta, con el nombre del video** (sin `¿?`, que Windows no los
    permite). Dentro van el `.mp4` y un `PUBLICAR.txt` con títulos calificados en vidIQ, descripción, #hashtags y
    tags.
11. Sonido: la voz al frente, música y efectos sintetizados abajo, y el volumen final a **-14 LUFS**.
12. **Mismo elenco en todos los videos:** usa los personajes de `shorts-sticky/src/engine/elenco.ts` (Sticky, MAMA,
    PAPA, NINO, ABUELA, GRANJERO, CIENTIFICA, PROFE, DOCTORA, TENDERO, OBRERO, SENOR, TOBY, MICHI). Nunca los redefinas
    dentro de un video. Si agregas un personaje o un escenario, apúntalo en `BIBLIA/`.
13. **Calidad igual o mejor que los videos actuales:** sigue la lista de revisión de `BIBLIA/CALIDAD.md` antes de
    dar un video por terminado.
14. **Todo se guarda en GitHub:** al terminar cada video (o cada cambio al motor), corre `SINCRONIZAR.bat` (o
    `git pull --rebase` + `git add -A` + commit + `git push`). Los `.mp4` y `.wav` no se suben; se regeneran.

## Estructura de carpetas (en la PC original: `Desktop\STICK 3D\`)
```
STICK 3D/
├─ SKILL.md, plantillas/, referencias/ ...   ← repo de LuisPa (clonado)
├─ alejandro-victoria/   ← 1er short (Alejandro en Gaugamela, 9.8 s, sin voz). Proyecto Remotion aparte.
├─ sol-apagado/          ← 2º short «¿Y si el Sol se apaga?» (56.9 s). Primera vez con narrador y Sticky.
├─ shorts-sticky/        ← ★ MOTOR ACTUAL, compartido por todos los shorts nuevos ★
│   ├─ src/engine/       ← world.ts, sets.ts, stick.ts, crowd.ts, Short.tsx, timeline.ts, types.ts + post (ink, lensblur, grade…)
│   ├─ src/videos/       ← apagon.ts, luna.ts, rotacion.ts, outro.tsx (una historia por video)
│   ├─ src/Root.tsx      ← registra las composiciones: Apagon, Luna, Rotacion, Outro
│   ├─ voz/<video>/      ← guion.txt, voz.mp3, palabras.json (tiempos por palabra)  + voz/tts.py
│   ├─ public/voz_<video>.wav
│   ├─ audio/mezcla.py   ← música y efectos sintetizados por video (cues por cuadro) + voz → -14 LUFS
│   ├─ subtitulos.py     ← genera el .ass palabra por palabra y lo quema con ffmpeg
│   └─ scripts/fotos.mjs, scripts/sheet.sh   ← cuadros de prueba y hojas de revisión
├─ Y si el Sol se apaga de repente/          ← video + PUBLICAR.txt
├─ Apagon mundial - Las primeras 72 horas/   ← video + PUBLICAR.txt
├─ Y si la Luna desapareciera esta noche/    ← video + PUBLICAR.txt
└─ Y si la Tierra dejara de girar 1 segundo/ ← video + PUBLICAR.txt
```

## El motor (`shorts-sticky/src/engine`)
- **Story** (`types.ts`): cada video exporta `{ TOTAL, camAt, layersAt, dofAt, state(id,f), MARKS, overlay? }`.
  `state()` devuelve por cuadro: `set` (lugar), `env` (day / dusk / night / space / underwater), `cards` (personajes) y
  extras (lights, stars, milky, moonDisc, tide, flow, fridge, tv, water, spawn, snow, speedLines, shake, space{sun,earth,moon}).
- **Tomas** (`timeline.ts → makeTimeline`): cada una tiene llaves de cámara `{f, pos, look, fov, glide}` y un fundido de 6 cuadros entre tomas.
- **Lugares** (cada uno en su propio origen y solo se ve el activo):
  - `world.ts`: park (0,0), street (400,0), beach (-400,0) y space.
  - `sets.ts` (coordenadas en `ORIGIN`): house (sala y cocina, con refri que abre, tele, llave del agua y lámpara),
    elevator, hospital (monitor y planta de luz), store (pasillo de súper con productos de colores), classroom
    (pizarrón, globo terráqueo y pupitres), desert (dunas, mesetas, cactus y observatorio), reef (corales de colores,
    algas y desove animado) y farm (granero rojo, silo, surcos, cerca y pacas).
  - Los interiores no tienen techo, para que entre el sol; la cámara nunca mira hacia arriba dentro de ellos.
- **Personajes** (`stick.ts`): `sticky`, `person` (sombreros, bigote, barba, lentes, corbata, bolsa, bastón; brazos:
  phone/candle/flash/icecream/wave/cheer/point/fly/cover/hug), `dog`, `cat`, `bird`, `turtle`, `penguin`, `cow`,
  `chicken`, `pig`, `fish`, `beetle`, `car`, `plane`, `wave` (ola gigante) y `top` (trompo).
- **Multitudes** (`crowd.ts`): `band({...})` reparte extras variados en un rectángulo y **nunca los pone entre la cámara
  y Sticky** (`blocksLead`). `mirrorFor` voltea las tarjetas según el movimiento.
- En la playa la arena está inclinada; el motor sube las tarjetas `0.045*z` solo.

## Cómo hacer un short nuevo (pasos)
1. Tema → guion propio (unas 175 palabras, ~55 s): gancho, escalada, «Por suerte… / Por desgracia…», «Fíjate…»
   (una comparación cotidiana) y remate con un dato real.
2. Voz: `cd shorts-sticky/voz/<nombre>` → guarda `guion.txt` → `python -I ../tts.py es-MX-JorgeNeural +24%`
   (genera `voz.mp3` y `palabras.json`) → `ffmpeg -i voz.mp3 -ar 48000 -ac 1 ../../public/voz_<nombre>.wav`.
3. Imprime los cuadros de cada palabra (`t*30`) y escribe `src/videos/<nombre>.ts`, con 8 a 14 tomas en lugares
   distintos y elencos chicos. Regístralo en `Root.tsx`.
4. Revisa cuadros: `node scripts/fotos.mjs <Comp> out/x_ 100,300,... ` → `sh scripts/sheet.sh out/x_ "100 300" out/hoja.jpg`.
   Corrige cámaras atoradas, gente tapando a Sticky y cosas fuera de cuadro.
5. Render: `npx remotion render src/index.ts <Comp> out/<n>_mudo.mp4 --codec h264 --crf 18 --gl=angle --concurrency=3 --timeout=240000`
   (unos 20 min por cada minuto de video). **Usa siempre `--gl=angle`.**
6. Audio: agrega los cues en `audio/mezcla.py` → `python -I audio/mezcla.py <n> public/voz_<n>.wav out/<n>_mezcla.wav`.
7. Junta y subtitula: `ffmpeg -i out/<n>_mudo.mp4 -i out/<n>_mezcla.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac out/<n>_sin_subs.mp4`
   → `python -I subtitulos.py voz/<n>/palabras.json out/<n>_sin_subs.mp4 out/<n>_final.mp4`.
8. Cierre: concat con `out/outro_final.mp4` (filtro `concat=n=2:v=1:a=1`).
9. Carpeta con el nombre del video + `PUBLICAR.txt` (títulos calificados con vidIQ `score_title`, descripción,
   hashtags y tags).

## Empezar en otra PC (desde este repo)
1. Instala Git, Node 20 o más, Python 3 y ffmpeg. Luego `pip install edge-tts numpy`.
2. `git clone https://github.com/johnemma2310-design/Videostick3d.git "STICK 3D"` y después `cd "STICK 3D\shorts-sticky"` y `npm install`.
3. Para renderizar un video completo, corre `shorts-sticky\RENDERIZAR.bat apagon|luna|rotacion`. Hace la voz, la animación, el
   sonido, los subtítulos y el cierre (este lo crea la primera vez), y deja el `.mp4` en la carpeta del video.
   Para el Sol se usa `sol-apagado\RENDERIZAR.bat`.
4. Para sincronizar, haz doble clic en `SINCRONIZAR.bat` al empezar y al terminar.
5. La skill original de LuisPa (`SKILL.md` y las referencias de estilo) **no viene aquí**: clónala de su repo si la necesitas.

## Herramientas que se usaron (Windows)
Node 24, npm, Python 3.14 con numpy, ffmpeg 9, edge-tts 7.3.1, Remotion 4.0.522, three 0.186.
Para investigar, el conector de vidIQ: `outliers` (qué shorts están pegando), `keyword_research` y `score_title`.

## Lo que encontró vidIQ (nov 2026, shorts en español «¿qué pasaría si…?»)
- Pegan: «Apagón mundial: las primeras 72 horas» (185x su promedio), «El mundo sin México» (117x), y «¿Qué pasaría si
  la Tierra se volviera azul / desapareciera?» (más de 1M de vistas).
- La búsqueda «qué pasaría si» crece **+68 %**; los mercados principales son España, México y Colombia.
- Formato de título que funciona: pregunta + 1 o 2 palabras en MAYÚSCULAS + 2 emojis (😱) + `#shorts`.
  Ejemplos con 80/100 o más: «¿Y si la LUNA desapareciera esta noche? 🌕😱 #shorts».
- Ideas pendientes: Luna (ya hecha), apagón (hecho), la Tierra deja de girar (hecho). Otras posibles: «¿y si los
  océanos fueran de gelatina?», «¿y si la Tierra fuera de oro?», «¿y si corrieras más rápido que el sonido?».

## Videos terminados
| Video | Duración | Lugares |
|---|---|---|
| Y si el Sol se apaga de repente | 56.9 s | parque, espacio, parque helado, lago congelado (motor viejo `sol-apagado`) |
| Apagón mundial - Las primeras 72 horas | 64 s | calle, sala, elevador, parque, cocina, refri, hospital, súper, desierto + observatorio |
| Y si la Luna desapareciera esta noche | 61 s | parque, espacio, granja, arrecife, playa, desierto, salón, sala con trompo |
| Y si la Tierra dejara de girar 1 segundo | 58 s | parque, espacio, granja con avión, calle, camión, playa con ola, polo, salón |

## Detalles pendientes y trucos
- En el polo (el parque con nieve), el camino se ve un poco color arena: habría que cambiarle la textura cuando hay nieve.
- Las cámaras pegadas a la pared y las tarjetas a menos de 1.8 m del lente se ven mal: aléjalas.
- El cuadro es vertical y angosto (~26° horizontal): para que se vean personajes al lado de Sticky, ponlos **detrás**
  de él, en una franja.
- `audio/mezcla.py` tarda varios minutos por los filtros (`np.convolve`); córrelo en segundo plano.
- Los videos y `node_modules` no van en git: son pesados.
