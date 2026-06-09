import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FocalPointEditor } from './FocalPointEditor'

export function SortablePhoto({ photo, dateId }) {
  const [editingFocal, setEditingFocal] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="relative group rounded-sm overflow-hidden shadow-md"
      >
        <div className="relative" style={{ paddingBottom: '100%' }}>
          <img
            src={photo.storageUrl}
            alt="Foto"
            className="photo-analog absolute inset-0 w-full h-full object-cover cursor-pointer"
            style={{
              objectPosition: `${(photo.focalX ?? 0.5) * 100}% ${(photo.focalY ?? 0.5) * 100}%`,
            }}
            onClick={() => setEditingFocal(true)}
          />
        </div>
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
          style={{ backgroundColor: 'rgba(253,246,227,0.9)', color: 'var(--text)', cursor: 'grab' }}
          aria-label="Arrastar foto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </div>
      {editingFocal && (
        <FocalPointEditor photo={photo} dateId={dateId} onClose={() => setEditingFocal(false)} />
      )}
    </>
  )
}
