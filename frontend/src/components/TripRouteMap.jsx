import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps'
import worldData from 'world-atlas/countries-50m.json'

const WIDTH = 800

// Durakların hepsini kapsayacak şekilde haritanın merkezini ve yakınlığını hesapla
function fitToStops(points, HEIGHT, fill) {
  const lngs = points.map((p) => p[0])
  const lats = points.map((p) => p[1])
  const center = [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2]

  // Derece cinsinden genişlik/yükseklik → radyan; kenarlarda boşluk kalsın diye en az 4 derece
  const lngSpan = Math.max(Math.max(...lngs) - Math.min(...lngs), 4) * (Math.PI / 180)
  const latSpan = Math.max(Math.max(...lats) - Math.min(...lats), 4) * (Math.PI / 180)
  const scale = Math.min((WIDTH * fill) / lngSpan, (HEIGHT * fill) / latSpan, 6000)

  return { center, scale }
}

// compact: liste kartlarındaki küçük harita (isim etiketi ve not yok)
export default function TripRouteMap({ stops, compact = false }) {
  const HEIGHT = compact ? 300 : 380
  // Sadece konumu bilinen duraklar haritada gösterilebilir
  const located = stops.filter((s) => s.latitude != null && s.longitude != null)
  const missing = stops.length - located.length

  if (located.length === 0) return null

  const points = located.map((s) => [Number(s.longitude), Number(s.latitude)])
  // Küçük kartta noktalar kenara yapışmasın diye daha fazla boşluk bırak
  const { center, scale } = fitToStops(points, HEIGHT, compact ? 0.55 : 0.7)
  const dotSize = compact ? 22 : 11

  return (
    <div className={compact ? 'route-mini' : 'map-card route-card'}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center, scale }}
        width={WIDTH}
        height={HEIGHT}
      >
        <Geographies geography={worldData}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo} className="route-land" />
            ))
          }
        </Geographies>

        {/* Ardışık duraklar arasında rota çizgisi */}
        {points.slice(1).map((to, i) => (
          <Line key={i} from={points[i]} to={to} className="route-line" strokeWidth={compact ? 4 : 2} />
        ))}

        {located.map((s, i) => (
          <Marker key={s.id} coordinates={points[i]}>
            <circle r={dotSize} className="route-dot" />
            <text y={dotSize * 0.36} textAnchor="middle" className="route-num" style={{ fontSize: dotSize * 1.1 }}>
              {stops.indexOf(s) + 1}
            </text>
            {!compact && <text x={16} y={4} className="route-label">{s.place}</text>}
          </Marker>
        ))}
      </ComposableMap>

      {!compact && missing > 0 && (
        <p className="route-note">
          {missing} durağın konumu bulunamadı. Şehir adını öneri listesinden seçersen haritada görünür.
        </p>
      )}
    </div>
  )
}
