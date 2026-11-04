/* Contenido: regiones y provincias.
   Cifras de superficie, población (Censo 2022, INEC), densidad y cantones: tabla de provincias de Ecuador
   (Wikipedia, a partir de INEC). Cantones vigentes: 223 en total (Esmeraldas 8 y Morona Santiago 13).
   Alturas de las capitales: valores aproximados. */
(function () {
  const EC = (window.EC = window.EC || {});

  EC.REGIONS = {
    costa: { id: 'costa', name: 'Costa', alt: 'Litoral', color: 'var(--costa)', blurb: 'Llanuras aluviales, cordilleras bajas y el Pacífico.' },
    sierra: { id: 'sierra', name: 'Sierra', alt: 'Región interandina', color: 'var(--sierra)', blurb: 'Dos cordilleras, un callejón de volcanes y páramos.' },
    amazonia: { id: 'amazonia', name: 'Amazonía', alt: 'Oriente', color: 'var(--amazonia)', blurb: 'Selva húmeda, ríos caudalosos y baja densidad humana.' },
    insular: { id: 'insular', name: 'Insular', alt: 'Galápagos', color: 'var(--insular)', blurb: 'Un archipiélago volcánico a 1 000 km del continente.' },
  };

  // [id, región, capital, altitud capital (m), superficie km², población 2022, densidad, cantones, etiqueta en líneas]
  const T = [
    ['azuay', 'sierra', 'Cuenca', 2560, 8310, 801609, 96.47, 15, ['Azuay']],
    ['bolivar', 'sierra', 'Guaranda', 2668, 3945, 199078, 50.46, 7, ['Bolívar']],
    ['canar', 'sierra', 'Azogues', 2518, 3231, 227578, 70.41, 7, ['Cañar']],
    ['carchi', 'sierra', 'Tulcán', 2980, 3780, 172828, 45.71, 6, ['Carchi']],
    ['chimborazo', 'sierra', 'Riobamba', 2754, 6500, 471933, 72.61, 10, ['Chimborazo']],
    ['cotopaxi', 'sierra', 'Latacunga', 2750, 6108, 470210, 76.98, 7, ['Cotopaxi']],
    ['el-oro', 'costa', 'Machala', 6, 5767, 714592, 123.92, 14, ['El Oro']],
    ['esmeraldas', 'costa', 'Esmeraldas', 6, 15809, 553900, 35.04, 8, ['Esmeraldas']],
    ['galapagos', 'insular', 'Puerto Baquerizo Moreno', 6, 8010, 28583, 3.57, 3, ['Galápagos']],
    ['guayas', 'costa', 'Guayaquil', 4, 15515, 4391923, 283.07, 25, ['Guayas']],
    ['imbabura', 'sierra', 'Ibarra', 2225, 4712, 469879, 99.71, 6, ['Imbabura']],
    ['loja', 'sierra', 'Loja', 2060, 11063, 485421, 43.88, 16, ['Loja']],
    ['los-rios', 'costa', 'Babahoyo', 8, 7205, 898652, 124.72, 13, ['Los Ríos']],
    ['manabi', 'costa', 'Portoviejo', 53, 19516, 1592840, 81.99, 22, ['Manabí']],
    ['morona-santiago', 'amazonia', 'Macas', 1020, 25690, 192508, 8.0, 13, ['Morona', 'Santiago']],
    ['napo', 'amazonia', 'Tena', 510, 12543, 131672, 10.5, 5, ['Napo']],
    ['orellana', 'amazonia', 'Francisco de Orellana (Coca)', 250, 21692, 182166, 8.4, 4, ['Orellana']],
    ['pastaza', 'amazonia', 'Puyo', 960, 29641, 111915, 3.78, 4, ['Pastaza']],
    ['pichincha', 'sierra', 'Quito', 2850, 9536, 3089473, 323.98, 8, ['Pichincha']],
    ['santa-elena', 'costa', 'Santa Elena', 6, 3690, 385735, 104.53, 3, ['Santa', 'Elena']],
    ['santo-domingo', 'costa', 'Santo Domingo', 655, 3770, 492969, 130.76, 2, ['Santo', 'Domingo']],
    ['sucumbios', 'amazonia', 'Nueva Loja (Lago Agrio)', 297, 18084, 199014, 11.0, 7, ['Sucumbíos']],
    ['tungurahua', 'sierra', 'Ambato', 2577, 3386, 563532, 166.42, 9, ['Tungurahua']],
    ['zamora-chinchipe', 'amazonia', 'Zamora', 970, 10584, 110973, 10.48, 9, ['Zamora', 'Chinchipe']],
  ];

  // Texto de cada provincia: resumen geográfico y tres claves para recordar.
  const TXT = {
    azuay: {
      resumen: 'Provincia del austro andino. Cuenca ocupa una hoya cruzada por cuatro ríos (Tomebamba, Yanuncay, Tarqui y Machángara) que alimentan el Paute, tributario de la vertiente amazónica. Al occidente se levanta el páramo del Parque Nacional Cajas, con más de 200 lagunas, y las tierras bajan hacia la llanura costera.',
      claves: ['Hoya de Cuenca (≈ 2 560 m)', 'Parque Nacional Cajas, páramo de lagunas', 'Aguas que van al Paute → Santiago → Amazonas'],
    },
    bolivar: {
      resumen: 'Una de las provincias más pequeñas de la Sierra, en la ladera occidental de los Andes. Guaranda, la «ciudad de las siete colinas», se asienta entre lomas; hacia el oeste el terreno desciende a zonas subtropicales cercanas a Los Ríos. Sus aguas, como las del Chimbo, alimentan el sistema del Guayas.',
      claves: ['Guaranda (≈ 2 670 m) entre colinas', 'Ladera occidental: de páramo a subtropical', 'Río Chimbo → cuenca del Guayas'],
    },
    canar: {
      resumen: 'Provincia del austro, entre Chimborazo y Azuay. Azogues se ubica en la hoya del Cañar; hacia el occidente el relieve desciende hasta La Troncal, en la llanura costera, zona de caña de azúcar. Aquí está Ingapirca, el complejo arqueológico cañari-inca más importante del país.',
      claves: ['Azogues (≈ 2 520 m)', 'Baja hasta la llanura costera (La Troncal)', 'Ingapirca, sitio arqueológico'],
    },
    carchi: {
      resumen: 'La provincia más septentrional de la Sierra: limita con Colombia. Tulcán, a casi 3 000 m, es una de las ciudades más altas del país. Combina páramos (El Ángel, con frailejones), el volcán Chiles en la frontera y el cálido y seco valle del Chota, que comparte con Imbabura.',
      claves: ['Frontera con Colombia', 'Tulcán (≈ 2 980 m), una de las ciudades más altas', 'Páramo de El Ángel y valle del Chota'],
    },
    chimborazo: {
      resumen: 'Sierra central. Riobamba se levanta en la hoya del Chambo, bajo el Chimborazo (6 263 m), la cumbre más alta del Ecuador, y cerca de El Altar (5 319 m). Hacia el occidente las laderas bajan a zonas subtropicales; Alausí, con la «Nariz del Diablo», muestra cuánto cambia el relieve en pocos kilómetros.',
      claves: ['Chimborazo, 6 263 m: punto más alto del país', 'Riobamba (≈ 2 750 m), hoya del Chambo', 'El Altar y el Parque Nacional Sangay'],
    },
    cotopaxi: {
      resumen: 'Sierra central, a los pies del Cotopaxi (5 897 m), uno de los volcanes activos más altos del mundo. Latacunga ocupa la hoya del mismo nombre; la caldera del Quilotoa guarda una laguna a 3 914 m. Hacia el occidente, el piedemonte subtropical (La Maná, Pangua) cambia por completo el paisaje y los cultivos.',
      claves: ['Volcán Cotopaxi, 5 897 m, activo', 'Laguna del Quilotoa, caldera volcánica', 'Latacunga (≈ 2 750 m); piedemonte occidental'],
    },
    'el-oro': {
      resumen: 'Costa sur, frontera con Perú. Machala, a nivel del mar, es conocida como la capital bananera del mundo. La provincia une llanura costera, manglares del archipiélago de Jambelí y estribaciones andinas donde están Zaruma y Portovelo, ciudades mineras que dan nombre a la provincia.',
      claves: ['Frontera con Perú y salida al Pacífico', 'Banano en la llanura; manglares en Jambelí', 'Minería de oro en Zaruma–Portovelo'],
    },
    esmeraldas: {
      resumen: 'Costa norte, frontera con Colombia. Es la parte más húmeda del litoral: selva lluviosa del Chocó biogeográfico, manglares altos en Cayapas-Mataje y grandes ríos como el Esmeraldas, formado por el Guayllabamba y el Blanco. Su capital es puerto y sede de la principal refinería del país.',
      claves: ['Frontera con Colombia y litoral pacífico', 'Selva húmeda del Chocó; Reserva Cotacachi-Cayapas', 'Río Esmeraldas = Guayllabamba + Blanco'],
    },
    galapagos: {
      resumen: 'Archipiélago volcánico a unos 1 000 km de la costa. Tiene 13 islas grandes, 6 menores y más de cien islotes. Las islas occidentales (Isabela, Fernandina) son las más jóvenes y activas. Parque Nacional desde 1959 y Patrimonio Natural de la Humanidad desde 1978; la capital está en San Cristóbal.',
      claves: ['Origen volcánico (punto caliente, Placa de Nazca)', 'Isabela: la isla mayor; Fernandina y Wolf, volcanes activos', 'Patrimonio Natural de la Humanidad (1978)'],
    },
    guayas: {
      resumen: 'La provincia más poblada del país. Guayaquil, su capital, es la mayor ciudad y el principal puerto marítimo. Se extiende por la llanura aluvial del río Guayas y por el golfo de Guayaquil, el mayor estuario de la costa pacífica sudamericana, con la isla Puná. Predominan arroz, banano, cacao y caña de azúcar.',
      claves: ['Cuenca y río Guayas (Daule + Babahoyo)', 'Golfo de Guayaquil e isla Puná', 'Provincia más poblada: 4,39 millones'],
    },
    imbabura: {
      resumen: 'Sierra norte, la «provincia de los lagos»: Yahuarcocha, San Pablo y la laguna de Cuicocha, en el cráter del volcán Cotacachi (4 944 m). Domina el paisaje el Imbabura (4 609 m). Ibarra, la «ciudad blanca», está a ≈ 2 225 m; al occidente el terreno baja a la zona subtropical de Intag.',
      claves: ['Lagos: Yahuarcocha, San Pablo, Cuicocha', 'Volcanes Imbabura y Cotacachi', 'Valle cálido del Chota (con Carchi)'],
    },
    loja: {
      resumen: 'Extremo sur de la Sierra, frontera con Perú. Aquí los Andes pierden altura: no hay volcanes, sino cordilleras bajas y valles templados (Catamayo, Vilcabamba). Loja está en una hoya a ≈ 2 060 m; hacia el suroccidente aparece el bosque seco de Macará y Zapotillo, y hacia el oriente el Parque Nacional Podocarpus.',
      claves: ['Andes bajos y fragmentados, sin volcanes', 'Valles templados y bosque seco en el suroeste', 'Podocarpus, parque compartido con Zamora Chinchipe'],
    },
    'los-rios': {
      resumen: 'Costa interior, sin salida directa al mar. Es una llanura inundable atravesada por los ríos Babahoyo, Vinces y Quevedo, afluentes del sistema del Guayas. En invierno gran parte del terreno se anega, lo que explica su vocación agrícola: arroz, banano, cacao, maíz y palma.',
      claves: ['Única provincia costera sin litoral', 'Ríos Babahoyo, Vinces y Quevedo', 'Llanura inundable y muy fértil'],
    },
    manabi: {
      resumen: 'La mayor provincia de la Costa por superficie. Su litoral es largo y variado: acantilados, playas y los puertos de Manta y Bahía. El clima pasa de seco (Portoviejo, Manta, bosque seco) en el centro y sur a más húmedo al norte. Incluye el Parque Nacional Machalilla y fue la más afectada por el terremoto de 2016.',
      claves: ['Mayor provincia de la Costa: 19 516 km²', 'Parque Nacional Machalilla e isla de la Plata', 'La línea ecuatorial cruza el norte (Pedernales)'],
    },
    'morona-santiago': {
      resumen: 'Amazonía sur y segunda provincia más extensa del país. Une la cordillera Real con la selva baja a través de la cordillera subandina de Cutucú y el valle del Upano, donde está Macas. Allí nace el río Santiago y se alza el volcán Sangay (5 230 m). Es territorio ancestral shuar y achuar.',
      claves: ['Valle del Upano; cordillera de Cutucú', 'Volcán Sangay (5 230 m), muy activo', 'Frontera con Perú'],
    },
    napo: {
      resumen: 'Amazonía norte-centro, en el escalón donde los Andes bajan a la selva. Tena está a ≈ 510 m. Tiene ríos de aguas rápidas (Jatunyacu, Misahuallí) que forman el Napo, el volcán Sumaco (3 732 m), aislado en la selva, y parte del Antisana (5 704 m) y de la Reserva Cayambe-Coca.',
      claves: ['Alta cuenca del río Napo', 'Volcán Sumaco, aislado de los Andes', 'Selva de piedemonte (≈ 500 m)'],
    },
    orellana: {
      resumen: 'Amazonía norte, llanura baja (≈ 250 m) junto al río Napo. Francisco de Orellana (Coca) es el centro urbano. Contiene buena parte del Parque Nacional Yasuní, Reserva de Biosfera desde 1989 y hogar waorani, y es, junto con Sucumbíos, el corazón petrolero del país. Limita con Perú al este.',
      claves: ['Llanura amazónica baja', 'Parque Nacional Yasuní', 'Ríos Napo, Coca, Tiputini'],
    },
    pastaza: {
      resumen: 'La provincia más extensa del Ecuador y una de las menos densas (3,8 hab/km²). Puyo es la puerta de entrada; los ríos Pastaza, Bobonaza y Curaray la cruzan hacia el Amazonas. Es territorio de los pueblos kichwa, shuar, achuar, sápara y waorani, con selva casi continua y comunicaciones fluviales o aéreas.',
      claves: ['Mayor provincia: 29 641 km²', 'Ríos Pastaza, Bobonaza y Curaray', 'Selva baja con pocas vías terrestres'],
    },
    pichincha: {
      resumen: 'Sierra norte. Quito, la capital, está a ≈ 2 850 m en la hoya de Guayllabamba, al pie del Guagua Pichincha. La línea equinoccial cruza la provincia; el Cayambe (5 790 m) es el único punto de la línea ecuatorial con nieve permanente. Al noroccidente el terreno baja a selvas húmedas (Chocó andino) y al oriente a la Amazonía.',
      claves: ['Quito: capital y segunda ciudad del país', 'Cruzada por la línea ecuatorial (Mitad del Mundo)', 'Del nevado Cayambe a las selvas del noroccidente'],
    },
    'santa-elena': {
      resumen: 'La península más occidental del continente ecuatoriano. Creada en 2007, tiene clima semiárido, bosque seco y playas (Salinas, Montañita). Las aguas frías de la corriente de Humboldt explican su baja pluviosidad. Entre junio y septiembre se avistan ballenas jorobadas frente a sus costas.',
      claves: ['Península semiárida y de bosque seco', 'Influencia de la corriente fría de Humboldt', 'Provincia creada en 2007'],
    },
    'santo-domingo': {
      resumen: 'Creada en 2007, ocupa la ladera occidental de los Andes, a ≈ 655 m, donde la Sierra se encuentra con la Costa: por eso es un gran nudo vial. El clima es cálido y muy lluvioso. Es el territorio del pueblo tsáchila; sus cultivos principales son palma africana, banano, cacao y abacá.',
      claves: ['Transición Sierra–Costa (≈ 655 m)', 'Clima cálido y muy lluvioso', 'Territorio del pueblo tsáchila'],
    },
    sucumbios: {
      resumen: 'Amazonía norte, con frontera hacia Colombia (ríos San Miguel y Putumayo) y Perú. Nueva Loja (Lago Agrio) nació del boom petrolero tras el hallazgo de 1967. Alberga la Reserva de Producción de Fauna Cuyabeno, un sistema de lagunas y bosque inundable, y parte de la Reserva Cayambe-Coca.',
      claves: ['Frontera con Colombia y con Perú', 'Reserva Cuyabeno: lagunas y bosque inundable', 'Núcleo petrolero (Lago Agrio, 1967)'],
    },
    tungurahua: {
      resumen: 'La provincia de menor superficie del país (3 386 km²), pero con un relieve muy contrastado: del páramo y el volcán Tungurahua (5 023 m) a las selvas de Baños, donde el Pastaza abre un cañón hacia la Amazonía. Ambato, en la hoya del mismo nombre, es centro de fruta, cuero y textiles.',
      claves: ['La más pequeña del país: 3 386 km²', 'Volcán Tungurahua y cañón del Pastaza', 'Ambato (≈ 2 580 m)'],
    },
    'zamora-chinchipe': {
      resumen: 'Amazonía sur, frontera con Perú. Zamora (≈ 970 m) se sitúa en la unión de los ríos Zamora y Bombuscaro. Sus montañas húmedas —cordillera del Cóndor y Podocarpus— son un foco de biodiversidad, y hoy albergan los grandes proyectos mineros de Fruta del Norte (oro) y Mirador (cobre).',
      claves: ['Cordillera del Cóndor y Podocarpus', 'Río Zamora → Santiago → Amazonas', 'Frontera con Perú'],
    },
  };

  EC.PROVS = {};
  const names = {};
  (window.EC_GEO.provinces || []).forEach((p) => (names[p.id] = p));
  for (const r of T) {
    const [id, region, capital, alt, area, pop, dens, cantones, lines] = r;
    const g = names[id];
    EC.PROVS[id] = Object.assign({ id, region, capital, capitalAlt: alt, area, pop, dens, cantones, lines, name: g.name }, TXT[id]);
  }
  EC.PROV_IDS = Object.keys(EC.PROVS).sort((a, b) => EC.PROVS[a].name.localeCompare(EC.PROVS[b].name, 'es'));

  // Totales por región (derivados de la tabla)
  EC.STATS = { total: { area: 0, pop: 0, n: 0, cantones: 0 } };
  for (const k of Object.keys(EC.REGIONS)) EC.STATS[k] = { area: 0, pop: 0, n: 0, cantones: 0, ids: [] };
  for (const id of EC.PROV_IDS) {
    const p = EC.PROVS[id];
    for (const s of [EC.STATS[p.region], EC.STATS.total]) { s.area += p.area; s.pop += p.pop; s.n++; s.cantones += p.cantones; }
    EC.STATS[p.region].ids.push(id);
  }
  for (const k of Object.keys(EC.REGIONS)) {
    EC.STATS[k].areaPct = (EC.STATS[k].area / EC.STATS.total.area) * 100;
    EC.STATS[k].popPct = (EC.STATS[k].pop / EC.STATS.total.pop) * 100;
  }

  // Conjuntos derivados de la geometría
  const G = window.EC_GEO;
  EC.SETS = {
    equator: G.provinces.filter((p) => p.latRange[0] < 0 && p.latRange[1] > 0 && !p.inset).map((p) => p.id),
    colombia: Object.keys(G.borders).filter((k) => G.borders[k].includes('colombia')),
    peru: Object.keys(G.borders).filter((k) => G.borders[k].includes('peru')),
    coast: ['esmeraldas', 'manabi', 'santa-elena', 'guayas', 'el-oro'],
  };
})();
