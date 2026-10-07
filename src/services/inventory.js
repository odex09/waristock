import { supabase } from '../lib/supabaseClient'

export async function getInventories(shopId) {
  const { data, error } = await supabase
    .from('inventories')
    .select('*, products(*)')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createInventory(shopId, inventoryData) {
  const { data, error } = await supabase
    .from('inventories')
    .insert({
      ...inventoryData,
      shop_id: shopId,
    })
    .select()
    .single()
  return { data, error }
}
