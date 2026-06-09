import { useEffect, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function FocalPointEditor({ photo, dateId, onClose }) {
  const imgRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function computeFocal(e) {
    const rect = imgRef.current.getBoundingClientRect()
    const focalX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const focalY = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    return { focalX, focalY }
  }

  async function handleClick(e) {
    const { focalX, focalY } = computeFocal(e)
    await updateDoc(doc(db, 'dates', dateId, 'photos', photo.id), { focalX, focalY })
    // Keep denormalized cover photo in sync if this is the first photo
    if (photo.order === 0) {
      await updateDoc(doc(db, 'dates', dateId), {
        'coverPhoto.focalX': focalX,
        'coverPhoto.focalY': focalY,
      })
    }
    onClose()
  }

  return (
    <div
      data-testid="focal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(44,26,14,0.85)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-w-3xl w-full">
        <p className="font-body text-sm text-center mb-3" style={{ color: 'var(--card)', opacity: 0.8 }}>
          Clique na foto para definir o ponto de foco
        </p>
        <div className="relative cursor-crosshair" onClick={handleClick}>
          <img
            ref={imgRef}
            src={photo.storageUrl}
            alt="Definir ponto de foco"
            className="w-full rounded-sm"
            draggable={false}
          />
          <div
            className="absolute w-6 h-6 rounded-full border-4 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow"
            style={{
              left: `${photo.focalX * 100}%`,
              top: `${photo.focalY * 100}%`,
              backgroundColor: 'var(--accent)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
