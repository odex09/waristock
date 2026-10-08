import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'
import ProductCard from '../components/ProductCard'

const F = (n) =>
  Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g, ' ')

function MovementRow({ m, products }) {
  const p = products[m[1]]
  if (!p) return null
  return (
    <div className="mv">
      <div className={`d ${m[0] ? '' : 'o'}`}>{m[0] ? '+' : '−'}</div>
      <div>
        <b style={{ fontSize: '14px' }}>{p[0]}</b>
        <div className="sub">{m[3]} · {m[4]}</div>
      </div>
      <b>{m[0] ? '+' : '−'}{m[2]}</b>
    </div>
  )
}

export default function Home() {
  const {
    products,
    movements,
    navigate,
    setSelectedId,
    setMoveType,
    theme,
    toggleTheme,
    auth,
  } = useApp()
  const profile = auth.profile
  const ownerName = profile?.owner_name?.trim()
  const shopName = profile?.shop_name?.trim() || 'Ma boutique'
  const location = profile?.city?.trim()
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12
    ? 'Bonjour,'
    : currentHour < 18
      ? 'Bon après-midi,'
      : 'Bonsoir,'

  const stockValue = useMemo(
    () => products.reduce((a, p) => a + p[3] * p[6], 0),
    [products]
  )

  const stockChangeThisMonth = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthlyNetByProduct = new Map()

    for (const movement of movements) {
      if (movement[8]?.slice(0, 7) !== currentMonth || movement[1] < 0) continue
      const quantity = movement[2] * (movement[0] ? 1 : -1)
      monthlyNetByProduct.set(
        movement[1],
        (monthlyNetByProduct.get(movement[1]) || 0) + quantity
      )
    }

    const openingStockValue = products.reduce((total, product, index) => {
      const createdThisMonth = product[10]?.slice(0, 7) === currentMonth
      const openingQuantity = createdThisMonth
        ? 0
        : Math.max(0, product[3] - (monthlyNetByProduct.get(index) || 0))
      return total + openingQuantity * product[6]
    }, 0)

    if (openingStockValue === 0) {
      return stockValue > 0 ? null : 0
    }

    return ((stockValue - openingStockValue) / openingStockValue) * 100
  }, [movements, products, stockValue])

  const lowStock = useMemo(
    () => products.filter((p) => p[3] > 0 && p[3] <= p[4]),
    [products]
  )

  const outOfStock = useMemo(
    () => products.filter((p) => p[3] === 0),
    [products]
  )

  const alerts = useMemo(
    () =>
      products
        .map((p, i) => [p, i])
        .filter(([p]) => p[3] === 0 || p[3] <= p[4])
        .sort((a, b) => (b[0][3] === 0 ? 1 : -1)),
    [products]
  )

  return (
    <section className="scr">
      <div className="top">
        <div>
          <p className="sub">{greeting}</p>
          <h1>{ownerName || 'Bienvenue'} 👋</h1>
        </div>
        <div style={{ display: 'inline-flex', gap: 8 }}>
          <button
            className="ib"
            onClick={() => navigate('alerts')}
            aria-label="Alertes"
          >
            <Icon name="bell" />
            {alerts.length > 0 && (
              <span className="n">{alerts.length}</span>
            )}
          </button>
          <button
            className="ib"
            onClick={toggleTheme}
            aria-label="Theme"
          >
            <Icon name={theme === 'dark' ? 'sun' : theme === 'light' ? 'moon' : 'sun'} />
          </button>
        </div>
      </div>

      <div className="row sb" style={{ marginBottom: '14px' }}>
        <div className="shop">
          <i>{shopName.charAt(0).toUpperCase()}</i>
          {shopName}{location ? ` · ${location}` : ''}
        </div>
        <button
          className="btn s au"
          onClick={() => navigate('addProduct')}
        >
          <Icon name="plus" />
          Nouveau produit
        </button>
      </div>

      <div className="two">
        <div>
          <div className="hero pat" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <button
                className="btn s"
                style={{ background: 'var(--tc)', color: '#fff' }}
                onClick={() => navigate('clients')}
              >
                Crédit client
              </button>
              <button
                className="btn s"
                style={{ background: 'var(--au)', color: '#3a2a00' }}
                onClick={() => navigate('reports')}
              >
                Rapport
              </button>
            </div>
            <small>Valeur du stock</small>
            <div className="v">
              {F(stockValue)}
              <span>FCFA</span>
            </div>
            <span className="tr">
              {stockChangeThisMonth === null
                ? 'Nouveau stock ce mois'
                : `${stockChangeThisMonth > 0 ? '↑ ' : stockChangeThisMonth < 0 ? '↓ ' : ''}${Math.abs(stockChangeThisMonth).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} % ce mois`}
            </span>
            <div className="mini">
              <div>
                <b>{products.length}</b>
                <span>Produits</span>
              </div>
              <div>
                <b>{lowStock.length}</b>
                <span>Stock bas</span>
              </div>
              <div>
                <b>{outOfStock.length}</b>
                <span>Ruptures</span>
              </div>
            </div>
          </div>

          <div className="qa">
            <button
              className="a"
              onClick={() => {
                setMoveType(1)
                navigate('move')
              }}
            >
              <span>
                <Icon name="down" />
              </span>
              Entrée
            </button>
            <button
              onClick={() => {
                setMoveType(0)
                navigate('move')
              }}
            >
              <span>
                <Icon name="up" />
              </span>
              Sortie
            </button>
            <button onClick={() => navigate('inventory')}>
              <span>
                <Icon name="check" />
              </span>
              Inventaire
            </button>
            <button onClick={() => navigate('suppliers')}>
              <span>
                <Icon name="users" />
              </span>
              Fournisseurs
            </button>
          </div>
        </div>

        <div>
          <div className="sh">
            <h2>À réapprovisionner</h2>
            <button
              className="lnk"
              onClick={() => navigate('alerts')}
            >
              Tout voir
            </button>
          </div>
          <div className="list">
            {alerts.slice(0, 3).map(([p, i]) => (
              <ProductCard
                key={i}
                product={p}
                index={i}
                status={p[3] === 0 ? 2 : 1}
                threshold={p[4]}
                unit={p[5]}
                onClick={() => {
                  setSelectedId(i)
                  navigate('detail')
                }}
              />
            ))}
            {alerts.length === 0 && (
              <div className="card sub" style={{ padding: '30px', textAlign: 'center' }}>
                Tout est en ordre
              </div>
            )}
          </div>

          <div className="sh" style={{ marginTop: '22px' }}>
            <h2>Produits récents</h2>
            <button className="lnk" onClick={() => navigate('products')}>
              Tout voir
            </button>
          </div>
          <div className="list">
            {products.slice(0, 3).map((product, index) => (
              <ProductCard
                key={product[9] || index}
                product={product}
                onClick={() => {
                  setSelectedId(index)
                  navigate('detail')
                }}
              />
            ))}
            {products.length === 0 && (
              <div className="card sub" style={{ padding: '24px', textAlign: 'center' }}>
                Aucun produit enregistré.
              </div>
            )}
          </div>

          <div className="sh" style={{ marginTop: '22px' }}>
            <h2>Mouvements récents</h2>
          </div>
          <div className="card" style={{ padding: '4px 14px' }}>
            {movements.length > 0 ? movements.slice(0, 4).map((movement, index) => (
              <MovementRow key={`${movement[1]}-${index}`} m={movement} products={products} />
            )) : (
              <p className="sub" style={{ padding: '16px 0', textAlign: 'center' }}>
                Aucun mouvement enregistré.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
