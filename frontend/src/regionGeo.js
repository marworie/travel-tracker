import countries from 'i18n-iso-countries'
import { geoArea } from 'd3-geo'

// Bir ülkenin 1. seviye idari bölgelerinin sınırları.
// Kaynak: geoBoundaries (CC BY 4.0) — https://www.geoboundaries.org
const cache = new Map()

export function loadRegionGeo(isoNumeric) {
  if (cache.has(isoNumeric)) return cache.get(isoNumeric)

  const iso3 = countries.numericToAlpha3(isoNumeric) // "276" → "DEU"
  const url = `https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/${iso3}/ADM1/geoBoundaries-${iso3}-ADM1_simplified.geojson`

  const promise = fetch(url).then((res) => {
    if (!res.ok) throw new Error('Bu ülke için bölge haritası bulunamadı.')
    return res.json()
  }).then(fixWinding)
  promise.catch(() => cache.delete(isoNumeric)) // hata olursa bir dahaki sefere yeniden denensin
  cache.set(isoNumeric, promise)
  return promise
}

// geoBoundaries çokgenleri saat yönünün tersine çiziyor, d3 ise saat yönünde bekliyor.
// Ters çizilen çokgen d3'e göre "bölge hariç tüm dünya" olur ve harita dolu bir kutu gibi görünür.
function fixWinding(geojson) {
  for (const feature of geojson.features) {
    const { type, coordinates } = feature.geometry
    const polygons = type === 'Polygon' ? [coordinates] : coordinates
    for (const rings of polygons) {
      if (geoArea({ type: 'Polygon', coordinates: rings }) > 2 * Math.PI) {
        rings.forEach((ring) => ring.reverse())
      }
    }
  }
  return geojson
}