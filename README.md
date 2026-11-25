# Videostick3d — shorts animados de «Curiosidades con Sticky»

Lee primero **[CONTEXTO_CLAUDE.md](CONTEXTO_CLAUDE.md)**: tiene las reglas del canal, cómo funciona el motor y los pasos para hacer un short.

| Carpeta | Qué es |
|---|---|
| `shorts-sticky/` | ★ Motor actual (Remotion + three.js): Apagón, Luna, Rotación y el Cierre (Outro) |
| `sol-apagado/` | Short «¿Y si el Sol se apaga?» (motor anterior) |
| `alejandro-victoria/` | Primer short (Alejandro en Gaugamela), sin voz |

No incluye videos, `node_modules` ni renders. Para empezar en otra PC:
```
cd shorts-sticky
npm install
for v in apagon luna rotacion outro: ffmpeg -i voz/<v>/voz.mp3 -ar 48000 -ac 1 public/voz_<v>.wav
npx remotion render src/index.ts Outro out/outro_mudo.mp4 --gl=angle   (luego mezcla + subtítulos → out/outro_final.mp4)
```
La skill original de LuisPa (SKILL.md y referencias) está en https://github.com/luispablovillasenor-afk/shorts-animados-claude
