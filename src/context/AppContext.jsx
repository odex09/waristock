import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProducts, getSuppliers, getMovements } from '../services'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const auth = useAuth()
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
        suppliers,
        setSuppliers,
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
