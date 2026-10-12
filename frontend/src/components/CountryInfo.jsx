import { useEffect, useState } from 'react'
import { getCountryInfo } from '../countryInfo'
import { fetchRates, formatMoney } from '../money'

// Dünya sayfasında seçilen ülkenin kısa bilgi kartı
export default function CountryInfo({ iso, homeCurrency = 'TRY' }) {
  const [info, setInfo] = useState(null)
  const [rate, setRate] = useState(null) // 1 yerel para kaç TL

  useEffect(() => {
    setInfo(null)
    setRate(null)
    getCountryInfo(iso).then((data) => {
      setInfo(data)
      const currency = data?.currencies[0]?.code
      if (currency && currency !== homeCurrency) {
        fetchRates(currency).then((r) => setRate(r[homeCurrency] ?? null)).catch(() => {})
      }
    })
  }, [iso, homeCurrency])

  if (!info) return null
  const currency = info.currencies[0]

  return (
    <div className="country-info">
      <img className="country-flag" src={info.flag} alt="" />
      <dl>
        {info.capital && (<><dt>Başkent</dt><dd>{info.capital}</dd></>)}
        {currency && (
          <>
            <dt>Para birimi</dt>
            <dd>
              {currency.name} ({currency.symbol ?? currency.code})
              {rate && (
                <span className="panel-hint">
                    {/* Değeri çok düşük paralarda (rupi, yen…) ters çeviriyoruz: "1 TRY = 384 IDR" */}
                    {rate >= 1
                    ? ` · 1 ${currency.code} = ${formatMoney(rate, homeCurrency)}`
                    : ` · 1 ${homeCurrency} = ${formatMoney(1 / rate, currency.code)}`}
                </span>
                )}
            </dd>
          </>
        )}
        {info.languages.length > 0 && (<><dt>Diller</dt><dd>{info.languages.join(', ')}</dd></>)}
        {info.phone && (<><dt>Telefon kodu</dt><dd>{info.phone}</dd></>)}
        <dt>Yüzölçümü</dt><dd>{info.area.toLocaleString('tr-TR')} km²</dd>
        {info.borders.length > 0 && (<><dt>Komşular</dt><dd>{info.borders.join(', ')}</dd></>)}
      </dl>
    </div>
  )
}