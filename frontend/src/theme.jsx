// Açık / karanlık tema. Seçim tarayıcıda saklanır, sayfa yenilenince hatırlanır.
const KEY = 'theme'

export function getInitialTheme() {
  const saved = localStorage.getItem(KEY)
  if (saved === 'light' || saved === 'dark') return saved
  // Hiç seçilmemişse bilgisayarın ayarına bak
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme // <html data-theme="dark">
  // telefonda tarayıcının/uygulamanın ust cubuğu da temanın rengini alsın
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#1b2320' : '#f7f8f5')
  localStorage.setItem(KEY, theme)
}