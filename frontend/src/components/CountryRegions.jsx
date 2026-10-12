import { useEffect, useState } from 'react'
import { api } from '../api'
import { loadRegionGeo } from '../regionGeo'
import RegionMap from './RegionMap'

// Bir ülkenin bölge haritası + gezilen bölgeler (veritabanından)
export default function CountryRegions({ iso }) {
  const [geo, setGeo] = useState(null)
  const [visited, setVisited] = useState(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    setGeo(null)
    setError('')
    Promise.all([loadRegionGeo(iso), api.getRegions(iso)])
      .then(([g, names]) => {
        setGeo(g)
        setVisited(new Set(names))
      })
      .catch((err) => setError(err.message))
  }, [iso])

  const handleRegionClick = async (name) => {
    const { isVisited } = await api.toggleRegion(iso, name)
    setVisited((prev) => {
      const next = new Set(prev)
      isVisited ? next.add(name) : next.delete(name)
      return next
    })
  }

  if (error) return <p className="form-error">{error}</p>
  if (!geo) return <p className="panel-empty">Harita yükleniyor…</p>

  return (
    <>
      <p className="region-summary">
        <strong>{visited.size}</strong> / {geo.features.length} bölge gezildi
      </p>
      <div className="map-card">
        <RegionMap iso={iso} geo={geo} visited={visited} onRegionClick={handleRegionClick} />
      </div>
      <p className="map-credit">
        Sınır verisi: <a href="https://www.geoboundaries.org" target="_blank" rel="noreferrer">geoBoundaries</a> (CC BY 4.0)
      </p>
    </>
  )
}