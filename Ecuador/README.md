# Ecuador · Provincia, ciudad y sector

Guía de consulta para ubicar direcciones dictadas por teléfono. Las direcciones se piden siempre en este orden, y el módulo tiene exactamente tres secciones:

1. **Provincia**: las 24 provincias en el mapa, ordenadas por número de casos, con capital, región, ciudades frecuentes y limítrofes.
2. **Ciudad**: las ciudades más frecuentes (las que superan 10 casos en el reporte), con su provincia, cantón y altitud.
3. **Sector**: las clínicas dentales de la red en el mapa, separadas por las zonas del listado de proveedores (Quito: norte, centro, sur, valles, Machachi, Cayambe, Guayllabamba; Guayaquil: norte, centro, sur, Durán, Milagro; Cuenca por zonas; y 28 ciudades más). En Quito, Guayaquil y Cuenca el mapa dibuja los límites de los barrios (parroquias urbanas y barrios de OpenStreetMap; `tools/fetch-barrios.js`) y cada clínica se asigna al que la contiene. La ubicación es aproximada: el sector o la cabecera, no la puerta.

La portada (`#/`) es una introducción breve al país: seis datos y cómo se dicta una dirección.

**Abrir:** doble clic en `index.html` (funciona sin conexión) o `node tools/serve.js 5191` y entrar a http://localhost:5191.

## De dónde sale qué
- **Qué ciudades y en qué orden:** reporte de asistencias (`transference_*.xlsx`, junio a octubre de 2026, 2 763 casos en Ecuador). Solo se guarda el conteo agregado en `tools/data/frecuencia.json`; el Excel y los datos de personas no se publican.
- Algunas «ciudades» del reporte son en realidad barrios o parroquias (Belisario Quevedo, Solanda, Bellavista, Lizarzaburu, Ayacucho, Carcelén…). El constructor las suma a su ciudad y las lista como sector.
- **Clínicas:** listado de proveedores dentales (`Listado de Asignacion Proveedores…xlsx`, noviembre de 2026). En `tools/data/clinicas.json` solo se guardan nombre, dirección, ciudad y zona; **no** se publican teléfonos, prioridades ni instrucciones internas ("no sugerir"). `tools/build-clinicas.js` las ubica con anclas aproximadas (sectores de `js/guia-data.js` o coordenadas).

## Límites del módulo
Es una ayuda de contexto. **No sustituye** el mapa de despacho ni la ubicación en vivo del cliente. Los límites son referenciales y las posiciones de los sectores son aproximadas. El mapa no muestra calles.

## Estructura
- `js/content-provincias.js`: textos y cifras de las 24 provincias.
- `js/guia-data.js`: frecuencias y ciudades (generado por `tools/build-guia.js`). `js/clinicas-data.js`: clínicas por zona (generado por `tools/build-clinicas.js`).
- `js/ec-map.js`: componente de mapa (SVG, zoom, arrastre, teclado, marcadores).
- `js/geo-data.js`: geometría de provincias (generado).
- `js/ec-views.js`, `js/ec-app.js`: pantallas y enrutador.
- `assets/`: relieve sombreado y tipografías (Instrument Serif, Newsreader, DM Mono; licencia OFL).
- `tools/`: scripts para regenerar datos y pruebas (`flow.js`, `shot.js`). Requieren `npm install` dentro de `tools/`.

## Regenerar datos
`tools/cache/` no se publica. Para actualizar con un reporte nuevo, agregar sus conteos a `tools/data/frecuencia.json` (provincias y pares provincia|ciudad) y ejecutar:

```bash
node tools/fetch-sectors.js   # barrios de OpenStreetMap (Overpass; puede tardar por los reintentos)
node tools/build-guia.js      # frecuencias, ciudades y sectores
node tools/build-geo.js       # provincias (solo si cambian)
node tools/build-relief.js    # relieve sombreado (solo si cambia)
```

`tools/build-cantones.js` y `js/cantones-data.js` quedan como entrada de `build-guia.js` (cabeceras cantonales); el sitio no los carga.

## Fuentes
- Límites de provincias: geoBoundaries (CC0), referenciales; no sustituyen la cartografía oficial del IGM.
- Cabeceras cantonales y sectores: GeoNames (CC BY 4.0) y © colaboradores de OpenStreetMap (ODbL).
- Población: INEC, Censo 2022. Relieve: teselas Terrarium (SRTM/GEBCO) vía AWS Open Data.
