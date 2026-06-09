import { useState } from 'react'
import { Header } from './components/Header'
import { HomeView } from './components/HomeView'
import { DetailView } from './components/DetailView'
import { useDates } from './hooks/useDates'

export default function App() {
  const [selectedDateId, setSelectedDateId] = useState(null)
  const dates = useDates()

  const selectedDate = selectedDateId
    ? dates.find((d) => d.id === selectedDateId) ?? null
    : null

  return (
    <>
      {!selectedDate && <Header />}
      {selectedDate ? (
        <DetailView date={selectedDate} onBack={() => setSelectedDateId(null)} />
      ) : (
        <HomeView onSelectDate={setSelectedDateId} />
      )}
    </>
  )
}
