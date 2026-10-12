import { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

// public/ klasöründeki 81 il GeoJSON'u (her ilin id'si = plaka kodu)
const TURKEY_GEO = '/tr-cities.json'

// GeoJSON'daki id'ler plaka kodu DEĞİL, alfabetik sıra numarası.
// Bu yüzden plaka kodunu il adından buluyoruz.
const PLATES = {
  'Adana': 1, 'Adıyaman': 2, 'Afyon': 3, 'Ağrı': 4, 'Amasya': 5, 'Ankara': 6,
  'Antalya': 7, 'Artvin': 8, 'Aydın': 9, 'Balıkesir': 10, 'Bilecik': 11, 'Bingöl': 12,
  'Bitlis': 13, 'Bolu': 14, 'Burdur': 15, 'Bursa': 16, 'Çanakkale': 17, 'Çankırı': 18,
  'Çorum': 19, 'Denizli': 20, 'Diyarbakır': 21, 'Edirne': 22, 'Elazığ': 23, 'Erzincan': 24,
  'Erzurum': 25, 'Eskişehir': 26, 'Gaziantep': 27, 'Giresun': 28, 'Gümüşhane': 29, 'Hakkari': 30,
  'Hatay': 31, 'Isparta': 32, 'Mersin': 33, 'İstanbul': 34, 'İzmir': 35, 'Kars': 36,
  'Kastamonu': 37, 'Kayseri': 38, 'Kırklareli': 39, 'Kırşehir': 40, 'Kocaeli': 41, 'Konya': 42,
  'Kütahya': 43, 'Malatya': 44, 'Manisa': 45, 'Kahramanmaraş': 46, 'Mardin': 47, 'Muğla': 48,
  'Muş': 49, 'Nevşehir': 50, 'Niğde': 51, 'Ordu': 52, 'Rize': 53, 'Sakarya': 54,
  'Samsun': 55, 'Siirt': 56, 'Sinop': 57, 'Sivas': 58, 'Tekirdağ': 59, 'Tokat': 60,
  'Trabzon': 61, 'Tunceli': 62, 'Şanlıurfa': 63, 'Uşak': 64, 'Van': 65, 'Yozgat': 66,
  'Zonguldak': 67, 'Aksaray': 68, 'Bayburt': 69, 'Karaman': 70, 'Kırıkkale': 71, 'Batman': 72,
  'Şırnak': 73, 'Bartın': 74, 'Ardahan': 75, 'Iğdır': 76, 'Yalova': 77, 'Karabük': 78,
  'Kilis': 79, 'Osmaniye': 80, 'Düzce': 81,
}

export default function TurkeyMap({ visited, onCityClick }) {
  const [hovered, setHovered] = useState('')

  return (
    <div className="map-wrap">
      <div className="hover-label">{hovered || 'İl adını görmek için üzerine gel'}</div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [35.5, 39], scale: 2300 }}
        width={800}
        height={380}
      >
        <Geographies geography={TURKEY_GEO}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const plateCode = PLATES[geo.properties.name]
              const isVisited = visited.has(plateCode)

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => onCityClick(plateCode)}
                  onMouseEnter={() => setHovered(`${geo.properties.name} (${plateCode})`)}
                  onMouseLeave={() => setHovered('')}
                  className={isVisited ? 'region visited-city' : 'region'}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  )
}
