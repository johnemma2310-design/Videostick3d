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
| `gallinero` | 420, 0, 800 | Cuarto de madera 8 × 7 m: 4 nidos con paja y huevos (fondo), percha (izq.), comedero y bebedero (der.), paca y letrero GALLINERO. Libre: x −2..2, z −2..3 | Gallinas |
| `mercado` | −400, 0, −450 | Plaza con 5 puestos de toldo a rayas (FRUTAS, PIEDRITAS en x 0 z −4.4, SEMILLAS, PAN, MAÍZ), cajas con fruta, papel picado y edificios atrás | Gallinas |
| `lago` | 400, 0, −450 | Orilla de pasto (z > 0), agua en y −0.25 que se ve de arriba y de abajo (`env: "underwater"` con la cámara abajo), fondo en y −3 con piedras y algas, juncos y **muelle** de x ±0.9, z +1..−7.75, tablas en y 0.39 | Peces |
| `gym` | 300, 0, 800 | Gimnasio de colores: piso de goma con motitas, tapetes de colores, espejo grande, rack de mancuernas, banco con barra y discos, árbol de discos, 2 caminadoras, saco de boxeo, pesas rusas, báscula grande y carteles (¡TÚ PUEDES!, SIN EXCUSAS, ¡UNA MÁS!, TOMA AGUA). Flags `bascula`, `saco`, `cinta` | Músculo (prueba `PruebaH`) |

### Sin gravedad: `flota` (0..1)

Con `flota` en el `SceneState`, los objetos sueltos del escenario activo **suben y giran despacio** (0 = todo en su lugar, el
valor por defecto, así que los videos viejos no cambian). Se registran en `sets.ts` con `flotante(FL, set, objeto, altura, { sp, dx, dz })`:

| `set` | Qué flota |
|---|---|
| `park` | las 3 bancas |
| `house` | mesa, 2 sillas, sofá, lámpara de pie y maceta |
| `classroom` | 12 pupitres (la fila de adelante sube menos para no tapar la cámara), escritorio del profe y globo terráqueo |
| `gym` | 14 mancuernas (salen del rack hacia el centro), barra con discos, 3 discos del árbol, 3 pesas rusas y botellas |
| `farm` | 6 pacas de paja |
| `hospital` | cama y suero |
| `store` | todos los productos de los estantes (salen volando al pasillo) y la caja |
| `beach` | 90 gotas y burbujas de agua del mar que suben (algunas gigantes) |

- Para que suban: `flota: flotaSube(f, f0)`. Para que **caigan con rebote** al volver la gravedad: `flota: flotaCae(f, f0, T)`
  (`T` = cuadros de caída; dos rebotes chiquitos y luego 0). Ambas en `sets.ts`.
- Los coches de la calle son tarjetas: hazlos flotar en la historia (ver `flo()` en `gravedad.ts`).
- Para girar a un personaje sobre su centro (no sobre los pies), usa `spinC()` de `gravedad.ts`.

### Gimnasio (`gym`): dónde está cada cosa

Cuarto de 14 × 10 m (paredes naranja, celeste y rosa con `emissive 0.45`). Todo con `at(ORIGIN.gym, x, y, z)`:

| Cosa | Posición local | Notas |
|---|---|---|
| Zona libre (tapetes) | x −4..2, z −4.4..−0.4 | Buen lugar para Sticky y extras; la cámara mira hacia −z |
| Espejo | fondo, x −3.9..2.7, y 0.9..3 | Mapa pintado (sin reflejo real) |
| Mancuernas | pared izquierda, x −6.4, z −3.5..0.3 | 7 colores, dos niveles |
| Banco con barra | x −2.6, z −2..−3.3 | Barra a 1.22 m con discos rojo/azul/amarillo |
| Caminadoras | x 5.3, z −3 y −0.6 | Sobre la banda pon la tarjeta con `y: 0.22`. `cinta` = velocidad de la banda (m/s) |
| Saco de boxeo | x 2.75, z −4.1 | `saco` 0..1 = cuánto se balancea |
| Báscula grande | plataforma en x 2.3, z 0.9 (párate con `y: 0.125`) | Carátula 0–200 kg; `bascula` 0..1 mueve la aguja (0.5 ≈ 100 kg). Para ver la carátula al lado de Sticky, pon la cámara de lado (ver `pruebaH.ts`, toma 3) |

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

## Objetos (props), profundidad y cámara (nov 2026)

- **`kind: "prop"`** (`engine/props.ts`, ayuda `prop(tipo, pos, s, {on, k, txt, col, anillos})`): satelite, celular (pantalla `txt`: mapa / blanco / senal / negro), cono, reloj (`k` = minutero), letrero (`txt`, `k: 1` con postes), muneco (`k` = derretido), oso, bola, paraguas, mapa, nube (`on` = lluvia), planeta (Tierra o Urano con `anillos`), linterna, foco, router, zzz, rayo, moneda, papel, pasto, arbusto, pino, poste, planta, charco. En el piso proyectan su silueta; con `y` > 0 flotan.
- **Profundidad:** `capaCerca(cam, tipo, lado)` pone pasto / arbusto / pino / poste / planta a ~1.2 m de la cámara en una esquina de abajo (no tapa el centro). Úsalo con `dofAt` cInf 5–7 para que salga borroso.
- **`niebla`** en el `SceneState` (1 normal, 0.5 = el doble de niebla) y **`sunDir`** (dirección del disco del sol, p. ej. `[-0.1, 0.64, -0.76]` = sol alto).
- **`roll`** en la cámara (`Cam`, rad) para planos inclinados (usa una cámara-función).
- Sticky con **`gafas: true`** (gafas de sol) en `StickyOpts`.
- Ayudas de toma en `engine/tomas.ts`: `K`, `at`, `orbit`, `punch`, `withPunch`, `keysPunch`, `entra`, `armarTomas(CUTS, TOTAL, SHOTCAM)`, `flo` (flota), `cae` (cae con rebote), `vuela` (tiro parabólico), `spinC`, `brinca`. Junto con `caraEn` y `conSalto` (`timeline.ts`) y la `Portada` (`portada.tsx`) bastan para armar un short nuevo.
- **Nuevos objetos (nov 2026):** lupa, rayosx (molleja con piedritas; `k` = apretón), molcajete (`k` = molienda), maiz, pan, piedras, piedrita, costal (`txt`), pecera (pez que nada y abre la boca; `k` = fase), branquias (esquema: el agua entra por la boca y sale por las branquias; `k` = fase), tanque, burbujas (`k` = subida), mesa.
- **`pisos`** en el `SceneState` (alturas en m): una tarjeta parada a esa altura (muelle 0.39, mesa 0.82, cama 0.91) también proyecta su silueta.
