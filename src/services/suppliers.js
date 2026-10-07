import { supabase } from '../lib/supabaseClient'

export async function getSuppliers(shopId) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('shop_id', shopId)
    .order('name')
  return { data, error }
}

export async function createSupplier(shopId, supplierData) {
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      ...supplierData,
      shop_id: shopId,
    })
    .select()
    .single()
  return { data, error }
}

export async function updateSupplier(id, updates) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteSupplier(id) {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)
  return { error }
}
