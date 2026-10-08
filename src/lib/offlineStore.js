const DATABASE_NAME = 'waristock-offline'
const DATABASE_VERSION = 2
const SNAPSHOTS_STORE = 'shop-snapshots'
const QUEUE_STORE = 'write-queue'
const PROFILES_STORE = 'profiles'

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Le stockage hors ligne n’est pas disponible dans ce navigateur.'))
      return
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(SNAPSHOTS_STORE)) {
        database.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'userId' })
      }
      if (!database.objectStoreNames.contains(QUEUE_STORE)) {
        database.createObjectStore(QUEUE_STORE, { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains(PROFILES_STORE)) {
        database.createObjectStore(PROFILES_STORE, { keyPath: 'userId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Impossible d’ouvrir le stockage hors ligne.'))
  })
}

async function transact(storeName, mode, operation) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    let result

    try {
      result = operation(store)
    } catch (error) {
      database.close()
      reject(error)
      return
    }

    transaction.oncomplete = () => {
      database.close()
      resolve(result?.result)
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error || new Error('Erreur du stockage hors ligne.'))
    }
    transaction.onabort = () => {
      database.close()
      reject(transaction.error || new Error('Écriture hors ligne annulée.'))
    }
  })
}

export function getShopSnapshot(userId) {
  return transact(SNAPSHOTS_STORE, 'readonly', (store) => store.get(userId))
}

export function saveShopSnapshot(userId, snapshot) {
  return transact(SNAPSHOTS_STORE, 'readwrite', (store) =>
    store.put({ userId, ...snapshot, savedAt: new Date().toISOString() })
  )
}

export function getCachedProfile(userId) {
  return transact(PROFILES_STORE, 'readonly', (store) => store.get(userId))
    .then((record) => record?.profile || null)
}

export function saveCachedProfile(userId, profile) {
  return transact(PROFILES_STORE, 'readwrite', (store) =>
    store.put({ userId, profile })
  )
}

export function enqueueWrite(write) {
  return getQueuedWrites(write.userId).then((writes) => {
    const previousOrder = writes[writes.length - 1]?.queueOrder || 0
    const queueOrder = Math.max(Date.now() * 1000, previousOrder + 1)
    return transact(QUEUE_STORE, 'readwrite', (store) =>
      store.put({ ...write, queueOrder, queuedAt: new Date().toISOString() })
    )
  })
}

export function getQueuedWrites(userId) {
  return transact(QUEUE_STORE, 'readonly', (store) => store.getAll())
    .then((writes) => writes
      .filter((write) => write.userId === userId)
      .sort((a, b) => a.queueOrder - b.queueOrder))
}

export function removeQueuedWrite(id) {
  return transact(QUEUE_STORE, 'readwrite', (store) => store.delete(id))
}

export function countQueuedWrites(userId) {
  return getQueuedWrites(userId).then((writes) => writes.length)
}
