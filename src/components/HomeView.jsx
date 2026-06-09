import { useState } from 'react'
import { useDates } from '../hooks/useDates'
import { DateCard } from './DateCard'
import { CreateDateModal } from './CreateDateModal'

export function HomeView({ onSelectDate }) {
  const dates = useDates()
  const [showModal, setShowModal] = useState(false)

  return (
    <main className="max-w-6xl w-full mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-24 sm:pb-10">
      {/* Desktop button — hidden on mobile (FAB takes over) */}
      <div className="hidden sm:flex justify-end mb-6 md:mb-8 flex-shrink-0">
        <button
          onClick={() => setShowModal(true)}
          className="btn-accent"
          aria-label="Añadir Date"
        >
          + Añadir Date
        </button>
      </div>

      {dates.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ opacity: 0.5 }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--border)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-script text-2xl">Ninguna aventura aún...</p>
          <p className="font-body text-sm">Toca "+ Añadir Date" para empezar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 items-start">
          {dates.map((date) => (
            <DateCard key={date.id} date={date} onClick={onSelectDate} />
          ))}
        </div>
      )}

      {/* FAB — mobile only */}
      <button
        onClick={() => setShowModal(true)}
        className="fab sm:hidden"
        aria-label="Añadir Date"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {showModal && <CreateDateModal onClose={() => setShowModal(false)} />}
    </main>
  )
}
