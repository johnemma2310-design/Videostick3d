# Trampas: errores que ya nos pasaron (no repetirlos)

> Cada vez que algo sale mal, **se anota aquí con su regla** y el próximo video ya no repite el error.
> Los agentes leen esto antes de armar o renderizar un video. (Idea tomada del tutorial de "Prompt y Listo",
> nov 2026: "una skill que guarda tus reglas y una lista de trampas".)

## Historia y guion

| Pasó | Regla |
|---|---|
| *Músculo* (10 min) quedó demasiado educativo para niños | Solo shorts rápidos con humor, máx. 2 datos (`SHORTS_NINOS.md`) |
| Un video que salta entre temas sueltos se siente como un "compilado random" | **Una sola historia** que recorre 3 o más lugares (los nuestros, 6+). Cada lugar es un paso de la MISMA historia |
| Personajes parados hablando | En cada lugar, los personajes **hacen algo con las manos**: celular, comer, cargar, celebrar, abrazar |
| El inicio no engancha y la gente se va | Los temas con algo de miedo o peligro funcionan mejor. El gancho tiene que verse en los primeros 2 s |
| Un gráfico que tenía que "desplomarse" casi no bajaba | **Si la historia dice que algo cae, el dibujo cae en picada**: exagera lo visual, con la cifra en rojo |

## Imagen y cámara

| Pasó | Regla |
|---|---|
| Personajes atravesaban paredes (*Músculo*) | Deja 0.6 m de margen a las paredes y revisa el primer y el último cuadro de cada toma en interiores |
| La cara de Sticky quedaba debajo de los subtítulos (*Gravedad* v1, casa) | La cara va entre el 20 % y el 62 % de la altura del cuadro |
| Los muebles no flotaban porque eran geometría fija | Usa el flag `flota` del motor (`ESCENARIOS.md`) |
| Un cartel 3D cerca de la cámara sale borroso | El cartel que hay que leer va **a la misma distancia que el personaje** |
| Con la cámara mirando hacia atrás, izquierda y derecha se invierten y salen carteles cortados | Revisa el encuadre en una foto antes de renderizar |
| El texto del cartel del cierre se salía por los bordes | Usa `textLength` o una letra más chica y revisa la hoja |
| Sticky se veía chico en los planos generales (espacio, arrecife, calle) | Alterna con un primer plano; en el plano general, Sticky al frente |
| Una portada linda pero que no se entiende | La portada se entiende en 1 segundo: personajes grandes, una idea, texto enorme (`CALIDAD.md` → Portada) |

## Sonido

| Pasó | Regla |
|---|---|
| Pads o ambiente sintético largo debajo de todo (lo mismo que el "murmullo" del tutorial) | Nada de ambiente en bucle; los pads son acentos de 1–3 s como mucho |
| La música compite con la voz | La voz va unos 12 dB sobre la música y el total queda en -14 LUFS |

## Técnico (render, Windows)

| Pasó | Regla |
|---|---|
| El `.bat` tenía un carácter `\v` (tabulador vertical) en `public\voz...` | Escribe los `.bat` con cuidado (`public\voz` → revisa con `grep -P "\x0b"`) |
| Los `.bat` con fin de línea LF fallaban | Los `.bat` van en CRLF (`.gitattributes`) |
| `timeout` falla cuando la entrada está redirigida (`< nul`, en segundo plano) | Para esperar usa `ping -n N 127.0.0.1 >nul` |
| Un render falló con "timeout" al buscar un cuadro | Reintenta una vez; si se repite, revisa la carga de texturas o `delayRender` |
| Remotion deja `%TEMP%\remotion-webpack-bundle-*` (se juntaron 4.8 GB) | `RENDERIZAR.bat` los borra al terminar |
| La sesión se cerró a mitad de un render | Si existe `out/<v>_mudo.mp4`, sigue desde el paso [3/6] sin volver a renderizar |
| `cmd //c` desde Git Bash no encontraba el `.bat` | Lanza el `.bat` desde PowerShell con la ruta completa |
| La consola de Windows no imprimía emojis (cp1252) | Los scripts de Python usan `sys.stdout.reconfigure(encoding="utf-8")` |
| Hay que proteger las claves de YouTube | Van en `secretos/` (en `.gitignore`); nunca se pegan en el chat ni en el código |
