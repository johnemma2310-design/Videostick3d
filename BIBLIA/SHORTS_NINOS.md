# Formato oficial: shorts rápidos para niños

> **Decisión del 26 nov 2026.** El canal hace **solo shorts verticales** (1080×1920), pensados para niños: rápidos, con mucho
> movimiento y poco "modo clase". El video largo horizontal (*Músculo*, 10 min) quedó muy educativo y **no se repite**;
> su código se queda solo como referencia. Esta guía manda sobre cualquier regla anterior que choque con ella.

## 1. Ritmo (lo más importante)

| Cosa | Valor |
|---|---|
| Duración | **35–50 s** + cierre (antes 55–60 s) |
| Gancho | En los **primeros 2 s**: la pregunta + algo que pasa YA en pantalla (explosión, caída, susto) |
| Largo de cada toma | **1.5–3 s (45–90 cuadros)**. Nunca más de 4 s quieta en el mismo encuadre |
| Tomas por short | **18–30** (antes 8–14), en **6 o más escenarios** |
| Algo nuevo | Cada **2–3 s** pasa algo: cambio de toma, golpe, zoom, cartel, personaje que entra corriendo |
| Voz | Igual: `es-MX-JorgeNeural` a `+24%`, frases cortas (máx. 10–12 palabras) |

## 2. Movimiento: nada está quieto

**Cámara** (en `camAt` / llaves de toma):
- Toda toma tiene movimiento de cámara: acercamiento (push-in), alejamiento, paneo o vuelta alrededor de Sticky.
- Usa **zoom de golpe** (fov baja 8–12 en 6 cuadros) en las palabras fuertes.
- Pon `shake` (sacudida) en golpes, caídas y sorpresas, y `speedLines` cuando alguien corre o algo vuela.
- Alterna planos: general → medio → primer plano de la cara de Sticky. No dos tomas seguidas con el mismo plano.

**Personajes** (en `cards`):
- Sticky **siempre hace algo**: camina, corre (`run`), salta, gesticula (`wave`, `cheer`, `point`, `flex`…) y **habla** (`voz`).
- Las entradas y salidas son **corriendo**, nunca apareciendo de la nada.
- Usa saltos y rebotes (`y` con un seno corto) en celebraciones y sustos.
- Las caras van **exageradas**: sorpresa, miedo, risa. Cambia de `expr` en cada toma.
- Los extras y animales del fondo también se mueven: perros corriendo, gente caminando y pájaros volando.

**Pantalla:**
- Los carteles (`MARKS`) entran con rebote. Máx. 3 palabras y números grandes.
- Ponle a cada corte un **efecto de sonido** (whoosh, pop, boing, golpe) en `audio/mezcla.py`. La música va animada, no pads lentos.

## 3. Guion para niños

- Es **humor + asombro**, no una clase. Sticky sufre o goza la situación en carne propia, con chistes y exageraciones.
- Lleva **1 o 2 datos reales**, dichos simple ("¡pesarías como un elefante!"), y no tablas de números ni términos médicos.
- Las frases van cortas, con onomatopeyas (¡PUM!, ¡zas!) y preguntas al espectador ("¿tú qué harías?").
- Al terminar va el mismo cierre: el cierre nuevo de `CALIDAD.md` (suscríbete, like, comenta y cameo).
- Igual guarda la fuente de los datos en `voz/<video>/fuentes.txt`.

## 4. Nadie atraviesa paredes (error visto en *Músculo*)

Los interiores (`house`, `elevator`, `hospital`, `store`, `classroom`, `gym`) son cuartos sin techo con paredes reales.
Ningún personaje ni cámara puede cruzarlas.

- **Posiciones dentro del cuarto** con al menos **0.6 m de margen** a cada pared. Esto vale para el principio **y el final** de cada caminata o carrera.
- Si alguien tiene que salir del cuarto, **córtalo**: termina la toma antes de llegar a la pared, o que salga por la puerta.
- Revisa el camino completo: si va de A a B, ninguna parte de la línea puede cruzar una pared ni un mueble grande (sofá, cama, estantes, mostrador).
- **La cámara también queda adentro**, o arriba del borde de la pared mirando hacia abajo, nunca pegada al muro.
- Si Sticky crece (musculoso o gigante), toma su ancho real para el margen.
- Prueba: saca foto del **primer y último cuadro** de cada toma que tenga movimiento en un interior.

## Cameo del invitado especial

Al final del short (antes del cierre) va un plano de ~2 s donde Sticky saluda al **invitado especial**: la última persona que
comentó en el último video. Pasos:

1. `python -I scripts/cameo.py` (en `shorts-sticky/`): imprime los últimos comentarios, el nombre del ganador y **baja su foto de
   perfil** (`authorProfileImageUrl`) a `public/cameo/ganador.jpg`.
2. En la historia: `cameo: { foto: "cameo/ganador.jpg", nombre: "@nombre" }` y la tarjeta `cameo(f, ..., [x, 0, z])` en la toma
   (ver `BIBLIA/PERSONAJES.md`, sección Cameo). Mientras no haya ganador usa `cameo/ejemplo.jpg` y "TU NOMBRE AQUÍ".
3. Revisa con una foto suelta que se lea el nombre y que la cara quede fuera de la franja de subtítulos.

## 5. Lista de revisión extra (además de `CALIDAD.md`)

- [ ] El short dura 35–50 s más el cierre.
- [ ] En los primeros 2 s pasa algo en pantalla.
- [ ] Ninguna toma dura más de 4 s y hay 18 o más tomas.
- [ ] La cámara se mueve en todas las tomas, con zooms de golpe y sacudidas en los momentos fuertes.
- [ ] Sticky se mueve y cambia de cara en cada toma.
- [ ] Nadie atraviesa paredes ni muebles (fotos del primer y último cuadro de cada toma en interiores).
- [ ] Cada corte tiene su efecto de sonido.
- [ ] El guion tiene chistes, frases cortas y máximo 2 datos, sin palabras técnicas.
- [ ] El short tiene subtítulos y cierre, como siempre.

## 6. Cameo del último comentario

- Cada short nuevo incluye como **cameo** (un stickman `person` del elenco con un cartel con su nombre de usuario, y su foto si la hay) a la **última persona que comentó en el último video largo del canal**. El cierre lo anuncia: «¡Y el último en comentar en mi video largo sale en el próximo short, con su foto y su nombre!».
- El ganador sale de `python -I scripts/cameo.py largo` (API de YouTube) o lo da el usuario. Las claves NUNCA se suben a git: van en `secretos/` (ya ignorado).
- Cada short se sube con ese video largo como **"Video relacionado"**. Los videos largos los hace otro proyecto (animación 2D).
- En cada `PUBLICAR.txt` de short va la línea `VIDEO RELACIONADO: <el último video largo del canal>`.
- Revisión: [ ] el cameo aparece con nombre; [ ] `PUBLICAR.txt` trae VIDEO RELACIONADO.

## Historia y armado (tutorial "Prompt y Listo", 27 nov 2026)

- **Una sola historia** que pasa por varios lugares. Cada lugar es un paso de esa historia, no temas sueltos.
- En cada lugar los personajes **hacen algo con las manos**.
- **La cara cambia 2 cuadros antes** de la palabra clave (helper en `timeline.ts`).
- Las caras van claras: furioso (con venita), llorando (con lágrimas), asustado (con gota de sudor), sorprendido y feliz.
- En cada golpe, la cámara da un **saltito** y cambia de plano.
- **Trabajo en paralelo:** para un short nuevo, el agente principal reparte los escenarios entre ayudantes y luego une todo.
- Cada short lleva su **portada** (`Portada`, ver `CALIDAD.md`).
- Antes de renderizar: una hoja con unas 20 fotos, se corrige, 3–4 fotos más y recién ahí el render.
