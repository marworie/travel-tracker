import { useEffect, useState } from 'react'
import { api } from '../api'
import { countryName } from '../countryNames'
import UnescoSites from '../components/UnescoSites'
import LandmarkCollections from '../components/LandmarkCollections'

export default function ExplorePage() {
  const [tab, setTab] = useState('landmarks') // 'landmarks' | 'unesco'
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
        <p className="subtitle">Görülmesi gereken yerleri keşfet, listene ekle.</p>
      </div>

      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={tab === 'landmarks'} className={tab === 'landmarks' ? 'on' : ''} onClick={() => setTab('landmarks')}>
          Mutlaka görülmeli
        </button>
        <button role="tab" aria-selected={tab === 'unesco'} className={tab === 'unesco' ? 'on' : ''} onClick={() => setTab('unesco')}>
          UNESCO listesi
        </button>
      </div>

      {tab === 'landmarks' && <LandmarkCollections />}

      {tab === 'unesco' && (
        <>
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
      )}
    </>
  )
}
