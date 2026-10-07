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

  getStats: () => request('/stats'),
}