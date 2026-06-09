import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FocalPointEditor } from './FocalPointEditor'

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../firebase', () => ({ db: {} }))

const mockPhoto = {
  id: 'photo1',
  storageUrl: 'https://example.com/photo.jpg',
  focalX: 0.5,
  focalY: 0.5,
  order: 0,
}

describe('FocalPointEditor', () => {
  it('renders the photo', () => {
    render(<FocalPointEditor photo={mockPhoto} dateId="date1" onClose={() => {}} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', mockPhoto.storageUrl)
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(<FocalPointEditor photo={mockPhoto} dateId="date1" onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking the backdrop', async () => {
    const onClose = vi.fn()
    render(<FocalPointEditor photo={mockPhoto} dateId="date1" onClose={onClose} />)
    await userEvent.click(screen.getByTestId('focal-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })
})
