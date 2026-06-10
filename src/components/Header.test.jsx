import { render, screen } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header />)
    expect(screen.getByText('Daiva & Nath')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<Header />)
    expect(screen.getByText(/nuestro baúl de recuerdos/i)).toBeInTheDocument()
  })
})
