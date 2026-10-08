import { auth } from './auth'

// Backend adresi — dotnet run çıktısındaki porta göre değiştir
const API_URL = 'http://localhost:5000/api'

// Tüm istekler buradan geçer: token varsa "Authorization" başlığına eklenir.
// Backend 401 dönerse oturum düşmüş demektir → uygulamaya haber veriyoruz.
async function send(path, options = {}) {
  const token = auth.get()?.token
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

  getLandmarks: () => request('/landmarks'),
  getSavedLandmarks: () => request('/landmarks/saved'),
  toggleLandmarkWanted: (id) => request(`/landmarks/${id}/wanted`, { method: 'POST' }),
  toggleLandmarkVisited: (id) => request(`/landmarks/${id}/visited`, { method: 'POST' }),

  getStats: () => request('/stats'),
}
