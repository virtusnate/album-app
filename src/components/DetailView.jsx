import { usePhotos } from '../hooks/usePhotos'
import { HeroPhoto } from './HeroPhoto'
import { PhotoGrid } from './PhotoGrid'
import { AddPhotosButton } from './AddPhotosButton'

export function DetailView({ date, onBack }) {
  const photos = usePhotos(date.id)
  const coverPhoto = photos[0] ?? null

  const formattedDate = date.date?.toDate().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main>
      {/* Hero — full width, back button overlaid */}
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

      {/* Title + date immediately below the hero */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-3 pb-10 md:pb-14">
        <div className="mb-4 md:mb-6">
          <h2 className="font-display text-3xl md:text-5xl leading-tight" style={{ color: 'var(--text)' }}>
            {date.title}
          </h2>
          <p className="font-body text-sm mt-0.5 pb-1" style={{ color: 'var(--text)', opacity: 0.5 }}>
            {formattedDate}
          </p>
        </div>

        <PhotoGrid photos={photos} dateId={date.id} />

        <div className="flex justify-center mt-8 md:mt-10">
          <AddPhotosButton dateId={date.id} currentPhotoCount={photos.length} />
        </div>
      </div>
    </main>
  )
}
