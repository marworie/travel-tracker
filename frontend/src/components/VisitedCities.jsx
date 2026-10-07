export default function VisitedCities({ cities, onSelectCountry }) {
  if (cities.length === 0) return null

  // Ülkelere göre grupla
  const groups = cities.reduce((acc, c) => {
    (acc[c.countryName] ??= []).push(c)
    return acc
  }, {})

  return (
    <section className="visited-section">
      <h2>📍 Gezilen şehirler</h2>
      <div className="visited-grid">
        {Object.entries(groups).map(([countryName, list]) => (
          <div
            key={countryName}
            className="visited-group"
            onClick={() => onSelectCountry({ iso: list[0].isoNumeric, name: countryName })}
          >
            <div className="group-title">
              {countryName} <span>{list.length}</span>
            </div>
            <div className="visited-names">{list.map((c) => c.name).join(' · ')}</div>
          </div>
        ))}
      </div>
    </section>
  )
}