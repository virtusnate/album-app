import { useRef, useState } from 'react'
import { compressImage } from '../utils/compressImage'
import { uploadPhoto } from '../utils/uploadPhoto'

export function AddPhotosButton({ dateId, currentPhotoCount }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploading(true)
    await Promise.all(
      files.map((file, i) =>
        compressImage(file).then((compressed) =>
          uploadPhoto(compressed, dateId, currentPhotoCount + i)
        )
      )
    )
    setUploading(false)
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <button
        onClick={() => inputRef.current.click()}
        disabled={uploading}
        className="btn-accent w-full sm:w-auto px-8"
        aria-label="Agregar fotos"
      >
        {uploading ? 'Subiendo...' : '+ Agregar fotos'}
      </button>
    </>
  )
}
