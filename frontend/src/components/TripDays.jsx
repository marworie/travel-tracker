import { useState } from 'react'
import { api } from '../api'

// "1. gün" başlığının yanına tarih: başlangıç tarihi varsa gün gün ilerletiyoruz
function dayDate(startDate, dayNumber) {
  if (!startDate) return null
  const d = new Date(startDate)
  d.setDate(d.getDate() + dayNumber - 1)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })
}

function DayCard({ trip, dayNumber, activities, onChange }) {
  const [text, setText] = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await api.addActivity(trip.id, dayNumber, text)
    setText('')
    onChange()
  }

  const handleDelete = async (id) => {
    await api.deleteActivity(id)
    onChange()
  }

  const date = dayDate(trip.startDate, dayNumber)

  return (
    <section className="day-card">
      <h3>
        {dayNumber}. gün
        {date && <span className="day-date">{date}</span>}
      </h3>

      {activities.length === 0 ? (
        <p className="day-empty">Henüz plan yok.</p>
      ) : (
        <ul className="activity-list">
          {activities.map((a) => (
            <li key={a.id}>
              <span>{a.text}</span>
              <button onClick={() => handleDelete(a.id)} aria-label="Sil">×</button>
            </li>
          ))}
        </ul>
      )}

      <form className="activity-form" onSubmit={handleAdd}>
        <input
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
          placeholder="ör. Ayasofya'yı gez"
        />
        <button type="submit">Ekle</button>
      </form>
    </section>
  )
}

export default function TripDays({ trip, onChange }) {
  const days = Array.from({ length: trip.dayCount }, (_, i) => i + 1) // [1, 2, 3, ...]

  const changeDayCount = async (count) => {
    const lost = trip.activities.filter((a) => a.dayNumber > count).length
    if (lost > 0 && !confirm(`Son gün silinecek ve içindeki ${lost} plan da gidecek. Emin misin?`)) return
    await api.setDayCount(trip.id, count)
    onChange()
  }

  return (
    <section className="trip-days">
      <div className="trip-days-head">
        <h2>Gün gün plan</h2>
        <div className="day-stepper">
          <button onClick={() => changeDayCount(trip.dayCount - 1)} disabled={trip.dayCount <= 1} aria-label="Gün azalt">−</button>
          <span>{trip.dayCount} gün</span>
          <button onClick={() => changeDayCount(trip.dayCount + 1)} disabled={trip.dayCount >= 60} aria-label="Gün ekle">+</button>
        </div>
      </div>

      <div className="day-grid">
        {days.map((n) => (
          <DayCard
            key={n}
            trip={trip}
            dayNumber={n}
            activities={trip.activities.filter((a) => a.dayNumber === n)}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  )
}