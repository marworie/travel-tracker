import { useEffect, useState } from 'react'
import { api } from '../api'
import { allCountries, countryName, formatDate } from '../countryNames'
import TripRouteMap from './TripRouteMap'
import TripDays from './TripDays'
import TripBudget from './TripBudget'
import TripBookings from './TripBookings'
import TripWeather from './TripWeather'

const EMPTY_STOP = { countryIso: '792', place: '', stopDate: '', note: '' }

// Bir durağı yerinde düzenleme formu
function StopEditForm({ stop, onSave, onCancel }) {
  const [form, setForm] = useState({
    countryIso: stop.countryIso,
    place: stop.place,
    stopDate: stop.stopDate ? stop.stopDate.slice(0, 10) : '', // "2026-10-21T00:00:00" → "2026-10-21"
    note: stop.note ?? '',
  })
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, stopDate: form.stopDate || null, note: form.note || null })
  }

  return (
    <form className="stop-form stop-edit" onSubmit={handleSubmit}>
      <label className="field">
        <span>Ülke</span>
        <select value={form.countryIso} onChange={set('countryIso')}>
          {allCountries.map((c) => <option key={c.iso} value={c.iso}>{c.name}</option>)}
        </select>
      </label>
      <label className="field grow">
        <span>Şehir veya yer</span>
        <input required maxLength={200} value={form.place} onChange={set('place')} />
      </label>
      <label className="field">
        <span>Tarih</span>
        <input type="date" value={form.stopDate} onChange={set('stopDate')} />
      </label>
      <label className="field grow">
        <span>Not</span>
        <input maxLength={500} value={form.note} onChange={set('note')} />
      </label>
      <button type="button" className="link-btn" onClick={onCancel}>Vazgeç</button>
      <button type="submit" className="primary-btn">Kaydet</button>
    </form>
  )
}

// Gezinin adını ve tarihlerini başlıkta yerinde düzenleme formu
function TripHeadForm({ trip, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: trip.title,
    startDate: trip.startDate ? trip.startDate.slice(0, 10) : '',
    endDate: trip.endDate ? trip.endDate.slice(0, 10) : '',
  })
  const [error, setError] = useState('')
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await onSave({ title: form.title, startDate: form.startDate || null, endDate: form.endDate || null })
    } catch (err) {
      setError(err.message) // ör. "Bitiş tarihi başlangıçtan önce olamaz."
    }
  }

  return (
    <form className="panel trip-form trip-head-form" onSubmit={handleSubmit}>
      <label className="field grow">
        <span>Gezi adı</span>
        <input required maxLength={150} autoFocus value={form.title} onChange={set('title')} />
      </label>
      <label className="field">
        <span>Başlangıç</span>
        <input type="date" value={form.startDate} onChange={set('startDate')} />
      </label>
      <label className="field">
        <span>Bitiş</span>
        <input type="date" value={form.endDate} onChange={set('endDate')} />
      </label>
      <button type="button" className="link-btn" onClick={onCancel}>Vazgeç</button>
      <button type="submit" className="primary-btn">Kaydet</button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

export default function TripDetail({ id, onBack }) {
  const [trip, setTrip] = useState(null)
  const [stop, setStop] = useState(EMPTY_STOP)
  const [suggestions, setSuggestions] = useState([])
  const [editingStopId, setEditingStopId] = useState(null) // düzenlenen durak
  const [editingHead, setEditingHead] = useState(false)   // gezi adı/tarihleri düzenleniyor mu

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

  const handleUpdateStop = async (stopId, data) => {
    await api.updateStop(stopId, data)
    setEditingStopId(null)
    loadTrip() // koordinat değişmiş olabilir, harita da güncellensin
  }

  const handleDeleteStop = async (stopId) => {
    await api.deleteStop(stopId)
    loadTrip()
  }

  const handleUpdateTrip = async (data) => {
    await api.updateTrip(id, data)
    setEditingHead(false)
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
      <button className="back-btn no-print" onClick={onBack}>‹ Gezi planlarına dön</button>

      {editingHead ? (
        <TripHeadForm trip={trip} onSave={handleUpdateTrip} onCancel={() => setEditingHead(false)} />
      ) : (
        <div className="page-head trip-head">
          <div>
            <h1>{trip.title}</h1>
            <p className="subtitle">
              {trip.startDate
                ? `${formatDate(trip.startDate)}${trip.endDate ? ` – ${formatDate(trip.endDate)}` : ''}`
                : 'Tarih belirlenmedi'}
            </p>
          </div>
          <div className="trip-head-actions no-print">
            <button className="link-btn" onClick={() => setEditingHead(true)}>Düzenle</button>
            {/* Tarayıcının yazdırma penceresini açar; oradan "PDF olarak kaydet" de seçilebilir */}
            <button className="link-btn" onClick={() => window.print()}>Yazdır / PDF</button>
            <button className="text-danger-btn" onClick={handleDeleteTrip}>Geziyi sil</button>
          </div>
        </div>
      )}

      {/* Rota haritası en üstte: gezinin genel resmi ilk bakışta görünsün */}
      <TripRouteMap stops={trip.stops} />

      <TripWeather trip={trip} />

      <TripDays trip={trip} onChange={loadTrip} />

      <TripBookings trip={trip} onChange={loadTrip} />

      <TripBudget key={trip.currency} trip={trip} onChange={loadTrip} />

      <h2 className="section-title">Duraklar</h2>
      {trip.stops.length === 0 ? (
        <div className="empty-card">Bu gezide henüz durak yok. Aşağıdan ilk durağı ekle.</div>
      ) : (
        <ol className="stop-list">
          {trip.stops.map((s, i) => editingStopId === s.id ? (
            <li key={s.id} className="stop stop-editing">
              <span className="stop-num">{i + 1}</span>
              <StopEditForm stop={s} onSave={(data) => handleUpdateStop(s.id, data)} onCancel={() => setEditingStopId(null)} />
            </li>
          ) : (
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
                <button onClick={() => setEditingStopId(s.id)} aria-label="Durağı düzenle">✎</button>
                <button onClick={() => handleDeleteStop(s.id)} aria-label="Durağı sil">×</button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <section className="panel no-print">
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
