import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import worldData from 'world-atlas/countries-110m.json'

// Özet sayfasındaki küçük, tıklanamayan dünya haritası
export default function WorldMiniMap({ visited }) {
  return (
    <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={380}>
      <Geographies geography={worldData}>
        {({ geographies }) =>
          geographies
            .filter((geo) => geo.properties.name !== 'Antarctica')
            .map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className={visited.has(geo.id) ? 'mini-land visited' : 'mini-land'}
              />
            ))
        }
      </Geographies>
    </ComposableMap>
  )
}
