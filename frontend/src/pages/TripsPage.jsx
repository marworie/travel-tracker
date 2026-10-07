import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatDate, tripStatus } from '../countryNames'
import TripDetail from '../components/TripDetail'
import TripRouteMap from '../components/TripRouteMap'

const EMPTY = { title: '', startDate: '', endDate: '' }

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
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </label>
        <label className="field">
          <span>Bitiş</span>
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
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
