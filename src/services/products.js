import { supabase } from '../lib/supabaseClient'
import { getProductImageUrl } from './upload'

async function withSignedProductImage(product, userId) {
  if (!product.emoji?.startsWith(`${userId}/`)) {
    return { ...product, imageError: null }
  }

  const { data, error } = await getProductImageUrl(product.emoji)
  if (error) return { ...product, emoji: '/favicon.svg', imageError: error }
  return { ...product, emoji: data, imageError: null }
}

export async function getProducts(shopId) {
  const { data, error } = await supabase
    .from('products')
    .select('*, suppliers(*)')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
  if (error) return { data: null, error }

  const products = await Promise.all(
    data.map((product) => withSignedProductImage(product, shopId))
  )
  return { data: products, error: null }
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, suppliers(*)')
    .eq('id', id)
    .single()
  if (error) return { data: null, error }
  const product = await withSignedProductImage(data, data.shop_id)
  return { data: product, error: null, imageError: product.imageError }
}

export async function createProduct(shopId, productData) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...productData,
      shop_id: shopId,
    })
    .select()
    .single()
  if (error) return { data: null, error }

  return { data: await withSignedProductImage(data, shopId), error: null }
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error }
}
