import { vi, describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDates } from './useDates'

vi.mock('../firebase', () => ({ db: {} }))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
}))

import { onSnapshot } from 'firebase/firestore'

describe('useDates', () => {
  it('returns empty array initially', () => {
    onSnapshot.mockImplementation(() => () => {})
    const { result } = renderHook(() => useDates())
    expect(result.current).toEqual([])
  })

  it('returns dates from Firestore snapshot', () => {
    let capturedCallback
    onSnapshot.mockImplementation((_, callback) => {
      capturedCallback = callback
      return () => {}
    })

    const { result } = renderHook(() => useDates())

    act(() => {
      capturedCallback({
        docs: [
          { id: 'id1', data: () => ({ title: 'Hike', date: { toDate: () => new Date('2024-03-15') } }) },
          { id: 'id2', data: () => ({ title: 'Beach', date: { toDate: () => new Date('2024-04-01') } }) },
        ],
      })
    })

    expect(result.current).toHaveLength(2)
    expect(result.current[0]).toMatchObject({ id: 'id1', title: 'Hike' })
  })

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn()
    onSnapshot.mockImplementation(() => unsubscribe)
    const { unmount } = renderHook(() => useDates())
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
