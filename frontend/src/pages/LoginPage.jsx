import { useState } from 'react'
import { api } from '../api'
import WorldMiniMap from '../components/WorldMiniMap'

const EMPTY = new Set()

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
           <div className="password-wrap">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="M4 4l16 16" />}
                </svg>
              </button>
            </div>
          </label>

          {isRegister && (
            <label className="field">
              <span>Şifre tekrar</span>
              <input
                required
                type={showPassword ? 'text' : 'password'}
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
