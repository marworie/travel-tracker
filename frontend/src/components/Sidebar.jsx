// Sade çizgi ikonlar (24x24, stroke ile çiziliyor)
const ICONS = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
    stats: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V8M17 20v-9" />
    </>
  ),
  turkey: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  world: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 3.4 5.4 3.4 8.5s-1 6.1-3.4 8.5c-2.4-2.4-3.4-5.4-3.4-8.5s1-6.1 3.4-8.5z" />
    </>
  ),
    regions: (
    <>
      <path d="M4 6.5 9 4.5l6 2 5-2v13l-5 2-6-2-5 2z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </>
  ),
  wishlist: (
    <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />
  ),
  trips: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16" />
    </>
  ),
  memories: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 17 5-4.5 3.5 3 3-2.5 4.5 4" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  explore: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
}

const PAGES = [
  { id: 'home', label: 'Özet' },
  { id: 'stats', label: 'İstatistikler '},
  { id: 'turkey', label: 'Ülkem' },
  { id: 'world', label: 'Dünya' },
  { id: 'regions', label: 'Gezdiğim ülkeler' },
  { id: 'explore', label: 'Keşfet' },
  { id: 'wishlist', label: 'Gidilecekler' },
  { id: 'trips', label: 'Gezi planları' },
  { id: 'memories', label: 'Anılar' },
  { id: 'profile', label: 'Profilim' },
]

export default function Sidebar({ page, onChange, username, onLogout, theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5V4l-6 2.5z M9 4v13 M15 6.5v13" />
        </svg>
        Gezi Haritam
      </div>

      <nav>
        {PAGES.map((p) => (
          <button
            key={p.id}
            className={page === p.id ? 'nav-item active' : 'nav-item'}
            onClick={() => onChange(p.id)}
            aria-current={page === p.id ? 'page' : undefined}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[p.id]}</svg>
            {p.label}
          </button>
        ))}
      </nav>
        <button className="theme-btn" onClick={onToggleTheme}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {theme === 'dark'
            ? <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>
            : <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />}
        </svg>
        {theme === 'dark' ? 'Aydınlık mod' : 'Karanlık mod'}
      </button>
      <div className="sidebar-user">
        <button
          className={page === 'profile' ? 'user-link active' : 'user-link'}
          onClick={() => onChange('profile')}
        >
          <span className="user-avatar">{username[0].toLocaleUpperCase('tr-TR')}</span>
          {username}
        </button>        
        <button className="logout-btn" onClick={onLogout}>Çıkış yap</button>
      </div>
    </aside>
  )
}
