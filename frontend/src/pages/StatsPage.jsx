import { useEffect, useState } from 'react'
import { api } from '../api'
import { CONTINENTS } from '../continents'
import { tripStatus } from '../countryNames'
import { evaluateBadges } from '../badges'

const percent = (part, total) => (total ? Math.round((part / total) * 1000) / 10 : 0) // 1 ondalık

export default function StatsPage({ visitedCountries, visitedCities, wishes }) {
  const [trips, setTrips] = useState([])
  const [unescoSeen, setUnescoSeen] = useState(0)

  useEffect(() => {
    api.getTrips().then(setTrips).catch(() => setTrips([]))
    api.getSavedUnesco().then((list) => setUnescoSeen(list.filter((u) => u.isVisited).length)).catch(() => {})
  }, [])

  // ---- Kıtalar ----
  const continents = CONTINENTS.map((c) => {
    const visited = c.countries.filter((iso) => visitedCountries.has(iso)).length
    return { ...c, visited, total: c.countries.length, pct: percent(visited, c.countries.length) }
  })
  const topContinent = [...continents].sort((a, b) => b.visited - a.visited)[0]

  // ---- Geziler (sadece tamamlananlar sayılır) ----
  const done = trips.filter((t) => t.startDate && tripStatus(t.startDate, t.endDate).past)
  const totalDays = done.reduce((sum, t) => sum + t.dayCount, 0)
  const longest = [...done].sort((a, b) => b.dayCount - a.dayCount)[0]

  // Yıllara göre gezi sayısı: { 2025: 2, 2026: 5 }
  const byYear = {}
  for (const t of trips) {
    if (!t.startDate) continue
    const year = new Date(t.startDate).getFullYear()
    byYear[year] = (byYear[year] ?? 0) + 1
  }
  const years = Object.keys(byYear).sort()
  // ---- Rozetler ----
const badges = evaluateBadges({
  visitedCountries,
  visitedCities,
  trips,
  totalDays,
  wishes,
  unesco: unescoSeen,
  photoCount: trips.reduce((sum, t) => sum + (t.files ?? []).filter((f) => f.kind === 'photo').length, 0),
})
const earnedCount = badges.filter((b) => b.earned).length
  const maxPerYear = Math.max(1, ...Object.values(byYear))

  return (
    <>
      <div className="page-head">
        <h1>İstatistikler</h1>
        <p className="subtitle">Dünyanın ne kadarını gördün?</p>
      </div>

      <section className="stat-tiles">
        <div><strong>{trips.length}</strong><span>gezi planı</span></div>
        <div><strong>{totalDays}</strong><span>gün seyahat edildi</span></div>
        <div>
          <strong>{longest ? `${longest.dayCount} gün` : '–'}</strong>
          <span>{longest ? `en uzun gezi: ${longest.title}` : 'en uzun gezi'}</span>
        </div>
        <div>
          <strong>{topContinent?.visited ? topContinent.name : '–'}</strong>
          <span>en çok gezilen kıta</span>
        </div>
      </section>
      <section className="panel">
        <h2>Rozetler <span className="count-pill">{earnedCount}/{badges.length}</span></h2>
        <div className="badge-grid">
            {badges.map((b) => (
            <div key={b.id} className={b.earned ? 'badge earned' : 'badge'} title={b.desc}>
                <span className="badge-medal" aria-hidden="true">{b.earned ? '★' : ''}</span>
                <div className="badge-body">
                <strong>{b.title}</strong>
                <span className="badge-desc">{b.desc}</span>
                {!b.earned && (
                    <span className="badge-progress">
                    <span className="region-bar"><span style={{ width: `${(b.current / b.target) * 100}%` }} /></span>
                    <span>{b.current}/{b.target}</span>
                    </span>
                )}
                </div>
            </div>
            ))}
        </div>
      </section>
      <section className="panel">
        <h2>Kıtalara göre</h2>
        <ul className="region-list continent-list">
          {continents.map((c) => (
            <li key={c.id}>
              <span className="region-name">{c.name}</span>
              <span className="region-bar"><span style={{ width: `${c.pct}%` }} /></span>
              <span className="region-count">{c.visited}/{c.total} · %{c.pct.toLocaleString('tr-TR')}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Yıllara göre geziler</h2>
        {years.length === 0 ? (
          <p className="panel-empty">Tarihli bir gezi ekleyince burada görünecek.</p>
        ) : (
          <div className="year-chart">
            {years.map((y) => (
              <div key={y} className="year-col">
                <span className="year-count">{byYear[y]}</span>
                <span className="year-bar" style={{ height: `${(byYear[y] / maxPerYear) * 100}%` }} />
                <span className="year-label">{y}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}