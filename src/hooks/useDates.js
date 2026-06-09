import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function useDates() {
  const [dates, setDates] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'dates'), orderBy('date', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDates(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return unsubscribe
  }, [])

  return dates
}
