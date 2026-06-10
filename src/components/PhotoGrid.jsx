import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { doc, writeBatch, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { SortablePhoto } from './SortablePhoto'

export function PhotoGrid({ photos, dateId, onOpenLightbox }) {
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

    const newFirst = reordered[0]
    if (newFirst && newFirst.id !== photos[0]?.id) {
      await updateDoc(doc(db, 'dates', dateId), {
        coverPhoto: { storageUrl: newFirst.storageUrl, focalX: newFirst.focalX, focalY: newFirst.focalY },
      })
    }
  }

  async function handleDelete(photo) {
    await deleteDoc(doc(db, 'dates', dateId, 'photos', photo.id))

    if (photo.order === 0) {
      const remaining = photos
        .filter((p) => p.id !== photo.id)
        .sort((a, b) => a.order - b.order)

      if (remaining.length > 0) {
        const newCover = remaining[0]
        await updateDoc(doc(db, 'dates', dateId), {
          coverPhoto: { storageUrl: newCover.storageUrl, focalX: newCover.focalX, focalY: newCover.focalY },
        })
      } else {
        await updateDoc(doc(db, 'dates', dateId), { coverPhoto: null })
      }
    }
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 opacity-50">
        <p className="font-script text-xl">Sin fotos aún...</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {photos.map((photo, i) => (
            <SortablePhoto
              key={photo.id}
              photo={photo}
              dateId={dateId}
              onDelete={handleDelete}
              onOpenLightbox={onOpenLightbox ? () => onOpenLightbox(i) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
