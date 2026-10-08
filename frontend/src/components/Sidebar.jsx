// Sade çizgi ikonlar (24x24, stroke ile çiziliyor)
const ICONS = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
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
  trips: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16" />
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
  { id: 'turkey', label: 'Türkiye' },
  { id: 'world', label: 'Dünya' },
  { id: 'explore', label: 'Keşfet' },
  { id: 'trips', label: 'Gezi planları' },
]

export default function Sidebar({ page, onChange, username, onLogout }) {
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

      <div className="sidebar-user">
        <span className="user-name">{username}</span>
        <button className="logout-btn" onClick={onLogout}>Çıkış yap</button>
      </div>
    </aside>
  )
}
