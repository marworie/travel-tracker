function StatCard({ emoji, label, visited, total, percent, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-emoji">{emoji}</span>
        <span className="stat-label">{label}</span>
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

export default function StatsBar({ stats }) {
  if (!stats) return null

  return (
    <div className="stats">
      <StatCard emoji="🏙️" label="Gezilen iller" visited={stats.visitedCities}
        total={stats.totalCities} percent={stats.cityPercent} color="var(--coral)" />
      <StatCard emoji="✈️" label="Gezilen ülkeler" visited={stats.visitedCountries}
        total={stats.totalCountries} percent={stats.countryPercent} color="var(--teal)" />
      <StatCard emoji="📍" label="Yurt dışı şehirler" visited={stats.visitedForeignCities} />
    </div>
  )
}