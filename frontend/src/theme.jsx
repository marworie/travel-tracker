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
  localStorage.setItem(KEY, theme)
}