import countries from 'i18n-iso-countries'
import tr from 'i18n-iso-countries/langs/tr.json'

countries.registerLocale(tr)

// "792" → "Türkiye", "250" → "Fransa"
export const countryName = (iso) => countries.getName(iso, 'tr') ?? iso

// Tüm ülkeler, Türkçe adına göre sıralı: [{ iso: "792", name: "Türkiye" }, ...]
export const allCountries = Object.entries(countries.getNames('tr'))
  .map(([alpha2, name]) => ({ iso: countries.alpha2ToNumeric(alpha2), name }))
  .filter((c) => c.iso)
  .sort((a, b) => a.name.localeCompare(b.name, 'tr'))

// "2026-10-07T00:00:00" → "7 Ekim 2026"
export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

// Gezinin bugüne göre durumu: "12 gün kaldı", "Devam ediyor", "Tamamlandı"
export const tripStatus = (start, end) => {
  if (!start) return { label: 'Tarih yok', past: false }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const s = new Date(start)
  const e = end ? new Date(end) : s
  const days = Math.round((s - today) / 86400000)

  if (e < today) return { label: 'Tamamlandı', past: true }
  if (s <= today) return { label: 'Devam ediyor', past: false }
  if (days === 1) return { label: 'Yarın', past: false }
  return { label: `${days} gün kaldı`, past: false }
}
