import { useState } from 'react'
import { api, FILE_BASE } from '../api'

const sizeText = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)
const dateText = (value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })

// 1–5 yıldız; aynı yıldıza tekrar tıklayınca puan kalkar
function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="stars" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={n <= (hover || value || 0) ? 'star on' : 'star'}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n === value ? null : n)}
          aria-label={`${n} yıldız`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function TripMemories({ trip, onChange }) {
  const [noteText, setNoteText] = useState('')
  const [noteDay, setNoteDay] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null) // büyük gösterilen fotoğraf

  const photos = trip.files.filter((f) => f.kind === 'photo')
  const documents = trip.files.filter((f) => f.kind === 'document')

  const run = async (action) => {
    setError('')
    try {
      await action()
      onChange()
    } catch (err) {
      setError(err.message)
    }
  }

  const addNote = (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    run(async () => {
      await api.addNote(trip.id, { text: noteText, dayNumber: noteDay ? Number(noteDay) : null })
      setNoteText('')
    })
  }

  // Birden fazla dosya seçilebilir; sırayla yüklüyoruz
  const upload = (kind) => async (e) => {
    const files = [...e.target.files]
    e.target.value = '' // aynı dosya tekrar seçilebilsin
    setUploading(true)
    await run(async () => {
      for (const file of files) await api.uploadFile(trip.id, file, kind)
    })
    setUploading(false)
  }

  const removeFile = (f) => {
    if (!confirm(`"${f.fileName}" silinsin mi?`)) return
    run(() => api.deleteFile(f.id))
  }

  return (
    <section className="trip-memories">
      <div className="trip-days-head">
        <h2>Anılar</h2>
        <div className="rating">
          <span className="panel-hint">Gezine puan ver</span>
          <Stars value={trip.rating} onChange={(r) => run(() => api.setRating(trip.id, r))} />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {/* ---- Fotoğraflar ---- */}
      <div className="memory-block">
        <div className="memory-head">
          <h3>Fotoğraflar <span className="count-pill">{photos.length}</span></h3>
          <label className="upload-btn">
            {uploading ? 'Yükleniyor…' : 'Fotoğraf yükle'}
            <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={upload('photo')} />
          </label>
        </div>
        {photos.length === 0 ? (
          <p className="panel-hint">Henüz fotoğraf yok.</p>
        ) : (
          <div className="photo-grid">
            {photos.map((p) => (
              <figure key={p.id} className="photo">
                <img src={FILE_BASE + p.url} alt={p.caption ?? p.fileName} loading="lazy" onClick={() => setPreview(p)} />
                <button className="photo-delete" onClick={() => removeFile(p)} aria-label="Sil">×</button>
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* ---- Günlük ---- */}
      <div className="memory-block">
        <h3>Gezi günlüğü</h3>
        <form className="note-form" onSubmit={addNote}>
          <textarea
            rows={3}
            maxLength={2000}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Bugün neler yaşadın? Ne yedin, nereyi sevdin?"
          />
          <div className="note-form-bottom">
            <select value={noteDay} onChange={(e) => setNoteDay(e.target.value)}>
              <option value="">Genel not</option>
              {Array.from({ length: trip.dayCount }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}. gün</option>
              ))}
            </select>
            <button type="submit" className="primary-btn">Kaydet</button>
          </div>
        </form>
        {trip.notes.length > 0 && (
          <ul className="note-list">
            {trip.notes.map((n) => (
              <li key={n.id}>
                <div className="note-meta">
                  {n.dayNumber ? `${n.dayNumber}. gün` : 'Genel'} · {dateText(n.createdAt)}
                  <button onClick={() => run(() => api.deleteNote(n.id))} aria-label="Sil">×</button>
                </div>
                <p>{n.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---- Belgeler ---- */}
      <div className="memory-block">
        <div className="memory-head">
          <h3>Bilet ve belgeler <span className="count-pill">{documents.length}</span></h3>
          <label className="upload-btn">
            {uploading ? 'Yükleniyor…' : 'Belge yükle'}
            <input type="file" accept="application/pdf,image/*" multiple hidden disabled={uploading} onChange={upload('document')} />
          </label>
        </div>
        {documents.length === 0 ? (
          <p className="panel-hint">Uçak bileti, otel rezervasyonu, vize gibi belgeleri buraya yükleyebilirsin (PDF veya resim, en fazla 10 MB).</p>
        ) : (
          <ul className="doc-list">
            {documents.map((d) => (
              <li key={d.id}>
                <span className="doc-type">{d.contentType === 'application/pdf' ? 'PDF' : 'Resim'}</span>
                <a href={FILE_BASE + d.url} target="_blank" rel="noreferrer">{d.fileName}</a>
                <span className="panel-hint">{sizeText(d.sizeBytes)}</span>
                <button onClick={() => removeFile(d)} aria-label="Sil">×</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Büyük fotoğraf görünümü */}
      {preview && (
        <div className="lightbox" onClick={() => setPreview(null)}>
          <img src={FILE_BASE + preview.url} alt={preview.caption ?? preview.fileName} />
        </div>
      )}
    </section>
  )
}