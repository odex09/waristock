const ROUTE_PATHS = {
  login: '/login',
  register: '/register',
  home: '/home',
  products: '/products',
  detail: '/product',
  move: '/movement',
  addProduct: '/products/new',
  alerts: '/alerts',
  suppliers: '/suppliers',
  inventory: '/inventory',
  reports: '/reports',
  settings: '/settings',
  more: '/more',
  clients: '/clients',
}

const PATH_ROUTES = Object.fromEntries(
  Object.entries(ROUTE_PATHS).map(([route, path]) => [path, route])
)

export function getRoutePath(route) {
  return ROUTE_PATHS[route] || '/'
}

export function getRouteFromLocation() {
  if (window.location.hash.startsWith('#/')) {
    return window.location.hash.slice(2) || 'login'
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  return PATH_ROUTES[path] || (path === '/' ? 'login' : path.slice(1))
}
