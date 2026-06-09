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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(44,26,14,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-sm shadow-2xl p-8"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <h2 className="font-display text-3xl mb-6" style={{ color: 'var(--text)' }}>
          Nova aventura
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
              className="border-b-2 bg-transparent py-2 font-body text-base focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="Ex: Trilha da Pedra Grande"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="date" className="font-body text-sm font-bold" style={{ color: 'var(--text)' }}>
              Data *
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-b-2 bg-transparent py-2 font-body text-base focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="photo" className="font-body text-sm font-bold" style={{ color: 'var(--text)' }}>
              Foto de capa (opcional)
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="font-body text-sm"
            />
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 font-body text-sm border rounded-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title || !date || loading}
              className="px-5 py-2 font-body text-sm text-white rounded-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
