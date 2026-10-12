import countries from 'i18n-iso-countries'
import { countryName } from './countryNames'

// Ülke bilgi kartı verisi: başkent, para birimi, diller, komşular...
// Kaynak: world-countries (ODbL) — https://github.com/mledoze/countries
// Veri büyük (~1,4 MB) olduğu için sadece ilk ihtiyaç olduğunda yüklenir (dinamik import).
let dataPromise = null
const loadData = () => (dataPromise ??= import('world-countries').then((m) => m.default))

// Veride başkentler İngilizce; Türkçede farklı söylenenleri düzeltiyoruz
const CAPITAL_TR = {
  AE: 'Abu Dabi', AF: 'Kabil', AL: 'Tiran', AM: 'Erivan', AT: 'Viyana', AZ: 'Bakü',
  BA: 'Saraybosna', BE: 'Brüksel', BG: 'Sofya', CN: 'Pekin', CY: 'Lefkoşa', CZ: 'Prag',
  DK: 'Kopenhag', DZ: 'Cezayir', EG: 'Kahire', GE: 'Tiflis', GR: 'Atina', IN: 'Yeni Delhi',
  IQ: 'Bağdat', IR: 'Tahran', IT: 'Roma', KR: 'Seul', LB: 'Beyrut', LU: 'Lüksemburg',
  LY: 'Trablus', MD: 'Kişinev', MK: 'Üsküp', MX: 'Meksiko', PL: 'Varşova', PT: 'Lizbon',
  RO: 'Bükreş', RS: 'Belgrad', RU: 'Moskova', SA: 'Riyad', SY: 'Şam', TN: 'Tunus',
  UA: 'Kiev', US: 'Washington', UZ: 'Taşkent', VA: 'Vatikan',
}

const languageNames = new Intl.DisplayNames('tr', { type: 'language' })
const currencyNames = new Intl.DisplayNames('tr', { type: 'currency' })
const tryName = (names, code, fallback) => {
  try {
    return names.of(code) ?? fallback
  } catch {
    return fallback
  }
}

export async function getCountryInfo(isoNumeric) {
  const list = await loadData()
  const c = list.find((x) => x.ccn3 === isoNumeric)
  if (!c) return null

  return {
    code: c.cca2,
    flag: `https://flagcdn.com/w160/${c.cca2.toLowerCase()}.png`,
    capital: CAPITAL_TR[c.cca2] ?? c.capital?.[0] ?? null,
    currencies: Object.entries(c.currencies ?? {}).map(([code, cur]) => ({
      code,
      name: tryName(currencyNames, code, cur.name),
      symbol: cur.symbol,
    })),
    languages: Object.entries(c.languages ?? {}).map(([code, name]) => tryName(languageNames, code, name)),
    phone: c.idd?.root ? c.idd.root + (c.idd.suffixes?.length === 1 ? c.idd.suffixes[0] : '') : null,
    area: c.area,
    borders: (c.borders ?? [])
      .map((a3) => countries.alpha3ToNumeric(a3))
      .filter(Boolean)
      .map((iso) => countryName(iso)),
  }
}