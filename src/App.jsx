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
    auth,
    toast,
    isOnline,
    pendingSyncCount,
    syncPendingWrites,
  } = useApp()

  useEffect(() => {
    const onPopState = () => syncRoute()
    window.addEventListener('popstate', onPopState)
    syncRoute()
    return () => window.removeEventListener('popstate', onPopState)
  }, [syncRoute])

  const hasPage = Object.prototype.hasOwnProperty.call(PAGES, route)

  useEffect(() => {
    if (auth.loading) return

    const isPublicRoute = route === 'login' || route === 'register'
    if (window.location.pathname === '/') {
      window.history.replaceState({}, '', auth.user ? '/home' : '/login')
      syncRoute()
    } else if (!auth.user && !isPublicRoute) {
      window.history.replaceState({}, '', '/login')
      syncRoute()
    } else if (auth.user && isPublicRoute) {
      window.history.replaceState({}, '', '/home')
      syncRoute()
    } else if (!hasPage) {
      window.history.replaceState({}, '', auth.user ? '/home' : '/login')
      syncRoute()
    }
  }, [auth.loading, auth.user, hasPage, route, syncRoute])

  const isPublicRoute = route === 'login' || route === 'register'
  const isProtectedRoute = !isPublicRoute
  const canRenderRoute = !auth.loading &&
    (auth.user ? !isPublicRoute && hasPage : isPublicRoute)
  const Page = hasPage ? PAGES[route] : Login
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
      {auth.user && !isAuthPage && <SideNav />}
      <main
        id="app"
        style={{
          paddingBottom: isProtectedRoute && auth.user ? '96px' : 0,
          paddingLeft: isProtectedRoute && auth.user ? undefined : 0,
        }}
      >
        {canRenderRoute ? (
          <Suspense fallback={<div className="page-loading" role="status">Chargement…</div>}>
            <Page />
          </Suspense>
        ) : (
          <div className="page-loading" role="status">Vérification de la session…</div>
        )}
      </main>
      {auth.user && !isAuthPage && <BottomNav />}
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
