import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatDate } from '../countryNames'
import TripDetail from '../components/TripDetail'

const EMPTY = { title: '', startDate: '', endDate: '' }

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
    const trip = await api.createTrip({
      title: form.title,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    })
    setForm(EMPTY)
    loadTrips()
    setOpenId(trip.id)
  }

  if (openId) {
    return <TripDetail id={openId} onBack={() => { setOpenId(null); loadTrips() }} />
  }

  return (
    <>
      <div className="page-head">
        <h1>Gezi planları</h1>
        <p className="subtitle">Bir gezi oluştur, sonra duraklarını sırayla ekle.</p>
      </div>

      <form className="trip-form" onSubmit={handleCreate}>
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

      <section className="home-section">
        <h2>Gezilerim <span className="count-pill">{trips.length}</span></h2>
        {trips.length === 0 ? (
          <div className="empty-card">Henüz bir gezi planlamadın. Yukarıdaki formdan ilkini oluştur.</div>
        ) : (
          <div className="trip-list">
            {trips.map((t) => (
              <button key={t.id} className="trip-row" onClick={() => setOpenId(t.id)}>
                <span className="trip-title">{t.title}</span>
                <span className="trip-dates">
                  {t.startDate ? `${formatDate(t.startDate)}${t.endDate ? ` – ${formatDate(t.endDate)}` : ''}` : 'Tarih yok'}
                </span>
                <span className="trip-stops">{t.stopCount} durak</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
