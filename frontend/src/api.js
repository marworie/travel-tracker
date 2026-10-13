import { auth } from './auth'

// Yayında .env.production dosyasındaki adres, yerelde localhost kullanılır
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
// Yüklenen dosyaların adresi: http://localhost:5000/uploads/...
export const FILE_BASE = API_URL.replace(/\/api$/, '')

// Tüm istekler buradan geçer: token varsa "Authorization" başlığına eklenir.
// Backend 401 dönerse oturum düşmüş demektir → uygulamaya haber veriyoruz.
async function send(path, options = {}) {
  const token = auth.get()?.token
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      // Dosya yüklerken (FormData) Content-Type'ı tarayıcı kendisi ayarlar
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (res.status === 401 && !path.startsWith('/auth')) {
    auth.clear()
    window.dispatchEvent(new Event('auth:logout'))
  }
  if (!res.ok) {
    // Backend'in gönderdiği hata mesajını (ör. "Bu kullanıcı adı alınmış.") aynen ilet
    const message = await res.text()
    throw new Error(message || `API hatası: ${res.status}`)
  }
  return res
}

// JSON cevap bekleyen istekler
const request = (path, options) => send(path, options).then((res) => res.json())

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getCities: () => request('/cities'),
  toggleCity: (plateCode) => request(`/cities/${plateCode}/toggle`, { method: 'POST' }),

  getVisitedCountries: () => request('/countries'),
  toggleCountry: (isoNumeric, name) =>
    request(`/countries/${isoNumeric}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getForeignCities: () => request('/foreign-cities'),
  addForeignCity: (isoNumeric, countryName, cityName) =>
    request('/foreign-cities', {
      method: 'POST',
      body: JSON.stringify({ isoNumeric, countryName, cityName }),
    }),
  deleteForeignCity: (id) => send(`/foreign-cities/${id}`, { method: 'DELETE' }),

  searchWorldCities: (iso, q = '') =>
    request(`/world-cities?iso=${iso}&q=${encodeURIComponent(q)}`),

  getUnescoSites: (iso) => request(`/unesco?iso=${iso}`),
  getUnescoCountries: () => request('/unesco/countries'),
  getSavedUnesco: () => request('/unesco/saved'),
  toggleUnescoWanted: (id) => request(`/unesco/${id}/wanted`, { method: 'POST' }),
  toggleUnescoVisited: (id) => request(`/unesco/${id}/visited`, { method: 'POST' }),

  getTrips: () => request('/trips'),
  getTrip: (id) => request(`/trips/${id}`),
  createTrip: (trip) => request('/trips', { method: 'POST', body: JSON.stringify(trip) }),
  deleteTrip: (id) => send(`/trips/${id}`, { method: 'DELETE' }),
  addStop: (tripId, stop) =>
    request(`/trips/${tripId}/stops`, { method: 'POST', body: JSON.stringify(stop) }),
  deleteStop: (stopId) => send(`/trips/stops/${stopId}`, { method: 'DELETE' }),
  moveStop: (stopId, direction) =>
    send(`/trips/stops/${stopId}/move?direction=${direction}`, { method: 'POST' }),
    addActivity: (tripId, dayNumber, text) =>
    request(`/trips/${tripId}/activities`, { method: 'POST', body: JSON.stringify({ dayNumber, text }) }),
    deleteActivity: (activityId) => send(`/trips/activities/${activityId}`, { method: 'DELETE' }),
    reorderActivities: (tripId, dayNumber, activityIds) =>
      send(`/trips/${tripId}/activities/order`, { method: 'PUT', body: JSON.stringify({ dayNumber, activityIds }) }),
    moveActivity: (activityId, direction) =>
    send(`/trips/activities/${activityId}/move?direction=${direction}`, { method: 'POST' }),
    setDayCount: (tripId, dayCount) =>
      send(`/trips/${tripId}/days`, { method: 'PUT', body: JSON.stringify({ dayCount }) }),
    setBudget: (tripId, budget) =>
    send(`/trips/${tripId}/budget`, { method: 'PUT', body: JSON.stringify(budget) }),
    addExpense: (tripId, expense) =>
      request(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(expense) }),
    deleteExpense: (expenseId) => send(`/trips/expenses/${expenseId}`, { method: 'DELETE' }),
    getWishes: () => request('/wishes'),
    addWish: (wish) => request('/wishes', { method: 'POST', body: JSON.stringify(wish) }),
    toggleWishDone: (id) => request(`/wishes/${id}/done`, { method: 'POST' }),
    deleteWish: (id) => send(`/wishes/${id}`, { method: 'DELETE' }),
    addBooking: (tripId, booking) =>
    request(`/trips/${tripId}/bookings`, { method: 'POST', body: JSON.stringify(booking) }),
  deleteBooking: (bookingId) => send(`/trips/bookings/${bookingId}`, { method: 'DELETE' }),
  setRating: (tripId, rating) =>
    send(`/trips/${tripId}/rating`, { method: 'PUT', body: JSON.stringify({ rating }) }),
  addNote: (tripId, note) =>
    request(`/trips/${tripId}/notes`, { method: 'POST', body: JSON.stringify(note) }),
  deleteNote: (noteId) => send(`/trips/notes/${noteId}`, { method: 'DELETE' }),
  uploadFile: (tripId, file, kind, caption = '') => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    form.append('caption', caption)
    return request(`/trips/${tripId}/files`, { method: 'POST', body: form })
  },
  deleteFile: (fileId) => send(`/trips/files/${fileId}`, { method: 'DELETE' }),
  getLandmarks: () => request('/landmarks'),
  getSavedLandmarks: () => request('/landmarks/saved'),
  toggleLandmarkWanted: (id) => request(`/landmarks/${id}/wanted`, { method: 'POST' }),
  toggleLandmarkVisited: (id) => request(`/landmarks/${id}/visited`, { method: 'POST' }),

  getStats: () => request('/stats'),

  getRegions: (iso) => request(`/regions/${iso}`),
  toggleRegion: (iso, regionName) =>
  request(`/regions/${iso}/toggle`, { method: 'POST', body: JSON.stringify({ regionName }) }),
  getProfile: () => request('/profile'),
  updateProfile: (profile) => request('/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  changePassword: (currentPassword, newPassword) =>
  send('/profile/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
}
