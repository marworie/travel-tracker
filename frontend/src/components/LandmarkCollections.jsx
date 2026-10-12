import { useEffect, useState } from 'react'
import { api } from '../api'
import { countryName } from '../countryNames'
import { fetchWikiInfo, fetchWikiSummary } from '../wiki'

const COLLECTIONS = [
  { id: 'new7', short: '7 Harika', title: 'Dünyanın Yeni 7 Harikası', note: '2007 oylamasıyla seçilen yedi yapı ve onursal olarak Gize Piramitleri' },
  { id: 'turkey', short: 'Türkiye', title: "Türkiye'de mutlaka görülmeli", note: 'Tarihten doğaya, listede olması gereken yerler' },
  { id: 'iconic', short: 'İkonik yerler', title: 'Dünyanın ikonik yerleri', note: 'Şehirleriyle özdeşleşmiş yapılar ve tarihi alanlar' },
  { id: 'nature', short: 'Doğa harikaları', title: 'Doğa harikaları', note: 'Şelaleler, kanyonlar, dağlar ve resifler' },
]

function LandmarkCard({ place, wiki, onToggle, onOpen }) {
  return (
    <article className={`landmark-card ${place.isVisited ? 'seen' : ''}`}>
      <button className="landmark-photo" onClick={onOpen} aria-label={`${place.name} detayı`}>
        {wiki?.image ? <img src={wiki.image} alt={place.name} loading="lazy" /> : <span>{place.name}</span>}
      </button>
      <div className="landmark-body">
        <h3>{place.name}</h3>
        <p className="landmark-where">{place.city}, {countryName(place.countryIso)}</p>
        {wiki?.extract && <p className="landmark-desc">{wiki.extract}</p>}
        <div className="unesco-actions">
          <button className={place.isWanted ? 'on-wanted' : ''} onClick={() => onToggle(place.id, 'wanted')}>
            {place.isWanted ? 'Listede' : 'Listeye ekle'}
          </button>
          <button className={place.isVisited ? 'on-visited' : ''} onClick={() => onToggle(place.id, 'visited')}>
            {place.isVisited ? 'Gidildi' : 'Gittim'}
          </button>
        </div>
      </div>
    </article>
  )
}

// Bir yere tıklanınca açılan kısa detay sayfası
function LandmarkDetail({ place, wiki, onToggle, onBack }) {
  const [summary, setSummary] = useState(wiki?.extract ?? null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!wiki?.trTitle) return
    fetchWikiSummary(wiki.trTitle)
      .then((text) => text && setSummary(text))
      .catch(() => {}) // olmazsa karttaki kısa açıklama kalır
  }, [wiki?.trTitle])

  return (
    <>
      <button className="back-btn landmark-back" onClick={onBack}>‹ Keşfet'e dön</button>
      <article className="landmark-detail">
        <div className="landmark-detail-photo">
          {wiki?.image ? <img src={wiki.image} alt={place.name} /> : <span>{place.name}</span>}
        </div>
        <div className="landmark-detail-body">
          <h1>{place.name}</h1>
          <p className="landmark-where">{place.city}, {countryName(place.countryIso)}</p>
          <p className="landmark-summary">{summary ?? 'Açıklama bulunamadı.'}</p>
          <div className="unesco-actions">
            <button className={place.isWanted ? 'on-wanted' : ''} onClick={() => onToggle(place.id, 'wanted')}>
              {place.isWanted ? 'Listede' : 'Listeye ekle'}
            </button>
            <button className={place.isVisited ? 'on-visited' : ''} onClick={() => onToggle(place.id, 'visited')}>
              {place.isVisited ? 'Gidildi' : 'Gittim'}
            </button>
          </div>
          <p className="credit">Kaynak: Vikipedi</p>
        </div>
      </article>
    </>
  )
}

export default function LandmarkCollections() {
  const [places, setPlaces] = useState([])
  const [wiki, setWiki] = useState({})
  const [openId, setOpenId] = useState(null) // detayı açık olan yer
  const [active, setActive] = useState('new7') // seçili koleksiyon

  useEffect(() => {
    api.getLandmarks().then(async (list) => {
      setPlaces(list)
      // Her koleksiyonun resimlerini ayrı ayrı çek, ilki hemen görünsün
      for (const c of COLLECTIONS) {
        const titles = list.filter((p) => p.collection === c.id).map((p) => p.wikiTitle)
        const info = await fetchWikiInfo(titles)
        setWiki((prev) => ({ ...prev, ...info }))
      }
    }).catch(() => setPlaces([]))
  }, [])

  const handleToggle = async (id, field) => {
    const updated = field === 'wanted' ? await api.toggleLandmarkWanted(id) : await api.toggleLandmarkVisited(id)
    setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  if (places.length === 0) return null

  const openPlace = places.find((p) => p.id === openId)
  if (openPlace) {
    return (
      <LandmarkDetail
        place={openPlace}
        wiki={wiki[openPlace.wikiTitle]}
        onToggle={handleToggle}
        onBack={() => setOpenId(null)}
      />
    )
  }

  const collection = COLLECTIONS.find((c) => c.id === active)
  const list = places.filter((p) => p.collection === active)
  const seen = list.filter((p) => p.isVisited).length

  return (
    <>
      {/* Koleksiyon seçimi: sadece seçilen koleksiyon aşağıda gösterilir */}
      <div className="country-chips collection-tabs">
        {COLLECTIONS.map((c) => {
          const items = places.filter((p) => p.collection === c.id)
          return (
            <button key={c.id} className={c.id === active ? 'chip active' : 'chip'} onClick={() => setActive(c.id)}>
              {c.short} <span className="chip-count">{items.filter((p) => p.isVisited).length}/{items.length}</span>
            </button>
          )
        })}
      </div>

      <section className="collection">
        <div className="collection-head">
          <div>
            <h2>{collection.title}</h2>
            <p className="subtitle">{collection.note}</p>
          </div>
          <span className="unesco-count">{seen} / {list.length} görüldü</span>
        </div>
        <div className="landmark-grid">
          {list.map((p) => (
            <LandmarkCard key={p.id} place={p} wiki={wiki[p.wikiTitle]} onToggle={handleToggle} onOpen={() => setOpenId(p.id)} />
          ))}
        </div>
      </section>
      <p className="credit">Görseller ve açıklamalar Wikipedia'dan alınmıştır.</p>
    </>
  )
}