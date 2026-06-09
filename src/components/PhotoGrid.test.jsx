import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PhotoGrid } from './PhotoGrid'

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
}))
vi.mock('../firebase', () => ({ db: {} }))

const photos = [
  { id: 'p1', storageUrl: 'https://example.com/1.jpg', order: 0, focalX: 0.5, focalY: 0.5 },
  { id: 'p2', storageUrl: 'https://example.com/2.jpg', order: 1, focalX: 0.3, focalY: 0.7 },
]

describe('PhotoGrid', () => {
  it('renders all photos', () => {
    render(<PhotoGrid photos={photos} dateId="date1" />)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
  })

  it('renders empty state when no photos', () => {
    render(<PhotoGrid photos={[]} dateId="date1" />)
    expect(screen.getByText(/nenhuma foto ainda/i)).toBeInTheDocument()
  })
})
