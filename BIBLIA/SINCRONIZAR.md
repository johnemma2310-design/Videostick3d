# Sincronizar entre PCs (GitHub)

La carpeta **`STICK 3D`** es el repositorio `johnemma2310-design/Videostick3d`. Se trabaja igual en las dos PCs.

## Lo que se guarda en GitHub

- El motor y el código de cada video (`shorts-sticky/`, `sol-apagado/`, `alejandro-victoria/`)
- Los personajes (`elenco.ts`) y los escenarios (`sets.ts`, `world.ts`)
- Las voces (`voz/<video>/voz.mp3`), los guiones (`guion.txt`) y los tiempos (`palabras.json`)
- La carpeta de cada video, con su `PUBLICAR.txt`
- Esta biblia y sus fotos de referencia

## Lo que NO se guarda (se vuelve a generar)

Los `.mp4`, los `.wav`, `node_modules/` y `out/`. Están en el `.gitignore`.

Para tener un video en la otra PC, renderízalo con `RENDERIZAR.bat`, que sale igualito porque todo es determinista. Si no, pásalo por Drive o USB.

También quedan fuera los archivos de la skill de LuisPa: `SKILL.md`, `plantillas/`, `ejemplos/`, etc. Se bajan aparte de su repo.

## Rutina (para no perder nada)

1. **Al empezar a trabajar:** doble clic en `SINCRONIZAR.bat`. Baja lo último.
2. **Al terminar** (o al acabar cada video): doble clic en `SINCRONIZAR.bat` otra vez. Sube todo con un mensaje.
3. No trabajes el mismo archivo en las dos PCs al mismo tiempo sin sincronizar antes.

## Primera vez en una PC nueva

```
git clone https://github.com/johnemma2310-design/Videostick3d.git "STICK 3D"
cd "STICK 3D\shorts-sticky"
npm install
pip install edge-tts numpy
```

También necesitas Node.js 20 o más, Python 3 y ffmpeg en el PATH.

Luego renderiza, por ejemplo, `shorts-sticky\RENDERIZAR.bat luna`. Si es la primera vez, también hace el cierre.

## Un video nuevo

1. Crea `shorts-sticky/src/videos/<nombre>.ts` y regístralo en `src/Root.tsx`.
2. Crea `shorts-sticky/voz/<nombre>/guion.txt` y genera la voz con `tts.py`.
3. Agrega sus efectos de sonido en `audio/mezcla.py` y su carpeta en `RENDERIZAR.bat`.
4. Crea la carpeta `STICK 3D/<Título del video>/` con su `PUBLICAR.txt`.
5. Apúntalo en [VIDEOS.md](VIDEOS.md).
6. Corre `SINCRONIZAR.bat`.
