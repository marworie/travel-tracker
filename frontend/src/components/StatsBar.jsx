function StatCard({ label, visited, total, percent, onClick }) {
  return (
    <button className="stat-card" onClick={onClick} title="Listeyi göster">
      <span className="stat-label">{label}</span>
      <span className="stat-number">
        {visited}
        {total && <span className="stat-total"> / {total}</span>}
      </span>
      {percent !== undefined ? (
        <span className="progress" aria-label={`%${percent}`}>
          <span className="progress-fill" style={{ width: `${percent}%` }} />
        </span>
      ) : (
        <span className="stat-note">yurt dışında</span>
      )}
    </button>
  )
}

export default function StatsBar({ stats, onOpenList }) {
  if (!stats) return null

  return (
    <div className="stats">
      <StatCard label="İller" visited={stats.visitedCities} total={stats.totalCities}
        percent={stats.cityPercent} onClick={() => onOpenList('cities')} />
      <StatCard label="Ülkeler" visited={stats.visitedCountries} total={stats.totalCountries}
        percent={stats.countryPercent} onClick={() => onOpenList('countries')} />
      <StatCard label="Şehirler" visited={stats.visitedForeignCities}
        onClick={() => onOpenList('foreign')} />
    </div>
  )
}
