/* Contenido: lecciones (texto + escena de mapa por paso) y preguntas de comprobación.
   Cada paso: { kicker, title, body (HTML), aside?, scene }.
   scene: { focus, hl, layers, aux } — ver AtlasMap.setScene en ec-map.js */
(function () {
  const EC = (window.EC = window.EC || {});
  const S = EC.SETS, R = EC.STATS;
  const ids = (r) => EC.STATS[r].ids;
  const pct = (v) => v.toFixed(0);
  const T = (id, label) => `<button class="term" data-prov="${id}">${label || EC.PROVS[id].name}</button>`;
  const P = (name) => name;
  const RV = (id, label) => label;

  EC.SCENE_DEFAULT = { focus: 'all', hl: null, tint: 0.5, relief: true, regions: true, places: false, equator: false, labels: 'provinces', aux: null };

  EC.LESSONS = [
    // ───────────────────────────── 1 ─────────────────────────────
    {
      id: 'posicion', n: 1, title: 'Posición y territorio', minutes: 12,
      blurb: 'Dónde está Ecuador, con quién limita y qué significa vivir sobre la línea equinoccial.',
      steps: [
        {
          kicker: '0° 0′ 0″', title: 'Un país que lleva su latitud en el nombre',
          body: `<p>«Ecuador» es, en español, la línea imaginaria que divide la Tierra en dos hemisferios: la <strong>línea equinoccial</strong>, de latitud 0°. El país se llama así porque ese paralelo atraviesa su territorio.</p>
                 <p>Con los límites de este mapa, la línea cruza cinco provincias: ${T('manabi')}, ${T('santo-domingo', 'Santo Domingo de los Tsáchilas')}, ${T('pichincha')}, ${T('napo')} y ${T('sucumbios', 'Sucumbíos')}.</p>`,
          aside: ['Dato de campo', 'El monumento de la Mitad del Mundo, en San Antonio de Pichincha, está a unos 25 km al norte de Quito. Mediciones con GPS ubican la línea real unos 240 m más al norte.'],
          scene: { focus: { box: [-81.2, -2.2, -75.6, 2.0] }, hl: S.equator, layers: { equator: true, tint: 0.45, labels: 'provinces' } },
        },
        {
          kicker: '1° 27′ N — 5° 01′ S', title: 'Casi todo el país queda al sur, pero por muy poco',
          body: `<p>El territorio continental se extiende desde cerca de <strong>1° 27′ de latitud norte</strong> (frontera con Colombia, en ${T('carchi')} y ${T('esmeraldas')}) hasta <strong>5° 01′ sur</strong> (frontera con Perú, en ${T('zamora-chinchipe')}). Su longitud va de 75° 11′ a 81° 01′ oeste.</p>
                 <p>Quito está en el hemisferio sur, a solo 0° 11′ de la línea. Ibarra y Tulcán están al norte. Es un país «cuadrado»: mide aproximadamente lo mismo de norte a sur que de este a oeste.</p>`,
          scene: { focus: 'main', hl: null, layers: { places: ['Tulcán', 'Quito', 'Zamora'], equator: true, tint: 0.4, labels: 'regions' } },
        },
        {
          kicker: 'Norte', title: 'Colombia, al norte',
          body: `<p>Al norte limita con Colombia a lo largo de tres provincias: ${T('esmeraldas')} (frontera con el departamento de Nariño y la costa), ${T('carchi')} (donde el volcán Chiles marca el límite) y ${T('sucumbios', 'Sucumbíos')}, donde el límite sigue los ríos San Miguel y Putumayo.</p>`,
          scene: { focus: { box: [-80.4, 0.0, -75.4, 1.8] }, hl: S.colombia, layers: { tint: 0.45 } },
        },
        {
          kicker: 'Sur y este', title: 'Perú, la frontera más larga',
          body: `<p>Con Perú comparte la frontera más extensa, más de 1 400 km, que va desde el Pacífico hasta el extremo oriental. La tocan siete provincias: ${T('el-oro')}, ${T('loja')}, ${T('zamora-chinchipe')}, ${T('morona-santiago')}, ${T('pastaza')}, ${T('orellana')} y ${T('sucumbios', 'Sucumbíos')}.</p>
                 <p>El límite quedó definido por el Protocolo de Río de Janeiro (1942) y se cerró definitivamente con el Acta Presidencial de Brasilia de 1998, que puso fin a décadas de conflicto.</p>`,
          scene: { focus: { box: [-81.2, -5.5, -75.0, 0.2] }, hl: S.peru, layers: { tint: 0.45 } },
        },
        {
          kicker: 'Oeste', title: 'El Pacífico y el litoral continental',
          body: `<p>Al oeste está el océano Pacífico. Cinco provincias tienen costa: ${T('esmeraldas')}, ${T('manabi', 'Manabí')}, ${T('santa-elena')}, ${T('guayas')} y ${T('el-oro')}. ${T('los-rios')} y ${T('santo-domingo', 'Santo Domingo de los Tsáchilas')} son parte de la Costa, pero no tienen litoral.</p>`,
          scene: { focus: { box: [-81.6, -4.2, -78.6, 1.6] }, hl: S.coast, layers: { tint: 0.45 } },
        },
        {
          kicker: 'Archipiélago', title: 'Galápagos, a 1 000 km al oeste',
          body: `<p>El archipiélago de ${T('galapagos', 'Galápagos')} está a unos 1 000 km de la costa continental, por eso aparece en un recuadro a escala reducida. Es la única provincia insular y la única con otro huso horario: <strong>UTC−6</strong>, una hora menos que el continente (UTC−5).</p>
                 <p>Ecuador no cambia la hora en verano: al estar sobre el ecuador, el día dura casi 12 horas todo el año, con el sol saliendo hacia las 6:00 y poniéndose hacia las 18:00.</p>`,
          scene: { focus: 'gal', hl: ['galapagos'], layers: { tint: 0.35, labels: 'provinces' } },
        },
      ],
      check: [
        { t: 'mcq', q: '¿Qué significa el nombre «Ecuador»?', o: ['La línea que divide la Tierra en dos hemisferios', 'El nombre indígena de la cordillera', 'La capital de la antigua colonia', 'El río más largo del país'], a: 0, why: 'El nombre viene de la línea ecuatorial (latitud 0°), que cruza el país al norte de Quito.' },
        { t: 'mcq', q: '¿Cuál de estas provincias es atravesada por la línea equinoccial?', o: ['Pichincha', 'Loja', 'Azuay', 'El Oro'], a: 0, why: 'La línea cruza Pichincha (además de Manabí, Santo Domingo, Napo y Sucumbíos).' },
        { t: 'mcq', q: 'A qué distancia aproximada de la costa continental están las Galápagos?', o: ['100 km', '500 km', '1 000 km', '3 000 km'], a: 2, why: 'El archipiélago está a unos 1 000 km del continente, y por eso su huso horario es UTC−6.' },
      ],
    },

    // ───────────────────────────── 2 ─────────────────────────────
    {
      id: 'regiones', n: 2, title: 'Las cuatro regiones', minutes: 15,
      blurb: 'Costa, Sierra, Amazonía e Insular: cuántas provincias tiene cada una y qué las distingue.',
      steps: [
        {
          kicker: '24 provincias · 4 regiones', title: 'Una división natural, no administrativa',
          body: `<p>Las regiones naturales agrupan las 24 provincias según su relieve y clima. No son unidades de gobierno, pero organizan casi todo el conocimiento geográfico del país: la Costa tiene ${R.costa.n} provincias, la Sierra ${R.sierra.n}, la Amazonía ${R.amazonia.n} y Galápagos es la región Insular, con una sola.</p>
                 <p>Mira cómo las regiones corren en franjas de norte a sur, paralelas a los Andes.</p>`,
          scene: { focus: 'all', hl: null, layers: { tint: 0.62, labels: 'regions' } },
        },
        {
          kicker: 'Provincias, cantones y parroquias', title: 'Qué es un cantón',
          body: `<p>Además de las regiones naturales, el país tiene una división <strong>administrativa</strong> en tres niveles. La <strong>provincia</strong> se divide en <strong>cantones</strong>, y cada cantón se divide en <strong>parroquias</strong>, urbanas o rurales.</p>
                 <p>Cada cantón tiene una <strong>cabecera cantonal</strong> (su ciudad principal) y un gobierno municipal. En total hay ${R.total.n} provincias y ${R.total.cantones} cantones. ${T('guayas')} tiene el mayor número (25); ${T('santo-domingo', 'Santo Domingo de los Tsáchilas')} solo 2.</p>
                 <p>La capital de una provincia es la cabecera de uno de sus cantones: Quito es capital de ${T('pichincha')} y cabecera del cantón Quito.</p>`,
          aside: ['No confundir', 'Provincia y cantón son términos administrativos; Costa, Sierra o Amazonía son regiones naturales. Una región agrupa provincias, no cantones.'],
          scene: { focus: 'all', hl: null, layers: { tint: 0.5, labels: 'provinces', places: 'capitals' } },
        },
        {
          kicker: `Costa · ${R.costa.n} provincias`, title: 'La Costa: llanura, estuario y mar',
          body: `<p>Ocupa el ${pct(R.costa.areaPct)} % del territorio y reúne al <strong>${pct(R.costa.popPct)} % de la población</strong>. Va del litoral a las estribaciones occidentales de los Andes, con cordilleras bajas (Chongón-Colonche, Mache-Chindul) y la gran llanura aluvial del Guayas.</p>
                 <p>Provincias: ${ids('costa').map((i) => T(i)).join(', ')}. En el mapa verás a ${T('santo-domingo', 'Santo Domingo')} subiendo por la ladera andina: es Costa por clasificación oficial, aunque su relieve ya sea de piedemonte.</p>`,
          aside: ['Para recordar', 'Banano, cacao, camarón y arroz: la Costa concentra la agricultura de exportación y los grandes puertos.'],
          scene: { focus: { provinces: ids('costa') }, hl: ids('costa'), layers: { tint: 0.62, labels: 'provinces', places: ['Guayaquil', 'Esmeraldas', 'Machala', 'Portoviejo'] } },
        },
        {
          kicker: `Sierra · ${R.sierra.n} provincias`, title: 'La Sierra: dos cordilleras, un corredor',
          body: `<p>Es el ${pct(R.sierra.areaPct)} % del territorio y el ${pct(R.sierra.popPct)} % de la población. Sigue el corredor entre las cordilleras Occidental y Real, con cuencas llamadas hoyas a entre 2 000 y 3 000 m, y volcanes de más de 5 000 m.</p>
                 <p>Provincias: ${ids('sierra').map((i) => T(i)).join(', ')}. ${T('loja')} es la más austral: allí los Andes bajan y se rompen.</p>`,
          aside: ['Para recordar', 'La capital, Quito, está en la Sierra, a 2 850 m, pero la mayor ciudad, Guayaquil, está en la Costa.'],
          scene: { focus: { provinces: ids('sierra') }, hl: ids('sierra'), layers: { tint: 0.62, labels: 'provinces', places: ['Quito', 'Cuenca', 'Ambato', 'Riobamba', 'Loja'] } },
        },
        {
          kicker: `Amazonía · ${R.amazonia.n} provincias`, title: 'La Amazonía: casi la mitad del territorio',
          body: `<p>También llamada Oriente. Es la región <strong>más extensa</strong>: ${pct(R.amazonia.areaPct)} % del territorio, pero con apenas el ${R.amazonia.popPct.toFixed(1).replace('.', ',')} % de la población. Va de las laderas orientales de la cordillera Real a la llanura selvática, atravesada por ríos que tributan al Amazonas.</p>
                 <p>Provincias: ${ids('amazonia').map((i) => T(i)).join(', ')}. ${T('pastaza')} es la mayor provincia del país.</p>`,
          aside: ['Para recordar', 'Es la región de menor densidad humana y la de mayor presencia de pueblos indígenas amazónicos: kichwa, shuar, achuar, waorani, sápara, entre otros.'],
          scene: { focus: { provinces: ids('amazonia') }, hl: ids('amazonia'), layers: { tint: 0.62, labels: 'provinces', places: ['Tena', 'Puyo', 'Macas', 'Coca'] } },
        },
        {
          kicker: 'Insular · 1 provincia', title: 'La región Insular',
          body: `<p>Es solo ${T('galapagos', 'Galápagos')}: 8 010 km² de superficie, 28 583 habitantes y una única capital, Puerto Baquerizo Moreno, en la isla San Cristóbal. Es la región de menor población y la única sin continuidad terrestre con el resto del país.</p>`,
          scene: { focus: 'gal', hl: ['galapagos'], layers: { tint: 0.62, labels: 'provinces', places: ['Puerto Baquerizo Moreno'] } },
        },
        {
          kicker: 'Comparación', title: 'Mucho territorio no significa mucha gente',
          body: `<p>El gráfico compara qué parte del territorio y qué parte de la población tiene cada región. La Amazonía casi no cambia de lugar entre ambas barras: ocupa 46 % del suelo y alberga 5,5 % de la población. La Costa hace lo contrario: con 28 % del territorio, concentra 53 % de los habitantes.</p>
                 <p>${T('guayas')} y ${T('pichincha')}, solas, reúnen cerca del 44 % de la población del país.</p>`,
          scene: { focus: 'all', hl: null, aux: { chart: 'regiones' }, layers: { tint: 0.62, labels: 'regions' } },
        },
      ],
      check: [
        { t: 'mcq', q: '¿Cuántas provincias tiene la región Sierra?', o: ['6', '7', '10', '12'], a: 2, why: 'La Sierra tiene 10 provincias: de Carchi a Loja, pasando por Azuay y Cañar.' },
        { t: 'mcq', q: '¿Qué región ocupa más territorio?', o: ['Costa', 'Sierra', 'Amazonía', 'Insular'], a: 2, why: 'La Amazonía abarca casi la mitad del territorio (≈ 46 %), con muy poca población.' },
        { t: 'tf', q: 'Loja pertenece a la región Costa.', a: false, why: 'Loja está en la Sierra, en el extremo sur de los Andes, frontera con Perú.' },
      ],
    },

    // ───────────────────────────── 3 ─────────────────────────────
    {
      id: 'relieve', n: 3, title: 'El relieve: Andes, costa y selva', minutes: 18,
      blurb: 'Cordilleras, volcanes, hoyas y llanuras: cómo el relieve ordena a las provincias.',
      steps: [
        {
          kicker: 'La columna vertebral', title: 'Los Andes dividen al país en tres',
          body: `<p>Al entrar desde Colombia, los Andes se organizan en dos cordilleras paralelas, la <strong>Occidental</strong> y la <strong>Real</strong> (u Oriental), que corren de norte a sur y separan el territorio en tres franjas: Costa a un lado, Amazonía al otro y, entre ambas, la Sierra.</p>
                 <p>En el mapa, el relieve muestra con claridad cómo la cordillera es mucho más ancha y alta en el centro y se disuelve hacia el sur, en ${T('loja')}.</p>`,
          scene: { focus: 'main', hl: null, layers: { tint: 0.0, regions: false, labels: false, } },
        },
        {
          kicker: 'Humboldt, 1802', title: 'La «Avenida de los Volcanes»',
          body: `<p>Entre las dos cordilleras se abre el <strong>callejón interandino</strong>, que el naturalista Alexander von Humboldt llamó «avenida de los volcanes» al recorrerlo en 1802. Hay decenas de conos y nevados: ${P('Cayambe')}, ${P('Antisana')}, ${P('Cotopaxi')}, ${P('Illiniza Sur')}, ${P('Tungurahua')}, ${P('El Altar')}, ${P('Sangay')} y, el mayor, el ${P('Chimborazo')} (6 263 m).</p>
                 <p>Humboldt intentó escalar el Chimborazo, llegó a unos 5 900 m y desde entonces su imagen del volcán quedó ligada a la ciencia moderna.</p>`,
          aside: ['Dato de campo', 'Por el abultamiento ecuatorial de la Tierra, la cima del Chimborazo es el punto de la superficie más alejado del centro del planeta, aunque el Everest sea más alto sobre el nivel del mar.'],
          scene: { focus: { box: [-79.6, -2.4, -77.6, 0.7] }, hl: null, layers: { tint: 0.1, regions: false, labels: false, places: ['Quito', 'Latacunga', 'Ambato', 'Riobamba'] } },
        },
        {
          kicker: 'Hoyas y nudos', title: 'Un callejón cortado en cuencas',
          body: `<p>El callejón no es continuo: unos tramos donde las dos cordilleras se juntan, los <strong>nudos</strong> (como Mojanda–Cajas, Tiopullo, Azuay y Loja, entre otros), lo dividen en cuencas llamadas <strong>hoyas</strong>: Chota, Guayllabamba, Latacunga, Ambato, Riobamba, Cuenca, Loja…</p>
                 <p>Cada hoya es un escenario agrícola y urbano: allí están Quito (${T('pichincha')}), Ambato, Riobamba y Cuenca, a entre 2 500 y 2 900 m.</p>`,
          scene: { focus: { box: [-79.4, -3.4, -77.6, 0.5] }, hl: ids('sierra'), layers: { tint: 0.2, labels: 'provinces', places: ['Quito', 'Latacunga', 'Ambato', 'Riobamba', 'Azogues', 'Cuenca', 'Loja', 'Ibarra'] } },
        },
        {
          kicker: 'El sur', title: 'Hacia Loja, los Andes se abren',
          body: `<p>Al sur de ${T('azuay')} las montañas pierden altura: ya no hay nevados ni grandes volcanes, sino cordilleras más bajas, valles templados (Catamayo, Malacatos) y un clima más seco. Aquí está también el Parque Nacional Podocarpus, uno de los más biodiversos del país.</p>`,
          scene: { focus: { box: [-80.6, -5.3, -78.2, -2.4] }, hl: ['loja', 'zamora-chinchipe', 'el-oro'], layers: { tint: 0.2, places: ['Loja', 'Zamora', 'Machala'] } },
        },
        {
          kicker: 'Costa', title: 'Costa: lomas bajas y un gran estuario',
          body: `<p>La Costa no es un plano: las cordilleras costeras de <strong>Chongón-Colonche</strong> (Guayas–Santa Elena–Manabí) y <strong>Mache-Chindul</strong> (Esmeraldas–Manabí) corren paralelas al litoral, con alturas de menos de 1 000 m. Entre ellas y los Andes se extiende la llanura aluvial del Guayas.</p>
                 <p>Al sur se abre el <strong>golfo de Guayaquil</strong>, el mayor estuario del Pacífico sudamericano, con la isla Puná y manglares en ${T('el-oro')} y ${T('guayas')}.</p>`,
          scene: { focus: { box: [-81.6, -4.0, -78.6, 1.6] }, hl: ids('costa'), layers: { tint: 0.15, labels: false, places: ['Guayaquil', 'Esmeraldas', 'Portoviejo'] } },
        },
        {
          kicker: 'Oriente', title: 'Amazonía: piedemonte, cordilleras bajas y llanura',
          body: `<p>De la cordillera Real se baja de golpe: en menos de 100 km se pasa de 4 000 m a unos 500 m. Después vienen las cordilleras subandinas (Galeras, Cutucú, Cóndor), mucho más bajas que los Andes, y finalmente la llanura amazónica, casi plana, por donde los ríos serpentean.</p>
                 <p>El ${P('Sumaco')}, un volcán aislado, y el ${P('Reventador')}, muy activo, sobresalen en el piedemonte.</p>`,
          scene: { focus: { box: [-78.9, -4.6, -75.0, 1.0] }, hl: ids('amazonia'), layers: { tint: 0.15, labels: false, } },
        },
        {
          kicker: 'Por qué se mueve el suelo', title: 'Una placa que se hunde',
          body: `<p>Los Andes ecuatorianos son el resultado de la <strong>subducción</strong>: la placa de Nazca, bajo el Pacífico, se hunde bajo la placa Sudamericana a unos 5–6 cm por año. Esa colisión levanta la cordillera, alimenta los volcanes y produce los terremotos. Lo retomaremos en la última lección.</p>`,
          scene: { focus: 'all', hl: null, layers: { tint: 0.1, labels: false, regions: false, } },
        },
      ],
      check: [
        { t: 'mcq', q: '¿Cuál es la montaña más alta del Ecuador?', o: ['Cotopaxi', 'Chimborazo', 'Cayambe', 'Antisana'], a: 1, why: 'El Chimborazo, con 6 263 m, es la cumbre más alta del país.' },
        { t: 'mcq', q: 'Humboldt llamó «avenida de los volcanes» a…', o: ['La costa del Pacífico', 'El callejón interandino', 'La llanura amazónica', 'El archipiélago de Galápagos'], a: 1, why: 'El callejón interandino es el corredor entre las cordilleras Occidental y Real, flanqueado por volcanes.' },
        { t: 'mcq', q: '¿Qué placa tectónica se hunde bajo Sudamérica frente a Ecuador?', o: ['Caribe', 'Cocos', 'Nazca', 'Antártica'], a: 2, why: 'La placa de Nazca se subduce bajo la Sudamericana y es el motor de volcanes y sismos.' },
      ],
    },

    // ───────────────────────────── 4 ─────────────────────────────
    {
      id: 'agua', n: 4, title: 'Agua: vertientes y ríos', minutes: 14,
      blurb: 'Por qué unos ríos van al Pacífico y otros al Amazonas, y cómo atraviesan las cordilleras.',
      steps: [
        {
          kicker: 'Dos vertientes', title: 'Casi mitad y mitad',
          body: `<p>Las cordilleras reparten el agua del país en dos grandes vertientes: la del <strong>Pacífico</strong> y la del <strong>Amazonas</strong>, de tamaño parecido. Cada una tiene sus propios ríos, sus cuencas y sus ritmos.</p>
                 <p>Ojo: la divisoria de aguas no es una sola línea recta, porque varios ríos de las hoyas interandinas abren cañones y cruzan una cordillera para salir hacia el otro lado.</p>`,
          scene: { focus: 'main', hl: null, layers: { tint: 0.5, labels: 'regions' } },
        },
        {
          kicker: 'Vertiente del Pacífico', title: 'Ríos cortos y de caudal estacional',
          body: `<p>Los ríos que bajan al Pacífico son más cortos y de caudal muy marcado por la época de lluvias. El ${RV('esmeraldas', 'Esmeraldas')}, que nace de la unión del Guayllabamba y el Blanco, desemboca en la ciudad homónima. Otros ríos costeros nacen en las laderas de ${T('manabi')}, ${T('el-oro')} y ${T('loja')}.</p>`,
          scene: { focus: { box: [-81.6, -4.6, -77.6, 1.5] }, hl: [...ids('costa'), 'carchi', 'imbabura', 'pichincha', 'cotopaxi', 'bolivar', 'chimborazo', 'azuay', 'loja'], layers: { tint: 0.5, labels: 'provinces' } },
        },
        {
          kicker: 'Cuenca del Guayas', title: 'El gran sistema del Guayas',
          body: `<p>La cuenca del <strong>Guayas</strong> es la mayor de la costa del Pacífico sudamericano. Se forma con los ríos ${RV('daule', 'Daule')} y ${RV('babahoyo', 'Babahoyo')} (alimentado por Vinces, Quevedo, Chimbo y otros), que se juntan frente a Guayaquil y forman el ${RV('guayas', 'Guayas')} antes de abrirse al golfo.</p>
                 <p>Esa llanura se anega cada invierno: de allí su fertilidad y su riesgo de inundación.</p>`,
          aside: ['Para recordar', 'Daule + Babahoyo = Guayas. Guayaquil queda en la orilla derecha del Guayas, justo antes de que se ensanche en el golfo.'],
          scene: { focus: { box: [-80.9, -3.2, -79.0, -0.9] }, hl: ['guayas', 'los-rios', 'manabi'], layers: { tint: 0.5, labels: 'provinces', places: ['Guayaquil', 'Babahoyo'] } },
        },
        {
          kicker: 'Vertiente amazónica', title: 'Ríos largos que terminan en el Amazonas',
          body: `<p>Los ríos de la vertiente amazónica son más largos y caudalosos. El ${RV('napo', 'Napo')}, que reúne agua de ${T('cotopaxi')}, ${T('napo')} y ${T('pichincha')}, cruza la selva hasta el Amazonas en Perú. El ${RV('pastaza', 'Pastaza')}, que nace en las hoyas de Latacunga y Ambato, atraviesa la cordillera Real por Agoyán (cerca de Baños).</p>`,
          scene: { focus: { box: [-79.4, -5.2, -75.0, 1.0] }, hl: ids('amazonia'), layers: { tint: 0.5, labels: 'provinces' } },
        },
        {
          kicker: 'Un viaje', title: 'De Cuenca al Amazonas',
          body: `<p>Los cuatro ríos de Cuenca (Tomebamba, Yanuncay, Tarqui y Machángara) se unen en el ${RV('paute', 'Paute')}. Este atraviesa la cordillera Real, entra en la Amazonía y se convierte en el ${RV('santiago', 'Santiago')}, que desemboca en el Marañón, uno de los dos grandes tributarios del Amazonas.</p>
                 <p>Es decir: el agua que cae sobre una ciudad andina a 2 560 m termina, tras más de cuatro mil kilómetros, en el Atlántico.</p>`,
          scene: { focus: { box: [-79.7, -4.0, -76.4, -2.0] }, hl: ['azuay', 'morona-santiago'], layers: { tint: 0.5, labels: 'provinces', places: ['Cuenca', 'Macas'] } },
        },
        {
          kicker: 'Uso', title: 'Agua que genera energía',
          body: `<p>El relieve vuelve a Ecuador un país hidroeléctrico: la mayor parte de su electricidad proviene de centrales como Paute–Molino (río Paute), Coca Codo Sinclair (río Coca) y Mazar. En la Costa, las represas Daule-Peripa y Poza Honda regulan inundaciones y abastecen riego y agua potable.</p>`,
          scene: { focus: 'main', hl: ['azuay', 'napo', 'orellana', 'sucumbios', 'morona-santiago', 'guayas'], layers: { tint: 0.5, labels: 'provinces' } },
        },
      ],
      check: [
        { t: 'mcq', q: 'El río Guayas se forma por la unión de…', o: ['Napo y Aguarico', 'Daule y Babahoyo', 'Esmeraldas y Mira', 'Paute y Zamora'], a: 1, why: 'Los ríos Daule y Babahoyo se juntan frente a Guayaquil y forman el Guayas.' },
        { t: 'mcq', q: '¿A qué vertiente pertenece el río Napo?', o: ['Pacífico', 'Amazonas', 'Caribe', 'Ninguna: es un río interior'], a: 1, why: 'El Napo, como el Pastaza, el Santiago y el Aguarico, drena a la cuenca del Amazonas.' },
        { t: 'tf', q: 'El río Paute desemboca directamente en el océano Pacífico.', a: false, why: 'El Paute pasa a la Amazonía, se une al Santiago y llega al Marañón y al Amazonas.' },
      ],
    },

    // ───────────────────────────── 5 ─────────────────────────────
    {
      id: 'clima', n: 5, title: 'Clima y pisos altitudinales', minutes: 14,
      blurb: 'En un país sin estaciones térmicas, la altitud y las corrientes marinas deciden el clima.',
      steps: [
        {
          kicker: 'Sin estaciones', title: 'El año no se divide en frío y calor',
          body: `<p>Al estar sobre el ecuador, Ecuador recibe luz solar casi constante y la temperatura media apenas varía durante el año. Lo que cambia es la <strong>lluvia</strong>: se habla de «invierno» (época lluviosa) y «verano» (época seca).</p>
                 <p>En la Costa, el invierno va de diciembre a mayo. En la Sierra, las lluvias se concentran entre octubre y mayo. En la Amazonía, llueve casi todo el año.</p>`,
          scene: { focus: 'main', hl: null, layers: { tint: 0.6, labels: 'regions' } },
        },
        {
          kicker: 'La altitud manda', title: 'Misma latitud, climas opuestos',
          body: `<p>Mira estas tres ciudades, casi a la misma latitud: <strong>Tena</strong> (510 m), <strong>Quito</strong> (2 850 m) y <strong>Guayaquil</strong> (4 m). Tena y Guayaquil son cálidas, con temperaturas medias de unos 25–26 °C; Quito, por altura, ronda los 14 °C.</p>
                 <p>En los Andes tropicales la temperatura baja cerca de <strong>0,6 °C cada 100 m</strong>. Por eso, en pocas decenas de kilómetros se pasa del calor húmedo al frío del páramo.</p>`,
          scene: { focus: { box: [-80.4, -3.2, -76.8, 0.4] }, hl: ['guayas', 'pichincha', 'napo'], layers: { tint: 0.3, labels: false, places: ['Guayaquil', 'Quito', 'Tena'] } },
        },
        {
          kicker: 'Pisos altitudinales', title: 'Seis pisos entre el mar y la nieve',
          body: `<p>El clima por altura se ordena en <strong>pisos altitudinales</strong>. Estos rangos son referenciales (varían según la ladera y la fuente):</p>
                 <ul class="floors-list">
                   <li><b>Cálido</b> · 0–800 m · 24–30 °C</li>
                   <li><b>Subtropical</b> · 800–1 800 m · 18–24 °C</li>
                   <li><b>Templado</b> · 1 800–2 800 m · 12–18 °C</li>
                   <li><b>Frío</b> · 2 800–3 600 m · 6–12 °C</li>
                   <li><b>Páramo</b> · 3 600–4 700 m · 0–6 °C</li>
                   <li><b>Glaciar</b> · más de 4 700 m · bajo 0 °C</li>
                 </ul>
                 `,
          scene: { focus: 'main', hl: ids('sierra'), layers: { tint: 0.5, labels: 'provinces', places: ['Quito', 'Guayaquil', 'Tena'] } },
        },
        {
          kicker: 'Dos corrientes', title: 'Humboldt y El Niño en el mar',
          body: `<p>Frente a la costa se encuentran dos corrientes: la <strong>corriente de Humboldt</strong>, fría, que sube desde el sur, y la <strong>corriente cálida de El Niño</strong> (o de Panamá), que baja desde el norte. Su frente de contacto queda hacia el golfo de Guayaquil.</p>
                 <p>Resultado: el sur de la costa, como ${T('santa-elena')}, es semiárido (menos de 300 mm de lluvia al año), mientras el norte, como ${T('esmeraldas')}, es muy húmedo.</p>`,
          scene: { focus: { box: [-81.6, -4.0, -78.6, 1.6] }, hl: ['santa-elena', 'esmeraldas'], layers: { tint: 0.5, labels: 'provinces' } },
        },
        {
          kicker: 'Oriente', title: 'La Amazonía, siempre mojada',
          body: `<p>En buena parte de la Amazonía llueve más de 3 000 mm al año, sin una época seca definida. Los vientos húmedos del Atlántico chocan con la cordillera Real y descargan el agua en el piedemonte, lo que alimenta ríos de crecida rápida.</p>`,
          scene: { focus: { provinces: ids('amazonia') }, hl: ids('amazonia'), layers: { tint: 0.5, labels: 'provinces', } },
        },
        {
          kicker: 'Anomalía', title: 'Cuando El Niño se calienta',
          body: `<p>Cada cierto número de años, el calentamiento anómalo del Pacífico (evento <strong>El Niño</strong>) aumenta las lluvias de la Costa y provoca inundaciones, como en 1982–1983 y 1997–1998. Cuando ocurre lo contrario (<strong>La Niña</strong>), las lluvias disminuyen y hay sequías.</p>`,
          scene: { focus: { box: [-81.6, -4.0, -78.6, 1.6] }, hl: ids('costa'), layers: { tint: 0.5, labels: 'provinces' } },
        },
      ],
      check: [
        { t: 'mcq', q: '¿Qué factor influye más en la temperatura dentro de Ecuador?', o: ['La latitud', 'La altitud', 'La longitud', 'La cercanía a una capital'], a: 1, why: 'Como todo el país está cerca del ecuador, la altitud explica casi todo: ≈ 0,6 °C menos cada 100 m.' },
        { t: 'mcq', q: 'La corriente fría que reseca el sur de la Costa se llama…', o: ['de Humboldt', 'de El Niño', 'del Golfo', 'de Cromwell'], a: 0, why: 'La corriente de Humboldt enfría el agua y reduce la lluvia en la costa sur, como en Santa Elena.' },
        { t: 'mcq', q: 'Un lugar a 4 000 m de altitud pertenece al piso…', o: ['Cálido', 'Templado', 'Páramo', 'Subtropical'], a: 2, why: 'Entre 3 600 y 4 700 m está el páramo: frío, con pajonal, lagunas y frailejones.' },
      ],
    },

    // ───────────────────────────── 6 ─────────────────────────────
    {
      id: 'naturaleza', n: 6, title: 'Biodiversidad y riesgos', minutes: 15,
      blurb: 'Un país megadiverso que también convive con volcanes, sismos e inundaciones.',
      steps: [
        {
          kicker: 'Megadiverso', title: 'Mucha vida en poco territorio',
          body: `<p>Ecuador ocupa menos del 0,2 % de la superficie terrestre, pero es uno de los 17 países considerados <strong>megadiversos</strong>. La razón es geográfica: pasa del nivel del mar a más de 6 000 m en pocos kilómetros, y cada piso altitudinal tiene su propia flora y fauna.</p>`,
          scene: { focus: 'all', hl: null, layers: { tint: 0.5, labels: 'regions' } },
        },
        {
          kicker: 'Archipiélago', title: 'Galápagos: laboratorio natural',
          body: `<p>Las islas nacieron del magma de un punto caliente bajo la placa de Nazca. Las del oeste (Isabela y Fernandina) son las más jóvenes y activas; las del este (San Cristóbal, Española), las más antiguas. La Reserva Marina que las rodea supera los 130 000 km².</p>
                 <p>En 1978 fueron uno de los primeros sitios inscritos como Patrimonio Natural de la Humanidad por la UNESCO.</p>`,
          scene: { focus: 'gal', hl: ['galapagos'], layers: { tint: 0.3, labels: 'provinces', places: ['Puerto Baquerizo Moreno'] } },
        },
        {
          kicker: 'Fuego', title: 'Volcanes: dónde y cuáles',
          body: `<p>Ecuador tiene decenas de volcanes, en el callejón, en las cordilleras y en Galápagos. Se consideran activos, entre otros: ${P('Cotopaxi')} (se reactivó en agosto de 2015), ${P('Tungurahua')} (en actividad entre 1999 y 2016), ${P('Sangay')} (con erupción casi permanente), ${P('Reventador')} (en erupción desde 2002), ${P('Guagua Pichincha')} y, en Galápagos, Wolf y Fernandina.</p>
                 <p>Los mayores peligros no son solo la lava o la ceniza, sino los <strong>lahares</strong> (flujos de lodo) que bajan por los valles desde glaciares fundidos.</p>`,
          scene: { focus: { box: [-79.6, -2.4, -77.4, 0.5] }, hl: null, layers: { tint: 0.15, regions: false, labels: false, places: ['Quito', 'Latacunga'] } },
        },
        {
          kicker: '16 de abril de 2016', title: 'Terremotos: la costa norte',
          body: `<p>La subducción de la placa de Nazca también produce sismos. El 16 de abril de 2016, un terremoto de magnitud 7,8 con epicentro cerca de Pedernales dejó más de 600 fallecidos y afectó sobre todo a ${T('manabi')} y ${T('esmeraldas')}. Es el más destructivo en décadas.</p>
                 <p>Toda la franja andina y costera está en el Cinturón de Fuego del Pacífico, así que la prevención sísmica es parte de la vida cotidiana.</p>`,
          scene: { focus: { box: [-81.2, -1.6, -78.4, 1.6] }, hl: ['manabi', 'esmeraldas'], layers: { tint: 0.4, labels: 'provinces', } },
        },
        {
          kicker: 'Agua en exceso y en falta', title: 'Inundaciones, deslizamientos y sequías',
          body: `<p>La Costa baja y los valles andinos se inundan en época de lluvias; las laderas empinadas, saturadas de agua, sufren deslizamientos. En sentido opuesto, la Costa sur y los valles secos (Chota, Catamayo) padecen sequías cuando fallan las lluvias. Conocer el relieve y los ríos es conocer dónde están los riesgos.</p>`,
          scene: { focus: 'main', hl: [...ids('costa').filter((i) => ['guayas', 'los-rios', 'manabi'].includes(i))], layers: { tint: 0.4, labels: 'provinces' } },
        },
      ],
      check: [
        { t: 'tf', q: 'Ecuador figura entre los países megadiversos del mundo.', a: true, why: 'Pese a su tamaño, es uno de los 17 países megadiversos, por la variedad de pisos climáticos.' },
        { t: 'mcq', q: '¿En qué año fueron declaradas las Galápagos Patrimonio Natural de la Humanidad?', o: ['1959', '1978', '1998', '2008'], a: 1, why: 'En 1978, y fueron de los primeros bienes inscritos por la UNESCO. El Parque Nacional es de 1959.' },
        { t: 'mcq', q: 'El terremoto de abril de 2016 afectó principalmente a…', o: ['Loja y Zamora', 'Manabí y Esmeraldas', 'Guayas y El Oro', 'Napo y Orellana'], a: 1, why: 'El epicentro estuvo cerca de Pedernales: Manabí y Esmeraldas sufrieron los mayores daños.' },
      ],
    },
  ];

  // ───────── Banco adicional de preguntas (para práctica y evaluación) ─────────
  EC.BANK = [
    { t: 'mcq', tag: 'regiones', q: '¿En qué se divide una provincia?', o: ['En cantones', 'En regiones', 'En zonas', 'En departamentos'], a: 0, why: 'La provincia se divide en cantones, y cada cantón en parroquias urbanas y rurales.' },
    { t: 'tf', tag: 'regiones', q: 'La Sierra es un cantón de Ecuador.', a: false, why: 'La Sierra es una región natural. El cantón es una división administrativa dentro de una provincia.' },
    { t: 'mcq', tag: 'posicion', q: '¿Con qué países limita Ecuador por tierra?', o: ['Colombia y Perú', 'Colombia y Brasil', 'Perú y Brasil', 'Venezuela y Perú'], a: 0, why: 'Al norte con Colombia y al sur y este con Perú; al oeste, el Pacífico.' },
    { t: 'mcq', tag: 'posicion', q: 'Galápagos tiene un huso horario…', o: ['Igual al continental', 'Una hora menos que el continente', 'Una hora más que el continente', 'Dos horas menos'], a: 1, why: 'El continente usa UTC−5 y Galápagos UTC−6.' },
    { t: 'tf', tag: 'posicion', q: 'Quito se encuentra en el hemisferio norte.', a: false, why: 'Quito está a 0° 11′ S: apenas al sur de la línea ecuatorial.' },
    { t: 'mcq', tag: 'posicion', q: '¿Cuántas provincias tiene el país?', o: ['22', '23', '24', '25'], a: 2, why: 'Son 24 provincias; las dos más recientes (Santa Elena y Santo Domingo de los Tsáchilas) se crearon en 2007.' },
    { t: 'mcq', tag: 'regiones', q: '¿Cuál es la capital de la provincia de Imbabura?', o: ['Otavalo', 'Ibarra', 'Cotacachi', 'Tulcán'], a: 1, why: 'Ibarra, la «ciudad blanca», es la capital de Imbabura.' },
    { t: 'mcq', tag: 'regiones', q: '¿A qué región pertenece Zamora Chinchipe?', o: ['Costa', 'Sierra', 'Amazonía', 'Insular'], a: 2, why: 'Zamora Chinchipe está en la Amazonía sur, frontera con Perú.' },
    { t: 'mcq', tag: 'regiones', q: '¿Cuál es la provincia más poblada?', o: ['Pichincha', 'Guayas', 'Manabí', 'Azuay'], a: 1, why: 'Guayas, con 4,39 millones, es la más poblada; Pichincha es la segunda.' },
    { t: 'mcq', tag: 'regiones', q: '¿Cuál es la provincia de mayor superficie?', o: ['Pastaza', 'Morona Santiago', 'Manabí', 'Orellana'], a: 0, why: 'Pastaza (29 641 km²) es la mayor; la sigue Morona Santiago.' },
    { t: 'mcq', tag: 'regiones', q: '¿Cuál es la provincia más pequeña por superficie?', o: ['Carchi', 'Santa Elena', 'Tungurahua', 'Cañar'], a: 2, why: 'Tungurahua tiene 3 386 km², la menor del país.' },
    { t: 'tf', tag: 'regiones', q: 'La Amazonía tiene más habitantes que la Sierra.', a: false, why: 'La Sierra concentra ≈ 41 % de la población; la Amazonía apenas ≈ 5 %.' },
    { t: 'mcq', tag: 'regiones', q: '¿Cuál es la capital de la provincia de Los Ríos?', o: ['Quevedo', 'Vinces', 'Babahoyo', 'Ventanas'], a: 2, why: 'Babahoyo es la capital; Quevedo es una ciudad más grande, pero no es la capital provincial.' },
    { t: 'mcq', tag: 'relieve', q: '¿Cómo se llaman las cuencas del callejón interandino?', o: ['Hoyas', 'Llanos', 'Mesetas', 'Cañadas'], a: 0, why: 'Las hoyas (Quito, Ambato, Riobamba, Cuenca, Loja…) están separadas por nudos montañosos.' },
    { t: 'mcq', tag: 'relieve', q: '¿Qué volcán es el más alto de los que siguen activos?', o: ['Cotopaxi (5 897 m)', 'Pichincha (4 784 m)', 'Sumaco (3 732 m)', 'Reventador (3 562 m)'], a: 0, why: 'El Cotopaxi supera los 5 800 m y es uno de los volcanes activos más altos del mundo.' },
    { t: 'mcq', tag: 'relieve', q: '¿Qué es el golfo de Guayaquil?', o: ['El mayor estuario del Pacífico sudamericano', 'Un lago interandino', 'Una isla del archipiélago', 'La desembocadura del Esmeraldas'], a: 0, why: 'Es el mayor estuario de la costa pacífica de Sudamérica y recibe al río Guayas.' },
    { t: 'tf', tag: 'relieve', q: 'La cima del Chimborazo es el punto de la superficie terrestre más alejado del centro de la Tierra.', a: true, why: 'Por el abultamiento ecuatorial, supera incluso al Everest en distancia al centro del planeta.' },
    { t: 'mcq', tag: 'relieve', q: 'La cordillera costera de Chongón-Colonche se ubica en…', o: ['Guayas, Santa Elena y Manabí', 'Esmeraldas y Carchi', 'Loja y El Oro', 'Napo y Pastaza'], a: 0, why: 'Chongón-Colonche corre paralela al litoral entre Guayas, Santa Elena y Manabí.' },
    { t: 'mcq', tag: 'agua', q: '¿Qué ciudad queda junto al río Guayas?', o: ['Guayaquil', 'Cuenca', 'Esmeraldas', 'Tena'], a: 0, why: 'Guayaquil se levanta en la margen derecha del Guayas.' },
    { t: 'mcq', tag: 'agua', q: 'El río Pastaza atraviesa la cordillera Real por…', o: ['Agoyán, cerca de Baños', 'Cuenca', 'Quito', 'Loja'], a: 0, why: 'En Agoyán el Pastaza abre un cañón hacia la Amazonía.' },
    { t: 'mcq', tag: 'agua', q: 'El río Esmeraldas se forma por la unión de…', o: ['Guayllabamba y Blanco', 'Napo y Coca', 'Santiago y Zamora', 'Chone y Portoviejo'], a: 0, why: 'El Guayllabamba y el Blanco forman el Esmeraldas, que desemboca en el Pacífico.' },
    { t: 'tf', tag: 'agua', q: 'El río Putumayo forma parte de la frontera con Colombia.', a: true, why: 'El Putumayo y el San Miguel marcan el límite en Sucumbíos.' },
    { t: 'mcq', tag: 'clima', q: 'Aproximadamente, ¿cuánto baja la temperatura al subir 100 m?', o: ['0,1 °C', '0,6 °C', '2 °C', '5 °C'], a: 1, why: 'En los Andes tropicales la temperatura baja cerca de 0,6 °C por cada 100 m.' },
    { t: 'mcq', tag: 'clima', q: 'En la Costa, ¿cuándo cae la mayor parte de la lluvia («invierno»)?', o: ['De diciembre a mayo', 'De junio a noviembre', 'Solo en julio', 'Durante todo el año por igual'], a: 0, why: 'El invierno costeño es la época lluviosa, de diciembre a mayo.' },
    { t: 'tf', tag: 'clima', q: 'En la Amazonía hay una época seca marcada.', a: false, why: 'Llueve casi todo el año, con más de 3 000 mm anuales en buena parte de la región.' },
    { t: 'mcq', tag: 'naturaleza', q: '¿Dónde está el Parque Nacional Yasuní?', o: ['Amazonía (Orellana y Pastaza)', 'Costa (Manabí)', 'Sierra (Azuay)', 'Insular'], a: 0, why: 'El Yasuní está en la Amazonía, entre Orellana y Pastaza; es Reserva de Biosfera desde 1989.' },
    { t: 'mcq', tag: 'naturaleza', q: 'El Parque Nacional Cajas, famoso por sus lagunas, está en…', o: ['Azuay', 'Napo', 'Esmeraldas', 'Carchi'], a: 0, why: 'El Cajas queda en Azuay, al occidente de Cuenca.' },
    { t: 'tf', tag: 'naturaleza', q: 'Las islas más jóvenes de Galápagos están en el oeste del archipiélago.', a: true, why: 'Isabela y Fernandina, al oeste, son las más jóvenes y con mayor actividad volcánica.' },
    // preguntas de mapa
    { t: 'map', tag: 'regiones', q: 'Haz clic en la provincia de Los Ríos.', a: 'los-rios', why: 'Los Ríos es una provincia costera sin litoral, al norte del Guayas.' },
    { t: 'map', tag: 'regiones', q: 'Haz clic en Chimborazo.', a: 'chimborazo', why: 'Chimborazo ocupa la Sierra central y da nombre al volcán más alto del país.' },
    { t: 'map', tag: 'regiones', q: 'Haz clic en Galápagos.', a: 'galapagos', why: 'El archipiélago aparece en un recuadro a escala reducida.' },
    { t: 'map', tag: 'posicion', q: 'Haz clic en la provincia de Carchi, en la frontera con Colombia.', a: 'carchi', why: 'Carchi es la provincia más septentrional de la Sierra.' },
    { t: 'map', tag: 'regiones', q: 'Haz clic en Pastaza, la provincia más extensa.', a: 'pastaza', why: 'Pastaza tiene 29 641 km².' },
    { t: 'map', tag: 'regiones', q: 'Haz clic en Santa Elena, la península más occidental.', a: 'santa-elena', why: 'Santa Elena es una provincia creada en 2007 y de clima semiárido.' },
  ];
})();
