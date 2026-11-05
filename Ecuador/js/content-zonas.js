/* Zonas de las ciudades principales (sección 3). Texto de referencia: confirme siempre con el mapa de despacho.
   `sectores`: ejemplos de cada zona que se ubican en el mapa (nombres de js/guia-data.js). */
(function () {
  const EC = (window.EC = window.EC || {});
  EC.ZONAS = {
    quito: {
      resumen: 'Capital del país, a unos 2 850 m. Se estira de norte a sur unos 50 km en un valle angosto, con el Pichincha al oeste. El cantón incluye los valles (Cumbayá, Tumbaco, Calderón, Pomasqui), a 30–60 minutos del centro.',
      zonas: [
        { name: 'Norte', desc: 'La Carolina, Iñaquito, Cotocollao, Carcelén, El Condado y Calderón. Más al norte, Pomasqui y San Antonio (Mitad del Mundo).', sectores: ['La Carolina', 'Iñaquito', 'Cotocollao', 'Carcelén', 'El Condado', 'Calderón', 'Pomasqui'] },
        { name: 'Centro', desc: 'Centro Histórico (Plaza Grande, San Francisco, La Ronda) y La Mariscal, junto a la Av. Amazonas.', sectores: ['Centro Histórico', 'La Mariscal', 'La Floresta', 'Itchimbía'] },
        { name: 'Sur', desc: 'Villaflora, Solanda, Chillogallo, Quitumbe (terminal terrestre) y Guamaní.', sectores: ['Villaflora', 'Solanda', 'Chillogallo', 'Quitumbe', 'Guamaní'] },
        { name: 'Valles del este', desc: 'Cumbayá y Tumbaco por la Interoceánica y la Ruta Viva; más allá, Pifo y el aeropuerto, en Tababela.', sectores: ['Cumbayá', 'Tumbaco', 'Puembo'] },
        { name: 'Valle de los Chillos', desc: 'Conocoto y Amaguaña (Quito). Sangolquí es otro cantón (Rumiñahui), con su propio municipio.', sectores: ['Conocoto'] },
      ],
    },
    guayaquil: {
      resumen: 'La ciudad más poblada del país, a nivel del mar, entre el río Guayas y el estero Salado. Es muy plana. Forma con Durán y Samborondón una sola mancha urbana, pero son tres cantones distintos.',
      zonas: [
        { name: 'Norte', desc: 'Urdesa, Kennedy, Alborada, Garzota, Samanes, Sauces y Mapasingue.', sectores: ['Urdesa Central', 'Kennedy Norte', 'Alborada', 'Garzota', 'Samanes', 'Sauces', 'Mapasingue'] },
        { name: 'Centro', desc: 'Malecón 2000, el centro comercial y administrativo, Las Peñas y el cerro Santa Ana.', sectores: ['Centro', 'Las Peñas'] },
        { name: 'Sur', desc: 'Guasmo, Barrio Cuba y Cristo del Consuelo.', sectores: ['Guasmo', 'Barrio Cuba', 'Cristo del Consuelo', 'Isla Trinitaria'] },
        { name: 'Oeste', desc: 'Vía a la Costa: Los Ceibos y urbanizaciones que se ubican por kilómetro.', sectores: ['Los Ceibos'] },
        { name: 'Noroeste', desc: 'Vía a Daule: Pascuales y Prosperina.', sectores: ['Pascuales', 'Prosperina'] },
        { name: 'Samborondón y Durán', desc: 'Al otro lado del río Daule (Samborondón) y del Guayas (Durán). No son Guayaquil.', sectores: [] },
      ],
    },
    cuenca: {
      resumen: 'Tercera ciudad del país, a unos 2 560 m, en la hoya del Paute. La cruzan cuatro ríos: Tomebamba, Yanuncay, Tarqui y Machángara. El cantón incluye parroquias rurales a 15–40 minutos del centro.',
      zonas: [
        { name: 'Centro Histórico', desc: 'Parque Calderón, la Catedral Nueva y la zona entre el río Tomebamba y la Av. Gran Colombia.', sectores: ['Centro Histórico'] },
        { name: 'Oeste y suroeste', desc: 'El Ejido, Yanuncay, Turi y Baños (termas).', sectores: ['Medio Ejido', 'Yanuncay', 'Turi', 'Baños'] },
        { name: 'Norte', desc: 'Ricaurte, Sinincay y la vía hacia Azogues.', sectores: ['Ricaurte'] },
        { name: 'Este', desc: 'Monay, Totoracocha, Challuabamba, Paccha y el valle hacia Gualaceo.', sectores: ['Monay', 'Totoracocha'] },
        { name: 'Parroquias rurales', desc: 'Sayausí, San Joaquín, Ricaurte, Paccha, Llacao, Nulti, Sidcay, Sinincay, Tarqui, Valle, Checa, Chiquintad, Cumbe y Molleturo.', sectores: ['Sayausí', 'San Joaquín'] },
      ],
    },
  };
})();
