import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import worldData from 'world-atlas/countries-110m.json'

export default function WorldMap({ visited, selectedIso, onCountryClick }) {
  const [hovered, setHovered] = useState('')

  return (
    <div className="map-wrap">
      <div className="hover-label">{hovered || 'Yakınlaştırmak için fare tekerleğini kullan'}</div>

      <ComposableMap projectionConfig={{ scale: 150 }} width={800} height={420}>
        <ZoomableGroup center={[20, 20]} minZoom={1} maxZoom={6}>
          <Geographies geography={worldData}>
            {({ geographies }) =>
              geographies
                .filter((geo) => geo.id) // id'si olmayan birkaç bölgeyi atla
                .map((geo) => {
                  const iso = geo.id // ör. Türkiye = "792"
                  const name = geo.properties.name

                  let className = 'region'
                  if (visited.has(iso)) className += ' visited-country'
                  if (iso === selectedIso) className += ' selected'

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => onCountryClick(iso, name)}
                      onMouseEnter={() => setHovered(name)}
                      onMouseLeave={() => setHovered('')}
                      className={className}
                    />
                  )
                })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
