import { ICONS } from './Sidebar'

// Telefonda ekranın altında duran sekme çubuğu (bilgisayarda CSS ile gizli).
// En sık kullanılan 4 sayfa + geri kalanları açan "Daha fazla".
const TABS = [
  { id: 'home', label: 'Özet' },
  { id: 'world', label: 'Dünya' },
  { id: 'trips', label: 'Geziler' },
  { id: 'memories', label: 'Anılar' },
]

const MORE_ICON = (
  <>
    <circle cx="5.5" cy="12" r="1.4" />
    <circle cx="12" cy="12" r="1.4" />
    <circle cx="18.5" cy="12" r="1.4" />
  </>
)

export default function MobileTabBar({ page, onChange, onMore }) {
  const isMainTab = TABS.some((t) => t.id === page)

  return (
    <nav className="tab-bar" aria-label="Ana menü">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={page === t.id ? 'tab active' : 'tab'}
          onClick={() => onChange(t.id)}
          aria-current={page === t.id ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[t.id]}</svg>
          {t.label}
        </button>
      ))}
      {/* Diğer sayfalar (İstatistikler, Ülkem, Keşfet, Profil...) yandan açılan menüde */}
      <button className={isMainTab ? 'tab' : 'tab active'} onClick={onMore}>
        <svg viewBox="0 0 24 24" aria-hidden="true">{MORE_ICON}</svg>
        Daha fazla
      </button>
    </nav>
  )
}
