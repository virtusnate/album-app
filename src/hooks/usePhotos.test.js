import { vi, describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePhotos } from './usePhotos'

vi.mock('../firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
}))

import { onSnapshot } from 'firebase/firestore'

describe('usePhotos', () => {
  it('returns empty array initially', () => {
    onSnapshot.mockImplementation(() => () => {})
    const { result } = renderHook(() => usePhotos('date1'))
    expect(result.current).toEqual([])
  })

  it('returns photos ordered by order field', () => {
    let capturedCallback
    onSnapshot.mockImplementation((_, callback) => {
      capturedCallback = callback
      return () => {}
    })

    const { result } = renderHook(() => usePhotos('date1'))

    act(() => {
      capturedCallback({
        docs: [
          { id: 'p1', data: () => ({ storageUrl: 'https://url1', order: 0, focalX: 0.5, focalY: 0.5 }) },
          { id: 'p2', data: () => ({ storageUrl: 'https://url2', order: 1, focalX: 0.3, focalY: 0.7 }) },
        ],
      })
    })

    expect(result.current).toHaveLength(2)
    expect(result.current[0]).toMatchObject({ id: 'p1', order: 0 })
    expect(result.current[1]).toMatchObject({ id: 'p2', order: 1 })
  })

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn()
    onSnapshot.mockImplementation(() => unsubscribe)
    const { unmount } = renderHook(() => usePhotos('date1'))
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
