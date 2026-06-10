import { useState, useEffect, useRef } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { doc, writeBatch, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useDates } from '../hooks/useDates'
import { DateCard } from './DateCard'
import { CreateDateModal } from './CreateDateModal'
import { ConfirmDialog } from './ConfirmDialog'
export function HomeView({ onSelectDate }) {
  const dates = useDates()
  const [orderedDates, setOrderedDates] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [dateToDelete, setDateToDelete] = useState(null)
  const initialized = useRef(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    if (!initialized.current) {
      if (dates.length === 0) return
      const sorted = [...dates].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order
        return 0
      })
      setOrderedDates(sorted)
      initialized.current = true
    } else {
      setOrderedDates((prev) => {
        const newIds = new Set(dates.map((d) => d.id))
        const prevIds = new Set(prev.map((d) => d.id))
        const updated = prev
          .filter((d) => newIds.has(d.id))
          .map((d) => dates.find((fd) => fd.id === d.id) ?? d)
        const added = dates.filter((d) => !prevIds.has(d.id))
        return [...updated, ...added]
      })
    }
  }, [dates])

  async function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIndex = orderedDates.findIndex((d) => d.id === active.id)
    const newIndex = orderedDates.findIndex((d) => d.id === over.id)
    const reordered = arrayMove(orderedDates, oldIndex, newIndex)
    setOrderedDates(reordered)
    const batch = writeBatch(db)
    reordered.forEach((date, i) => {
      batch.update(doc(db, 'dates', date.id), { order: i })
    })
    await batch.commit()
  }

  async function handleMove(id, direction) {
    const index = orderedDates.findIndex((d) => d.id === id)
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= orderedDates.length) return
    const reordered = arrayMove(orderedDates, index, newIndex)
    setOrderedDates(reordered)
    const batch = writeBatch(db)
    reordered.forEach((date, i) => {
      batch.update(doc(db, 'dates', date.id), { order: i })
    })
    await batch.commit()
  }

  async function handleDeleteConfirm() {
    if (!dateToDelete) return
    await deleteDoc(doc(db, 'dates', dateToDelete.id))
    setOrderedDates((prev) => prev.filter((d) => d.id !== dateToDelete.id))
    setDateToDelete(null)
  }

  return (
    <main className="max-w-6xl w-full mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-24 sm:pb-10">
      {/* Desktop button */}
      <div className="hidden sm:flex justify-end mb-6 md:mb-8 flex-shrink-0">
        <button onClick={() => setShowModal(true)} className="btn-accent" aria-label="Añadir Date">
          + Añadir Date
        </button>
      </div>

      {orderedDates.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ opacity: 0.5 }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--border)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-script text-2xl">Ninguna aventura aún...</p>
          <p className="font-body text-sm">Toca "+ Añadir Date" para empezar!</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedDates.map((d) => d.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 items-start">
              {orderedDates.map((date, i) => (
                <DateCard
                  key={date.id}
                  date={date}
                  onClick={onSelectDate}
                  onDelete={setDateToDelete}
                  onMoveUp={(id) => handleMove(id, 'up')}
                  onMoveDown={(id) => handleMove(id, 'down')}
                  isFirst={i === 0}
                  isLast={i === orderedDates.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* FAB — mobile only */}
      <button onClick={() => setShowModal(true)} className="fab sm:hidden" aria-label="Añadir Date">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {showModal && <CreateDateModal onClose={() => setShowModal(false)} />}

      {dateToDelete && (
        <ConfirmDialog
          title="¿Eliminar este date?"
          message={`"${dateToDelete.title}" y todas sus fotos serán eliminadas para siempre.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDateToDelete(null)}
        />
      )}


    </main>
  )
}
