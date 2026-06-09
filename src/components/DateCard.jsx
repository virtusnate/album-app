import { tiltFromId } from '../utils/tiltFromId'

export function DateCard({ date, onClick }) {
  const tilt = tiltFromId(date.id)
  const formattedDate = date.date?.toDate().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article
      role="article"
      onClick={() => onClick(date.id)}
      className="polaroid-card cursor-pointer"
      style={{ transform: `rotate(${tilt}deg)` }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) translateY(-6px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${tilt}deg)` }}
    >
      <div className="polaroid-frame">
        {/* Photo area */}
        <div className="relative overflow-hidden" style={{ paddingBottom: '133%' }}>
          {date.coverPhoto ? (
            <img
              src={date.coverPhoto.storageUrl}
              alt={date.title}
              className="photo-analog absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: `${(date.coverPhoto.focalX ?? 0.5) * 100}% ${(date.coverPhoto.focalY ?? 0.5) * 100}%`,
              }}
              loading="lazy"
            />
          ) : (
            <div
              data-testid="photo-placeholder"
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--border)', opacity: 0.35 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Polaroid caption area — wider bottom like a real polaroid */}
        <div className="polaroid-caption">
          <p className="font-script text-base leading-snug truncate" style={{ color: 'var(--text)' }}>
            {date.title}
          </p>
          <p className="font-body text-xs mt-1" style={{ color: 'var(--text)', opacity: 0.5 }}>
            {formattedDate}
          </p>
        </div>
      </div>
    </article>
  )
}
