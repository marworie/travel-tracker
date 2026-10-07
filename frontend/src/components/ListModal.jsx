import { useEffect, useState } from 'react'
import { api } from '../api'

const TITLES = {
  cities: '🏙️ Gezilen iller',
  countries: '✈️ Gezilen ülkeler',
  foreign: '📍 Yurt dışı şehirler',
}

export default function ListModal({ type, onClose }) {
  const [items, setItems] = useState(null) // null = yükleniyor

  // Açılınca verileri API'den taze çek
  useEffect(() => {
    const load = {
      cities: () =>
        api.getCities().then((list) =>
          list.filter((c) => c.isVisited).map((c) => ({ key: c.plateCode, main: c.name, sub: c.plateCode }))
        ),
      countries: () =>
        api.getVisitedCountries().then((list) => list.map((c) => ({ key: c.isoNumeric, main: c.name }))),
      foreign: () =>
        api.getForeignCities().then((list) => list.map((c) => ({ key: c.id, main: c.name, sub: c.countryName }))),
    }

    load[type]()
      .then((list) => setItems(list.sort((a, b) => a.main.localeCompare(b.main, 'tr'))))
      .catch(() => setItems([]))
  }, [type])

  // Esc ile kapat
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{TITLES[type]}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {items === null && <p className="modal-empty">Yükleniyor...</p>}
        {items?.length === 0 && <p className="modal-empty">Henüz bir yer eklemedin.</p>}

        {items?.length > 0 && (
          <ul className="modal-list">
            {items.map((item) => (
              <li key={item.key}>
                <span>{item.main}</span>
                {item.sub && <span className="modal-sub">{item.sub}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}