import { useState } from 'react'
import { useDates } from '../hooks/useDates'
import { DateCard } from './DateCard'
import { CreateDateModal } from './CreateDateModal'

export function HomeView({ onSelectDate }) {
  const dates = useDates()
  const [showModal, setShowModal] = useState(false)

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 font-body text-sm text-white rounded-sm shadow-md"
          style={{ backgroundColor: 'var(--accent)' }}
          aria-label="Nova aventura"
        >
          + Nova aventura
        </button>
      </div>

      {dates.length === 0 ? (
        <div className="text-center py-24 opacity-50">
          <p className="font-script text-2xl">Nenhuma aventura ainda...</p>
          <p className="font-body text-sm mt-2">Clique em "+ Nova aventura" para começar!</p>
        </div>
      ) : (
        <div style={{ columns: '3', columnGap: '1.5rem' }}>
          {dates.map((date) => (
            <DateCard key={date.id} date={date} onClick={onSelectDate} />
          ))}
        </div>
      )}

      {showModal && <CreateDateModal onClose={() => setShowModal(false)} />}
    </main>
  )
}
