# Videostick3d — shorts animados de «Curiosidades con Sticky»

Lee primero **[CONTEXTO_CLAUDE.md](CONTEXTO_CLAUDE.md)**: tiene las reglas del canal, cómo funciona el motor y los pasos para hacer un short.

| Carpeta | Qué es |
|---|---|
| `shorts-sticky/` | ★ Motor actual (Remotion + three.js): Apagón, Luna, Rotación y el Cierre (Outro) |
| `sol-apagado/` | Short «¿Y si el Sol se apaga?» (motor anterior) |
| `alejandro-victoria/` | Primer short (Alejandro en Gaugamela), sin voz |

Todo lo demás (personajes, escenarios, estándar de calidad, cómo sincronizar y el registro de videos) está en **[BIBLIA/](BIBLIA/)**.
El elenco fijo vive en código, en `shorts-sticky/src/engine/elenco.ts`.

| Archivo | Para qué |
|---|---|
| `SINCRONIZAR.bat` | Baja lo último de GitHub y sube tus cambios (doble clic al empezar y al terminar) |
| `shorts-sticky/RENDERIZAR.bat <video>` | Render completo (`apagon`, `luna` o `rotacion`), con voz, subtítulos y cierre, que queda en la carpeta del video |
| `<Título del video>/PUBLICAR.txt` | Título, descripción, hashtags y tags de cada video |

No se suben los videos (`.mp4`), los `.wav`, `node_modules` ni `out/`: se regeneran con `RENDERIZAR.bat`.

Primera vez en otra PC:
```
git clone https://github.com/johnemma2310-design/Videostick3d.git "STICK 3D"
cd "STICK 3D/shorts-sticky"
npm install
pip install edge-tts numpy
```
La skill original de LuisPa (SKILL.md y referencias) está en https://github.com/luispablovillasenor-afk/shorts-animados-claude
