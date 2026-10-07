import { useEffect, useState } from 'react'
import { api } from '../api'
import { countryName } from '../countryNames'
import { fetchWikiInfo } from '../wiki'

const COLLECTIONS = [
  { id: 'new7', title: 'Dünyanın Yeni 7 Harikası', note: '2007 oylamasıyla seçilen yedi yapı ve onursal olarak Gize Piramitleri' },
  { id: 'turkey', title: "Türkiye'de mutlaka görülmeli", note: 'Tarihten doğaya, listede olması gereken yerler' },
  { id: 'iconic', title: 'Dünyanın ikonik yerleri', note: 'Şehirleriyle özdeşleşmiş yapılar ve tarihi alanlar' },
  { id: 'nature', title: 'Doğa harikaları', note: 'Şelaleler, kanyonlar, dağlar ve resifler' },
]

function LandmarkCard({ place, wiki, onToggle }) {
  return (
    <article className={`landmark-card ${place.isVisited ? 'seen' : ''}`}>
      <a className="landmark-photo" href={wiki?.url} target="_blank" rel="noreferrer">
        {wiki?.image ? <img src={wiki.image} alt={place.name} loading="lazy" /> : <span>{place.name}</span>}
      </a>
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

export default function LandmarkCollections() {
  const [places, setPlaces] = useState([])
  const [wiki, setWiki] = useState({})

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

  return (
    <>
      {COLLECTIONS.map((c) => {
        const list = places.filter((p) => p.collection === c.id)
        const seen = list.filter((p) => p.isVisited).length
        return (
          <section key={c.id} className="collection">
            <div className="collection-head">
              <div>
                <h2>{c.title}</h2>
                <p className="subtitle">{c.note}</p>
              </div>
              <span className="unesco-count">{seen} / {list.length} görüldü</span>
            </div>
            <div className="landmark-grid">
              {list.map((p) => (
                <LandmarkCard key={p.id} place={p} wiki={wiki[p.wikiTitle]} onToggle={handleToggle} />
              ))}
            </div>
          </section>
        )
      })}
      <p className="credit">Görseller ve açıklamalar Wikipedia'dan alınmıştır.</p>
    </>
  )
}
