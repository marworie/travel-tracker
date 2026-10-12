import { useState } from 'react'
import { api } from '../api'
import { allCountries, countryName } from '../countryNames'
import { CURRENCIES, formatMoney } from '../money'

const CATEGORIES = [
  { id: 'nature', label: 'Doğa' },
  { id: 'history', label: 'Tarih' },
  { id: 'food', label: 'Yemek' },
  { id: 'sea', label: 'Deniz' },
  { id: 'adventure', label: 'Macera' },
  { id: 'city', label: 'Şehir' },
]
const PRIORITIES = { 1: 'Düşük', 2: 'Orta', 3: 'Yüksek' }
const SEASONS = { spring: 'İlkbahar', summer: 'Yaz', autumn: 'Sonbahar', winter: 'Kış' }
const label = (list, id) => list.find((x) => x.id === id)?.label ?? id

const EMPTY = {
  name: '', countryIso: '792', city: '', category: 'nature', priority: 2,
  estimatedBudget: '', currency: 'TRY', bestSeason: '', note: '',
}

export default function WishlistPage({ wishes, foreignCities, onChange }) {
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState('open')       // 'open' | 'done'
  const [category, setCategory] = useState('all')
  const [error, setError] = useState('')

  // Yurt dışında gittiğin şehirlerden biriyse "gidildi" say (otomatik tamamlama)
  const visitedCityKeys = new Set(foreignCities.map((c) => `${c.isoNumeric}|${c.name.toLocaleLowerCase('tr')}`))
  const autoDone = (w) => !!w.city && visitedCityKeys.has(`${w.countryIso}|${w.city.toLocaleLowerCase('tr')}`)
  const isDone = (w) => w.isDone || autoDone(w)

  const open = wishes.filter((w) => !isDone(w))
  const done = wishes.filter(isDone)
  const list = (tab === 'open' ? open : done).filter((w) => category === 'all' || w.category === category)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.addWish({
        ...form,
        priority: Number(form.priority),
        estimatedBudget: form.estimatedBudget === '' ? null : Number(form.estimatedBudget),
        bestSeason: form.bestSeason || null,
      })
      setForm({ ...EMPTY, countryIso: form.countryIso })
      setShowForm(false)
      onChange()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleDone = async (id) => {
    await api.toggleWishDone(id)
    onChange()
  }

  const remove = async (w) => {
    if (!confirm(`"${w.name}" listeden silinsin mi?`)) return
    await api.deleteWish(w.id)
    onChange()
  }

  return (
    <>
      <div className="page-head trip-head">
        <div>
          <h1>Gitmek istediklerim</h1>
          <p className="subtitle">Haritada sarı görünen ülkeler bu listeden geliyor.</p>
        </div>
        {!showForm && <button className="primary-btn" onClick={() => setShowForm(true)}>Yer ekle</button>}
      </div>

      {showForm && (
        <form className="panel wish-form" onSubmit={handleAdd}>
          <label className="field wide">
            <span>Yer adı</span>
            <input required maxLength={150} value={form.name} onChange={set('name')} placeholder="ör. Kuzey ışıkları" />
          </label>
          <label className="field">
            <span>Ülke</span>
            <select value={form.countryIso} onChange={set('countryIso')}>
              {allCountries.map((c) => <option key={c.iso} value={c.iso}>{c.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Şehir (isteğe bağlı)</span>
            <input maxLength={100} value={form.city} onChange={set('city')} placeholder="ör. Tromsø" />
          </label>
          <label className="field">
            <span>Kategori</span>
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Öncelik</span>
            <select value={form.priority} onChange={set('priority')}>
              {[3, 2, 1].map((p) => <option key={p} value={p}>{PRIORITIES[p]}</option>)}
            </select>
          </label>
          <label className="field">
            <span>En uygun mevsim</span>
            <select value={form.bestSeason} onChange={set('bestSeason')}>
              <option value="">Fark etmez</option>
              {Object.entries(SEASONS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Tahmini bütçe</span>
            <div className="money-input">
              <input type="number" min={0} step="0.01" value={form.estimatedBudget} onChange={set('estimatedBudget')} />
              <select value={form.currency} onChange={set('currency')}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </label>
          <label className="field wide">
            <span>Not</span>
            <input maxLength={500} value={form.note} onChange={set('note')} placeholder="ör. Eylül–Mart arası görülüyor" />
          </label>
          {error && <p className="form-error wide">{error}</p>}
          <div className="wish-form-actions wide">
            <button type="button" className="link-btn" onClick={() => setShowForm(false)}>Vazgeç</button>
            <button type="submit" className="primary-btn">Ekle</button>
          </div>
        </form>
      )}

      <div className="wish-toolbar">
        <div className="segmented">
          <button className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>Gidilecek ({open.length})</button>
          <button className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>Gidildi ({done.length})</button>
        </div>
        <div className="country-chips">
          <button className={category === 'all' ? 'chip active' : 'chip'} onClick={() => setCategory('all')}>Tümü</button>
          {CATEGORIES.map((c) => (
            <button key={c.id} className={category === c.id ? 'chip active' : 'chip'} onClick={() => setCategory(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty-card">
          {tab === 'open' ? 'Listen boş. "Yer ekle" ile ilk hayalini ekle.' : 'Henüz tamamlanan yer yok.'}
        </div>
      ) : (
        <div className="wish-grid">
          {list.map((w) => (
            <article key={w.id} className={`wish-card priority-${w.priority} ${isDone(w) ? 'done' : ''}`}>
              <div className="wish-top">
                <span className="wish-tag">{label(CATEGORIES, w.category)}</span>
                <span className="wish-priority">{PRIORITIES[w.priority]} öncelik</span>
              </div>
              <h3>{w.name}</h3>
              <p className="landmark-where">{w.city ? `${w.city}, ` : ''}{countryName(w.countryIso)}</p>
              <p className="wish-meta">
                {w.bestSeason && <span>{SEASONS[w.bestSeason]}</span>}
                {w.estimatedBudget != null && <span>≈ {formatMoney(w.estimatedBudget, w.currency)}</span>}
              </p>
              {w.note && <p className="wish-note">{w.note}</p>}
              {autoDone(w) && !w.isDone && <p className="panel-hint">Bu şehre gittiğin için otomatik tamamlandı.</p>}
              <div className="unesco-actions">
                {!autoDone(w) && (
                  <button className={w.isDone ? 'on-visited' : ''} onClick={() => toggleDone(w.id)}>
                    {w.isDone ? 'Gidildi' : 'Gittim'}
                  </button>
                )}
                <button onClick={() => remove(w)}>Sil</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}