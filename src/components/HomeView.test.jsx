import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeView } from './HomeView'

vi.mock('../hooks/useDates', () => ({
  useDates: () => [
    { id: 'id1', title: 'Trilha', date: { toDate: () => new Date('2024-03-15') }, coverPhoto: null },
    { id: 'id2', title: 'Praia', date: { toDate: () => new Date('2024-04-01') }, coverPhoto: null },
  ],
}))

describe('HomeView', () => {
  it('renders all date cards', () => {
    render(<HomeView onSelectDate={() => {}} />)
    expect(screen.getByText('Trilha')).toBeInTheDocument()
    expect(screen.getByText('Praia')).toBeInTheDocument()
  })

  it('renders + New Date button', () => {
    render(<HomeView onSelectDate={() => {}} />)
    expect(screen.getByRole('button', { name: /nova aventura/i })).toBeInTheDocument()
  })

  it('opens modal when + New Date is clicked', async () => {
    render(<HomeView onSelectDate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /nova aventura/i }))
    expect(screen.getByText('Nova aventura')).toBeInTheDocument()
  })

  it('calls onSelectDate when a card is clicked', async () => {
    const onSelectDate = vi.fn()
    render(<HomeView onSelectDate={onSelectDate} />)
    await userEvent.click(screen.getAllByRole('article')[0])
    expect(onSelectDate).toHaveBeenCalledWith('id1')
  })
})
