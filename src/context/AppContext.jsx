import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuthContext } from './AuthContext'
import { enqueueWrite, getQueuedWrites, getShopSnapshot, saveShopSnapshot, countQueuedWrites } from '../lib/offlineStore'
import {
  createMovement as saveMovement,
  createProduct as saveProduct,
  createSupplier as saveSupplier,
  getProducts,
  getMovements,
  getSuppliers,
  updateProduct as saveProductUpdate,
} from '../services'
import { synchronizeOfflineWrites } from '../services/offlineSync'

const AppContext = createContext(null)
const isNetworkError = (error) =>
  !navigator.onLine ||
  error instanceof TypeError ||
  /network|fetch|offline|connection/i.test(error?.message || '')

function toProductRows(products, suppliers) {
  return products.map((product) => [
    product.name,
    product.emoji || '/favicon.svg',
    product.category,
    product.stock,
    product.threshold,
    product.unit,
    product.buy_price,
    product.sell_price,
    suppliers.findIndex((supplier) => supplier.id === product.supplier_id),
    product.id,
    product.created_at,
  ])
}

function toMovementRow(movement, productRows) {
  const createdAt = new Date(movement.created_at)
  const timestamp = Number.isNaN(createdAt.getTime())
    ? movement.created_at
    : createdAt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
  return [
    movement.type === 'entry' ? 1 : 0,
    productRows.findIndex((product) => product[9] === movement.product_id),
    movement.quantity,
    timestamp,
    movement.payment_method === 'credit' ? 'Crédit' : 'Espèces',
    movement.client_name || '',
    movement.client_phone || '',
    movement.due_date || '',
    movement.created_at?.slice(0, 10) || '',
    movement.id,
  ]
}

export function AppProvider({ children }) {
  const auth = useAuthContext()
  const [route, setRoute] = useState('login')
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [moveType, setMoveType] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState(0)
  const [period, setPeriod] = useState(0)
  const [economyMode, setEconomyMode] = useState(1)
  const [toast, setToast] = useState(null)
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'system'
    } catch {
      return 'system'
    }
  })

  const applyTheme = useCallback((t) => {
    const root = document.documentElement
    if (t === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else if (t === 'light') {
      root.setAttribute('data-theme', 'light')
    } else {
      root.removeAttribute('data-theme')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      let next
      if (prev === 'dark') {
        next = 'light'
      } else if (prev === 'light') {
        next = 'dark'
      } else {
        const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches
        next = isDarkSystem ? 'light' : 'dark'
      }
      try {
        localStorage.setItem('theme', next)
      } catch {}
      applyTheme(next)
      return next
    })
  }, [applyTheme])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }, [])

  const navigate = useCallback((r) => {
    window.location.hash = `#/${r}`
  }, [])

  const syncRoute = useCallback(() => {
    const h = window.location.hash.replace('#/', '') || 'login'
    setRoute(h)
  }, [])

  const refreshShopData = useCallback(async (userId) => {
    const [supplierResult, productResult, movementResult] = await Promise.all([
      getSuppliers(userId),
      getProducts(userId),
      getMovements(userId),
    ])
    const error = supplierResult.error || productResult.error || movementResult.error
    if (error) throw error

    const supplierRows = supplierResult.data || []
    const supplierState = supplierRows.map((supplier) => [
      supplier.name, supplier.categories, supplier.phone, supplier.id,
    ])
    let pendingWrites = []
    try {
      pendingWrites = await getQueuedWrites(userId)
    } catch (error) {
      showToast(`File hors ligne indisponible : ${error.message}`)
    }
    const pendingMovements = pendingWrites
      .filter((write) => write.type === 'stock-movement')
      .map((write) => write.movement)
    const productData = (productResult.data || []).map((product) => {
      const latestPendingWrite = [...pendingWrites]
        .reverse()
        .find((write) => write.type === 'stock-movement' && write.productId === product.id)
      return latestPendingWrite
        ? { ...product, stock: latestPendingWrite.nextStock }
        : product
    })
    const productRows = toProductRows(productData, supplierRows)
    const movementRows = [...(movementResult.data || []), ...pendingMovements]
      .filter((movement, index, rows) =>
        rows.findIndex((candidate) => candidate.id === movement.id) === index
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((movement) => toMovementRow(movement, productRows))

    setSuppliers(supplierState)
    setProducts(productRows)
    setMovements(movementRows)
    const imageError = (productResult.data || []).find((product) => product.imageError)?.imageError
    if (imageError) {
      showToast(`Les produits sont chargés, mais une photo n’a pas pu être affichée : ${imageError.message}`)
    }
  }, [showToast])

  const syncPendingWrites = useCallback(async () => {
    if (!auth.user?.id || !navigator.onLine || pendingSyncCount === 0) return
    try {
      const result = await synchronizeOfflineWrites(auth.user.id)
      setPendingSyncCount(result.pending)
      if (result.error) {
        showToast(`Synchronisation en attente : ${result.error.message}`)
        return
      }
      await refreshShopData(auth.user.id)
      showToast('Synchronisation terminée ✓')
    } catch (error) {
      showToast(`Synchronisation impossible : ${error.message}`)
    }
  }, [auth.user, pendingSyncCount, refreshShopData, showToast])

  useEffect(() => {
    let active = true

    async function loadShopData() {
      const userId = auth.user?.id
      if (!userId) {
        setProducts([])
        setSuppliers([])
        setMovements([])
        setPendingSyncCount(0)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const snapshot = await getShopSnapshot(userId)
        if (active && snapshot) {
          const cachedProducts = snapshot.products || []
          const cachedMovements = snapshot.movements || []
          let queuedWrites = []
          try {
            queuedWrites = await getQueuedWrites(userId)
          } catch (error) {
            showToast(`File hors ligne indisponible : ${error.message}`)
          }
          const latestStockByProduct = new Map()
          queuedWrites.forEach((write) => {
            if (write.type === 'stock-movement') {
              latestStockByProduct.set(write.productId, write.nextStock)
            }
          })
          const restoredProducts = cachedProducts.map((product) =>
            latestStockByProduct.has(product[9])
              ? [...product.slice(0, 3), latestStockByProduct.get(product[9]), ...product.slice(4)]
              : product
          )
          const cachedMovementIds = new Set(cachedMovements.map((movement) => movement[9]))
          const restoredMovements = queuedWrites
            .filter((write) =>
              write.type === 'stock-movement' && !cachedMovementIds.has(write.movement.id)
            )
            .map((write) => toMovementRow(write.movement, restoredProducts))
            .reverse()
          setSuppliers(snapshot.suppliers || [])
          setProducts(restoredProducts)
          setMovements([...restoredMovements, ...cachedMovements])
          setLoading(false)
        }
      } catch (error) {
        if (active) showToast(error.message || 'Impossible de lire les données hors ligne.')
      }

      if (!navigator.onLine || !active) {
        setLoading(false)
        try {
          setPendingSyncCount(await countQueuedWrites(userId))
        } catch (error) {
          if (active) showToast(error.message || 'Impossible de lire la file de synchronisation.')
        }
        return
      }

      let syncResult
      try {
        syncResult = await synchronizeOfflineWrites(userId)
        if (!active) return
        setPendingSyncCount(syncResult.pending)
        if (syncResult.error) showToast(`Synchronisation en attente : ${syncResult.error.message}`)
      } catch (error) {
        if (active) showToast(`Synchronisation indisponible : ${error.message}`)
      }

      try {
        if (active) await refreshShopData(userId)
      } catch (error) {
        if (active && navigator.onLine) {
          showToast(error.message || 'Impossible de charger les données de la boutique.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadShopData()
    return () => {
      active = false
    }
  }, [auth.user?.id, isOnline, refreshShopData, showToast])

  useEffect(() => {
    if (!auth.user?.id || loading) return
    saveShopSnapshot(auth.user.id, { products, suppliers, movements })
      .catch((error) => showToast(error.message || 'Impossible d’enregistrer les données hors ligne.'))
  }, [auth.user?.id, products, suppliers, movements, loading, showToast])

  const addSupplier = useCallback(async (supplier) => {
    if (!auth.user?.id) {
      return { error: { message: 'Connectez-vous avant d’ajouter un fournisseur.' } }
    }
    if (!navigator.onLine) {
      return { error: { message: 'La création de fournisseur nécessite une connexion Internet.' } }
    }

    const { data, error } = await saveSupplier(auth.user.id, {
      name: supplier[0],
      categories: supplier[1],
      phone: supplier[2],
    })
    if (error) return { error }

    const supplierRow = [data.name, data.categories, data.phone, data.id]
    setSuppliers((current) => [...current, supplierRow])
    return { data: supplierRow, error: null }
  }, [auth.user?.id])

  const addProduct = useCallback(async (product) => {
    if (!auth.user?.id) {
      return { error: { message: 'Connectez-vous avant d’ajouter un produit.' } }
    }
    if (!navigator.onLine) {
      return { error: { message: 'La création de produit nécessite une connexion Internet.' } }
    }

    const selectedSupplier = suppliers.find((supplier) => supplier[3] === product.supplierId)
    const { data, error } = await saveProduct(auth.user.id, {
      name: product.name,
      emoji: product.image || '/favicon.svg',
      category: product.category,
      stock: product.stock,
      threshold: product.threshold,
      unit: product.unit,
      buy_price: product.buyPrice,
      sell_price: product.sellPrice,
      supplier_id: selectedSupplier?.[3] || null,
    })
    if (error) return { error }

    const productRow = [
      data.name,
      data.emoji || '/favicon.svg',
      data.category,
      data.stock,
      data.threshold,
      data.unit,
      data.buy_price,
      data.sell_price,
      product.supplierIndex ?? (
        selectedSupplier ? suppliers.findIndex((supplier) => supplier[3] === selectedSupplier[3]) : -1
      ),
      data.id,
      data.created_at,
    ]
    setProducts((current) => [productRow, ...current])
    setMovements((current) => current.map((movement) => [
      ...movement.slice(0, 1),
      movement[1] >= 0 ? movement[1] + 1 : movement[1],
      ...movement.slice(2),
    ]))
    return { data: productRow, error: null, imageError: data.imageError }
  }, [auth.user?.id, suppliers])

  const recordStockMovement = useCallback(async ({
    productIndex,
    quantity,
    type,
    paymentMethod,
    clientName = null,
    clientPhone = null,
    dueDate = null,
  }) => {
    const product = products[productIndex]
    if (!auth.user?.id || !product?.[9]) {
      return { error: { message: 'Impossible d’identifier le produit ou le compte connecté.' } }
    }
    if (type === 'exit' && quantity > product[3]) {
      return { error: { message: `Stock insuffisant : ${product[3]} ${product[5]}` } }
    }

    const productId = product[9]
    const nextStock = product[3] + (type === 'entry' ? quantity : -quantity)
    const movementId = crypto.randomUUID()
    const movement = {
      id: movementId,
      shop_id: auth.user.id,
      product_id: productId,
      type,
      quantity,
      payment_method: paymentMethod,
      client_name: clientName,
      client_phone: clientPhone,
      due_date: dueDate,
      created_at: new Date().toISOString(),
    }
    const queueMovement = async () => {
      try {
        await enqueueWrite({
          id: movementId,
          userId: auth.user.id,
          type: 'stock-movement',
          productId,
          nextStock,
          movement,
        })
      } catch (error) {
        return { error }
      }
      const productRows = products.map((row) =>
        row[9] === productId ? [...row.slice(0, 3), nextStock, ...row.slice(4)] : row
      )
      const movementRow = toMovementRow(movement, productRows)
      setProducts(productRows)
      setMovements((current) => [movementRow, ...current])
      setPendingSyncCount((count) => count + 1)
      return { data: movement, error: null, pendingSync: true }
    }

    if (!navigator.onLine) return queueMovement()

    const { error: stockError } = await saveProductUpdate(productId, { stock: nextStock })
    if (stockError) return isNetworkError(stockError) ? queueMovement() : { error: stockError }

    let movementResult
    try {
      movementResult = await saveMovement(auth.user.id, movement)
    } catch (error) {
      if (isNetworkError(error)) return queueMovement()
      const { error: rollbackError } = await saveProductUpdate(productId, { stock: product[3] })
      return {
        error: rollbackError
          ? { message: `${error.message} Le stock n’a pas pu être rétabli : ${rollbackError.message}` }
          : error,
      }
    }
    const { data, error } = movementResult
    if (error) {
      if (isNetworkError(error)) return queueMovement()
      const { error: rollbackError } = await saveProductUpdate(productId, { stock: product[3] })
      return {
        error: rollbackError
          ? { message: `${error.message} Le stock n’a pas pu être rétabli : ${rollbackError.message}` }
          : error,
      }
    }

    const movementTime = data.created_at
      ? new Date(data.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
      : 'À l’instant'
    setProducts((current) => current.map((row) =>
      row[9] === productId ? [...row.slice(0, 3), nextStock, ...row.slice(4)] : row
    ))
    setMovements((current) => [[
      type === 'entry' ? 1 : 0,
      productIndex,
      quantity,
      movementTime,
      paymentMethod === 'credit' ? 'Crédit' : 'Espèces',
      clientName || '',
      clientPhone || '',
      dueDate || '',
      data.created_at?.slice(0, 10) || '',
    ], ...current])
    return { data, error: null }
  }, [auth.user?.id, products])

  return (
    <AppContext.Provider
      value={{
        route,
        products,
        setProducts,
        addProduct,
        recordStockMovement,
        suppliers,
        setSuppliers,
        addSupplier,
        movements,
        setMovements,
        selectedId,
        setSelectedId,
        searchQuery,
        setSearchQuery,
        category,
        setCategory,
        moveType,
        setMoveType,
        paymentMethod,
        setPaymentMethod,
        period,
        setPeriod,
        economyMode,
        setEconomyMode,
        loading,
        isOnline,
        pendingSyncCount,
        syncPendingWrites,
        toast,
        showToast,
        navigate,
        syncRoute,
        theme,
        setTheme,
        toggleTheme,
        auth,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
