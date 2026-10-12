import { CONTINENTS } from './continents'
import { REGIONS } from './regions'

// Rozetler: her biri bir hedef sayı ve "şu an kaçta olduğunu" hesaplayan bir fonksiyon.
// data = { visitedCountries, visitedCities, trips, totalDays, wishes, unesco, photoCount }
export const BADGES = [
  { id: 'first-country', title: 'İlk sınır', desc: 'İlk ülkeni işaretle', target: 1, value: (d) => d.visitedCountries.size },
  { id: 'five-countries', title: 'Gezgin', desc: '5 ülke gez', target: 5, value: (d) => d.visitedCountries.size },
  { id: 'ten-countries', title: 'Dünya vatandaşı', desc: '10 ülke gez', target: 10, value: (d) => d.visitedCountries.size },
  {
    id: 'three-continents', title: 'Üç kıta', desc: '3 farklı kıtaya git', target: 3,
    value: (d) => CONTINENTS.filter((c) => c.countries.some((iso) => d.visitedCountries.has(iso))).length,
  },
  {
    id: 'all-continents', title: 'Kıta avcısı', desc: 'Her kıtadan en az bir ülke', target: CONTINENTS.length,
    value: (d) => CONTINENTS.filter((c) => c.countries.some((iso) => d.visitedCountries.has(iso))).length,
  },
  { id: 'twenty-provinces', title: 'Yurdumu geziyorum', desc: "Türkiye'de 20 il gez", target: 20, value: (d) => d.visitedCities.size },
  {
    id: 'seven-regions', title: 'Yedi bölge', desc: 'Türkiye’nin her bölgesinden bir il', target: REGIONS.length,
    value: (d) => REGIONS.filter((r) => r.plates.some((p) => d.visitedCities.has(p))).length,
  },
  { id: 'all-provinces', title: '81 il', desc: "Türkiye'nin bütün illeri", target: 81, value: (d) => d.visitedCities.size },
  { id: 'first-trip', title: 'İlk plan', desc: 'Bir gezi planı oluştur', target: 1, value: (d) => d.trips.length },
  { id: 'hundred-days', title: 'Yüz gün', desc: 'Toplam 100 gün seyahat et', target: 100, value: (d) => d.totalDays },
  { id: 'unesco', title: 'Miras avcısı', desc: 'Bir UNESCO alanını gör', target: 1, value: (d) => d.unesco },
  { id: 'wish', title: 'Hayal gerçek oldu', desc: 'Gidilecekler listenden bir yeri tamamla', target: 1, value: (d) => d.wishes.filter((w) => w.isDone).length },
  { id: 'photos', title: 'Objektif', desc: '20 fotoğraf yükle', target: 20, value: (d) => d.photoCount },
]

// Her rozet için ilerlemeyi hesapla: { ...rozet, current, earned }
export const evaluateBadges = (data) =>
  BADGES.map((b) => {
    const current = Math.min(b.value(data), b.target)
    return { ...b, current, earned: current >= b.target }
  })