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
// Tarayıcı bir dilin/paranın Türkçe adını bilmezse kodun kendisini ("kl", "tpi") döndürüyor.
// Öyle olursa verideki İngilizce adı kullanıyoruz.
const tryName = (names, code, fallback) => {
  try {
    const name = names.of(code)
    const looksLikeCode = !name || /^[a-z]{2,3}$/i.test(name)
    return looksLikeCode ? fallback : name
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
    code3: c.cca3,
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
// Nüfus: Dünya Bankası'nın açık verisinden (anahtar gerekmez), en son açıklanan yıl.
// Cevap şekli: [ {sayfa bilgisi}, [ { date: "2024", value: 279798049, ... } ] ]
const populationCache = new Map()

export function fetchPopulation(code3) {
  if (!populationCache.has(code3)) {
    const url = `https://api.worldbank.org/v2/country/${code3}/indicator/SP.POP.TOTL?format=json&mrnev=1`
    const promise = fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const row = data?.[1]?.[0]
        return row?.value ? { value: row.value, year: row.date } : null
      })
    promise.catch(() => populationCache.delete(code3)) // hata olursa sonra tekrar denensin
    populationCache.set(code3, promise)
  }
  return populationCache.get(code3)
}

// 279798049 → "279,8 milyon", 8500 → "8.500"
export function formatPopulation(n) {
  if (n >= 1e9) return `${(n / 1e9).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} milyar`
  if (n >= 1e6) return `${(n / 1e6).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} milyon`
  return n.toLocaleString('tr-TR')
}