import { useEffect, useState } from 'react'
import { api } from '../api'

const CATEGORY = {
  cultural: { label: 'Kültürel' },
  natural: { label: 'Doğal' },
  mixed: { label: 'Karma' },
}

// Bir ülkenin UNESCO Dünya Mirası listesi
export default function UnescoSites({ iso, countryName }) {
  const [sites, setSites] = useState([])

  useEffect(() => {
    api.getUnescoSites(iso).then(setSites).catch(() => setSites([]))
  }, [iso])

  // Butona basınca güncellenen kaydı listede değiştir
  const replaceSite = (updated) =>
    setSites((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))

  const toggleWanted = (id) => api.toggleUnescoWanted(id).then(replaceSite)
  const toggleVisited = (id) => api.toggleUnescoVisited(id).then(replaceSite)

  if (sites.length === 0) return null

  const visitedCount = sites.filter((s) => s.isVisited).length

  return (
    <section className="unesco-section">
      <div className="unesco-head">
        <h2>{countryName}</h2>
        <span className="unesco-count">
          {visitedCount} / {sites.length} görüldü
        </span>
      </div>

      <div className="unesco-grid">
        {sites.map((s) => {
          const cat = CATEGORY[s.category] ?? CATEGORY.cultural
          return (
            <div key={s.id} className={`unesco-card ${s.isVisited ? 'seen' : ''}`}>
              <div className="unesco-meta">
                <span className={`cat cat-${s.category}`}>{cat.label}</span>
                <span>{s.yearInscribed}</span>
              </div>

              <a className="unesco-name" href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>

              {s.inDanger && <span className="danger-badge">Tehlike altında</span>}

              <div className="unesco-actions">
                <button className={s.isWanted ? 'on-wanted' : ''} onClick={() => toggleWanted(s.id)}>
                  {s.isWanted ? 'Listede' : 'Listeye ekle'}
                </button>
                <button className={s.isVisited ? 'on-visited' : ''} onClick={() => toggleVisited(s.id)}>
                  {s.isVisited ? 'Gidildi' : 'Gittim'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
