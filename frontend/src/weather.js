// Open-Meteo: ücretsiz, anahtar gerektirmeyen hava durumu servisi.
// En fazla 16 gün sonrasının tahminini verir.
export const FORECAST_DAYS = 16

// WMO hava kodu → simge + Türkçe açıklama
const CODES = [
  [[0], '☀️', 'Açık'],
  [[1, 2], '🌤️', 'Parçalı bulutlu'],
  [[3], '☁️', 'Bulutlu'],
  [[45, 48], '🌫️', 'Sisli'],
  [[51, 53, 55, 56, 57], '🌦️', 'Çisenti'],
  [[61, 63, 65, 66, 67, 80, 81, 82], '🌧️', 'Yağmurlu'],
  [[71, 73, 75, 77, 85, 86], '🌨️', 'Karlı'],
  [[95, 96, 99], '⛈️', 'Fırtınalı'],
]

export function describeWeather(code) {
  const found = CODES.find(([codes]) => codes.includes(code))
  return found ? { icon: found[1], label: found[2] } : { icon: '🌡️', label: 'Bilinmiyor' }
}

// Date → "2026-10-21" (yerel saate göre)
export const toIsoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export async function fetchForecast(lat, lon, startDate, endDate) {
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat}&longitude=${lon}`
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
    + `&timezone=auto&start_date=${startDate}&end_date=${endDate}`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Hava durumu alınamadı')
  const { daily } = await res.json()

  // Sütun sütun gelen veriyi gün gün nesnelere çeviriyoruz
  return daily.time.map((date, i) => ({
    date,
    code: daily.weather_code[i],
    max: Math.round(daily.temperature_2m_max[i]),
    min: Math.round(daily.temperature_2m_min[i]),
    rain: daily.precipitation_probability_max[i],
  }))
}