export function tiltFromId(id) {
  const hash = id.split('').reduce(
    (acc, c) => (((acc << 5) - acc + c.charCodeAt(0)) | 0) >>> 0,
    0
  )
  return (hash % 401) / 100 - 2
}
