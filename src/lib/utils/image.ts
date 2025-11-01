export type ImageVariant = 'thumbnail' | 'display' | 'original'

export interface ProcessedImage {
  thumbnail: Blob
  display: Blob
  original: Blob
}

export async function processImage(file: File): Promise<ProcessedImage> {
  const img = await loadImage(file)
  const thumbnail = await resize(img, 200, 0.7)
  const display = await compress(img, 2 * 1024 * 1024)
  return { thumbnail, display, original: file }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function resize(img: HTMLImageElement, targetWidth: number, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const scale = targetWidth / img.width
  canvas.width = targetWidth
  canvas.height = Math.floor(img.height * scale)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality))
}

async function compress(img: HTMLImageElement, maxSize: number): Promise<Blob> {
  let width = img.width
  let height = img.height
  let quality = 0.9
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  while (quality >= 0.4) {
    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality))
    if (blob.size <= maxSize) return blob
    quality -= 0.1
  }
  // fallback reduce dimensions
  width = Math.floor(width * 0.8)
  height = Math.floor(height * 0.8)
  return compress(img, maxSize)
}


