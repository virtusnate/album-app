import { vi, describe, it, expect, beforeEach } from 'vitest'
import { compressImage } from './compressImage'

vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}))

import imageCompression from 'browser-image-compression'

describe('compressImage', () => {
  beforeEach(() => {
    imageCompression.mockReset()
  })

  it('calls imageCompression with max 1200px and 0.5MB', async () => {
    const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const mockCompressed = new File(['compressed'], 'photo.jpg', { type: 'image/jpeg' })
    imageCompression.mockResolvedValue(mockCompressed)

    const result = await compressImage(mockFile)

    expect(imageCompression).toHaveBeenCalledWith(mockFile, {
      maxWidthOrHeight: 1200,
      maxSizeMB: 0.5,
      useWebWorker: true,
    })
    expect(result).toBe(mockCompressed)
  })
})
