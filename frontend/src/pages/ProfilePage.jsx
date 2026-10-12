import { useEffect, useState } from 'react'
import { api } from '../api'
import { allCountries, countryName } from '../countryNames'

const EMPTY_FORM = { username: '', displayName: '', homeCountryIso: '792', homeCity: '', bio: '' }

// "Elif Alın" → "EA"
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toLocaleUpperCase('tr-TR')
}

export default function ProfilePage({ stats, onUsernameChange, onHomeCountryChange }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => setError('Profil yüklenemedi.'))
  }, [])

  const startEdit = () => {
    setForm({
      username: profile.username,
      displayName: profile.displayName ?? '',
      homeCountryIso: profile.homeCountryIso,
      homeCity: profile.homeCity ?? '',
      bio: profile.bio ?? '',
    })
    setError('')
    setEditing(true)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const updated = await api.updateProfile(form)
      setProfile(updated)
      onUsernameChange(updated.username) // kenar çubuğundaki ad da güncellensin
      onHomeCountryChange(updated.homeCountryIso)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!profile) return <p className="panel-empty">{error || 'Yükleniyor…'}</p>

  const name = profile.displayName || profile.username
  const memberSince = new Date(profile.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <>
      <div className="page-head">
        <h1>Profilim</h1>
      </div>

      <section className="panel profile-card">
        <div className="profile-avatar">{initials(name)}</div>

        {!editing ? (
          <div className="profile-info">
            <h2 className="profile-name">{name}</h2>
            <p className="profile-meta">
              @{profile.username}
              {' · '}{profile.homeCity ? `${profile.homeCity}, ` : ''}{countryName(profile.homeCountryIso)}
              {' · '}{memberSince} tarihinden beri üye
            </p>
            <p className={profile.bio ? 'profile-bio' : 'profile-bio empty'}>
              {profile.bio || 'Henüz kendinden bahsetmedin.'}
            </p>
            <button className="primary-btn" onClick={startEdit}>Profili düzenle</button>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleSave}>
            <label className="field">
                Kullanıcı adı
                <input name="username" value={form.username} onChange={handleChange} minLength={3} maxLength={50} required />
            </label>
            <label className="field">
              Ad soyad
              <input name="displayName" value={form.displayName} onChange={handleChange} maxLength={100} />
            </label>
              <label className="field">
              Ülkem
              <select name="homeCountryIso" value={form.homeCountryIso} onChange={handleChange}>
                {allCountries.map((c) => (
                  <option key={c.iso} value={c.iso}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Şehir
              <input name="homeCity" value={form.homeCity} onChange={handleChange} maxLength={50} placeholder="ör. İzmir" />
            </label>
            <label className="field">
              Hakkımda
              <textarea name="bio" value={form.bio} onChange={handleChange} maxLength={300} rows={3} />
              <span className="field-count">{form.bio.length}/300</span>
            </label>
            {error && <p className="form-error">{error}</p>}
            <div className="profile-actions">
              <button type="button" className="link-btn" onClick={() => setEditing(false)}>Vazgeç</button>
              <button type="submit" className="primary-btn">Kaydet</button>
            </div>
          </form>
        )}
      </section>

      {stats && (
        <section className="profile-stats">
          <div><strong>{stats.visitedCities}</strong><span>il</span></div>
          <div><strong>{stats.visitedCountries}</strong><span>ülke</span></div>
          <div><strong>{stats.visitedForeignCities}</strong><span>yurt dışı şehir</span></div>
        </section>
      )}

      <PasswordForm />
    </>
  )
}

function PasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.changePassword(current, next)
      setCurrent('')
      setNext('')
      setMessage({ type: 'ok', text: 'Şifren değiştirildi.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <section className="panel">
      <h2>Şifre değiştir</h2>
      <form className="trip-form" onSubmit={handleSubmit}>
        <label className="field grow">
          Mevcut şifre
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </label>
        <label className="field grow">
          Yeni şifre
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} minLength={6} required />
        </label>
        <button type="submit" className="primary-btn">Değiştir</button>
      </form>
      {message && <p className={message.type === 'ok' ? 'form-ok' : 'form-error'}>{message.text}</p>}
    </section>
  )
}