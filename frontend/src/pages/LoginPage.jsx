import { useState } from 'react'
import { api } from '../api'
import WorldMiniMap from '../components/WorldMiniMap'

const EMPTY = new Set()

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setPassword('')
    setPassword2('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isRegister && password !== password2) {
      setError('Şifreler aynı değil.')
      return
    }

    setLoading(true)
    try {
      const result = isRegister
        ? await api.register(username, password)
        : await api.login(username, password)
      onLogin(result) // { token, username }
    } catch (err) {
      setError(err.message.includes('Failed to fetch')
        ? 'Sunucuya ulaşılamadı. Backend çalışıyor mu?'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-layout">
      <aside className="login-art" aria-hidden="true">
        <div className="login-brand">Gezi Haritam</div>
        <div className="login-map"><WorldMiniMap visited={EMPTY} /></div>
        <p className="login-tagline">Gittiğin her yer, tek haritada.</p>
      </aside>

      <main className="login-main">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1>{isRegister ? 'Hesap oluştur' : 'Giriş yap'}</h1>

          <div className="segmented login-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'on' : ''} onClick={() => switchMode('login')}>
              Giriş yap
            </button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'on' : ''} onClick={() => switchMode('register')}>
              Kayıt ol
            </button>
          </div>

          <label className="field">
            <span>Kullanıcı adı</span>
            <input
              required
              autoFocus
              minLength={3}
              maxLength={50}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Şifre</span>
            <input
              required
              type="password"
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {isRegister && (
            <label className="field">
              <span>Şifre tekrar</span>
              <input
                required
                type="password"
                minLength={6}
                autoComplete="new-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </label>
          )}

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="primary-btn login-submit" disabled={loading}>
            {loading ? 'Bekleyin...' : isRegister ? 'Hesap oluştur' : 'Giriş yap'}
          </button>

          {isRegister && <p className="login-hint">Şifre en az 6 karakter olmalı.</p>}
        </form>
      </main>
    </div>
  )
}
