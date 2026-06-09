import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FocalPointEditor } from './FocalPointEditor'

export function SortablePhoto({ photo, dateId, onDelete }) {
  const [editingFocal, setEditingFocal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  function handleDeleteClick(e) {
    e.stopPropagation()
    setConfirmDelete(true)
  }

  function handleConfirm(e) {
    e.stopPropagation()
    setConfirmDelete(false)
    onDelete(photo)
  }

  function handleCancel(e) {
    e.stopPropagation()
    setConfirmDelete(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="relative group rounded-sm overflow-hidden shadow-md"
      >
        {/* Square photo */}
        <div className="relative" style={{ paddingBottom: '133%' }}>
          <img
            src={photo.storageUrl}
            alt="Foto"
            className="photo-analog absolute inset-0 w-full h-full object-cover cursor-pointer"
            style={{ objectPosition: `${(photo.focalX ?? 0.5) * 100}% ${(photo.focalY ?? 0.5) * 100}%` }}
            onClick={() => !confirmDelete && setEditingFocal(true)}
          />
        </div>

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow"
          style={{ backgroundColor: 'rgba(253,246,227,0.9)', color: 'var(--text)', cursor: 'grab' }}
          aria-label="Arrastar foto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow"
          style={{ backgroundColor: 'rgba(220,38,38,0.85)', color: '#fff' }}
          aria-label="Eliminar foto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Delete confirmation overlay */}
        {confirmDelete && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: 'rgba(44,26,14,0.82)' }}
          >
            <p className="font-body text-xs text-white text-center px-2">¿Eliminar foto?</p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="w-11 h-11 rounded-full flex items-center justify-center shadow"
                style={{ backgroundColor: '#DC2626', color: '#fff' }}
                aria-label="Confirmar eliminar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleCancel}
                className="w-11 h-11 rounded-full flex items-center justify-center shadow"
                style={{ backgroundColor: 'rgba(253,246,227,0.9)', color: 'var(--text)' }}
                aria-label="Cancelar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {editingFocal && (
        <FocalPointEditor photo={photo} dateId={dateId} onClose={() => setEditingFocal(false)} />
      )}
    </>
  )
}
