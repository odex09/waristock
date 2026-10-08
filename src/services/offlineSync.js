import { supabase } from '../lib/supabaseClient'
import { getQueuedWrites, removeQueuedWrite } from '../lib/offlineStore'

async function syncStockMovement(write) {
  const { data: existingMovement, error: lookupError } = await supabase
    .from('movements')
    .select('id')
    .eq('id', write.movement.id)
    .maybeSingle()
  if (lookupError) throw lookupError

  if (!existingMovement) {
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: write.nextStock })
      .eq('id', write.productId)
      .eq('shop_id', write.userId)
      .select('id')
      .single()
    if (stockError) throw stockError

    const { error: movementError } = await supabase
      .from('movements')
      .insert(write.movement)
    if (movementError) throw movementError
  }
}

export async function synchronizeOfflineWrites(userId) {
  const writes = await getQueuedWrites(userId)
  let synced = 0

  for (const write of writes) {
    try {
      if (write.type === 'stock-movement') {
        await syncStockMovement(write)
      } else {
        throw new Error(`Type de synchronisation hors ligne inconnu : ${write.type}`)
      }
      await removeQueuedWrite(write.id)
      synced += 1
    } catch (error) {
      return { synced, pending: writes.length - synced, error }
    }
  }

  return { synced, pending: 0, error: null }
}
