import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadPhoto(file, dateId, order) {
  const photoId = crypto.randomUUID()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('public_id', `dates/${dateId}/${photoId}`)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  const storageUrl = data.secure_url

  const docRef = await addDoc(collection(db, 'dates', dateId, 'photos'), {
    storageUrl,
    order,
    focalX: 0.5,
    focalY: 0.5,
    uploadedAt: serverTimestamp(),
  })

  if (order === 0) {
    await updateDoc(doc(db, 'dates', dateId), {
      coverPhoto: { storageUrl, focalX: 0.5, focalY: 0.5 },
    })
  }

  return docRef.id
}
