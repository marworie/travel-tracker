import { useEffect, useState } from 'react'
import { api } from '../api'
import { countryName, formatDate, tripStatus } from '../countryNames'
import CountryInfo from './CountryInfo'

export default function CountryPanel({ country, cities, onAddCity, onRemoveCity }) {
  const [cityName, setCityName] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [trips, setTrips] = useState([])

  // Gezileri bir kez çek; seçilen ülkeye göre aşağıda süzeceğiz
  useEffect(() => {
    api.getTrips().then(setTrips).catch(() => setTrips([]))
  }, [])

  // Yazdıkça şehir önerilerini getir (200 ms bekleyerek)
  useEffect(() => {
    if (!country) return
    const timer = setTimeout(() => {
      api.searchWorldCities(country.iso, cityName).then(setSuggestions).catch(() => setSuggestions([]))
    }, 200)
    return () => clearTimeout(timer)
  }, [country?.iso, cityName])

  if (!country) {
    return <div className="panel panel-empty">Şehir eklemek için haritadan bir ülke seç.</div>
  }

  // Durakları arasında bu ülke olan geziler
  const countryTrips = trips.filter((t) => t.stops.some((s) => s.countryIso === country.iso))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cityName.trim()) return
    await onAddCity(cityName.trim())
    setCityName('')
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>{countryName(country.iso)}</h3>
        <span className="panel-hint">Kaldırmak için haritada ülkeye tekrar tıkla</span>
      </div>
      <CountryInfo iso={country.iso} />

      <form className="city-form" onSubmit={handleSubmit}>
        <input
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          placeholder="Şehir ara, ör. Paris"
          maxLength={100}
          list="city-suggestions"
        />
        <datalist id="city-suggestions">
          {suggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <button type="submit">Ekle</button>
      </form>

      {cities.length > 0 && (
        <div className="chips">
          {cities.map((c) => (
            <span key={c.id} className="chip">
              {c.name}
              <button onClick={() => onRemoveCity(c.id)} title="Sil">×</button>
            </span>
          ))}
        </div>
      )}

        <div className="country-trips">
        <h4>Bu ülkeye gezilerin</h4>
        {countryTrips.length === 0 ? (
          <p className="panel-hint">Henüz bu ülkeye bir gezi planın yok.</p>
        ) : (
          <ul>
            {countryTrips.map((t) => (
              <li key={t.id}>
                <span className="country-trip-title">{t.title}</span>
                <span className="panel-hint">
                  {t.startDate ? formatDate(t.startDate) : 'Tarih yok'}
                  {t.startDate && ` · ${tripStatus(t.startDate, t.endDate).label}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
