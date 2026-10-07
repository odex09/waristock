import { supabase } from '../lib/supabaseClient'

export async function getProducts(shopId) {
  const { data, error } = await supabase
    .from('products')
    .select('*, suppliers(*)')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, suppliers(*)')
    .eq('id', id)
    .single()
  return { data, error }
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
  return { data, error }
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
