# Geografías

Módulos de capacitación sobre la geografía de cada país: mapa interactivo, regiones, provincias o equivalentes, lecciones, práctica y evaluación.

Cada país vive en su propia carpeta y es independiente (se abre con su `index.html`).

| País | Carpeta | Estado |
|---|---|---|
| Ecuador | `Ecuador/` | Completo: 6 lecciones, 3 juegos, evaluación de 20 preguntas |

## Cómo añadir un país

1. Copiar `Ecuador/` a `NuevoPaís/` (sin `tools/node_modules` ni `tools/cache`).
2. **Geometrías:** obtener los límites de la división de primer nivel del país (geoBoundaries, ADM1, CC0) y regenerar `js/geo-data.js` adaptando `tools/build-geo.js` (identificadores, nombres, capitales, proyección en `PROJ`).
3. **Relieve:** ajustar las cajas de coordenadas en `tools/build-relief.js` y generar `assets/relief-*.webp`.
4. **Contenido:** reescribir `js/content-provincias.js` (datos y textos por división) y `js/content-lecciones.js` (lecciones y preguntas). Los nombres «provincia», «cantón» y «región» pueden cambiar según el país.
5. **Regiones y colores:** definir las regiones en `EC.REGIONS` y sus colores en `css/app.css` (`--costa`, `--sierra`, …).
6. Probar con `node tools/serve.js` y `node tools/flow.js`.

## Qué se reutiliza tal cual
`js/ec-map.js` (mapa), `js/ec-util.js`, `js/ec-views.js`, `js/ec-practice.js`, `js/ec-app.js`, `css/app.css` y `assets/fonts/`.

## Qué hay que rehacer por país
Datos geográficos, textos, cifras, preguntas, lecciones y la paleta de regiones. Las cifras deben verificarse con la fuente oficial de cada país.
