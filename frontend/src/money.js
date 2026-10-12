// Para birimleri, para biçimlendirme ve kur dönüşümü
export const CURRENCIES = ['TRY', 'EUR', 'USD', 'GBP', 'CHF', 'JPY']

// 1234.5, "TRY" → "₺1.234,50"
export const formatMoney = (amount, currency) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)

// Güncel kurlar: Frankfurter (Avrupa Merkez Bankası verisi, anahtar gerekmez)
// fetchRates('TRY') → { TRY: 1, EUR: 0.0181, USD: 0.0203, ... }  (1 TRY kaç EUR eder)
const cache = new Map()

export function fetchRates(base) {
  if (!cache.has(base)) {
    const promise = fetch(`https://api.frankfurter.dev/v2/rates?base=${base}`)
      .then((res) => {
        if (!res.ok) throw new Error('Kurlar alınamadı')
        return res.json()
      })
      .then((list) => Object.fromEntries([[base, 1], ...list.map((r) => [r.quote, r.rate])]))
    promise.catch(() => cache.delete(base)) // hata olursa sonra tekrar denensin
    cache.set(base, promise)
  }
  return cache.get(base)
}

// Bir tutarı gezinin para birimine çevir. Kur bilinmiyorsa null döner.
export function convert(amount, from, rates) {
  if (!rates) return null
  const rate = rates[from]
  return rate ? amount / rate : null
}