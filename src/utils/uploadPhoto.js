import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, storage } from '../firebase'

export async function uploadPhoto(file, dateId, order) {
  const photoId = crypto.randomUUID()
  const storageRef = ref(storage, `dates/${dateId}/${photoId}`)
  await uploadBytes(storageRef, file)
  const storageUrl = await getDownloadURL(storageRef)
  const docRef = await addDoc(collection(db, 'dates', dateId, 'photos'), {
    storageUrl,
    order,
    focalX: 0.5,
    focalY: 0.5,
    uploadedAt: serverTimestamp(),
  })
  // Denormalize cover photo onto the date doc so DateCard can render without N+1 queries
  if (order === 0) {
    await updateDoc(doc(db, 'dates', dateId), {
      coverPhoto: { storageUrl, focalX: 0.5, focalY: 0.5 },
    })
  }
  return docRef.id
}
