// Approximate coordinates for Peruvian cities and districts
const cityCoords = {
  'Lima':                    [-12.0464, -77.0428],
  'Lima Centro':             [-12.0464, -77.0428],
  'Miraflores':              [-12.1198, -77.0302],
  'San Isidro':              [-12.0983, -77.0365],
  'San Miguel':              [-12.0769, -77.0840],
  'La Victoria':             [-12.0611, -77.0189],
  'Rímac':                   [-12.0267, -77.0311],
  'Rimac':                   [-12.0267, -77.0311],
  'San Juan de Lurigancho':  [-11.9849, -77.0006],
  'Surco':                   [-12.1473, -76.9955],
  'Santiago de Surco':       [-12.1473, -76.9955],
  'San Borja':               [-12.1008, -76.9996],
  'Jesús María':             [-12.0722, -77.0504],
  'Jesus Maria':             [-12.0722, -77.0504],
  'Lince':                   [-12.0826, -77.0368],
  'Barranco':                [-12.1498, -77.0215],
  'Chorrillos':              [-12.1675, -77.0198],
  'Pueblo Libre':            [-12.0744, -77.0646],
  'Magdalena':               [-12.0895, -77.0729],
  'Callao':                  [-12.0560, -77.1354],
  'Arequipa':                [-16.4090, -71.5375],
  'Arequipa Centro':         [-16.4090, -71.5375],
  'Trujillo':                [-8.1121,  -79.0282],
  'Chiclayo':                [-6.7715,  -79.8408],
  'Iquitos':                 [-3.7489,  -73.2532],
  'Cusco':                   [-13.5319, -71.9675],
  'Piura':                   [-5.1944,  -80.6329],
  'Huancayo':                [-12.0655, -75.2048],
  'Tacna':                   [-18.0063, -70.2486],
  'Cajamarca':               [-7.1636,  -78.5028],
  'Puno':                    [-15.8402, -70.0219],
  'Ayacucho':                [-13.1588, -74.2237],
  'Huánuco':                 [-9.9306,  -76.2422],
  'Huanuco':                 [-9.9306,  -76.2422],
  'Pucallpa':                [-8.3917,  -74.5547],
  'Puerto Maldonado':        [-12.6000, -69.1833],
  'Ica':                     [-14.0679, -75.7286],
  'Ica Centro':              [-14.0679, -75.7286],
  'Nazca':                   [-14.8327, -74.9364],
  'Juliaca':                 [-15.4997, -70.1322],
  'Tingo María':             [-9.2950,  -75.9963],
  'Tingo Maria':             [-9.2950,  -75.9963],
  'Moquegua':                [-17.1943, -70.9351],
  'Tumbes':                  [-3.5669,  -80.4515],
  'Máncora':                 [-4.1038,  -81.0414],
  'Mancora':                 [-4.1038,  -81.0414],
  'Chimbote':                [-9.0746,  -78.5936],
  'Huaraz':                  [-9.5270,  -77.5272],
  'Tarapoto':                [-6.4850,  -76.3604],
  'Moyobamba':               [-6.0345,  -76.9737],
  'La Merced':               [-11.0530, -75.3275],
  'Abancay':                 [-13.6357, -72.8832],
};

/**
 * Given any text (address, city name, etc.), return [lat, lng] if a known
 * Peruvian city/district name is found inside it. Returns null otherwise.
 */
export const getCityCoords = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [city, coords] of Object.entries(cityCoords)) {
    if (lower.includes(city.toLowerCase())) return coords;
  }
  return null;
};

export default cityCoords;
