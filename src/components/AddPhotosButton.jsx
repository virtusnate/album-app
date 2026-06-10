import { useRef, useState } from 'react'
import { compressImage } from '../utils/compressImage'
import { uploadPhoto } from '../utils/uploadPhoto'
import { uploadVideo } from '../utils/uploadVideo'

export function AddPhotosButton({ dateId, currentPhotoCount }) {
  const inputRef = useRef(null)
  const [uploadState, setUploadState] = useState(null)

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const videos = files.filter((f) => f.type.startsWith('video/'))
    const images = files.filter((f) => !f.type.startsWith('video/'))

    try {
      if (images.length > 0) {
        setUploadState('images')
        await Promise.all(
          images.map((file, i) =>
            compressImage(file).then((compressed) =>
              uploadPhoto(compressed, dateId, currentPhotoCount + i)
            )
          )
        )
      }

      for (let i = 0; i < videos.length; i++) {
        const order = currentPhotoCount + images.length + i
        setUploadState(0)
        await uploadVideo(videos[i], dateId, order, (pct) => setUploadState(pct))
      }
    } finally {
      setUploadState(null)
      e.target.value = ''
    }
  }

  const isUploading = uploadState !== null
  const label = uploadState === null
    ? '+ Agregar fotos y videos'
    : uploadState === 'images'
    ? 'Subiendo fotos…'
    : `Subiendo video… ${uploadState}%`

  return (
    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <button
        onClick={() => inputRef.current.click()}
        disabled={isUploading}
        className="btn-accent w-full sm:w-auto px-8"
        aria-label="Agregar fotos y videos"
      >
        {label}
      </button>
      {typeof uploadState === 'number' && (
        <div className="w-full sm:w-64 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{ width: `${uploadState}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>
      )}
    </div>
  )
}
