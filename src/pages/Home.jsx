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
  const { products, navigate, setSelectedId, setMoveType, theme, toggleTheme } = useApp()

  const stockValue = useMemo(
    () => products.reduce((a, p) => a + p[3] * p[6], 0),
    [products]
  )

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
          <p className="sub">Bonjour,</p>
          <h1>Afi 👋</h1>
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
          <i>T</i>
          Boutique Tokoin · Lomé
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
            <span className="tr">↑ 6,4 % ce mois</span>
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
                Tout est en ordre 🎉
              </div>
            )}
          </div>

          <div className="sh" style={{ marginTop: '22px' }}>
            <h2>Mouvements récents</h2>
          </div>
          <div className="card" style={{ padding: '4px 14px' }}>
            {products && (
              <>
                <MovementRow
                  m={[1, 3, 12, "Aujourd'hui · 09:14", 'Espèces']}
                  products={products}
                />
                <MovementRow
                  m={[0, 0, 4, "Aujourd'hui · 08:40", 'Orange Money']}
                  products={products}
                />
                <MovementRow
                  m={[1, 4, 10, 'Hier · 17:32', 'Moov Money']}
                  products={products}
                />
                <MovementRow
                  m={[0, 2, 24, 'Hier · 11:05', 'Espèces']}
                  products={products}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
