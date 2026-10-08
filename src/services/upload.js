import { supabase } from '../lib/supabaseClient'

export async function uploadProductImage(file, userId, filename) {
  const path = `${userId}/${filename}`
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  return { data, error }
}

export async function getProductImageUrl(path) {
  const { data, error } = await supabase.storage
    .from('product-images')
    .createSignedUrl(path, 60 * 60)

  return { data: data?.signedUrl || null, error }
}
