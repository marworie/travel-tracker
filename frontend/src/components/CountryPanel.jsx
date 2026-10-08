import { useEffect, useState } from 'react'
import { api } from '../api'

export default function CountryPanel({ country, cities, onAddCity, onRemoveCity }) {
  const [cityName, setCityName] = useState('')
  const [suggestions, setSuggestions] = useState([])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cityName.trim()) return
    await onAddCity(cityName.trim())
    setCityName('')
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>{country.name}</h3>
        <span className="panel-hint">Kaldırmak için haritada ülkeye tekrar tıkla</span>
      </div>

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
    </div>
  )
}
