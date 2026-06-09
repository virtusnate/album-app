import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../firebase', () => ({ db: {}, storage: {} }))
vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => 'mockRef'),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mockCollectionRef'),
  addDoc: vi.fn(),
  doc: vi.fn(() => 'mockDocRef'),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}))

import { uploadPhoto } from './uploadPhoto'
import { uploadBytes, getDownloadURL } from 'firebase/storage'
import { addDoc, updateDoc } from 'firebase/firestore'

describe('uploadPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads file to storage and writes Firestore doc', async () => {
    const mockFile = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    uploadBytes.mockResolvedValue({})
    getDownloadURL.mockResolvedValue('https://storage.example.com/photo.jpg')
    addDoc.mockResolvedValue({ id: 'newPhotoId' })
    updateDoc.mockResolvedValue({})

    const result = await uploadPhoto(mockFile, 'dateId1', 2)

    expect(uploadBytes).toHaveBeenCalled()
    expect(getDownloadURL).toHaveBeenCalled()
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        storageUrl: 'https://storage.example.com/photo.jpg',
        order: 2,
        focalX: 0.5,
        focalY: 0.5,
      })
    )
    expect(result).toBe('newPhotoId')
  })

  it('updates date doc coverPhoto when order is 0', async () => {
    const mockFile = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    uploadBytes.mockResolvedValue({})
    getDownloadURL.mockResolvedValue('https://storage.example.com/cover.jpg')
    addDoc.mockResolvedValue({ id: 'coverId' })
    updateDoc.mockResolvedValue({})

    await uploadPhoto(mockFile, 'dateId1', 0)

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        coverPhoto: expect.objectContaining({
          storageUrl: 'https://storage.example.com/cover.jpg',
          focalX: 0.5,
          focalY: 0.5,
        }),
      })
    )
  })

  it('does NOT update coverPhoto when order is not 0', async () => {
    const mockFile = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    uploadBytes.mockResolvedValue({})
    getDownloadURL.mockResolvedValue('https://storage.example.com/photo.jpg')
    addDoc.mockResolvedValue({ id: 'photoId' })
    updateDoc.mockResolvedValue({})

    await uploadPhoto(mockFile, 'dateId1', 3)

    expect(updateDoc).not.toHaveBeenCalled()
  })
})
