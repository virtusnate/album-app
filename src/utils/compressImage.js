import imageCompression from 'browser-image-compression'

export async function compressImage(file) {
  return imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.5,
    useWebWorker: true,
  })
}
