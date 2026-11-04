/* Guías de orientación por ciudad. Texto de referencia: confirme siempre con el mapa de despacho. */
(function () {
  const EC = (window.EC = window.EC || {});
  EC.CITY_GUIDE = {
    quito: {
      resumen: 'Capital del país, a unos 2 850 m. La ciudad se estira de norte a sur (cerca de 50 km) en un valle angosto, con el Pichincha al oeste. El cantón es el Distrito Metropolitano de Quito: incluye parroquias rurales y valles como Cumbayá, Tumbaco, Calderón o Pomasqui, a 30–60 minutos del centro.',
      zonas: [
        ['Norte', 'La Carolina, Iñaquito, Cotocollao, Carcelén, El Condado y Calderón. Más al norte, Pomasqui y San Antonio (Mitad del Mundo).'],
        ['Centro', 'Centro Histórico (Plaza Grande, San Francisco, La Ronda) y La Mariscal, junto a la Av. Amazonas.'],
        ['Sur', 'Villaflora, Solanda, Chillogallo, Quitumbe (terminal terrestre) y Guamaní.'],
        ['Valles del este', 'Cumbayá y Tumbaco por la Interoceánica y la Ruta Viva; más allá, Pifo y el aeropuerto, en Tababela.'],
        ['Valle de los Chillos', 'Conocoto y Amaguaña (Quito) y Sangolquí, que es otro cantón (Rumiñahui) con su propio municipio.'],
      ],
      vias: [
        'Av. Simón Bolívar: circunvalación oriental que une el norte con el sur y los valles.',
        'Av. Mariscal Sucre (Occidental): bordea la ciudad por el oeste, al pie del Pichincha.',
        'Av. 10 de Agosto, 6 de Diciembre, Amazonas y De los Shyris: ejes norte–sur del centro y norte.',
        'Av. Pedro Vicente Maldonado: eje del sur, hacia la Panamericana Sur.',
        'Av. Interoceánica y Ruta Viva: hacia Cumbayá, Tumbaco y el aeropuerto.',
        'Autopista General Rumiñahui: Quito–Sangolquí.',
        'Panamericana (E35): al norte hacia Cayambe e Ibarra; al sur hacia Machachi y Latacunga.',
      ],
      direccion: {
        formato: 'Av. Amazonas N24-155 y Colón',
        lectura: 'La letra (N, S, E u Oe) indica el sector: norte, sur, este u oeste. El primer número corresponde a la calle transversal más cercana y el segundo es el número del predio. Después de «y» va la calle que cruza.',
      },
      consejos: [
        'Preguntar si es norte, centro o sur: un mismo nombre de calle puede repetirse en varios sectores.',
        '«Quito» incluye los valles. Pedir la parroquia o el valle (Cumbayá, Tumbaco, Calderón, Pomasqui…) antes de estimar tiempos.',
        'Hay restricción vehicular por último dígito de placa en ciertos horarios y zonas; las reglas cambian, así que conviene consultar la vigente.',
        'Referencias de apoyo: Parque La Carolina, Quicentro Shopping, Estadio Olímpico Atahualpa y Terminal Terrestre Quitumbe.',
      ],
    },
    guayaquil: {
      resumen: 'La ciudad más poblada del país, a nivel del mar, entre el río Guayas y el estero Salado. Es muy plana, con pocas colinas al norte. Forma con Durán y Samborondón una sola mancha urbana, pero son tres cantones con municipios distintos.',
      zonas: [
        ['Norte', 'Urdesa, Kennedy, Alborada, Garzota, Samanes, Sauces y Mapasingue.'],
        ['Centro', 'Malecón 2000, el centro comercial y administrativo, Las Peñas y el cerro Santa Ana.'],
        ['Sur', 'Guasmo, Barrio Cuba y Cristo del Consuelo.'],
        ['Oeste', 'Vía a la Costa: Los Ceibos y urbanizaciones que se ubican por kilómetro.'],
        ['Noroeste', 'Vía a Daule y Pascuales.'],
        ['Samborondón y Durán', 'Al otro lado del río Daule (Samborondón) y del Guayas (Durán). No son Guayaquil.'],
      ],
      vias: [
        'Av. 9 de Octubre: principal eje este–oeste del centro.',
        'Av. Francisco de Orellana y Av. Juan Tanca Marengo: ejes del norte.',
        'Av. de las Américas: acceso al aeropuerto y a la Terminal Terrestre.',
        'Av. Carlos Julio Arosemena: hacia Urdesa y la Vía a la Costa.',
        'Vía a la Costa: hacia Playas y Salinas.',
        'Vía a Daule y Vía a Samborondón: salidas al norte.',
        'Vía Perimetral: cinturón que rodea la ciudad.',
        'Puente de la Unidad Nacional: cruce hacia Durán.',
      ],
      direccion: {
        formato: 'Cdla. Alborada, Mz 15, Villa 4',
        lectura: 'No hay un sistema único. En el centro se usan esquinas («9 de Octubre y Boyacá»). En urbanizaciones se dice ciudadela (Cdla.), manzana (Mz) y solar o villa. En el sur abundan calles por número y letra («la 17 y la F»).',
      },
      consejos: [
        'Confirmar si la persona está en Guayaquil, Durán o Samborondón: son cantones distintos y cruzar los puentes suma tiempo.',
        'En Vía a la Costa, Vía a Daule y Vía a Samborondón, pedir el kilómetro y el sentido de circulación.',
        'Muchas ciudadelas tienen varias etapas (por ejemplo Alborada, Urdenor). Pedir la etapa, la manzana y el solar.',
        'Referencias de apoyo: Terminal Terrestre, Aeropuerto José Joaquín de Olmedo, Malecón 2000, Mall del Sol y Estadio Monumental.',
      ],
    },
    cuenca: {
      resumen: 'Tercera ciudad del país, a unos 2 560 m, en la hoya del Paute. La cruzan cuatro ríos: Tomebamba, Yanuncay, Tarqui y Machángara. Su centro histórico es Patrimonio Cultural de la Humanidad desde 1999. El cantón incluye muchas parroquias rurales a 15–40 minutos del centro.',
      zonas: [
        ['Centro Histórico', 'Parque Calderón, la Catedral Nueva y la zona entre el río Tomebamba y la Av. Gran Colombia.'],
        ['Oeste y suroeste', 'El Ejido, Yanuncay, Turi y Baños (termas).'],
        ['Norte', 'Ricaurte, Sinincay y la vía hacia Azogues.'],
        ['Este', 'Challuabamba, Paccha y el valle hacia Gualaceo.'],
        ['Parroquias rurales', 'Baños, Turi, Sayausí, Ricaurte, Paccha, Llacao, Nulti, Sidcay, Sinincay, Tarqui, Valle, Checa, Chiquintad, Cumbe, Molleturo y otras.'],
      ],
      vias: [
        'Av. de las Américas: circunvalación del oeste y norte.',
        'Av. España: acceso a la Terminal Terrestre y al aeropuerto.',
        'Av. 12 de Abril: sigue el río Tomebamba al borde del centro.',
        'Av. Remigio Crespo Toral: una de las avenidas comerciales principales.',
        'Av. Loja: hacia el suroeste y la vía a Loja.',
        'Autopista Cuenca–Azogues (E35): al norte.',
        'Vía Cuenca–Molleturo: hacia el Parque Nacional Cajas; con niebla frecuente.',
      ],
      direccion: {
        formato: 'Av. Remigio Crespo 1-67 y Federico Proaño',
        lectura: 'Formato frecuente: calle principal, numeración del predio (cuadra-casa) y la transversal después de «y». Confirmar siempre el sector o la parroquia.',
      },
      consejos: [
        'Distinguir parroquias urbanas de rurales: una dirección en Sayausí, Baños o Molleturo puede estar muy lejos del centro.',
        'Cuenca es compacta, pero el tráfico se concentra en el centro y en las avenidas de las Américas y Loja.',
        'Referencias de apoyo: Parque Calderón, Terminal Terrestre, Mall del Río, Estadio Alejandro Serrano Aguilar y Hospital Vicente Corral Moscoso.',
      ],
    },
  };
})();
