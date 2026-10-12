import { useEffect, useState } from 'react'
import { api } from '../api'
import { CURRENCIES, convert, fetchRates, formatMoney } from '../money'
import { formatDate } from '../countryNames'

export const CATEGORIES = [
  { id: 'transport', label: 'Ulaşım' },
  { id: 'stay', label: 'Konaklama' },
  { id: 'flight', label: 'Uçak bileti' },
  { id: 'food', label: 'Yemek' },
  { id: 'activity', label: 'Etkinlik' },
  { id: 'personal', label: 'Kişisel harcamalar' },
  { id: 'other', label: 'Diğer' },
]
const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id

export default function TripBudget({ trip, onChange }) {
  const [rates, setRates] = useState(null)
  const [ratesError, setRatesError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [budgetForm, setBudgetForm] = useState(null)
  const emptyExpense = { category: 'food', description: '', amount: '', currency: trip.currency, expenseDate: '' }
  const [expense, setExpense] = useState(emptyExpense)
  const [error, setError] = useState('')
  const [view, setView] = useState(trip.currency) // tutarların gösterileceği para birimi

  // Gezinin para birimine göre kurları çek
  useEffect(() => {
    setRatesError(false)
    fetchRates(trip.currency).then(setRates).catch(() => setRatesError(true))
  }, [trip.currency])

  // ---- Hesaplamalar (hepsi gezinin para biriminde) ----
  const converted = trip.expenses.map((e) => ({ ...e, value: convert(e.amount, e.currency, rates) }))
  const spent = converted.reduce((sum, e) => sum + (e.value ?? 0), 0)
  const unknown = converted.filter((e) => e.value == null).length // kuru bulunamayanlar
  const remaining = trip.budget != null ? trip.budget - spent : null
  const usedPct = trip.budget ? Math.min((spent / trip.budget) * 100, 100) : 0
  const byCategory = CATEGORIES.map((c) => ({
    ...c,
    total: converted.filter((e) => e.category === c.id).reduce((sum, e) => sum + (e.value ?? 0), 0),
  })).filter((c) => c.total > 0)

  // ---- Bütçe formu ----
  const startEdit = () => {
    setBudgetForm({ budget: trip.budget ?? '', currency: trip.currency, travelerCount: trip.travelerCount })
    setEditing(true)
  }

  const saveBudget = async (e) => {
    e.preventDefault()
    await api.setBudget(trip.id, {
      budget: budgetForm.budget === '' ? null : Number(budgetForm.budget),
      currency: budgetForm.currency,
      travelerCount: Number(budgetForm.travelerCount),
    })
    setEditing(false)
    onChange()
  }

  // ---- Harcama ekle / sil ----
  const addExpense = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.addExpense(trip.id, {
        ...expense,
        amount: Number(expense.amount),
        expenseDate: expense.expenseDate || null,
      })
      setExpense({ ...emptyExpense, category: expense.category, currency: expense.currency })
      onChange()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteExpense = async (id) => {
    await api.deleteExpense(id)
    onChange()
  }

// Gösterim: gezinin para birimindeki tutarı seçilen birime çevir (1 TRY = rates.EUR EUR)
const factor = view === trip.currency ? 1 : rates?.[view]
const money = (amount) => (factor ? formatMoney(amount * factor, view) : formatMoney(amount, trip.currency))

  return (
    <section className="trip-budget">
      <div className="trip-days-head">
        <h2>Bütçe ve harcamalar</h2>
        <div className="budget-head-actions">
        <label className="view-currency">
            Göster:
            <select value={view} onChange={(e) => setView(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
        </label>
        {!editing && <button className="link-btn" onClick={startEdit}>Bütçeyi düzenle</button>}
        </div>
      </div>
      {view !== trip.currency && factor && (
        <p className="panel-hint rate-note">1 {view} = {formatMoney(1 / factor, trip.currency)} (güncel kur)</p>
      )}

      {editing && (
        <form className="panel trip-form budget-form" onSubmit={saveBudget}>
          <label className="field">
            <span>Toplam bütçe</span>
            <input type="number" min={0} step="0.01" value={budgetForm.budget}
              onChange={(e) => setBudgetForm({ ...budgetForm, budget: e.target.value })} placeholder="ör. 25000" />
          </label>
          <label className="field">
            <span>Para birimi</span>
            <select value={budgetForm.currency} onChange={(e) => setBudgetForm({ ...budgetForm, currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Kaç kişi?</span>
            <input type="number" min={1} max={50} required value={budgetForm.travelerCount}
              onChange={(e) => setBudgetForm({ ...budgetForm, travelerCount: e.target.value })} />
          </label>
          <button type="button" className="link-btn" onClick={() => setEditing(false)}>Vazgeç</button>
          <button type="submit" className="primary-btn">Kaydet</button>
        </form>
      )}

      <div className="budget-summary">
        <div><span>Bütçe</span><strong>{trip.budget != null ? money(trip.budget) : '–'}</strong></div>
        <div><span>Harcanan</span><strong>{money(spent)}</strong></div>
        <div>
          <span>Kalan</span>
          <strong className={remaining != null && remaining < 0 ? 'over' : ''}>
            {remaining != null ? money(remaining) : '–'}
          </strong>
        </div>
        <div><span>Kişi başı ({trip.travelerCount} kişi)</span><strong>{money(spent / trip.travelerCount)}</strong></div>
      </div>

      {trip.budget != null && (
        <div className="budget-bar">
          <span className={spent > trip.budget ? 'over' : ''} style={{ width: `${usedPct}%` }} />
        </div>
      )}

      {ratesError && <p className="form-error">Döviz kurları alınamadı; farklı para birimindeki harcamalar toplama katılmadı.</p>}
      {!ratesError && unknown > 0 && <p className="panel-hint">{unknown} harcamanın kuru bulunamadı, toplama katılmadı.</p>}

      {byCategory.length > 0 && (
        <ul className="region-list category-list">
          {byCategory.map((c) => (
            <li key={c.id}>
              <span className="region-name">{c.label}</span>
              <span className="region-bar"><span style={{ width: `${(c.total / spent) * 100}%` }} /></span>
              <span className="region-count">{money(c.total)}</span>
            </li>
          ))}
        </ul>
      )}

      <form className="panel stop-form expense-form" onSubmit={addExpense}>
        <label className="field">
          <span>Kategori</span>
          <select value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="field grow">
          <span>Açıklama</span>
            <input maxLength={200} value={expense.description} placeholder="İsteğe bağlı"
            onChange={(e) => setExpense({ ...expense, description: e.target.value })} />
        </label>
        <label className="field">
          <span>Tutar</span>
          <input required type="number" min="0.01" step="0.01" value={expense.amount} className="amount-input"
            onChange={(e) => setExpense({ ...expense, amount: e.target.value })} />
        </label>
        <label className="field">
          <span>Birim</span>
          <select value={expense.currency} onChange={(e) => setExpense({ ...expense, currency: e.target.value })}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Tarih</span>
          <input type="date" value={expense.expenseDate} onChange={(e) => setExpense({ ...expense, expenseDate: e.target.value })} />
        </label>
        <button type="submit" className="primary-btn">Ekle</button>
      </form>
      {error && <p className="form-error">{error}</p>}

      {converted.length > 0 && (
        <ul className="expense-list">
          {converted.map((e) => (
            <li key={e.id}>
              <span className="expense-cat">{categoryLabel(e.category)}</span>
              <span className="expense-desc">
                {e.description || categoryLabel(e.category)}
                {e.expenseDate && <span className="panel-hint"> · {formatDate(e.expenseDate)}</span>}
              </span>
              <span className="expense-amount">
                {formatMoney(e.amount, e.currency)}
                {e.currency !== view && e.value != null && (
                  <span className="panel-hint"> ≈ {money(e.value)}</span>
                )}
              </span>
              <button onClick={() => deleteExpense(e.id)} aria-label="Sil">×</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}