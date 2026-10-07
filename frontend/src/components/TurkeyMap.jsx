import { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

// public/ klasöründeki 81 il GeoJSON'u (her ilin id'si = plaka kodu)
const TURKEY_GEO = '/tr-cities.json'

export default function TurkeyMap({ visited, onCityClick }) {
  const [hovered, setHovered] = useState('')

  return (
    <div className="map-wrap">
      <div className="hover-label">{hovered || 'Bir ilin üzerine gel'}</div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [35.5, 39], scale: 2300 }}
        width={800}
        height={380}
      >
        <Geographies geography={TURKEY_GEO}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const plateCode = Number(geo.id)
              const isVisited = visited.has(plateCode)

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => onCityClick(plateCode)}
                  onMouseEnter={() => setHovered(`${plateCode} · ${geo.properties.name}`)}
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
