import { useState } from 'react'
import { api } from '../api'
import { CURRENCIES } from '../money'

// expense: ücret girilirse harcamalara hangi kategoriyle ekleneceği
const TYPES = [
  { id: 'flight', label: 'Uçak', start: 'Kalkış', end: 'Varış', example: 'ör. TK1861 İstanbul → Roma', expense: 'flight' },
  { id: 'bus', label: 'Otobüs', start: 'Kalkış', end: 'Varış', example: 'ör. Trabzon → Rize', expense: 'transport' },
  { id: 'train', label: 'Tren', start: 'Kalkış', end: 'Varış', example: 'ör. Roma → Floransa', expense: 'transport' },
  { id: 'ferry', label: 'Feribot', start: 'Kalkış', end: 'Varış', example: 'ör. Pire → Santorini', expense: 'transport' },
  { id: 'car', label: 'Araç kiralama', start: 'Teslim alma', end: 'Teslim etme', example: 'ör. Avis, Fiat Egea', expense: 'transport' },
  { id: 'hotel', label: 'Konaklama', start: 'Giriş', end: 'Çıkış', example: 'ör. Hotel Artemide', expense: 'stay' },
]
const typeOf = (id) => TYPES.find((t) => t.id === id) ?? TYPES[0]

// "2026-11-10T14:30:00" → "10 Kas Sal 14:30"
const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short', hour: '2-digit', minute: '2-digit' })
    : null

// Süre: otelde gece sayısı, yolculukta saat/dakika
function duration(b) {
  if (!b.startAt || !b.endAt) return null
  const start = new Date(b.startAt)
  const end = new Date(b.endAt)
  if (b.type === 'hotel' || b.type === 'car') {
    const nights = Math.round((new Date(end.toDateString()) - new Date(start.toDateString())) / 86400000)
    return nights > 0 ? `${nights} ${b.type === 'hotel' ? 'gece' : 'gün'}` : null
  }
  const minutes = Math.round((end - start) / 60000)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h} sa${m ? ` ${m} dk` : ''}` : `${m} dk`
}

// Rezervasyon gezinin kaçıncı gününe denk geliyor?
function tripDay(trip, value) {
  if (!trip.startDate || !value) return null
  const day = Math.round((new Date(new Date(value).toDateString()) - new Date(new Date(trip.startDate).toDateString())) / 86400000) + 1
  return day >= 1 && day <= trip.dayCount ? `${day}. gün` : null
}

// Henüz başlamamış en yakın rezervasyon
const nextBookingId = (bookings) =>
  bookings
    .filter((b) => b.startAt && new Date(b.startAt) > new Date())
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0]?.id

const EMPTY = { type: 'flight', title: '', startAt: '', endAt: '', reference: '', note: '', price: '', currency: '' }

export default function TripBookings({ trip, onChange }) {
  const [form, setForm] = useState({ ...EMPTY, currency: trip.currency })
  const [copied, setCopied] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const type = typeOf(form.type)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { price, currency, ...booking } = form
      await api.addBooking(trip.id, { ...booking, startAt: booking.startAt || null, endAt: booking.endAt || null })

      // Ücret girildiyse bütçeye harcama olarak da ekle
      if (price) {
        await api.addExpense(trip.id, {
          category: type.expense,
          description: booking.title,
          amount: Number(price),
          currency,
          expenseDate: booking.startAt ? booking.startAt.slice(0, 10) : null,
        })
      }
      setForm({ ...EMPTY, currency: trip.currency })
      setShowForm(false)
      onChange()
    } catch (err) {
      setError(err.message)
    }
  }

  // PNR'ye tıklayınca panoya kopyala
  const copyRef = async (b) => {
    try {
      await navigator.clipboard.writeText(b.reference)
      setCopied(b.id)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // pano izni yoksa sessizce geç
    }
  }

  const nextId = nextBookingId(trip.bookings)

  const handleDelete = async (b) => {
    if (!confirm(`"${b.title}" silinsin mi?`)) return
    await api.deleteBooking(b.id)
    onChange()
  }

  return (
    <section className="trip-bookings">
      <div className="trip-days-head">
        <h2>Ulaşım ve konaklama</h2>
        {!showForm && <button className="link-btn" onClick={() => setShowForm(true)}>Rezervasyon ekle</button>}
      </div>

      {showForm && (
        <form className="panel booking-form" onSubmit={handleAdd}>
          <label className="field">
            <span>Tür</span>
            <select value={form.type} onChange={set('type')}>
              {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <label className="field span-2">
            <span>Başlık</span>
            <input required maxLength={150} value={form.title} onChange={set('title')} placeholder={type.example} />
          </label>
          <label className="field">
            <span>{type.start}</span>
            <input type="datetime-local" value={form.startAt} onChange={set('startAt')} />
          </label>
          <label className="field">
            <span>{type.end}</span>
            <input type="datetime-local" value={form.endAt} onChange={set('endAt')} />
          </label>
          <label className="field">
            <span>Rezervasyon / PNR no</span>
            <input maxLength={50} value={form.reference} onChange={set('reference')} placeholder="ör. XK4P2L" />
          </label>
          <label className="field">
            <span>Ücret (isteğe bağlı)</span>
            <div className="money-input">
              <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} />
              <select value={form.currency} onChange={set('currency')}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </label>
          <label className="field span-2">
            <span>Not</span>
            <input maxLength={300} value={form.note} onChange={set('note')} placeholder="ör. 1 kabin bagajı dahil" />
          </label>
          {form.price && <p className="panel-hint span-3">Ücret, "Bütçe ve harcamalar" bölümüne de eklenecek.</p>}
          {error && <p className="form-error span-3">{error}</p>}
          <div className="wish-form-actions span-3">
            <button type="button" className="link-btn" onClick={() => setShowForm(false)}>Vazgeç</button>
            <button type="submit" className="primary-btn">Ekle</button>
          </div>
        </form>
      )}

      {trip.bookings.length === 0 ? (
        !showForm && <div className="empty-card">Uçuş, otobüs ya da otel bilgilerini buraya ekleyebilirsin.</div>
      ) : (
        <ul className="booking-list">
          {trip.bookings.map((b) => {
            const t = typeOf(b.type)
            const day = tripDay(trip, b.startAt)
            const length = duration(b)
            return (
              <li key={b.id} className={`booking booking-${b.type} ${b.id === nextId ? 'next' : ''}`}>
                <span className="booking-type">
                  {t.label}
                  {day && <span className="booking-day">{day}</span>}
                </span>
                <div className="booking-body">
                  <div className="booking-title">
                    {b.title}
                    {b.id === nextId && <span className="booking-next">Sıradaki</span>}
                  </div>
                  {(b.startAt || b.endAt) && (
                    <div className="booking-times">
                      {b.startAt && <span>{t.start}: {formatDateTime(b.startAt)}</span>}
                      {b.endAt && <span>{t.end}: {formatDateTime(b.endAt)}</span>}
                      {length && <span className="booking-length">{length}</span>}
                    </div>
                  )}
                  {b.note && <div className="panel-hint">{b.note}</div>}
                </div>
                <span>
                  {b.reference && (
                    <button className="booking-ref" onClick={() => copyRef(b)} title="Kopyalamak için tıkla">
                      {copied === b.id ? 'Kopyalandı' : b.reference}
                    </button>
                  )}
                </span>
                <button className="booking-delete" onClick={() => handleDelete(b)} aria-label="Sil">×</button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}