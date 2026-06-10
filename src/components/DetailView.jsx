import { useState } from 'react'
import { usePhotos } from '../hooks/usePhotos'
import { HeroPhoto } from './HeroPhoto'
import { PhotoGrid } from './PhotoGrid'
import { AddPhotosButton } from './AddPhotosButton'
import { PhotoLightbox } from './PhotoLightbox'
import { EditDateModal } from './EditDateModal'

export function DetailView({ date, onBack }) {
  const photos = usePhotos(date.id)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [editing, setEditing] = useState(false)
  const coverPhoto = photos[0] ?? null

  const formattedDate = date.date?.toDate().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

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
          <div className="min-w-0">
            <h2 className="font-display text-3xl md:text-5xl leading-tight" style={{ color: 'var(--text)' }}>
              {date.title}
            </h2>
            <p className="font-body text-sm mt-0.5 pb-2" style={{ color: 'var(--text)', opacity: 0.5 }}>
              {formattedDate}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            aria-label="Editar date"
            className="flex-shrink-0 flex items-center justify-center rounded-full mt-1"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'var(--card)',
              color: 'var(--text)',
              boxShadow: 'var(--shadow-card)',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        <PhotoGrid
          photos={photos}
          dateId={date.id}
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

      {editing && (
        <EditDateModal date={date} onClose={() => setEditing(false)} />
      )}
    </main>
  )
}
