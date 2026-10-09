import { useApp } from '../context/AppContext'
import { Icon } from './Icons'
import { getRoutePath } from '../lib/routes'

const NAV = [
  ['home', 'Accueil', 'home'],
  ['products', 'Produits', 'box'],
  ['move', null, 'plus'],
  ['alerts', 'Alertes', 'bell'],
  ['more', 'Plus', 'menu'],
]

export default function BottomNav() {
  const { route, navigate, products } = useApp()
  const alerts = products.filter((p) => p[3] === 0 || p[3] <= p[4]).length

  const isActive = (name) => {
    if (name === 'move') return route === 'move'
    if (name === 'products') return route === 'products' || route === 'detail'
    if (name === 'alerts') return route === 'alerts'
    if (name === 'more')
      return ['suppliers', 'inventory', 'reports', 'settings', 'more'].includes(route)
    if (name === 'home') return route === 'home'
    return false
  }

  return (
    <nav className="nav" aria-label="Navigation principale">
      {NAV.map(([name, label, icon]) => {
        if (name === 'move') {
          return (
            <a
              key={name}
              className="fab"
              href={getRoutePath('move')}
              onClick={(e) => {
                e.preventDefault()
                navigate('move')
              }}
              aria-label="Nouveau mouvement"
            >
              <Icon name={icon} />
            </a>
          )
        }
        const active = isActive(name)
        return (
          <a
            key={name}
            href={getRoutePath(name)}
            className={active ? 'on' : ''}
            aria-current={active ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault()
              navigate(name)
            }}
          >
            <Icon name={icon} />
            {label}
            {name === 'alerts' && alerts > 0 && (
              <span className="nb">{alerts}</span>
            )}
          </a>
        )
      })}
    </nav>
  )
}
