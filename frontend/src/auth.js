// Giriş bilgisini tarayıcıda saklar (sayfa yenilense de oturum kalsın diye)
const KEY = 'travel-tracker-auth'

export const auth = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(KEY))
    } catch {
      return null
    }
  },
  save: (data) => localStorage.setItem(KEY, JSON.stringify(data)), // { token, username }
  clear: () => localStorage.removeItem(KEY),
}
