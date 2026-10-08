import { lazy, Suspense, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import PwaInstallBanner from './components/PwaInstallBanner'

const Login = lazy(() => import('./pages/Login'))
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Move = lazy(() => import('./pages/Move'))
const AddProduct = lazy(() => import('./pages/AddProduct'))
const Alerts = lazy(() => import('./pages/Alerts'))
const Suppliers = lazy(() => import('./pages/Suppliers'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const More = lazy(() => import('./pages/More'))
const Clients = lazy(() => import('./pages/Clients'))
const Register = lazy(() => import('./pages/Register'))

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
  const {
    route,
    syncRoute,
    toast,
    isOnline,
    pendingSyncCount,
    syncPendingWrites,
  } = useApp()

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
      <PwaInstallBanner />
      {(!isOnline || pendingSyncCount > 0) && (
        <div
          className={`connection-status${isOnline ? '' : ' offline'}`}
          role="status"
          aria-live="polite"
        >
          {!isOnline
            ? `Mode hors ligne${pendingSyncCount ? ` · ${pendingSyncCount} mouvement(s) en attente` : ''}`
            : `${pendingSyncCount} mouvement(s) en attente de synchronisation`}
          {isOnline && pendingSyncCount > 0 && (
            <button className="sync-action" onClick={syncPendingWrites}>
              Synchroniser
            </button>
          )}
        </div>
      )}
      {!isAuthPage && <SideNav />}
      <main
        id="app"
        style={{
          paddingBottom: isAuthPage ? 0 : '96px',
          paddingLeft: isAuthPage ? 0 : undefined,
        }}
      >
        <Suspense fallback={<div className="page-loading" role="status">Chargement…</div>}>
          <Page />
        </Suspense>
      </main>
      {!isAuthPage && <BottomNav />}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
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
