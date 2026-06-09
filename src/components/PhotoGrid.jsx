import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { SortablePhoto } from './SortablePhoto'

export function PhotoGrid({ photos, dateId }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = photos.findIndex((p) => p.id === active.id)
    const newIndex = photos.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(photos, oldIndex, newIndex)

    const batch = writeBatch(db)
    reordered.forEach((photo, index) => {
      batch.update(doc(db, 'dates', dateId, 'photos', photo.id), { order: index })
    })
    await batch.commit()

    // Sync denormalized cover photo on the date doc if first photo changed
    const newFirst = reordered[0]
    if (newFirst && newFirst.id !== photos[0]?.id) {
      await import('firebase/firestore').then(({ updateDoc, doc: firestoreDoc }) =>
        updateDoc(firestoreDoc(db, 'dates', dateId), {
          coverPhoto: { storageUrl: newFirst.storageUrl, focalX: newFirst.focalX, focalY: newFirst.focalY },
        })
      )
    }
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 opacity-50">
        <p className="font-script text-xl">Nenhuma foto ainda...</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <SortablePhoto key={photo.id} photo={photo} dateId={dateId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
