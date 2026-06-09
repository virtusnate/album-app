import { tiltFromId } from '../utils/tiltFromId'

export function DateCard({ date, onClick }) {
  const tilt = tiltFromId(date.id)
  const formattedDate = date.date?.toDate().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article
      role="article"
      onClick={() => onClick(date.id)}
      className="cursor-pointer break-inside-avoid mb-6"
      style={{
        transform: `rotate(${tilt}deg)`,
        transition: 'transform 200ms ease-out',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(0deg) translateY(-4px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = `rotate(${tilt}deg)`)}
    >
      <div
        className="rounded-sm overflow-hidden shadow-lg"
        style={{ backgroundColor: 'var(--card)', border: '8px solid var(--card)', paddingBottom: '0' }}
      >
        <div className="relative overflow-hidden" style={{ paddingBottom: '75%' }}>
          {date.coverPhoto ? (
            <img
              src={date.coverPhoto.storageUrl}
              alt={date.title}
              className="photo-analog absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: `${(date.coverPhoto.focalX ?? 0.5) * 100}% ${(date.coverPhoto.focalY ?? 0.5) * 100}%`,
              }}
            />
          ) : (
            <div
              data-testid="photo-placeholder"
              className="absolute inset-0 w-full h-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--border)', opacity: 0.4 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
        </div>
        <div className="px-3 py-3">
          <p className="font-script text-lg truncate" style={{ color: 'var(--text)' }}>{date.title}</p>
          <p className="font-body text-xs mt-1 opacity-60" style={{ color: 'var(--text)' }}>{formattedDate}</p>
        </div>
      </div>
    </article>
  )
}
