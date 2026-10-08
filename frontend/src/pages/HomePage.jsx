import { useEffect, useState } from 'react'
import { api } from '../api'
import { countryName, formatDate, tripStatus } from '../countryNames'
import { REGIONS } from '../regions'
import StatsBar from '../components/StatsBar'
import WorldMiniMap from '../components/WorldMiniMap'

export default function HomePage({ stats, visitedCities, visitedCountries, onOpenList, onNavigate }) {
  const [saved, setSaved] = useState([])
  const [trips, setTrips] = useState([])

  useEffect(() => {
    // UNESCO yerleri ve "mutlaka görülmeli" yerler tek listede birleşiyor
    Promise.all([api.getSavedUnesco(), api.getSavedLandmarks().catch(() => [])])
      .then(([unesco, landmarks]) =>
        setSaved([
          ...landmarks.map((l) => ({
            key: `l${l.id}`, name: l.name, countryIso: l.countryIso, isWanted: l.isWanted, isVisited: l.isVisited,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(l.wikiTitle)}`,
          })),
          ...unesco.map((u) => ({ ...u, key: `u${u.id}` })),
        ])
      )
      .catch(() => setSaved([]))

    api.getTrips().then(setTrips).catch(() => setTrips([]))
  }, [])

  const wanted = saved.filter((s) => s.isWanted && !s.isVisited)
  const seen = saved.filter((s) => s.isVisited)

  // Tarihi geçmemiş geziler içinde en yakını
  const nextTrip = trips
    .filter((t) => t.startDate && !tripStatus(t.startDate, t.endDate).past)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0]

  return (
    <>
      <div className="page-head">
        <h1>Özet</h1>
      </div>

      <StatsBar stats={stats} onOpenList={onOpenList} />

      <div className="home-grid">
        {/* Gidilen ülkelerin küçük haritası */}
        <section className="home-card map-preview">
          <div className="home-card-head">
            <h2>Haritan</h2>
            <button className="link-btn" onClick={() => onNavigate('world')}>Dünya haritasını aç</button>
          </div>
          <button className="mini-map-btn" onClick={() => onNavigate('world')} aria-label="Dünya haritasını aç">
            <WorldMiniMap visited={visitedCountries} />
          </button>
        </section>

        {/* En yakın gezi */}
        <section className="home-card">
          <div className="home-card-head">
            <h2>Sıradaki gezin</h2>
          </div>
          {nextTrip ? (
            <button className="next-trip" onClick={() => onNavigate('trips')}>
              <span className="next-countdown">{tripStatus(nextTrip.startDate, nextTrip.endDate).label}</span>
              <span className="next-title">{nextTrip.title}</span>
              <span className="trip-dates">
                {formatDate(nextTrip.startDate)}
                {nextTrip.endDate && ` – ${formatDate(nextTrip.endDate)}`}
              </span>
              {nextTrip.stops?.length > 0 && (
                <span className="trip-chain">{nextTrip.stops.map((s) => s.place).join(' → ')}</span>
              )}
            </button>
          ) : (
            <div className="empty-inline">
              Tarihi belli bir gezin yok.{' '}
              <button className="link-btn" onClick={() => onNavigate('trips')}>Gezi planla</button>
            </div>
          )}
        </section>

        {/* Türkiye'nin 7 bölgesi */}
        <section className="home-card">
          <div className="home-card-head">
            <h2>Türkiye bölgeleri</h2>
            <button className="link-btn" onClick={() => onNavigate('turkey')}>Haritayı aç</button>
          </div>
          <ul className="region-list">
            {REGIONS.map((r) => {
              const done = r.plates.filter((p) => visitedCities.has(p)).length
              return (
                <li key={r.name}>
                  <span className="region-name">{r.name}</span>
                  <span className="region-bar">
                    <span style={{ width: `${(done / r.plates.length) * 100}%` }} />
                  </span>
                  <span className="region-count">{done}/{r.plates.length}</span>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Gitmek istenen yerler */}
        <section className="home-card">
          <div className="home-card-head">
            <h2>Gitmek istediklerim <span className="count-pill">{wanted.length}</span></h2>
          </div>
          {wanted.length === 0 ? (
            <div className="empty-inline">
              Listen boş.{' '}
              <button className="link-btn" onClick={() => onNavigate('explore')}>Keşfet'te yer ekle</button>
            </div>
          ) : (
            <div className="wish-list">
              {wanted.slice(0, 8).map((s) => (
                <a key={s.key} className="wish-item" href={s.url} target="_blank" rel="noreferrer">
                  <span className="wish-name">{s.name}</span>
                  <span className="wish-country">{countryName(s.countryIso)}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>

      {seen.length > 0 && (
        <section className="home-section">
          <h2>Gördüğüm yerler <span className="count-pill">{seen.length}</span></h2>
          <div className="chips">
            {seen.map((s) => <span key={s.key} className="chip">{s.name}</span>)}
          </div>
        </section>
      )}
    </>
  )
}
