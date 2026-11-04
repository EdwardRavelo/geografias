# Atlas de campo · Ecuador

Módulo de consulta y capacitación para ubicar lugares en Ecuador: provincias, cantones con sus cabeceras, ciudades principales con sectores y puntos de referencia, y lecciones breves. Pensado para agentes que reciben direcciones dictadas por teléfono.

**Abrir:** doble clic en `index.html` (funciona sin conexión) o `node tools/serve.js 5191` y entrar a http://localhost:5191.

## Contenido
- **Atlas**: 24 provincias con ficha (capital, superficie, población 2022, densidad, cantones, limítrofes). Al acercar el mapa aparecen los **223 cantones**, sus nombres y sus cabeceras; cada cantón tiene su ficha. Búsqueda por provincia, cantón o cabecera.
- **Cantones**: tabla ordenable con cabecera, altitud y población. Marca los 54 cantones cuya cabecera no se llama igual y los nombres que se repiten (Bolívar, Olmedo, Sucre, San Miguel, Eloy Alfaro…).
- **Ciudades**: ciudades principales con sectores y referencias (aeropuertos, terminales, hospitales, estadios, centros comerciales, universidades, peajes, lugares emblemáticos) y una guía para orientarse en Quito, Guayaquil y Cuenca.
- **Lecciones** (7): posición, regiones, relieve, agua, clima, biodiversidad y riesgos, y **ubicar una dirección dictada**.
- No hay práctica, evaluación ni registro de progreso. No se guardan datos de personas.

## Límites del módulo
Es una ayuda de contexto. **No sustituye** el mapa de despacho ni la ubicación en vivo del cliente. Los límites son referenciales y las referencias de ciudades vienen de OpenStreetMap, que puede estar incompleto.

## Estructura
- `js/content-provincias.js`, `js/content-lecciones.js`, `js/content-ciudades.js`: textos, cifras y guías (aquí se edita el contenido).
- `js/ec-map.js`: componente de mapa (SVG, zoom, arrastre, teclado, cantones y marcadores).
- `js/geo-data.js`, `js/cantones-data.js`, `js/ciudades-data.js`: datos generados (no editar a mano).
- `assets/`: relieve sombreado y tipografías (Instrument Serif, Newsreader, DM Mono; licencia OFL).
- `tools/`: scripts para regenerar datos y pruebas (`flow.js`, `shot.js`). Requieren `npm install` dentro de `tools/`.

## Regenerar datos
`tools/cache/` no se publica. Para regenerar hay que descargar a esa carpeta las fuentes (provincias y cantones de geoBoundaries ADM1/ADM2, `EC.txt` de GeoNames, la tabla de cantones de Wikipedia y las teselas de elevación) y ejecutar:

```bash
node tools/build-geo.js        # provincias, capitales, vecindad
node tools/build-cantones.js   # cantones y cabeceras
node tools/fetch-osm.js        # referencias de ciudades (Overpass; puede tardar)
node tools/build-ciudades.js   # ciudades, sectores y referencias
node tools/build-relief.js     # relieve sombreado
```

## Fuentes
- Límites de provincias y cantones: geoBoundaries (CC0), referenciales; no sustituyen la cartografía oficial del IGM.
- Cabeceras cantonales (coordenadas): GeoNames (CC BY 4.0).
- Cifras provinciales y cantonales: INEC, Censo 2022 (vía Wikipedia). Total vigente: 223 cantones.
- Sectores y referencias de ciudades: © colaboradores de OpenStreetMap (ODbL).
- Relieve: teselas Terrarium (SRTM/GEBCO) vía AWS Open Data.
