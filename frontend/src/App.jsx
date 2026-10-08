import { useEffect, useState } from 'react'
import { api } from './api'
import Sidebar from './components/Sidebar'
import WorldMap from './components/WorldMap'
import TurkeyMap from './components/TurkeyMap'
import CountryPanel from './components/CountryPanel'
import VisitedCities from './components/VisitedCities'
import ListPage from './pages/ListPage'
import TripsPage from './pages/TripsPage'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import LoginPage from './pages/LoginPage'
import WelcomeSplash from './components/WelcomeSplash'
import { auth } from './auth'

export default function App() {
  const [user, setUser] = useState(auth.get()) // { token, username } veya null
  const [page, setPage] = useState('home') // 'home' | 'turkey' | 'world' | 'explore'
  const [visitedCities, setVisitedCities] = useState(new Set())       // plaka kodları
  const [visitedCountries, setVisitedCountries] = useState(new Set()) // ISO numeric
  const [foreignCities, setForeignCities] = useState([])              // yurt dışı şehirler
  const [selectedCountry, setSelectedCountry] = useState(null)        // { iso, name }
  const [stats, setStats] = useState(null)
  const [openList, setOpenList] = useState(null) // 'cities' | 'countries' | 'foreign'
  const [error, setError] = useState('')
  const [showSplash, setShowSplash] = useState(false) // giriş sonrası animasyon

  const refreshStats = () => api.getStats().then(setStats)

  // Token süresi dolarsa veya geçersizse api.js "auth:logout" olayı gönderir
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  // Giriş yapılınca verileri çek
  useEffect(() => {
    if (!user) return
    setError('')
    Promise.all([api.getCities(), api.getVisitedCountries(), api.getForeignCities(), api.getStats()])
      .then(([cities, countries, foreign, s]) => {
        setVisitedCities(new Set(cities.filter((c) => c.isVisited).map((c) => c.plateCode)))
        setVisitedCountries(new Set(countries.map((c) => c.isoNumeric)))
        setForeignCities(foreign)
        setStats(s)
      })
      .catch(() => setError('Veriler yüklenemedi. Backend çalışıyor mu?'))
  }, [user])

  const handleLogin = (result) => {
    auth.save(result)
    setUser(result)
    setPage('home')
    setShowSplash(true)
  }

  const handleLogout = () => {
    auth.clear()
    setUser(null)
    setOpenList(null)
    setSelectedCountry(null)
  }

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

  // Haritada ülkeye tıklanınca:
  // - gidilmemişse → eklenir ve seçilir
  // - gidilmiş ve zaten seçiliyse → kaldırılır
  // - gidilmiş ama seçili değilse → sadece seçilir (şehir eklemek için)
  const handleCountryClick = async (iso, name) => {
    if (visitedCountries.has(iso) && selectedIso === iso) {
      await removeCountry(iso, name)
      return
    }

    setSelectedCountry({ iso, name })
    if (visitedCountries.has(iso)) return

    await api.toggleCountry(iso, name)
    setVisitedCountries((prev) => new Set(prev).add(iso))
    refreshStats()
  }

  const removeCountry = async (iso, name) => {
    const cityCount = foreignCities.filter((c) => c.isoNumeric === iso).length
    if (cityCount > 0 && !confirm(`${name} kaldırılırsa ${cityCount} şehir de silinecek. Emin misin?`)) return

    await api.toggleCountry(iso, name)
    setVisitedCountries((prev) => {
      const next = new Set(prev)
      next.delete(iso)
      return next
    })
    setForeignCities((prev) => prev.filter((c) => c.isoNumeric !== iso))
    setSelectedCountry(null)
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

  if (!user) return <LoginPage onLogin={handleLogin} />

  return (
    <div className="layout">
        {showSplash && <WelcomeSplash username={user.username} onDone={() => setShowSplash(false)} />}      <Sidebar
        page={page}
        onChange={(p) => { setPage(p); setOpenList(null) }}
        username={user.username}
        onLogout={handleLogout}
      />

      <main className="main">
        {error && <div className="error">{error}</div>}

        {openList && <ListPage type={openList} onBack={() => setOpenList(null)} />}

        {!openList && page === 'home' && (
          <HomePage
            stats={stats}
            visitedCities={visitedCities}
            visitedCountries={visitedCountries}
            onOpenList={setOpenList}
            onNavigate={setPage}
          />
        )}

        {!openList && page === 'turkey' && (
          <>
            <div className="page-head">
              <h1>Türkiye</h1>
              <p className="subtitle">Gittiğin ile tıkla, tekrar tıklarsan kaldırılır.</p>
            </div>
            <div className="map-card">
              <TurkeyMap visited={visitedCities} onCityClick={handleCityClick} />
            </div>
          </>
        )}

        {!openList && page === 'world' && (
          <>
            <div className="page-head">
              <h1>Dünya</h1>
              <p className="subtitle">Gittiğin ülkeye tıkla, altta şehir ekleyebilirsin.</p>
            </div>
            <div className="map-card">
              <WorldMap visited={visitedCountries} selectedIso={selectedIso} onCountryClick={handleCountryClick} />
            </div>
            <CountryPanel
              country={selectedCountry}
              cities={citiesOfSelected}
              onAddCity={handleAddCity}
              onRemoveCity={handleRemoveCity}
            />
            <VisitedCities cities={foreignCities} onSelectCountry={setSelectedCountry} />
          </>
        )}

        {!openList && page === 'explore' && <ExplorePage />}

        {!openList && page === 'trips' && <TripsPage />}
      </main>
    </div>
  )
}
