export function HeroPhoto({ photo }) {
  if (!photo) return null
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '60vh' }}>
      <img
        src={photo.storageUrl}
        alt=""
        className="photo-analog w-full h-full object-cover"
        style={{
          objectPosition: `${(photo.focalX ?? 0.5) * 100}% ${(photo.focalY ?? 0.5) * 100}%`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 40%, rgba(44,26,14,0.7) 100%)',
        }}
      />
    </div>
  )
}
