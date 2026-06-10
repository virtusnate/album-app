import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export function uploadVideo(file, dateId, order, onProgress) {
  return new Promise((resolve, reject) => {
    const videoId = crypto.randomUUID()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('public_id', `dates/${dateId}/${videoId}`)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', async () => {
      try {
        let data
        try {
          data = JSON.parse(xhr.responseText)
        } catch {
          reject(new Error(`Upload failed: unparseable response (HTTP ${xhr.status})`))
          return
        }
        if (xhr.status !== 200) {
          reject(new Error(data.error?.message ?? 'Upload failed'))
          return
        }

        const storageUrl = data.secure_url
        const thumbnailUrl = storageUrl
          .replace('/video/upload/', '/video/upload/so_0,w_400/')
          .replace(/\.[^.]+$/, '.jpg')

        await addDoc(collection(db, 'dates', dateId, 'photos'), {
          storageUrl,
          thumbnailUrl,
          type: 'video',
          order,
          uploadedAt: serverTimestamp(),
        })
        resolve()
      } catch (err) { reject(err) }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during video upload')))
    xhr.send(formData)
  })
}
