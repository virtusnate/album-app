export function HeroPhoto({ photo }) {
  if (!photo) return null

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ aspectRatio: '4/3', maxHeight: '65vh' }}
    >
      {/* Dominant-color fill — heavily blurred to read as solid color */}
      <img
        src={photo.storageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: 'blur(60px) saturate(2) brightness(0.5)',
          transform: 'scale(1.2)',
        }}
        draggable={false}
      />

      {/* Main photo — full image visible, no crop */}
      <img
        src={photo.storageUrl}
        alt="Foto principal"
        className="photo-analog absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* Bottom gradient for title readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(44,26,14,0.70) 100%)' }}
      />
    </div>
  )
}
