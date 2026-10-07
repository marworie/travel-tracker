import { useState } from 'react'

export default function CountryPanel({ country, isVisited, cities, onToggle, onAddCity, onRemoveCity }) {
  const [cityName, setCityName] = useState('')

  if (!country) {
    return <div className="panel panel-empty">👆 Haritadan bir ülke seç</div>
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
        <button className={isVisited ? 'visit-btn on' : 'visit-btn'} onClick={onToggle}>
          {isVisited ? '✕ Kaldır' : 'Gittim olarak işaretle'}
        </button>
      </div>

      <form className="city-form" onSubmit={handleSubmit}>
        <input
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          placeholder="Gittiğin şehri yaz, ör. Paris"
          maxLength={100}
        />
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