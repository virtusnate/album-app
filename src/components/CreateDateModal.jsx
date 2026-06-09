import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { compressImage } from '../utils/compressImage'
import { uploadPhoto } from '../utils/uploadPhoto'

export function CreateDateModal({ onClose }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title || !date) return
    setLoading(true)
    const dateRef = await addDoc(collection(db, 'dates'), {
      title,
      date: new Date(date),
      coverPhoto: null,
      createdAt: serverTimestamp(),
    })
    if (file) {
      const compressed = await compressImage(file)
      await uploadPhoto(compressed, dateRef.id, 0)
    }
    setLoading(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: 'rgba(44,26,14,0.65)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-lg shadow-2xl"
        style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-modal)' }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        <div className="px-6 pt-4 sm:pt-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <h2 className="font-display text-3xl mb-6" style={{ color: 'var(--text)' }}>
            Añadir Date
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="font-body text-sm font-bold" style={{ color: 'var(--text)' }}>
                Título *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-b-2 bg-transparent py-3 font-body text-base focus:outline-none min-h-[44px]"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="Ej: Caminata al lago"
                autoComplete="off"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="date" className="font-body text-sm font-bold" style={{ color: 'var(--text)' }}>
                Fecha *
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-b-2 bg-transparent py-3 font-body text-base focus:outline-none min-h-[44px]"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="photo" className="font-body text-sm font-bold" style={{ color: 'var(--text)' }}>
                Foto de portada <span className="font-normal opacity-50">(opcional)</span>
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="font-body text-sm py-2"
              />
            </div>

            <div className="flex gap-3 justify-end mt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 font-body text-sm border rounded-full min-h-[44px]"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title || !date || loading}
                className="btn-accent px-6"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
