// src/components/EditDateModal.jsx
import { useState, useEffect } from 'react'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export function EditDateModal({ date, onClose }) {
  const [title, setTitle] = useState(date.title ?? '')
  const [dateStr, setDateStr] = useState(
    date.date?.toDate().toISOString().split('T')[0] ?? ''
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    if (!title.trim() || !dateStr) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'dates', date.id), {
        title: title.trim(),
        date: Timestamp.fromDate(new Date(dateStr + 'T12:00:00')),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(44,26,14,0.60)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-4"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <h3 className="font-display text-xl" style={{ color: 'var(--text)' }}>
          Editar date
        </h3>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-title" className="font-body text-xs" style={{ color: 'var(--text)', opacity: 0.6 }}>
            Título
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg px-3 py-2 font-body text-sm border"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              minHeight: '44px',
            }}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-date" className="font-body text-xs" style={{ color: 'var(--text)', opacity: 0.6 }}>
            Fecha
          </label>
          <input
            id="edit-date"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-lg px-3 py-2 font-body text-sm border"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              minHeight: '44px',
            }}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-2.5 font-body text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', minHeight: '44px' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !dateStr}
            className="flex-1 btn-accent"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
