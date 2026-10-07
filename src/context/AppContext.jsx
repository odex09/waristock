import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AppContext = createContext(null)

const PR_INIT = [
  ['Riz parfumé 25 kg', '🍚', 'Céréales', 18, 10, 'sacs', 14500, 16500, 0],
  ['Huile végétale 5 L', '🛢️', 'Huiles', 7, 12, 'bidons', 6200, 7000, 1],
  ['Sucre en morceaux', '🧂', 'Épicerie', 24, 8, 'cartons', 11800, 13000, 0],
  ['Tomate concentrée', '🍅', 'Conserves', 3, 6, 'cartons', 9500, 11000, 2],
  ['Eau minérale 1,5 L', '💧', 'Boissons', 52, 20, 'packs', 1900, 2300, 1],
  ['Sardines à l\'huile', '🐟', 'Conserves', 0, 5, 'cartons', 8500, 9800, 2],
  ['Farine de blé 50 kg', '🌾', 'Céréales', 9, 5, 'sacs', 19500, 22000, 0],
  ['Savon de ménage', '🧼', 'Hygiène', 40, 15, 'cartons', 7600, 8900, 1],
]

const SU_INIT = [
  ['Grossiste Adjamé & Fils', 'Céréales, sucre', '+22890123456'],
  ['Distri-Afrique SARL', 'Huiles, boissons, hygiène', '+22891234567'],
  ['Comptoir Marché Central', 'Conserves', '+22892345678'],
]

const MV_INIT = [
  [1, 3, 12, "Aujourd'hui · 09:14", 'Espèces'],
  [0, 0, 4, "Aujourd'hui · 08:40", 'Orange Money'],
  [1, 4, 10, 'Hier · 17:32', 'Moov Money'],
  [0, 2, 24, 'Hier · 11:05', 'Espèces'],
]

export function AppProvider({ children }) {
  const [route, setRoute] = useState('login')
  const [products, setProducts] = useState(PR_INIT)
  const [suppliers, setSuppliers] = useState(SU_INIT)
  const [movements, setMovements] = useState(MV_INIT)
  const [selectedId, setSelectedId] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [moveType, setMoveType] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState(0)
  const [period, setPeriod] = useState(0)
  const [economyMode, setEconomyMode] = useState(1)
  const [toast, setToast] = useState(null)
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

  const addProduct = useCallback((p) => {
    setProducts((prev) => [...prev, [p.name, p.emoji, p.category, p.stock, p.threshold, p.unit, p.buyPrice, p.sellPrice, p.supplierId]])
  }, [])

  const addSupplier = useCallback((s) => {
    setSuppliers((prev) => [...prev, s])
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

  return (
    <AppContext.Provider
      value={{
        route,
        products,
        setProducts,
        addProduct,
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
        toast,
        showToast,
        navigate,
        syncRoute,
        theme,
        setTheme,
        toggleTheme,
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
