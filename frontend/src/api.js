// Backend adresi — dotnet run çıktısındaki porta göre değiştir
const API_URL = 'http://localhost:5000/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API hatası: ${res.status}`)
  return res.json()
}

export const api = {
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
  deleteForeignCity: (id) =>
    fetch(`${API_URL}/foreign-cities/${id}`, { method: 'DELETE' }),

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
  deleteTrip: (id) => fetch(`${API_URL}/trips/${id}`, { method: 'DELETE' }),
  addStop: (tripId, stop) =>
    request(`/trips/${tripId}/stops`, { method: 'POST', body: JSON.stringify(stop) }),
  deleteStop: (stopId) => fetch(`${API_URL}/trips/stops/${stopId}`, { method: 'DELETE' }),
  moveStop: (stopId, direction) =>
    fetch(`${API_URL}/trips/stops/${stopId}/move?direction=${direction}`, { method: 'POST' }),

  getLandmarks: () => request('/landmarks'),
  getSavedLandmarks: () => request('/landmarks/saved'),
  toggleLandmarkWanted: (id) => request(`/landmarks/${id}/wanted`, { method: 'POST' }),
  toggleLandmarkVisited: (id) => request(`/landmarks/${id}/visited`, { method: 'POST' }),

  getStats: () => request('/stats'),
}
