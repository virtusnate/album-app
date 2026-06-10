import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FocalPointEditor } from './FocalPointEditor'

export function SortablePhoto({ photo, dateId, editMode, onDelete, onOpenLightbox }) {
  const [editingFocal, setEditingFocal] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })

  function handleClick() {
    if (onOpenLightbox) onOpenLightbox()
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.4 : 1,
        }}
        className="relative rounded-sm overflow-visible shadow-md"
      >
        {/* Thumbnail */}
        <div className="relative rounded-sm overflow-hidden" style={{ paddingBottom: '133%' }}>
          {photo.type === 'video' ? (
            <video
              src={photo.storageUrl}
              className="photo-analog absolute inset-0 w-full h-full object-cover cursor-pointer"
              muted
              playsInline
              preload="metadata"
              onClick={handleClick}
            />
          ) : (
            <img
              src={photo.storageUrl}
              alt="Foto"
              className="photo-analog absolute inset-0 w-full h-full object-cover cursor-pointer"
              style={{ objectPosition: `${(photo.focalX ?? 0.5) * 100}% ${(photo.focalY ?? 0.5) * 100}%` }}
              onClick={handleClick}
            />
          )}

          {/* Play overlay for videos */}
          {photo.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(44,26,14,0.55)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FDF6E3' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ── Desktop: drag handle ── */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className={`date-card-action-btn hidden md:flex ${editMode ? 'photo-btn-in' : 'opacity-0 pointer-events-none'}`}
          style={{ top: '0.5rem', left: '0.5rem', cursor: 'grab' }}
          aria-label="Mover foto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* ── Desktop: focal point (images only) ── */}
        {photo.type !== 'video' && (
          <button
            onClick={(e) => { e.stopPropagation(); setEditingFocal(true) }}
            className={`date-card-action-btn hidden md:flex ${editMode ? 'photo-btn-in' : 'opacity-0 pointer-events-none'}`}
            style={{ bottom: '0.5rem', left: '0.5rem' }}
            aria-label="Punto de enfoque"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}

        {/* ── Desktop: delete ── */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(photo) }}
          className={`date-card-action-btn date-card-delete-btn hidden md:flex ${editMode ? 'photo-btn-in' : 'opacity-0 pointer-events-none'}`}
          style={{ top: '0.5rem', right: '0.5rem', width: '42px', height: '42px' }}
          aria-label="Eliminar foto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* ── Mobile: editMode only (no long-press) ── */}
        {editMode && (
          <>
            {photo.type !== 'video' && (
              <button
                onClick={(e) => { e.stopPropagation(); setEditingFocal(true) }}
                className="date-card-action-btn md:hidden photo-btn-in"
                style={{ bottom: '0.5rem', left: '0.5rem', width: '44px', height: '44px' }}
                aria-label="Punto de enfoque"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(photo) }}
              className="date-card-action-btn date-card-delete-btn md:hidden photo-btn-in"
              style={{ top: '0.5rem', right: '0.5rem', width: '44px', height: '44px' }}
              aria-label="Eliminar foto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>

      {editingFocal && (
        <FocalPointEditor photo={photo} dateId={dateId} onClose={() => setEditingFocal(false)} />
      )}
    </>
  )
}
