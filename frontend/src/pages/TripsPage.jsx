import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatDate, tripStatus } from '../countryNames'
import TripDetail from '../components/TripDetail'
import TripRouteMap from '../components/TripRouteMap'

const EMPTY = { title: '', startDate: '', endDate: '', dayCount: 1 }

// İki tarih arasındaki gün sayısı (ikisi de dahil): 10 Ekim – 12 Ekim → 3
const daysBetween = (start, end) => Math.round((new Date(end) - new Date(start)) / 86400000) + 1

// Tarih değişince, iki tarih de seçiliyse gün sayısını kendimiz hesaplayalım
function withDates(form, changes) {
  const next = { ...form, ...changes }
  if (next.startDate && next.endDate && next.endDate >= next.startDate) {
    next.dayCount = Math.min(daysBetween(next.startDate, next.endDate), 60)
  }
  return next
}

function TripCard({ trip, onOpen }) {
  const status = tripStatus(trip.startDate, trip.endDate)
  const hasLocation = trip.stops.some((s) => s.latitude != null)

  return (
    <button className={`trip-card ${status.past ? 'past' : ''}`} onClick={onOpen}>
      {hasLocation ? (
        <TripRouteMap stops={trip.stops} compact />
      ) : (
        <div className="route-mini route-empty">
          {trip.stops.length === 0 ? 'Henüz durak yok' : 'Durakların konumu bulunamadı'}
        </div>
      )}

      <div className="trip-card-body">
        <div className="trip-card-top">
          <span className="trip-title">{trip.title}</span>
          {trip.startDate && (
            <span className={`trip-status ${status.past ? '' : 'upcoming'}`}>{status.label}</span>
          )}
        </div>
        <div className="trip-dates">
          {trip.startDate
            ? `${formatDate(trip.startDate)}${trip.endDate ? ` – ${formatDate(trip.endDate)}` : ''}`
            : 'Tarih belirlenmedi'}
            {` · ${trip.dayCount} gün`}
        </div>
        {trip.stops.length > 0 && (
          <div className="trip-chain">{trip.stops.map((s) => s.place).join(' → ')}</div>
        )}
      </div>
    </button>
  )
}

export default function TripsPage() {
  const [trips, setTrips] = useState([])
  const [openId, setOpenId] = useState(null) // açık olan gezinin id'si
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const loadTrips = () => api.getTrips().then(setTrips).catch(() => setTrips([]))

  useEffect(() => { loadTrips() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('Bitiş tarihi başlangıçtan önce olamaz.')
      return
    }
    let trip
    try {
      trip = await api.createTrip({
        title: form.title,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        dayCount: Number(form.dayCount),
      })
    } catch {
      setError('Gezi kaydedilemedi. Backend çalışıyor mu?')
      return
    }
    setForm(EMPTY)
    setOpenId(trip.id)
  }

  if (openId) {
    return <TripDetail id={openId} onBack={() => { setOpenId(null); loadTrips() }} />
  }

  const upcoming = trips.filter((t) => !tripStatus(t.startDate, t.endDate).past)
  const past = trips.filter((t) => tripStatus(t.startDate, t.endDate).past)

  return (
    <>
      <div className="page-head">
        <h1>Gezi planları</h1>
        <p className="subtitle">Bir gezi oluştur, sonra duraklarını sırayla ekle.</p>
      </div>

      <form className="trip-form panel" onSubmit={handleCreate}>
        <label className="field grow">
          <span>Gezi adı</span>
          <input
            required
            maxLength={150}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="ör. Karadeniz turu"
          />
        </label>

        <label className="field">
          <span>Başlangıç</span>
          <input type="date" value={form.startDate} onChange={(e) => setForm(withDates(form, { startDate: e.target.value }))} />
        </label>

        <label className="field">
          <span>Bitiş</span>
          <input type="date" value={form.endDate} onChange={(e) => setForm(withDates(form, { endDate: e.target.value }))} />
        </label>

        <label className="field day-count-field">
          <span>Kaç gün?</span>
          <input
            type="number"
            min={1}
            max={60}
            required
            value={form.dayCount}
            onChange={(e) => setForm({ ...form, dayCount: e.target.value })}
          />
        </label>

        <button type="submit" className="primary-btn">Gezi oluştur</button>
      </form>
      {error && <p className="form-error">{error}</p>}

      {trips.length === 0 && (
        <div className="empty-card trips-empty">Henüz bir gezi planlamadın. Yukarıdaki formdan ilkini oluştur.</div>
      )}

      {upcoming.length > 0 && (
        <section className="home-section">
          <h2>Yaklaşan <span className="count-pill">{upcoming.length}</span></h2>
          <div className="trip-grid">
            {upcoming.map((t) => <TripCard key={t.id} trip={t} onOpen={() => setOpenId(t.id)} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="home-section">
          <h2>Geçmiş <span className="count-pill">{past.length}</span></h2>
          <div className="trip-grid">
            {past.map((t) => <TripCard key={t.id} trip={t} onOpen={() => setOpenId(t.id)} />)}
          </div>
        </section>
      )}
    </>
  )
}
