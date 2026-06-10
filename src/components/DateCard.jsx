import { useRef, useState, useCallback, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const LONG_PRESS_MS = 500

export function DateCard({ date, onClick, onDelete, onEdit, onMoveUp, onMoveDown, isFirst, isLast }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: date.id })
  const [mobileActive, setMobileActive] = useState(false)
  const timerRef = useRef(null)
  const didLongPressRef = useRef(false)

  const formattedDate = date.date?.toDate().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const startLongPress = useCallback((e) => {
    if (e.pointerType !== 'touch') return
    didLongPressRef.current = false
    timerRef.current = setTimeout(() => {
      didLongPressRef.current = true
      setMobileActive(true)
      if (navigator.vibrate) navigator.vibrate(30)
    }, LONG_PRESS_MS)
  }, [])

  const cancelLongPress = useCallback(() => {
    clearTimeout(timerRef.current)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleCardClick = useCallback((e) => {
    if (didLongPressRef.current) {
      e.stopPropagation()
      didLongPressRef.current = false
      return
    }
    if (mobileActive) {
      setMobileActive(false)
      return
    }
    onClick(date.id)
  }, [mobileActive, onClick, date.id])

  return (
    <article
      ref={setNodeRef}
      role="article"
      onClick={handleCardClick}
      onPointerDown={startLongPress}
      onPointerUp={cancelLongPress}
      onPointerCancel={cancelLongPress}
      className="polaroid-card cursor-pointer relative group"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        outline: mobileActive ? '2.5px solid var(--accent)' : undefined,
        outlineOffset: mobileActive ? '3px' : undefined,
        borderRadius: mobileActive ? '2px' : undefined,
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

      {/* ── Desktop: drag handle (hover) ─────────────────────── */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="date-card-action-btn hidden md:flex opacity-0 group-hover:opacity-100"
        style={{ top: '0.625rem', left: '0.625rem', cursor: 'grab' }}
        aria-label="Mover date"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* ── Desktop: delete (hover) ───────────────────────────── */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(date) }}
        className="date-card-action-btn date-card-delete-btn hidden md:flex opacity-0 group-hover:opacity-100"
        style={{ top: '0.5rem', right: '0.5rem', width: '42px', height: '42px' }}
        aria-label="Eliminar date"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* ── Desktop: edit (hover) ────────────────────────────── */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(date) }}
        className="date-card-action-btn hidden md:flex opacity-0 group-hover:opacity-100"
        style={{ top: '0.5rem', right: '3.5rem' }}
        aria-label="Editar date"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {/* ── Mobile: up / down arrows (long-press reveal) ─────── */}
      {mobileActive && (
        <>
          {!isFirst && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp(date.id) }}
              className="date-card-action-btn md:hidden"
              style={{ top: '0.625rem', left: '0.625rem' }}
              aria-label="Subir date"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}

          {!isLast && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown(date.id) }}
              className="date-card-action-btn md:hidden"
              style={{ bottom: '0.625rem', left: '0.625rem' }}
              aria-label="Bajar date"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* Mobile delete */}
          <button
            onClick={(e) => { e.stopPropagation(); setMobileActive(false); onDelete(date) }}
            className="date-card-action-btn date-card-delete-btn md:hidden"
            style={{ top: '0.625rem', right: '0.625rem' }}
            aria-label="Eliminar date"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Mobile edit */}
          <button
            onClick={(e) => { e.stopPropagation(); setMobileActive(false); onEdit(date) }}
            className="date-card-action-btn md:hidden"
            style={{ bottom: '0.625rem', right: '0.625rem' }}
            aria-label="Editar date"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </>
      )}
    </article>
  )
}
