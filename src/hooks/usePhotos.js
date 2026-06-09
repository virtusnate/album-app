import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'

export function usePhotos(dateId) {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    if (!dateId) return
    const q = query(
      collection(db, 'dates', dateId, 'photos'),
      orderBy('order', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsubscribe
  }, [dateId])

  return photos
}
