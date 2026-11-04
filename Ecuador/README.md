# Atlas de campo · Geografía del Ecuador

Módulo de capacitación con mapa interactivo: provincias, regiones y capitales.

**Abrir:** doble clic en `index.html` (funciona sin conexión y sin servidor) o `node tools/serve.js 5191` y entrar a http://localhost:5191.

## Contenido
- **Portada** con ficha del país y ruta de aprendizaje.
- **Atlas**: 24 provincias con ficha (capital, superficie, población 2022, densidad, cantones, limítrofes), búsqueda y capas.
- **6 lecciones** con mapa que se acerca y resalta mientras se lee, y 3 preguntas de comprobación cada una.
- **3 juegos**: ubicar provincias, capitales y regiones.
- **Evaluación final**: 20 preguntas (6 de mapa), aprobada con 80 %.
- El progreso se guarda en el navegador (`localStorage`).

## Estructura
- `js/content-provincias.js`, `js/content-lecciones.js`: textos, cifras y preguntas (aquí se edita el contenido).
- `js/ec-map.js`: componente de mapa (SVG, zoom, arrastre, teclado).
- `js/geo-data.js`: geometrías generadas (no editar a mano).
- `assets/`: relieve sombreado y tipografías (Instrument Serif, Newsreader, DM Mono; licencia OFL).
- `tools/`: scripts para regenerar datos (`build-geo.js`, `build-relief.js`) y pruebas (`flow.js`, `shot.js`). Requieren `npm install` dentro de `tools/`.

## Fuentes
- Límites: geoBoundaries (CC0), referenciales; no sustituyen la cartografía oficial del IGM.
- Relieve: teselas Terrarium (SRTM/GEBCO) vía AWS Open Data.
- Cifras provinciales: INEC, Censo 2022 (vía tabla de Wikipedia). Cantones de Esmeraldas (7) y Morona Santiago (12) corregidos para sumar 221.

## Regenerar datos (opcional)
`tools/cache/` no se publica. Para regenerar: descargar a esa carpeta `provinces-raw.geojson`, `col-adm0.geojson` y `per-adm0.geojson` (geoBoundaries, ADM1/ADM0, CC0), luego `npm install` dentro de `tools/` y ejecutar `node tools/build-geo.js` y `node tools/build-relief.js` (descargan las teselas de elevación). Los archivos generados ya están incluidos en el repositorio.
