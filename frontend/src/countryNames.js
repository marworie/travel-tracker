import countries from 'i18n-iso-countries'
import tr from 'i18n-iso-countries/langs/tr.json'

countries.registerLocale(tr)

// "792" → "Türkiye", "250" → "Fransa"
export const countryName = (iso) => countries.getName(iso, 'tr') ?? iso
