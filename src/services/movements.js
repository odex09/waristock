import { supabase } from '../lib/supabaseClient'

export async function getMovements(shopId) {
  const { data, error } = await supabase
    .from('movements')
    .select('*, products(*)')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createMovement(shopId, movementData) {
  const { data, error } = await supabase
    .from('movements')
    .insert({
      ...movementData,
      shop_id: shopId,
    })
    .select()
    .single()
  return { data, error }
}

export async function getMovementsByProduct(productId) {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getCreditClients(shopId) {
  const { data, error } = await supabase
    .from('credit_clients')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getStockAlerts(shopId) {
  const { data, error } = await supabase
    .from('stock_alerts')
    .select('*')
    .eq('shop_id', shopId)
    .order('status', { ascending: true })
  return { data, error }
}
