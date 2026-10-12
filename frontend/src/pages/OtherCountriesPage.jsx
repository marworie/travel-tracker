import { useState } from 'react'
import CountryRegions from '../components/CountryRegions'
import { countryName } from '../countryNames'

export default function OtherCountriesPage({ countries }) {
  const sorted = [...countries].sort((a, b) => countryName(a).localeCompare(countryName(b), 'tr'))
  const [selected, setSelected] = useState(sorted[0] ?? null)

  return (
    <>
      <div className="page-head">
        <h1>Gezdiğin ülkeler</h1>
        <p className="subtitle">Gittiğin bir ülke seç, gezdiğin bölgelere tıkla.</p>
      </div>

      {sorted.length === 0 ? (
        <p className="panel-empty">Önce Dünya haritasında gittiğin ülkeleri işaretle.</p>
      ) : (
        <>
          <div className="country-chips">
            {sorted.map((iso) => (
              <button
                key={iso}
                className={iso === selected ? 'chip active' : 'chip'}
                onClick={() => setSelected(iso)}
              >
                {countryName(iso)}
              </button>
            ))}
          </div>
          {selected && <CountryRegions key={selected} iso={selected} />}
        </>
      )}
    </>
  )
}