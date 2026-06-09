import { tiltFromId } from './tiltFromId'

describe('tiltFromId', () => {
  it('returns a number between -2 and 2', () => {
    const tilt = tiltFromId('abc123XYZ789abc123XY')
    expect(tilt).toBeGreaterThanOrEqual(-2)
    expect(tilt).toBeLessThanOrEqual(2)
  })

  it('is deterministic — same ID always returns same tilt', () => {
    const id = 'abc123XYZ789abc123XY'
    expect(tiltFromId(id)).toBe(tiltFromId(id))
  })

  it('returns different values for different IDs', () => {
    const tilts = new Set([
      tiltFromId('aaaaaaaaaaaaaaaaaaa1'),
      tiltFromId('aaaaaaaaaaaaaaaaaaa2'),
      tiltFromId('aaaaaaaaaaaaaaaaaaa3'),
      tiltFromId('bbbbbbbbbbbbbbbbbbb1'),
    ])
    expect(tilts.size).toBeGreaterThan(1)
  })

  it('handles empty string without throwing', () => {
    expect(() => tiltFromId('')).not.toThrow()
  })
})
