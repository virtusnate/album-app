import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DetailView } from './DetailView'

vi.mock('../hooks/usePhotos', () => ({
  usePhotos: () => [
    { id: 'p1', storageUrl: 'https://example.com/1.jpg', order: 0, focalX: 0.5, focalY: 0.5 },
  ],
}))
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), writeBatch: vi.fn(() => ({ update: vi.fn(), commit: vi.fn() })), updateDoc: vi.fn(), deleteDoc: vi.fn() }))
vi.mock('../firebase', () => ({ db: {} }))

const mockDate = {
  id: 'date1',
  title: 'Trilha da Pedra',
  date: { toDate: () => new Date('2024-03-15') },
}

describe('DetailView', () => {
  it('renders the adventure title', () => {
    render(<DetailView date={mockDate} onBack={() => {}} />)
    expect(screen.getByText('Trilha da Pedra')).toBeInTheDocument()
  })

  it('renders back button', () => {
    render(<DetailView date={mockDate} onBack={() => {}} />)
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn()
    render(<DetailView date={mockDate} onBack={onBack} />)
    await userEvent.click(screen.getByRole('button', { name: /volver/i }))
    expect(onBack).toHaveBeenCalled()
  })
})
