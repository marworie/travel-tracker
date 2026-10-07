import { useEffect, useState } from 'react'
import { api } from '../api'
import { allCountries, countryName, formatDate } from '../countryNames'
import TripRouteMap from './TripRouteMap'

const EMPTY_STOP = { countryIso: '792', place: '', stopDate: '', note: '' }

export default function TripDetail({ id, onBack }) {
  const [trip, setTrip] = useState(null)
  const [stop, setStop] = useState(EMPTY_STOP)
  const [suggestions, setSuggestions] = useState([])

  const loadTrip = () => api.getTrip(id).then(setTrip)

  useEffect(() => { loadTrip() }, [id])

  // Yer adı yazdıkça seçili ülkenin şehirlerini öner
  useEffect(() => {
    const timer = setTimeout(() => {
      api.searchWorldCities(stop.countryIso, stop.place).then(setSuggestions).catch(() => setSuggestions([]))
    }, 200)
    return () => clearTimeout(timer)
  }, [stop.countryIso, stop.place])

  const handleAddStop = async (e) => {
    e.preventDefault()
    if (!stop.place.trim()) return
    await api.addStop(id, { ...stop, stopDate: stop.stopDate || null, note: stop.note || null })
    // Ülke seçimi kalsın, diğer alanlar temizlensin
    setStop({ ...EMPTY_STOP, countryIso: stop.countryIso })
    loadTrip()
  }

  const handleMove = async (stopId, direction) => {
    await api.moveStop(stopId, direction)
    loadTrip()
  }

  const handleDeleteStop = async (stopId) => {
    await api.deleteStop(stopId)
    loadTrip()
  }

  const handleDeleteTrip = async () => {
    if (!confirm(`"${trip.title}" gezisi ve tüm durakları silinecek. Emin misin?`)) return
    await api.deleteTrip(id)
    onBack()
  }

  if (!trip) return <p className="subtitle">Yükleniyor...</p>

  return (
    <>
      <button className="back-btn" onClick={onBack}>‹ Gezi planlarına dön</button>

      <div className="page-head trip-head">
        <div>
          <h1>{trip.title}</h1>
          <p className="subtitle">
            {trip.startDate
              ? `${formatDate(trip.startDate)}${trip.endDate ? ` – ${formatDate(trip.endDate)}` : ''}`
              : 'Tarih belirlenmedi'}
          </p>
        </div>
        <button className="text-danger-btn" onClick={handleDeleteTrip}>Geziyi sil</button>
      </div>

      <TripRouteMap stops={trip.stops} />

      {trip.stops.length === 0 ? (
        <div className="empty-card">Bu gezide henüz durak yok. Aşağıdan ilk durağı ekle.</div>
      ) : (
        <ol className="stop-list">
          {trip.stops.map((s, i) => (
            <li key={s.id} className="stop">
              <span className="stop-num">{i + 1}</span>
              <div className="stop-body">
                <div className="stop-place">
                  {s.place} <span className="stop-country">{countryName(s.countryIso)}</span>
                </div>
                {(s.stopDate || s.note) && (
                  <div className="stop-meta">
                    {formatDate(s.stopDate)}
                    {s.stopDate && s.note && ' — '}
                    {s.note}
                  </div>
                )}
              </div>
              <div className="stop-actions">
                <button onClick={() => handleMove(s.id, 'up')} disabled={i === 0} aria-label="Yukarı taşı">↑</button>
                <button onClick={() => handleMove(s.id, 'down')} disabled={i === trip.stops.length - 1} aria-label="Aşağı taşı">↓</button>
                <button onClick={() => handleDeleteStop(s.id)} aria-label="Durağı sil">×</button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <section className="panel">
        <h2>Durak ekle</h2>
        <form className="stop-form" onSubmit={handleAddStop}>
          <label className="field">
            <span>Ülke</span>
            <select value={stop.countryIso} onChange={(e) => setStop({ ...stop, countryIso: e.target.value, place: '' })}>
              {allCountries.map((c) => (
                <option key={c.iso} value={c.iso}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="field grow">
            <span>Şehir veya yer</span>
            <input
              required
              maxLength={200}
              list="stop-suggestions"
              value={stop.place}
              onChange={(e) => setStop({ ...stop, place: e.target.value })}
              placeholder="ör. Trabzon"
            />
            <datalist id="stop-suggestions">
              {suggestions.map((name) => <option key={name} value={name} />)}
            </datalist>
          </label>
          <label className="field">
            <span>Tarih</span>
            <input type="date" value={stop.stopDate} onChange={(e) => setStop({ ...stop, stopDate: e.target.value })} />
          </label>
          <label className="field grow">
            <span>Not</span>
            <input
              maxLength={500}
              value={stop.note}
              onChange={(e) => setStop({ ...stop, note: e.target.value })}
              placeholder="ör. Uzungöl'de konaklama"
            />
          </label>
          <button type="submit" className="primary-btn">Ekle</button>
        </form>
      </section>
    </>
  )
}
