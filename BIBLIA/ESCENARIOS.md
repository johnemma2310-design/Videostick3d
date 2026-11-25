# Escenarios, ambientes y objetos

Cada escenario está en su propio punto del mundo y solo se ve el que usa la toma. Los escenarios abiertos se construyen en `shorts-sticky/src/engine/world.ts`. Los interiores y los temáticos se construyen en `shorts-sticky/src/engine/sets.ts`; su origen está en `ORIGIN`.

Para ubicar algo dentro de un escenario, usa `at(ORIGIN.house, x, y, z)`.

| `set` | Origen | Qué tiene | Usado en |
|---|---|---|---|
| `park` | 0, 0, 0 | Césped, camino, árboles, lago, bancas. Con `snow: true` es el **polo** | Sol, Luna, Rotación, Cierre |
| `street` | 400, 0, 0 | Edificios con ventanas, faroles, semáforo y coches. `lights` va de 0 a 1 | Apagón, Rotación |
| `beach` | -400, 0, 0 | Arena inclinada, mar y olas. `tide` es la marea y `flow` la corriente | Luna, Rotación |
| `space` | — | Sol, Tierra (giro, inclinación, eje) y Luna, todo en `space{}` | Sol, Luna, Rotación |
| `house` | 0, 0, 800 | Sala con TV, sofá, lámpara y alfombra; cocina con nevera y grifo. Flags `tv`, `fridge`, `water` | Apagón, Luna |
| `elevator` | 60, 0, 800 | Panel de luces y botones | Apagón |
| `hospital` | 120, 0, 800 | Cama, monitor de latidos, generador y cortina | Apagón |
| `store` | 180, 0, 800 | Estantes con productos de colores y carteles PILAS / VELAS | Apagón |
| `classroom` | 240, 0, 800 | Pizarrón con reloj, globo terráqueo y pupitres | Luna, Rotación |
| `desert` | 0, 0, -450 | Dunas, mesetas, cactus y un observatorio con cúpula | Apagón, Luna |
| `reef` | -400, 0, 450 | Corales y algas; `spawn` es el desove de corales | Luna |
| `farm` | 400, 0, 450 | Surcos, granero rojo, silo, cerca y paja | Luna, Rotación |

## Ambientes (`env`)

`day`, `dusk` (atardecer dorado), `night` (con `stars`, `milky` y `moonDisc`), `space` y `underwater` (agua azul con niebla).

## Reglas de variedad

- **Mínimo 6 escenarios distintos por video.** No te quedes solo en el parque y la calle.
- **Cambia de ambiente** dentro del video: día, noche, espacio y bajo el agua.
- Los interiores son cuartos sin techo con paredes que brillan un poco (`emissive 0.45`), así nunca se ven grises.
- Si un escenario nuevo se va a repetir, agrégalo en `sets.ts`, ponlo en `ORIGIN` (lejos de los demás), en el tipo `SetName` de `types.ts` y en esta tabla.

## Carteles de título (MARKS)

Son los textos grandes de arriba (y = 300), por ejemplo `HORA 0` o `LA VÍA LÁCTEA`. Cada uno lleva `{a, b, label, sub, col}`.

- Usa máximo 3 o 4 palabras.
- Elige el color de `PALETA.titulo` en `elenco.ts`.
