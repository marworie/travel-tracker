import { useState } from 'react'
import { api } from '../api'

// "1. gün" başlığının yanına tarih: başlangıç tarihi varsa gün gün ilerletiyoruz
function dayDate(startDate, dayNumber) {
  if (!startDate) return null
  const d = new Date(startDate)
  d.setDate(d.getDate() + dayNumber - 1)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })
}

function DayCard({ trip, dayNumber, activities, onChange, drag }) {
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null) // düzenlenen maddenin id'si
  const [editText, setEditText] = useState('')

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

  const startEdit = (a) => {
    setEditingId(a.id)
    setEditText(a.text)
  }

  const saveEdit = async () => {
    const id = editingId
    setEditingId(null)
    const original = activities.find((a) => a.id === id)
    // Boşsa ya da değişmediyse sunucuya gitmeye gerek yok
    if (!editText.trim() || editText.trim() === original?.text) return
    await api.updateActivity(id, editText)
    onChange()
  }

  // Fare bir maddenin üst yarısındaysa onun önüne, alt yarısındaysa arkasına bırakılacak
  const handleDragOverItem = (e, index) => {
    e.preventDefault() // bu satır olmazsa tarayıcı bırakmaya izin vermez
    e.stopPropagation()
    const box = e.currentTarget.getBoundingClientRect()
    const after = e.clientY > box.top + box.height / 2
    drag.setOver({ day: dayNumber, pos: after ? index + 1 : index })
  }

  // Maddelerin dışında, kartın boş bir yerine gelinirse en sona bırakılır
  const handleDragOverCard = (e) => {
    if (!drag.dragged) return
    e.preventDefault()
    drag.setOver({ day: dayNumber, pos: activities.length })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    drag.drop(dayNumber, activities)
  }

  const isOver = drag.over?.day === dayNumber
  const date = dayDate(trip.startDate, dayNumber)

  return (
    <section
      className={isOver ? 'day-card drop-target' : 'day-card'}
      onDragOver={handleDragOverCard}
      onDrop={handleDrop}
    >
      <h3>
        {dayNumber}. gün
        {date && <span className="day-date">{date}</span>}
      </h3>

      {activities.length === 0 ? (
        <p className="day-empty">{drag.dragged ? 'Buraya bırak' : 'Henüz plan yok.'}</p>
      ) : (
        <ul className="activity-list">
          {activities.map((a, i) => {
            const classes = [
              drag.dragged?.id === a.id && 'dragging',
              isOver && drag.over.pos === i && 'drop-before',
              isOver && drag.over.pos === i + 1 && i === activities.length - 1 && 'drop-after',
            ].filter(Boolean).join(' ')

            return (
              <li
                key={a.id}
                className={classes}
                draggable={editingId !== a.id} // yazı düzenlerken sürüklenmesin
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', String(a.id)) // bazı tarayıcılar bunu şart koşuyor
                  drag.setDragged({ id: a.id, day: dayNumber })
                }}
                onDragEnd={drag.reset}
                onDragOver={(e) => handleDragOverItem(e, i)}
              >
                <span className="drag-handle" aria-hidden="true">⋮⋮</span>
                {editingId === a.id ? (
                  <input
                    className="activity-edit"
                    autoFocus
                    maxLength={300}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveEdit} // kutunun dışına tıklayınca kaydet
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur() // Enter → blur → saveEdit
                      if (e.key === 'Escape') setEditingId(null)  // Esc → vazgeç
                    }}
                  />
                ) : (
                  <span className="activity-text" onDoubleClick={() => startEdit(a)} title="Düzenlemek için çift tıkla">
                    {a.text}
                  </span>
                )}
                {editingId !== a.id && (
                  <button className="activity-edit-btn" onClick={() => startEdit(a)} aria-label="Düzenle">✎</button>
                )}
                <button className="activity-delete" onClick={() => handleDelete(a.id)} aria-label="Sil">×</button>
              </li>
            )
          })}
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

  // Sürükle-bırak durumu burada tutuluyor ki maddeler günler arasında da taşınabilsin
  const [dragged, setDragged] = useState(null) // { id, day } sürüklenen madde
  const [over, setOver] = useState(null)       // { day, pos } bırakılacak yer

  const reset = () => { setDragged(null); setOver(null) }

  // Hedef günün yeni sırasını hesaplayıp backend'e gönder
  const drop = async (day, targetActivities) => {
    if (!dragged || !over) return reset()

    const ids = targetActivities.map((a) => a.id)
    // pos, sürüklenen madde listede dururkenki konuma göre; onu çıkarınca kayma olmasın diye düzeltiyoruz
    const before = ids.slice(0, over.pos).filter((id) => id !== dragged.id).length
    const newOrder = ids.filter((id) => id !== dragged.id)
    newOrder.splice(before, 0, dragged.id)

    reset()
    await api.reorderActivities(trip.id, day, newOrder)
    onChange()
  }

  const drag = { dragged, setDragged, over, setOver, reset, drop }

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
            drag={drag}
          />
        ))}
      </div>
    </section>
  )
}
