import { useEffect, useState } from 'react'
import { api } from '../api'
import { countryName } from '../countryNames'
import StatsBar from '../components/StatsBar'

export default function HomePage({ stats, onOpenList, onGoExplore }) {
  const [saved, setSaved] = useState([])

  // UNESCO yerleri ve "mutlaka görülmeli" yerler tek listede birleşiyor
  useEffect(() => {
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
  }, [])

  const wanted = saved.filter((s) => s.isWanted && !s.isVisited)
  const seen = saved.filter((s) => s.isVisited)

  return (
    <>
      <div className="page-head">
        <h1>Özet</h1>
      </div>

      <StatsBar stats={stats} onOpenList={onOpenList} />

      <section className="home-section">
        <h2>Gitmek istediklerim <span className="count-pill">{wanted.length}</span></h2>
        {wanted.length === 0 ? (
          <div className="empty-card">
            Listen boş. Keşfet'te bir yerin yanındaki "Listeye ekle" butonuna bas.{' '}
            <button className="link-btn" onClick={onGoExplore}>Keşfet'i aç</button>
          </div>
        ) : (
          <div className="wish-list">
            {wanted.map((s) => (
              <a key={s.key} className="wish-item" href={s.url} target="_blank" rel="noreferrer">
                <span className="wish-name">{s.name}</span>
                <span className="wish-country">{countryName(s.countryIso)}</span>
              </a>
            ))}
          </div>
        )}
      </section>

      {seen.length > 0 && (
        <section className="home-section">
          <h2>Gördüğüm yerler <span className="count-pill">{seen.length}</span></h2>
          <div className="chips">
            {seen.map((s) => (
              <span key={s.key} className="chip">{s.name}</span>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
