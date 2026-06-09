import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function DateCard({ date, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: date.id })

  const formattedDate = date.date?.toDate().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article
      ref={setNodeRef}
      role="article"
      onClick={() => onClick(date.id)}
      className="polaroid-card cursor-pointer relative group"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
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

        {/* Polaroid caption */}
        <div className="polaroid-caption">
          <p className="font-script text-base leading-snug truncate" style={{ color: 'var(--text)' }}>
            {date.title}
          </p>
          <p className="font-body text-xs mt-1 pb-2" style={{ color: 'var(--text)', opacity: 0.5 }}>
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Drag handle — rendered after frame so it stacks on top */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="date-card-action-btn opacity-100 md:opacity-0 md:group-hover:opacity-100"
        style={{ top: '0.625rem', left: '0.625rem', cursor: 'grab' }}
        aria-label="Mover date"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Delete button — rendered after frame so it stacks on top */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(date) }}
        className="date-card-action-btn date-card-delete-btn opacity-100 md:opacity-0 md:group-hover:opacity-100"
        style={{ top: '0.625rem', right: '0.625rem' }}
        aria-label="Eliminar date"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </article>
  )
}
