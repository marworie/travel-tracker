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
