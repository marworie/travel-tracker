// Wikipedia'dan resim ve kısa Türkçe açıklama çeker.
// Aynı başlığı ikinci kez istemesin diye sonuçları hafızada tutuyoruz.
const cache = new Map()

const api = (lang, params) =>
  fetch(`https://${lang}.wikipedia.org/w/api.php?` +
    new URLSearchParams({ action: 'query', format: 'json', origin: '*', redirects: '1', ...params })
  ).then((r) => r.json())

// API, başlığı düzeltebilir veya yönlendirebilir ("Ha Long Bay" → "Hạ Long Bay").
// Gelen sayfayı bizim istediğimiz başlığa geri eşlemek için bu tabloyu kuruyoruz.
function buildAlias(query) {
  const alias = {}
  for (const n of query.normalized ?? []) alias[n.to] = n.from
  for (const r of query.redirects ?? []) alias[r.to] = alias[r.from] ?? r.from
  return alias
}

export async function fetchWikiInfo(titles) {
  const missing = titles.filter((t) => !cache.has(t))

  if (missing.length > 0) {
    try {
      // 1) İngilizce Wikipedia: resim + Türkçe sayfanın adı
      const en = await api('en', {
        prop: 'pageimages|langlinks',
        piprop: 'thumbnail',
        pithumbsize: '640',
        lllang: 'tr',
        lllimit: 'max',
        titles: missing.join('|'),
      })
      const enAlias = buildAlias(en.query)
      for (const page of Object.values(en.query.pages)) {
        const requested = enAlias[page.title] ?? page.title
        const trTitle = page.langlinks?.[0]?.['*'] ?? null
        cache.set(requested, {
          image: page.thumbnail?.source ?? null,
          extract: null,
          url: trTitle
            ? `https://tr.wikipedia.org/wiki/${encodeURIComponent(trTitle)}`
            : `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
          trTitle,
        })
      }

      // 2) Türkçe Wikipedia: ilk iki cümlelik açıklama
      const trTitles = missing.map((t) => cache.get(t)?.trTitle).filter(Boolean)
      if (trTitles.length > 0) {
        const tr = await api('tr', {
          prop: 'extracts',
          exintro: '1',
          explaintext: '1',
          exsentences: '2',
          exlimit: 'max',
          titles: trTitles.join('|'),
        })
        const trAlias = buildAlias(tr.query)
        const extracts = {}
        for (const page of Object.values(tr.query.pages)) {
          extracts[trAlias[page.title] ?? page.title] = page.extract
        }
        for (const t of missing) {
          const info = cache.get(t)
          if (info?.trTitle) info.extract = extracts[info.trTitle] ?? null
        }
      }
    } catch {
      // İnternet yoksa veya Wikipedia cevap vermezse kartlar resimsiz görünür
    }
  }

  return Object.fromEntries(titles.map((t) => [t, cache.get(t) ?? null]))
}
