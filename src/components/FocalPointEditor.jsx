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

  function computeFocal(clientX, clientY) {
    const rect = imgRef.current.getBoundingClientRect()
    const focalX = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const focalY = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    return { focalX, focalY }
  }

  async function saveFocal(focalX, focalY) {
    await updateDoc(doc(db, 'dates', dateId, 'photos', photo.id), { focalX, focalY })
    if (photo.order === 0) {
      await updateDoc(doc(db, 'dates', dateId), {
        'coverPhoto.focalX': focalX,
        'coverPhoto.focalY': focalY,
      })
    }
    onClose()
  }

  function handleClick(e) {
    const { focalX, focalY } = computeFocal(e.clientX, e.clientY)
    saveFocal(focalX, focalY)
  }

  function handleTouch(e) {
    e.preventDefault()
    const touch = e.changedTouches[0]
    const { focalX, focalY } = computeFocal(touch.clientX, touch.clientY)
    saveFocal(focalX, focalY)
  }

  return (
    <div
      data-testid="focal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      style={{ backgroundColor: 'rgba(44,26,14,0.88)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-w-3xl w-full">
        <p className="font-body text-sm text-center mb-3" style={{ color: 'var(--card)', opacity: 0.85 }}>
          Toca la foto para definir el punto de enfoque
        </p>
        <div
          className="relative cursor-crosshair"
          onClick={handleClick}
          onTouchEnd={handleTouch}
        >
          <img
            ref={imgRef}
            src={photo.storageUrl}
            alt="Definir punto de enfoque"
            className="w-full rounded-sm"
            draggable={false}
          />
          {/* Crosshair indicator at current focal point */}
          <div
            className="absolute w-6 h-6 rounded-full border-4 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg"
            style={{
              left: `${photo.focalX * 100}%`,
              top: `${photo.focalY * 100}%`,
              backgroundColor: 'var(--accent)',
            }}
          />
        </div>
        <p className="font-body text-xs text-center mt-3" style={{ color: 'var(--card)', opacity: 0.5 }}>
          Toca fuera de la foto para cerrar
        </p>
      </div>
    </div>
  )
}
