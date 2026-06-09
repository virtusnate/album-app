import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateCard } from './DateCard'

const mockDate = {
  id: 'abc123XYZ789abc123XY',
  title: 'Trilha da Pedra',
  date: { toDate: () => new Date('2024-03-15') },
  coverPhoto: { storageUrl: 'https://example.com/photo.jpg', focalX: 0.5, focalY: 0.3 },
}

describe('DateCard', () => {
  it('renders the adventure title', () => {
    render(<DateCard date={mockDate} onClick={() => {}} />)
    expect(screen.getByText('Trilha da Pedra')).toBeInTheDocument()
  })

  it('renders the formatted date', () => {
    render(<DateCard date={mockDate} onClick={() => {}} />)
    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })

  it('renders cover photo when present', () => {
    render(<DateCard date={mockDate} onClick={() => {}} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders placeholder when no cover photo', () => {
    const dateWithoutPhoto = { ...mockDate, coverPhoto: null }
    render(<DateCard date={dateWithoutPhoto} onClick={() => {}} />)
    expect(screen.getByTestId('photo-placeholder')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<DateCard date={mockDate} onClick={onClick} />)
    await userEvent.click(screen.getByRole('article'))
    expect(onClick).toHaveBeenCalledWith(mockDate.id)
  })
})
