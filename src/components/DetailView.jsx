import { usePhotos } from '../hooks/usePhotos'
import { HeroPhoto } from './HeroPhoto'
import { PhotoGrid } from './PhotoGrid'
import { AddPhotosButton } from './AddPhotosButton'

export function DetailView({ date, onBack }) {
  const photos = usePhotos(date.id)
  const coverPhoto = photos[0] ?? null

  const formattedDate = date.date?.toDate().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main>
      <HeroPhoto photo={coverPhoto} />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-body text-sm mb-8 opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text)' }}
          aria-label="Voltar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        <div className="mb-10">
          <h2 className="font-display text-5xl" style={{ color: 'var(--text)' }}>{date.title}</h2>
          <p className="font-body text-sm mt-2 opacity-60" style={{ color: 'var(--text)' }}>{formattedDate}</p>
        </div>

        <PhotoGrid photos={photos} dateId={date.id} />

        <div className="flex justify-center mt-10">
          <AddPhotosButton dateId={date.id} currentPhotoCount={photos.length} />
        </div>
      </div>
    </main>
  )
}
