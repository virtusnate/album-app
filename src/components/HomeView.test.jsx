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

  it('renders + Añadir Date button', () => {
    render(<HomeView onSelectDate={() => {}} />)
    const buttons = screen.getAllByRole('button', { name: /añadir date/i })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('opens modal when + Añadir Date is clicked', async () => {
    render(<HomeView onSelectDate={() => {}} />)
    await userEvent.click(screen.getAllByRole('button', { name: /añadir date/i })[0])
    expect(screen.getByText('Añadir Date')).toBeInTheDocument()
  })

  it('calls onSelectDate when a card is clicked', async () => {
    const onSelectDate = vi.fn()
    render(<HomeView onSelectDate={onSelectDate} />)
    await userEvent.click(screen.getAllByRole('article')[0])
    expect(onSelectDate).toHaveBeenCalledWith('id1')
  })
})
