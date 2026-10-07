import { useEffect, useState } from 'react'
import { api } from '../api'
import { countryName } from '../countryNames'
import UnescoSites from '../components/UnescoSites'

export default function ExplorePage() {
  const [countries, setCountries] = useState([])
  const [iso, setIso] = useState('792') // varsayılan: Türkiye

  // Mirası olan ülkeleri Türkçe adlarına göre sırala
  useEffect(() => {
    api.getUnescoCountries().then((list) =>
      setCountries(
        list
          .map((c) => ({ ...c, name: countryName(c.countryIso) }))
          .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
      )
    )
  }, [])

  return (
    <>
      <div className="page-head">
        <h1>Keşfet</h1>
        <p className="subtitle">UNESCO Dünya Mirası Listesi'ndeki yerler, ülkeye göre</p>
      </div>

      <div className="explore-picker">
        <label htmlFor="country-select">Ülke</label>
        <select id="country-select" value={iso} onChange={(e) => setIso(e.target.value)}>
          {countries.map((c) => (
            <option key={c.countryIso} value={c.countryIso}>
              {c.name} ({c.siteCount})
            </option>
          ))}
        </select>
      </div>

      <UnescoSites iso={iso} countryName={countryName(iso)} />
    </>
  )
}
