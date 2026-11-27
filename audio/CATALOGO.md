# Catálogo de audio compartido

Esta es la biblioteca de música y efectos que comparten los 3 proyectos de videos de este PC.
La **copia maestra** está en `C:\Users\cit\Audio-Compartido\`. Cada proyecto tiene su propia copia dentro de su repo:

| Proyecto | Repo de GitHub | Dónde está el audio dentro del proyecto |
|---|---|---|
| stick3DD (videos largos 4D) | `Videos4d` | `assets/musica/`, `assets/sfx/` y `assets/sfx_drive/` |
| STICK 3D (shorts 3D) | `Videostick3d` | `audio/musica/`, `audio/sfx/` y `audio/sfx_drive/` |
| animacion Stick (shorts) | `animacion-stick` | `assets/audio/musica/`, `assets/audio/sfx/` y `assets/audio/sfx_drive/` |

## Reglas
1. **Antes de buscar o generar un sonido, mira esta lista.** Si ya hay uno que sirve, úsalo.
2. **Si agregas un sonido nuevo**, ponlo en la carpeta de audio de tu proyecto (o en la maestra) y ejecuta:
   `powershell -ExecutionPolicy Bypass -File C:\Users\cit\Audio-Compartido\sincronizar_audio.ps1`
   Ese script copia los archivos nuevos en las dos direcciones (sin sobrescribir nada) y agrega a esta lista los que falten.
3. **Rellena la fila del sonido nuevo**: para qué sirve, de dónde salió y su licencia. Sin licencia clara, no se usa.
4. Nombres en minúsculas, sin espacios ni acentos (`boom_grave.wav`, no `Boom Grave.wav`).
5. Si un archivo cambia, súbelo con un nombre nuevo (`whoosh2.wav`). El script nunca sobrescribe.
6. Después de sincronizar, cada proyecto hace commit y push de su carpeta de audio a su propio repo.

## Dónde buscar audio nuevo (sin problemas de copyright en YouTube)
- **Generarlo con código**: `tools/make_sfx.py` (efectos) y `tools/make_music.py` (música) en stick3DD. Es la opción más segura.
- **YouTube Audio Library** (YouTube Studio → Biblioteca de audio): algunas pistas piden dar crédito.
- **Pixabay Music / Pixabay Sound Effects**: gratis y sin necesidad de dar crédito.
- **Freesound.org**: usa los de licencia **CC0**. Los CC-BY piden dar crédito en la descripción.
- **Incompetech (Kevin MacLeod)**: CC-BY, hay que darle crédito en la descripción.
- **No usar** música comercial ni sonidos "trending" de TikTok o Instagram: en YouTube puede hacer que te quiten la monetización.

## Música (`musica/`)
| Archivo | Ambiente / para qué | Origen | Licencia |
|---|---|---|---|
| calido.wav | cálido, tierno, finales felices | `tools/make_music.py` (stick3DD) | propia, libre |
| comico.wav | cómico, situaciones graciosas | `tools/make_music.py` (stick3DD) | propia, libre |
| misterio.wav | misterio, "¿qué pasaría si…?" | `tools/make_music.py` (stick3DD) | propia, libre |
| tension.wav | tensión, peligro, cuenta atrás | `tools/make_music.py` (stick3DD) | propia, libre |
| triste.wav | triste, momentos emotivos | `tools/make_music.py` (stick3DD) | propia, libre |

## Efectos (`sfx/`)
| Archivo | Para qué | Origen | Licencia |
|---|---|---|---|
| boing.wav | rebote, salto cómico | `tools/make_sfx.py` (stick3DD) | propia, libre |
| boom.wav | explosión o impacto | `tools/make_sfx.py` | propia, libre |
| boom_grave.wav | impacto de cine, revelación fuerte | `tools/make_sfx.py` | propia, libre |
| borrador.wav | borrar en pizarrón | `tools/make_sfx.py` | propia, libre |
| campana.wav | campana, recreo, aviso | `tools/make_sfx.py` | propia, libre |
| clic.wav | interruptor, bombilla, idea | `tools/make_sfx.py` | propia, libre |
| corte_seco.wav | "sound drop" antes de un susto | `tools/make_sfx.py` | propia, libre |
| ding.wav | acierto, dato curioso | `tools/make_sfx.py` | propia, libre |
| golpe.wav | golpe seco | `tools/make_sfx.py` | propia, libre |
| lapiz.wav | lápiz escribiendo rápido | `tools/make_sfx.py` | propia, libre |
| latido.wav | latido, nervios | `tools/make_sfx.py` | propia, libre |
| papel.wav | papel arrugándose | `tools/make_sfx.py` | propia, libre |
| pasos.wav | pasos | `tools/make_sfx.py` | propia, libre |
| pop.wav | aparición, burbuja, texto que entra | `tools/make_sfx.py` | propia, libre |
| portazo.wav | portazo | `tools/make_sfx.py` | propia, libre |
| puerta.wav | puerta que rechina | `tools/make_sfx.py` | propia, libre |
| risa_eco.wav | risa con eco | `tools/make_sfx.py` | propia, libre |
| riser.wav | sube la tensión (1.8 s) y corta | `tools/make_sfx.py` | propia, libre |
| ronquido.wav | ronquido, dormir | `tools/make_sfx.py` | propia, libre |
| sorpresa.wav | "stinger" de sorpresa ascendente | `tools/make_sfx.py` | propia, libre |
| tictac.wav | reloj, tiempo corriendo | `tools/make_sfx.py` | propia, libre |
| tiza.wav | tiza en pizarrón | `tools/make_sfx.py` | propia, libre |
| transicion.wav | whoosh corto para cortes de escena | `tools/make_sfx.py` | propia, libre |
| triste.wav | trombón triste "wah wah waaah" | `tools/make_sfx.py` | propia, libre |
| viento.wav | viento, ambiente exterior | `tools/make_sfx.py` | propia, libre |
| whoosh.wav | movimiento rápido, transición | `tools/make_sfx.py` | propia, libre |

## Efectos de Drive (`sfx_drive/`)
Descargados el 27 nov 2026 de la carpeta compartida de Google Drive **"sound effects (copywrite free part 2)"**
(https://drive.google.com/drive/folders/1HCqd9TRGvktSj5T6Kd2V4DzzZA05sVq1). No son nuestros y la carpeta no dice de dónde
salieron: el "copyright free" del nombre **no está verificado**. Muchos son memes sacados de series, juegos o películas.

**Riesgo** (columna Licencia):
- 🟢 **bajo**: sonido genérico (golpe, pop, whoosh…). Se puede usar.
- 🟡 **medio**: meme o sonido viral conocido. Suele pasar en Shorts, pero puede saltar Content ID. Úsalo poco y en momentos cortos.
- 🔴 **alto**: sale de una marca, serie, película o juego con copyright. **No usar** en videos monetizados.

Dentro de cada proyecto están en `<carpeta de audio>/sfx_drive/`. Hay mp3, m4a y wav: si el motor de un proyecto solo lee `.wav`, conviértelo con
`ffmpeg -i archivo.mp3 archivo.wav` y guarda la copia en la misma carpeta.

| Archivo | Para qué | Origen | Licencia |
|---|---|---|---|
| bambu_golpe.mp3 | golpe de bambú, golpe cómico | Drive: "Bamboo Hit" | 🟢 bajo, sin verificar |
| bonk_anime.mp3 | "bonk" de anime/caricatura, golpe en la cabeza | Drive: "Bamboo Hit (AnimeCartoon Bonk)" | 🟢 bajo, sin verificar |
| camara_foto.wav | obturador de cámara, foto, "capturado" | Drive: "-camera-shutter" | 🟢 bajo, sin verificar |
| comer_caricatura.mp3 | comer, masticar, cómico | Drive: "Cartoon Eating… Non Copyrighted" | 🟢 bajo (dice "non copyrighted") |
| corcho_botella.mp3 | corcho que salta, celebración, "pop" | Drive: "bottle cork" | 🟢 bajo, sin verificar |
| flashback.wav | entrar a un recuerdo o flashback | Drive: "FLASHBACK" | 🟢 bajo, sin verificar |
| glitch.wav | fallo, error, interferencia digital | Drive: "Glitch" | 🟢 bajo, sin verificar |
| pato_juguete.mp3 | pato de goma, cómico | Drive: "TOY DUCK" | 🟢 bajo, sin verificar |
| pop_drive.mp3 | pop, aparición | Drive: "pop" | 🟢 bajo, sin verificar |
| punetazo.mp3 | puñetazo, golpe | Drive: "punch" | 🟢 bajo, sin verificar |
| reloj_tictac.mp3 | reloj, tiempo corriendo, espera | Drive: "Clock Ticking" | 🟢 bajo, sin verificar |
| revelacion.mp3 | revelación, "¡tadá!", dato sorpresa | Drive: "Reveal Sound Effect" | 🟢 bajo, sin verificar |
| silbato_juguete.wav | silbato de juguete, cómico | Drive: "cartoon-toy-whistle" | 🟢 bajo, sin verificar |
| transicion_caricatura.mp3 | transición rápida de caricatura | Drive: "CARTOON TRANSITION" | 🟢 bajo, sin verificar |
| whoosh_drive.mp3 | whoosh, movimiento rápido | Drive: "whoosh sound effect" | 🟢 bajo, sin verificar |
| angel.mp3 | coro de ángel, momento "divino" o perfecto | Drive: "Angel - Sound Effect" | 🟡 medio (meme) |
| augh_grito.mp3 | grito "AUGHHH", desesperación cómica | Drive: "AUGGHH AHHHHH" | 🟡 medio (meme) |
| awww.mp3 | "awww" de público, ternura | Drive: "awww" | 🟡 medio (meme) |
| bruh.mp3 | "bruh", algo absurdo o tonto | Drive: "Bruh Sound Effect" | 🟡 medio (meme) |
| confundido_reverb.m4a | confusión con eco | Drive: "Confused Reverb" | 🟡 medio (meme) |
| core.mp3 | (sin identificar; escúchalo antes de usarlo) | Drive: "Core" | 🟡 medio, sin identificar |
| decepcion.mp3 | decepción, algo que sale mal | Drive: "Disappointed" | 🟡 medio (meme) |
| faaah.mp3 | "faaah", fallo o susto cómico | Drive: "faahhhhh" | 🟡 medio (meme) |
| nope.mp3 | "nope", negarse, huir | Drive: "Nope sound effect" | 🟡 medio (meme) |
| omg_meme.mp3 | "OMG", sorpresa exagerada | Drive: "OMG meme" | 🟡 medio (meme) |
| pedo.mp3 | pedo, humor infantil | Drive: "Fart - Sound Effect" | 🟡 medio, sin verificar |
| rizz.mp3 | "rizz", ligar, momento "cool" | Drive: "Rizz Sound Effect" | 🟡 medio (meme) |
| silencio_incomodo.mp3 | silencio incómodo (grillos o pausa) | Drive: "Awkward Pause" | 🟡 medio (meme) |
| silencio_incomodo2.mp3 | silencio incómodo, variante | Drive: "Awkward Pause 02" | 🟡 medio (meme) |
| what_bottom_text.m4a | "What?" de meme, incredulidad | Drive: "'What' Bottom Text" | 🟡 medio (meme) |
| yeet.mp3 | "YEET", lanzar algo con fuerza | Drive: "YEET - Sound Effect HD" | 🟡 medio (meme) |
| alerta_twitch.m4a | notificación tipo alerta de stream | Drive: "Twitch Alert" | 🔴 alto (sonido de marca: Twitch) |
| among_us.mp3 | sonido de Among Us, "impostor", traición | Drive: "Among us sound effect" | 🔴 alto (videojuego Among Us) |
| doraemon_notificacion.mp3 | notificación de Doraemon | Drive: "Doraemon Notification Sound" | 🔴 alto (serie Doraemon) |
| illuminati.mp3 | "Illuminati confirmed", conspiración | Drive: "Illuminati Confirmed" | 🔴 alto (lleva música con copyright) |
| spiderman3_meme.mp3 | meme de Spider-Man 3 | Drive: "Spider-Man 3 Meme Sound" | 🔴 alto (película de Sony) |
| taco_bell.m4a | "bong" de Taco Bell, golpe o choque | Drive: "taco bell" | 🔴 alto (sonido de marca: Taco Bell) |
