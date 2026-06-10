import { useState, useEffect, useCallback } from 'react'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { usePhotos } from '../hooks/usePhotos'
import { HeroPhoto } from './HeroPhoto'
import { PhotoGrid } from './PhotoGrid'
import { AddPhotosButton } from './AddPhotosButton'
import { PhotoLightbox } from './PhotoLightbox'

export function DetailView({ date, onBack }) {
  const photos = usePhotos(date.id)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [dateDraft, setDateDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const coverPhoto = photos[0] ?? null

  const formattedDate = date.date?.toDate().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  function enterEdit() {
    setTitleDraft(date.title ?? '')
    setDateDraft(date.date?.toDate().toISOString().split('T')[0] ?? '')
    setEditMode(true)
  }

  const cancelEdit = useCallback(() => setEditMode(false), [])

  const saveEdit = useCallback(async () => {
    if (!titleDraft.trim() || !dateDraft) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'dates', date.id), {
        title: titleDraft.trim(),
        date: Timestamp.fromDate(new Date(dateDraft + 'T12:00:00')),
      })
      setEditMode(false)
    } finally {
      setSaving(false)
    }
  }, [titleDraft, dateDraft, date.id])

  useEffect(() => {
    if (!editMode) return
    const onKey = (e) => { if (e.key === 'Escape') cancelEdit() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editMode, cancelEdit])

  return (
    <main>
      <div className="relative">
        <HeroPhoto photo={coverPhoto} />
        <button
          onClick={onBack}
          className="absolute left-4 flex items-center gap-1.5 px-3 py-2 rounded-full min-h-[44px] backdrop-blur-sm"
          style={{
            top: 'max(0.75rem, env(safe-area-inset-top))',
            backgroundColor: 'rgba(44,26,14,0.52)',
            color: '#FDF6E3',
          }}
          aria-label="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-body text-sm">Volver</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-3 pb-10 md:pb-14">
        <div className="mb-4 md:mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {editMode ? (
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="font-display text-3xl md:text-5xl leading-tight bg-transparent border-b-2 outline-none w-full"
                style={{ borderColor: 'var(--accent)', color: 'var(--text)' }}
                autoFocus
              />
            ) : (
              <h2 className="font-display text-3xl md:text-5xl leading-tight" style={{ color: 'var(--text)' }}>
                {date.title}
              </h2>
            )}
            {editMode ? (
              <input
                type="date"
                value={dateDraft}
                onChange={(e) => setDateDraft(e.target.value)}
                className="font-body text-sm mt-1.5 bg-transparent border-b outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            ) : (
              <p className="font-body text-sm mt-0.5 pb-2" style={{ color: 'var(--text)', opacity: 0.5 }}>
                {formattedDate}
              </p>
            )}
          </div>

          {/* Pencil → checkmark toggle */}
          <button
            onClick={editMode ? saveEdit : enterEdit}
            disabled={saving}
            aria-label={editMode ? 'Guardar' : 'Editar date'}
            className="flex-shrink-0 flex items-center justify-center rounded-full mt-1"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: editMode ? 'var(--accent)' : 'var(--card)',
              color: editMode ? '#fff' : 'var(--text)',
              boxShadow: 'var(--shadow-card)',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              opacity: saving ? 0.5 : 1,
              transition: 'background-color 150ms ease-out, color 150ms ease-out',
            }}
          >
            {editMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </button>
        </div>

        <PhotoGrid
          photos={photos}
          dateId={date.id}
          editMode={editMode}
          onOpenLightbox={setLightboxIndex}
        />

        <div className="flex justify-center mt-8 md:mt-10">
          <AddPhotosButton dateId={date.id} currentPhotoCount={photos.length} />
        </div>
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </main>
  )
}
