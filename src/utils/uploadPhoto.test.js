import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mockCollectionRef'),
  addDoc: vi.fn(),
  doc: vi.fn(() => 'mockDocRef'),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}))

import { uploadPhoto } from './uploadPhoto'
import { addDoc, updateDoc } from 'firebase/firestore'

const CLOUDINARY_URL = 'https://storage.example.com/photo.jpg'

function mockFetch(url) {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ secure_url: url }),
  })
}

describe('uploadPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads file to Cloudinary and writes Firestore doc', async () => {
    mockFetch(CLOUDINARY_URL)
    addDoc.mockResolvedValue({ id: 'newPhotoId' })
    updateDoc.mockResolvedValue({})

    const mockFile = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await uploadPhoto(mockFile, 'dateId1', 2)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('cloudinary.com'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ storageUrl: CLOUDINARY_URL, order: 2, focalX: 0.5, focalY: 0.5 })
    )
    expect(result).toBe('newPhotoId')
  })

  it('updates date doc coverPhoto when order is 0', async () => {
    mockFetch('https://storage.example.com/cover.jpg')
    addDoc.mockResolvedValue({ id: 'coverId' })
    updateDoc.mockResolvedValue({})

    await uploadPhoto(new File(['img'], 'cover.jpg', { type: 'image/jpeg' }), 'dateId1', 0)

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        coverPhoto: expect.objectContaining({ storageUrl: 'https://storage.example.com/cover.jpg', focalX: 0.5, focalY: 0.5 }),
      })
    )
  })

  it('does NOT update coverPhoto when order is not 0', async () => {
    mockFetch(CLOUDINARY_URL)
    addDoc.mockResolvedValue({ id: 'photoId' })

    await uploadPhoto(new File(['img'], 'photo.jpg', { type: 'image/jpeg' }), 'dateId1', 3)

    expect(updateDoc).not.toHaveBeenCalled()
  })
})
