import { useEffect, useState } from 'react'
import { FORECAST_DAYS, describeWeather, fetchForecast, toIsoDate } from '../weather'

const dayName = (iso) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })

export default function TripWeather({ trip }) {
  // Koordinatı olan duraklar (aynı yer iki kez varsa bir kez göster)
  const places = trip.stops.filter((s, i, all) =>
    s.latitude != null && all.findIndex((x) => x.place === s.place) === i)

  const [placeId, setPlaceId] = useState(places[0]?.id)
  const [days, setDays] = useState(null)
  const [error, setError] = useState(false)

  const place = places.find((p) => p.id === placeId) ?? places[0]

  // Tahmin aralığı: gezinin bugünden sonraki kısmı, en fazla 16 gün ileriye kadar
  const today = new Date()
  const lastForecastDay = new Date(); lastForecastDay.setDate(today.getDate() + FORECAST_DAYS - 1)
  const start = trip.startDate?.slice(0, 10)
  const end = (trip.endDate ?? trip.startDate)?.slice(0, 10)
  const from = start && (start > toIsoDate(today) ? start : toIsoDate(today))
  const to = end && (end < toIsoDate(lastForecastDay) ? end : toIsoDate(lastForecastDay))

  const isPast = end && end < toIsoDate(today)
  const tooFar = start && start > toIsoDate(lastForecastDay)
  const canFetch = place && from && to && !isPast && !tooFar

  useEffect(() => {
    if (!canFetch) return
    setDays(null)
    setError(false)
    fetchForecast(place.latitude, place.longitude, from, to).then(setDays).catch(() => setError(true))
  }, [place?.id, from, to, canFetch])

  if (isPast) return null // geçmiş gezide hava durumu göstermeye gerek yok

  return (
    <section className="trip-weather">
      <h2 className="section-title">Hava durumu</h2>

      {!start && <p className="panel-hint">Hava durumunu görmek için geziye tarih ekle.</p>}
      {start && places.length === 0 && <p className="panel-hint">Hava durumunu görmek için rotaya bir durak ekle.</p>}
      {tooFar && place && (
        <p className="panel-hint">Tahmin en fazla {FORECAST_DAYS} gün öncesinden görünür. Geziye yaklaşınca tekrar bak.</p>
      )}

      {canFetch && (
        <>
          {places.length > 1 && (
            <div className="chips">
              {places.map((p) => (
                <button key={p.id} className={p.id === place.id ? 'chip active' : 'chip'} onClick={() => setPlaceId(p.id)}>
                  {p.place}
                </button>
              ))}
            </div>
          )}

          {error && <p className="form-error">Hava durumu alınamadı.</p>}
          {!days && !error && <p className="panel-hint">Yükleniyor...</p>}

          {days && (
            <ul className="weather-days">
              {days.map((d) => {
                const w = describeWeather(d.code)
                return (
                  <li key={d.date} title={w.label}>
                    <span className="weather-date">{dayName(d.date)}</span>
                    <span className="weather-icon" aria-label={w.label}>{w.icon}</span>
                    <span className="weather-temp"><strong>{d.max}°</strong> {d.min}°</span>
                    {d.rain != null && <span className="weather-rain">💧 %{d.rain}</span>}
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
