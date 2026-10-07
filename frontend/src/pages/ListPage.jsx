import { useEffect, useState } from 'react'
import { api } from '../api'
import { countryName } from '../countryNames'

const TITLES = {
  cities: 'Gezilen iller',
  countries: 'Gezilen ülkeler',
  foreign: 'Yurt dışında gezilen şehirler',
}

export default function ListPage({ type, onBack }) {
  const [items, setItems] = useState(null) // null = yükleniyor

  useEffect(() => {
    const load = {
      cities: () =>
        api.getCities().then((list) =>
          list.filter((c) => c.isVisited).map((c) => ({ key: c.plateCode, main: c.name, sub: c.plateCode }))
        ),
      countries: () =>
        api.getVisitedCountries().then((list) =>
          list.map((c) => ({ key: c.isoNumeric, main: countryName(c.isoNumeric) }))
        ),
      foreign: () =>
        api.getForeignCities().then((list) =>
          list.map((c) => ({ key: c.id, main: c.name, sub: countryName(c.isoNumeric) }))
        ),
    }

    setItems(null)
    load[type]()
      .then((list) => setItems(list.sort((a, b) => a.main.localeCompare(b.main, 'tr'))))
      .catch(() => setItems([]))
  }, [type])

  return (
    <>
      <button className="back-btn" onClick={onBack}>‹ Özete dön</button>

      <div className="page-head">
        <h1>{TITLES[type]}</h1>
        {items && <p className="subtitle">{items.length} kayıt</p>}
      </div>

      {items === null && <p className="subtitle">Yükleniyor...</p>}
      {items?.length === 0 && <div className="empty-card">Henüz bir yer eklemedin.</div>}

      {items?.length > 0 && (
        <ul className="list-page">
          {items.map((item) => (
            <li key={item.key}>
              <span>{item.main}</span>
              {item.sub && <span className="list-sub">{item.sub}</span>}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}