import { useEffect, useState } from 'react'
import { api, FILE_BASE } from '../api'
import { formatDate } from '../countryNames'
import TripMemories from '../components/TripMemories'

export default function MemoriesPage() {
  const [trips, setTrips] = useState([])
  const [openId, setOpenId] = useState(null)
  const [trip, setTrip] = useState(null) // açık gezinin tüm detayı

  const loadTrips = () => api.getTrips().then(setTrips).catch(() => setTrips([]))
  const loadTrip = () => api.getTrip(openId).then(setTrip)

  useEffect(() => { loadTrips() }, [])
  useEffect(() => {
    setTrip(null)
    if (openId) loadTrip()
  }, [openId])

  // ---- Bir gezinin anıları ----
  if (openId) {
    return (
      <>
        <button className="back-btn" onClick={() => { setOpenId(null); loadTrips() }}>‹ Tüm anılar</button>
        {!trip ? (
          <p className="subtitle">Yükleniyor…</p>
        ) : (
          <>
            <div className="page-head">
              <h1>{trip.title}</h1>
              <p className="subtitle">
                {trip.startDate ? `${formatDate(trip.startDate)}${trip.endDate ? ` – ${formatDate(trip.endDate)}` : ''}` : 'Tarih belirlenmedi'}
              </p>
            </div>
            <TripMemories trip={trip} onChange={loadTrip} />
          </>
        )}
      </>
    )
  }

  // ---- Tüm geziler: en yenisi üstte ----
  const sorted = [...trips].sort((a, b) => new Date(b.startDate ?? 0) - new Date(a.startDate ?? 0))

  return (
    <>
      <div className="page-head">
        <h1>Anılar</h1>
        <p className="subtitle">Gezilerinin fotoğrafları, notları ve belgeleri.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-card">Önce "Gezi planları"ndan bir gezi oluştur.</div>
      ) : (
        <div className="memory-grid">
          {sorted.map((t) => {
            const photos = t.files.filter((f) => f.kind === 'photo')
            const cover = photos[0]
            return (
              <button key={t.id} className="memory-card" onClick={() => setOpenId(t.id)}>
                <div className="memory-cover">
                  {cover ? <img src={FILE_BASE + cover.url} alt="" loading="lazy" /> : <span>{t.title}</span>}
                </div>
                <div className="memory-card-body">
                  <span className="trip-title">{t.title}</span>
                  <span className="trip-dates">{t.startDate ? formatDate(t.startDate) : 'Tarih yok'}</span>
                  <span className="memory-card-meta">
                    <span className="stars-static">{'★'.repeat(t.rating ?? 0)}<span>{'★'.repeat(5 - (t.rating ?? 0))}</span></span>
                    <span>{photos.length} fotoğraf</span>
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}