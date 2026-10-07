function StatCard({ emoji, label, visited, total, percent, color, onClick }) {
  return (
    <div className="stat-card clickable" onClick={onClick}>
      <div className="stat-top">
        <span className="stat-emoji">{emoji}</span>
        <span className="stat-label">{label}</span>
        <span className="stat-arrow">›</span>
      </div>
      <div className="stat-number">
        {visited} {total && <span>/ {total}</span>}
      </div>
      {percent !== undefined && (
        <>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${percent}%`, background: color }} />
          </div>
          <div className="stat-percent">%{percent}</div>
        </>
      )}
    </div>
  )
}

export default function StatsBar({ stats, onOpenList }) {
  if (!stats) return null

  return (
    <div className="stats">
      <StatCard emoji="🏙️" label="Gezilen iller" visited={stats.visitedCities}
        total={stats.totalCities} percent={stats.cityPercent} color="var(--coral)"
        onClick={() => onOpenList('cities')} />
      <StatCard emoji="✈️" label="Gezilen ülkeler" visited={stats.visitedCountries}
        total={stats.totalCountries} percent={stats.countryPercent} color="var(--teal)"
        onClick={() => onOpenList('countries')} />
      <StatCard emoji="📍" label="Yurt dışı şehirler" visited={stats.visitedForeignCities}
        onClick={() => onOpenList('foreign')} />
    </div>
  )
}