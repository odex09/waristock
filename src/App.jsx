import { useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Move from './pages/Move'
import AddProduct from './pages/AddProduct'
import Alerts from './pages/Alerts'
import Suppliers from './pages/Suppliers'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import More from './pages/More'
import Clients from './pages/Clients'
import Register from './pages/Register'
import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'

const PAGES = {
  login: Login,
  register: Register,
  home: Home,
  products: Products,
  detail: ProductDetail,
  move: Move,
  addProduct: AddProduct,
  alerts: Alerts,
  suppliers: Suppliers,
  inventory: Inventory,
  reports: Reports,
  settings: Settings,
  more: More,
  clients: Clients,
}

const _NAV_MAP = {
  home: 0,
  products: 1,
  detail: 1,
  alerts: 2,
  more: 3,
  suppliers: 3,
  inventory: 3,
  reports: 3,
  settings: 3,
}

function AppContent() {
  const { route, syncRoute } = useApp()

  useEffect(() => {
    const onHash = () => syncRoute()
    window.addEventListener('hashchange', onHash)
    syncRoute()
    return () => window.removeEventListener('hashchange', onHash)
  }, [syncRoute])

  const Page = PAGES[route] || Login
  const isAuthPage = route === 'login' || route === 'register'

  return (
    <>
      {!isAuthPage && <SideNav />}
      <main
        id="app"
        style={{
          paddingBottom: isAuthPage ? 0 : '96px',
          paddingLeft: isAuthPage ? 0 : undefined,
        }}
      >
        <Page />
      </main>
      {!isAuthPage && <BottomNav />}
    </>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
