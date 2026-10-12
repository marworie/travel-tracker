import { useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { geoAlbersUsa, geoMercator } from 'd3-geo'

const WIDTH = 800
const HEIGHT = 450

export default function RegionMap({ iso, geo, visited, onRegionClick }) {
  const [hovered, setHovered] = useState('')

  // Harita kutuya tam otursun diye projeksiyonu ülkenin sınırlarına göre hesaplıyoruz.
  // ABD için Alaska ve Hawaii'yi köşeye alan özel projeksiyon kullanıyoruz.
  const projection = useMemo(() => {
    const base = iso === '840' ? geoAlbersUsa() : geoMercator()
    return base.fitExtent([[12, 12], [WIDTH - 12, HEIGHT - 12]], geo)
  }, [iso, geo])

  return (
    <div className="map-wrap">
      <div className="hover-label">{hovered || 'Bölge adını görmek için üzerine gel'}</div>

      <ComposableMap projection={projection} width={WIDTH} height={HEIGHT}>
        <Geographies geography={geo}>
          {({ geographies }) =>
            geographies.map((g) => {
              const name = g.properties.shapeName
              return (
                <Geography
                  key={g.rsmKey}
                  geography={g}
                  onClick={() => onRegionClick(name)}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered('')}
                  className={visited.has(name) ? 'region visited-city' : 'region'}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  )
}