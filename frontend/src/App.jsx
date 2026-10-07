import { useEffect, useState } from 'react'
import { api } from './api'
import StatsBar from './components/StatsBar'
import WorldMap from './components/WorldMap'
import TurkeyMap from './components/TurkeyMap'
import CountryPanel from './components/CountryPanel'
import VisitedCities from './components/VisitedCities'
import ListModal from './components/ListModal'

export default function App() {
  const [tab, setTab] = useState('turkey')
  const [visitedCities, setVisitedCities] = useState(new Set())
  const [visitedCountries, setVisitedCountries] = useState(new Set())
  const [foreignCities, setForeignCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null) // { iso, name }
  const [stats, setStats] = useState(null)
  const [openList, setOpenList] = useState(null) // 'cities' | 'countries' | 'foreign'
  const [error, setError] = useState('')

  const refreshStats = () => api.getStats().then(setStats)

  useEffect(() => {
    Promise.all([api.getCities(), api.getVisitedCountries(), api.getForeignCities(), api.getStats()])
      .then(([cities, countries, foreign, s]) => {
        setVisitedCities(new Set(cities.filter((c) => c.isVisited).map((c) => c.plateCode)))
        setVisitedCountries(new Set(countries.map((c) => c.isoNumeric)))
        setForeignCities(foreign)
        setStats(s)
      })
      .catch(() => setError('Backend\'e bağlanılamadı. API çalışıyor mu?'))
  }, [])

  // ---- Türkiye ----
  const handleCityClick = async (plateCode) => {
    const city = await api.toggleCity(plateCode)
    setVisitedCities((prev) => {
      const next = new Set(prev)
      city.isVisited ? next.add(plateCode) : next.delete(plateCode)
      return next
    })
    refreshStats()
  }
 
  // ---- Dünya ----
  const selectedIso = selectedCountry?.iso
  const citiesOfSelected = foreignCities.filter((c) => c.isoNumeric === selectedIso)

  // Haritada ülkeye tıklanınca: seç + gidilmediyse direkt ekle
  const handleCountryClick = async (iso, name) => {
    setSelectedCountry({ iso, name })
    if (visitedCountries.has(iso)) return

    await api.toggleCountry(iso, name)
    setVisitedCountries((prev) => new Set(prev).add(iso))
    refreshStats()
  }

  const handleToggleCountry = async () => {
    const { iso, name } = selectedCountry

    if (visitedCountries.has(iso) && citiesOfSelected.length > 0) {
      const ok = confirm(`${name} kaldırılırsa ${citiesOfSelected.length} şehir de silinecek. Emin misin?`)
      if (!ok) return
    }

    const country = await api.toggleCountry(iso, name)
    setVisitedCountries((prev) => {
      const next = new Set(prev)
      country.isVisited ? next.add(iso) : next.delete(iso)
      return next
    })
    if (!country.isVisited) {
      setForeignCities((prev) => prev.filter((c) => c.isoNumeric !== iso))
    }
    refreshStats()
  }

  const handleAddCity = async (cityName) => {
    const { iso, name } = selectedCountry
    const city = await api.addForeignCity(iso, name, cityName)
    setForeignCities((prev) => (prev.some((c) => c.id === city.id) ? prev : [...prev, city]))
    setVisitedCountries((prev) => new Set(prev).add(iso))
    refreshStats()
  }

  const handleRemoveCity = async (id) => {
    await api.deleteForeignCity(id)
    setForeignCities((prev) => prev.filter((c) => c.id !== id))
    refreshStats()
  }

  return (
    <div className="app">
      <header>
        <h1>🗺️ Gezi Haritam</h1>
        <p className="subtitle">Gittiğin yerlere tıkla, haritan renklensin</p>
      </header>

      {error && <div className="error">{error}</div>}

      <StatsBar stats={stats} onOpenList={setOpenList} />

      {openList && <ListModal type={openList} onClose={() => setOpenList(null)} />}

      <div className="tabs">
        <button className={tab === 'turkey' ? 'active' : ''} onClick={() => setTab('turkey')}>🇹🇷 Türkiye</button>
        <button className={tab === 'world' ? 'active' : ''} onClick={() => setTab('world')}>🌍 Dünya</button>
      </div>

      <div className="map-card">
        {tab === 'turkey' ? (
          <TurkeyMap visited={visitedCities} onCityClick={handleCityClick} />
        ) : (
          <WorldMap
            visited={visitedCountries}
            selectedIso={selectedIso}
            onCountryClick={handleCountryClick}
          />
        )}
      </div>

      {tab === 'world' && (
        <>
          <CountryPanel
            country={selectedCountry}
            isVisited={visitedCountries.has(selectedIso)}
            cities={citiesOfSelected}
            onToggle={handleToggleCountry}
            onAddCity={handleAddCity}
            onRemoveCity={handleRemoveCity}
          />
          <VisitedCities cities={foreignCities} onSelectCountry={setSelectedCountry} />
        </>
      )}
    </div>
  )
}