# Catálogo de audio compartido

Esta es la biblioteca de música y efectos que comparten los 3 proyectos de videos de este PC.
La **copia maestra** está en `C:\Users\cit\Audio-Compartido\`. Cada proyecto tiene su propia copia dentro de su repo:

| Proyecto | Repo de GitHub | Dónde está el audio dentro del proyecto |
|---|---|---|
| stick3DD (videos largos 4D) | `Videos4d` | `assets/musica/` y `assets/sfx/` |
| STICK 3D (shorts 3D) | `Videostick3d` | `audio/musica/` y `audio/sfx/` |
| animacion Stick (shorts) | (todavía sin repo) | `assets/audio/musica/` y `assets/audio/sfx/` |

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
