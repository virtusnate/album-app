import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPhotosButton } from './AddPhotosButton'

vi.mock('../utils/compressImage', () => ({ compressImage: vi.fn((f) => Promise.resolve(f)) }))
vi.mock('../utils/uploadPhoto', () => ({ uploadPhoto: vi.fn().mockResolvedValue('newId') }))

describe('AddPhotosButton', () => {
  it('renders the button', () => {
    render(<AddPhotosButton dateId="date1" currentPhotoCount={2} />)
    expect(screen.getByRole('button', { name: /agregar fotos/i })).toBeInTheDocument()
  })
})
