import { useEffect, useState } from 'react'
import { api } from '../api'
import { countryName } from '../countryNames'
import StatsBar from '../components/StatsBar'

export default function HomePage({ stats, onOpenList, onGoExplore }) {
  const [saved, setSaved] = useState([])

  useEffect(() => {
    api.getSavedUnesco().then(setSaved).catch(() => setSaved([]))
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
              <a key={s.id} className="wish-item" href={s.url} target="_blank" rel="noreferrer">
                <span className="wish-name">{s.name}</span>
                <span className="wish-country">{countryName(s.countryIso)}</span>
              </a>
            ))}
          </div>
        )}
      </section>

      {seen.length > 0 && (
        <section className="home-section">
          <h2>Gördüğüm UNESCO mirasları <span className="count-pill">{seen.length}</span></h2>
          <div className="chips">
            {seen.map((s) => (
              <span key={s.id} className="chip">{s.name}</span>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
