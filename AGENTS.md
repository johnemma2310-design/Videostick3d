# Instrucciones para cualquier agente de IA (Kimi, Claude, Codex…)

Este repositorio hace los shorts animados del canal **Curiosidades con Sticky**. Antes de tocar nada, lee en este orden:

1. [CONTEXTO_CLAUDE.md](CONTEXTO_CLAUDE.md): las reglas del canal y cómo funciona todo. Vale para cualquier agente, no solo para Claude.
2. [BIBLIA/](BIBLIA/): personajes, escenarios, estándar de calidad, cómo sincronizar y el registro de videos.

## Reglas que no se rompen
**Antes de armar o renderizar, lee [BIBLIA/TRAMPAS.md](BIBLIA/TRAMPAS.md)** (errores que ya pasaron). Si algo sale mal, agrega ahí su regla.

**FORMATO OFICIAL (26 nov 2026): solo shorts verticales rápidos para niños.** Lee [BIBLIA/SHORTS_NINOS.md](BIBLIA/SHORTS_NINOS.md): 35–50 s, tomas de 1.5–3 s, todo en movimiento, guion con humor (máx. 2 datos) y nadie atraviesa paredes. Ya no se hacen videos largos.

- Sticky es el protagonista: cabeza blanca, cuerpo blanco y **bufanda azul**. Nada lo tapa.
- Usa el elenco fijo de `shorts-sticky/src/engine/elenco.ts`. Nunca redefinas personajes dentro de un video.
- Todo debe salir con la calidad de `BIBLIA/CALIDAD.md`, con su lista de revisión.
- **SIEMPRE CON SUBTÍTULOS.** Ningún video ni clip de prueba se entrega sin subtítulos quemados palabra por palabra
  (`python -I subtitulos.py voz/<video>/palabras.json <entrada.mp4> <salida.mp4>`, ya incluido en `RENDERIZAR.bat`).
- La voz es edge-tts `es-MX-JorgeNeural` a `+24%` (narrador en español).
- Cada video termina con el cierre de "suscríbete y comenta" y va en su carpeta con su `PUBLICAR.txt`.
- La historia lleva `voz:` (las palabras de `palabras.json`) para que Sticky mueva la boca.
- No subas `.mp4`, `.wav`, `node_modules` ni `out/`. Al terminar, corre `SINCRONIZAR.bat` o haz `git pull --rebase`, commit y push.

## Reparto automático de modelos (Claude Code)
En `.claude/agents/` hay tres subagentes. El agente principal reparte las tareas entre ellos solo, sin cambiar el modelo a mano:

| Subagente | Modelo | Para qué |
|---|---|---|
| `renderizador` | Haiku | Renders, subtítulos, cierre, copiar los videos y revisar duración y volumen |
| `guionista` | Sonnet | Guion, voz, `PUBLICAR.txt` y videos nuevos armados copiando la estructura de uno existente |
| `director` | Opus | Escenas difíciles, personajes, animaciones y cambios al motor |

Recomendado: deja la sesión principal en **Sonnet** como orquestador y que el `director` (Opus) entre solo cuando haga falta.

## Tareas buenas para un modelo barato o rápido
- Escribir el guion (`voz/<video>/guion.txt`) con datos reales y su fuente.
- Generar la voz: `python -I ../tts.py es-MX-JorgeNeural +24%` dentro de `voz/<video>/`.
- Renderizar con `shorts-sticky\RENDERIZAR.bat <video>`. Tarda unos 20 minutos por cada minuto de video.
- Escribir `PUBLICAR.txt` (título, descripción, hashtags y tags) y actualizar `BIBLIA/VIDEOS.md`.
- Armar un video nuevo copiando la estructura de uno existente (`src/videos/luna.ts`) y cambiando escenas, tiempos y textos.

## Tareas que piden un modelo fuerte
- Escenas nuevas con cámaras y encuadres difíciles, personajes o escenarios nuevos y cambios al motor (`src/engine/`).

## Para gastar poco
- Revisa con **fotos sueltas a escala baja** (`node scripts/fotos.mjs <Comp> rev <f1,f2,...> 0.35`) y hojas de contacto, no con renders completos.
- Las fichas `FichaSticky`, `FichaElenco`, `FichaAnimales`, `FichaMovimiento` y `FichaMusculo` sirven para revisar dibujos sin el mundo 3D.
- Lee solo los archivos que vas a cambiar. El motor es grande.

## Música y efectos de sonido (biblioteca compartida)

Los 3 proyectos de videos de este PC (stick3DD, STICK 3D y animacion Stick) comparten la misma biblioteca de audio.
- **En este proyecto está en** `audio/musica/ y audio/sfx/ (catálogo: audio/CATALOGO.md). Para usarlo en un short de Remotion, copia el archivo a su public/`. La lista con el ambiente, el origen y la licencia de cada archivo está en el `CATALOGO` de esa carpeta.
- **Copia maestra:** `C:\Users\cit\Audio-Compartido\` (ahí está también el catálogo original).
- **También hay `sfx_drive/`**: 37 efectos bajados de una carpeta de Google Drive (memes, golpes, transiciones). En el catálogo cada uno tiene su nivel de riesgo de copyright. Los 🔴 **no se usan** en videos monetizados, y los 🟡 solo de vez en cuando y en momentos cortos.
- **Antes de buscar o generar un sonido, mira el catálogo.** Si ya hay uno que sirve, úsalo.
- **Si agregas uno nuevo:** guárdalo en la carpeta de audio de este proyecto (minúsculas, sin espacios ni acentos) y ejecuta
  `powershell -ExecutionPolicy Bypass -File C:\Users\cit\Audio-Compartido\sincronizar_audio.ps1`. El script lo copia a los otros proyectos sin sobrescribir nada.
  Luego describe en `C:\Users\cit\Audio-Compartido\CATALOGO.md` para qué sirve, de dónde salió y su licencia, vuelve a ejecutar el script y haz commit y push de la carpeta de audio.
- **Dónde buscar audio nuevo:** genéralo con código (`tools/make_sfx.py` y `tools/make_music.py` de stick3DD), o usa YouTube Audio Library, Pixabay o Freesound (solo CC0). Incompetech es CC-BY y hay que dar crédito. **Nunca** uses música comercial ni sonidos "trending" de TikTok.