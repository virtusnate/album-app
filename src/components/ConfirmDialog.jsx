import { useEffect } from 'react'

export function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(44,26,14,0.62)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-sm p-6"
        style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-2xl mb-1" style={{ color: 'var(--text)' }}>
          {title}
        </h3>
        {message && (
          <p className="font-body text-sm mb-6 leading-relaxed" style={{ color: 'var(--text)', opacity: 0.6 }}>
            {message}
          </p>
        )}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-3 font-body text-sm border rounded-full min-h-[44px]"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-3 font-body text-sm rounded-full min-h-[44px] text-white"
            style={{ backgroundColor: '#C0392B' }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
