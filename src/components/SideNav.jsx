import { useApp } from '../context/AppContext'
import { Icon } from './Icons'

const ITEMS = [
  ['home', 'Accueil', 'home'],
  ['products', 'Produits', 'box'],
  ['move', 'Mouvement', 'plus'],
  ['alerts', 'Alertes', 'bell'],
  ['suppliers', 'Fournisseurs', 'users'],
  ['clients', 'Crédit client', 'wallet'],
  ['inventory', 'Inventaire', 'check'],
  ['reports', 'Rapports', 'chart'],
  ['settings', 'Paramètres', 'gear'],
]

export default function SideNav() {
  const { route } = useApp()

  return (
    <aside className="side" aria-label="Navigation">
      <div className="lg">
        <img
          src="/favicon.svg"
          alt="WariStock"
          style={{ width: 38, height: 38, borderRadius: 12, display: 'block' }}
        />
        WariStock
      </div>
      {ITEMS.map(([name, label, icon]) => {
        const active = route === name
        return (
          <a
            key={name}
            href={`#/${name}`}
            className={active ? 'on' : ''}
            onClick={(e) => {
              e.preventDefault()
              window.location.hash = `#/${name}`
            }}
          >
            <Icon name={icon} />
            {label}
          </a>
        )
      })}
    </aside>
  )
}
