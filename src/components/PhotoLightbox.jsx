import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useSwipeable } from 'react-swipeable'

export function PhotoLightbox({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex)
  const [closing, setClosing] = useState(false)
  const closeTimerRef = useRef(null)

  const close = useCallback(() => {
    setClosing(true)
    closeTimerRef.current = setTimeout(onClose, 140)
  }, [onClose])

  useEffect(() => () => clearTimeout(closeTimerRef.current), [])

  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1)), [photos.length])
  const next = useCallback(() => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0)), [photos.length])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, close])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventScrollOnSwipe: true,
    trackMouse: false,
  })

  const photo = photos[index]

  if (!photo) return null

  return (
    <div
      className={closing ? 'lightbox-exit' : 'lightbox-enter'}
      onClick={(e) => e.target === e.currentTarget && close()}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(20,10,5,0.95)',
      }}
    >
      {/* Close */}
      <button
        onClick={close}
        aria-label="Cerrar"
        style={{
          position: 'absolute',
          top: 'max(1rem, env(safe-area-inset-top))',
          right: '1rem',
          zIndex: 10,
          width: '44px', height: '44px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(253,246,227,0.15)', color: '#FDF6E3',
          cursor: 'pointer',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div
        className="absolute left-1/2 -translate-x-1/2 font-body text-xs px-3 py-1 rounded-full"
        style={{
          top: 'max(1rem, env(safe-area-inset-top))',
          backgroundColor: 'rgba(253,246,227,0.15)', color: '#FDF6E3',
          pointerEvents: 'none',
        }}
      >
        {index + 1} / {photos.length}
      </div>

      {/* Left arrow */}
      {photos.length > 1 && (
        <button
          onClick={prev}
          aria-label="Anterior"
          style={{
            position: 'absolute', left: '0.5rem',
            width: '44px', height: '44px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(253,246,227,0.12)', color: '#FDF6E3',
            cursor: 'pointer',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Media */}
      <div
        {...swipeHandlers}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%',
          paddingLeft: '56px', paddingRight: '56px',
          maxHeight: '100dvh',
        }}
      >
        {photo.type === 'video' ? (
          <video
            key={photo.id}
            src={photo.storageUrl}
            controls autoPlay muted playsInline
            style={{ maxWidth: '100%', maxHeight: 'calc(100dvh - 80px)', borderRadius: '2px' }}
          />
        ) : (
          <img
            key={photo.id}
            src={photo.storageUrl}
            alt=""
            draggable={false}
            style={{
              maxWidth: '100%', maxHeight: 'calc(100dvh - 80px)',
              objectFit: 'contain', borderRadius: '2px',
            }}
          />
        )}
      </div>

      {/* Right arrow */}
      {photos.length > 1 && (
        <button
          onClick={next}
          aria-label="Siguiente"
          style={{
            position: 'absolute', right: '0.5rem',
            width: '44px', height: '44px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(253,246,227,0.12)', color: '#FDF6E3',
            cursor: 'pointer',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
