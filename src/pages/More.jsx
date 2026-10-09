import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'
import LogoutButton from '../components/LogoutButton'
import { getRoutePath } from '../lib/routes'

const ITEMS = [
  ['suppliers', 'users', 'Fournisseurs'],
  ['clients', 'wallet', 'Crédit client'],
  ['inventory', 'check', 'Inventaire'],
  ['reports', 'chart', 'Rapports'],
  ['settings', 'gear', 'Paramètres'],
]

export default function More() {
  const { navigate, auth } = useApp()
  const profile = auth.profile
  const ownerName = profile?.owner_name?.trim() || 'Gérant'
  const shopName = profile?.shop_name?.trim() || 'Ma boutique'
  const initials = ownerName
    .split(/\s+/)
    .map((name) => name.charAt(0))
    .join('')
    .slice(0, 2)

  return (
    <section className="scr n">
      <div className="top">
        <h1>Plus</h1>
      </div>

      <div
        className="card row"
        style={{ marginBottom: '14px' }}
      >
        <div
          className="ib pat"
          style={{
            width: '56px',
            height: '56px',
            border: 0,
            color: '#fff',
            fontWeight: 800,
            fontSize: '20px',
          }}
        >
          {initials}
        </div>
        <div>
          <b style={{ fontSize: '17px' }}>
            {ownerName}
          </b>
          <p className="sub">
            {shopName}
          </p>
        </div>
      </div>

      <div
        className="card mn"
        style={{ padding: '4px 14px' }}
      >
        {ITEMS.map(([name, icon, label]) => (
          <a
            key={name}
            href={getRoutePath(name)}
            onClick={(e) => {
              e.preventDefault()
              navigate(name)
            }}
            style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              gap: '14px',
              padding: '16px 4px',
              borderBottom: '1px solid var(--l)',
              fontWeight: 600,
              textAlign: 'left',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <span
              className="ic"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '13px',
                background: 'var(--gl)',
                color: 'var(--g)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon name={icon} />
            </span>
            {label}
            <span className="rg">›</span>
          </a>
        ))}
        <LogoutButton
          className="more-logout"
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 4px',
            fontWeight: 600,
            textAlign: 'left',
            color: 'var(--tc)',
          }}
        >
          <span
            className="ic"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '13px',
              background: 'var(--tcl)',
              color: 'var(--tc)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="logout" />
          </span>
          Déconnexion
        </LogoutButton>
      </div>
    </section>
  )
}
