import { supabase } from '../lib/supabaseClient'

const MAX_IMAGE_DIMENSION = 1280
const MAX_COMPRESSED_SIZE = 300 * 1024
const IMAGE_QUALITIES = [0.82, 0.72, 0.62, 0.52]

function loadImage(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file).then((image) => ({
      image,
      width: image.width,
      height: image.height,
      release: () => image.close(),
    }))
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve({
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    })
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Impossible de lire cette image.'))
    }
    image.src = url
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Impossible de compresser cette image sur cet appareil.'))
      }
    }, type, quality)
  })
}

export async function compressProductImage(file) {
  const decoded = await loadImage(file)
  try {
    if (!decoded.width || !decoded.height) {
      throw new Error('Les dimensions de cette image sont invalides.')
    }

    const canvas = document.createElement('canvas')
    let scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(decoded.width, decoded.height))
    let blob = null

    for (let resizeAttempt = 0; resizeAttempt < 7; resizeAttempt += 1) {
      canvas.width = Math.max(1, Math.round(decoded.width * scale))
      canvas.height = Math.max(1, Math.round(decoded.height * scale))
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('La compression des images n’est pas disponible dans ce navigateur.')
      }
      context.drawImage(decoded.image, 0, 0, canvas.width, canvas.height)

      for (const quality of IMAGE_QUALITIES) {
        blob = await canvasToBlob(canvas, 'image/webp', quality)
        if (blob.type !== 'image/webp') {
          throw new Error('Le format WebP n’est pas pris en charge par ce navigateur.')
        }
        if (blob.size <= MAX_COMPRESSED_SIZE) break
      }

      if (blob.size <= MAX_COMPRESSED_SIZE || scale <= 0.4) break
      scale *= 0.8
    }

    if (!blob) throw new Error('La compression de cette image a échoué.')
    if (blob.size > MAX_COMPRESSED_SIZE) {
      throw new Error('Cette image reste trop volumineuse après compression. Choisissez une autre photo.')
    }
    return new File([blob], 'product-image.webp', {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } finally {
    decoded.release()
  }
}

export async function uploadProductImage(file, userId, filename) {
  const compressedFile = await compressProductImage(file)
  const path = `${userId}/${filename}`
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(path, compressedFile, {
      cacheControl: '3600',
      contentType: compressedFile.type,
      upsert: false,
    })

  return { data, error }
}

export async function removeProductImage(path) {
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .remove([path])
    return { data, error }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

export async function getProductImageUrl(path) {
  const { data, error } = await supabase.storage
    .from('product-images')
    .createSignedUrl(path, 60 * 60)

  return { data: data?.signedUrl || null, error }
}
