import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'

const F = (n) =>
  Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g, ' ')

const cls = ['', 'w', 'r']
const lab = ['En stock', 'Stock bas', 'Rupture']

function lv(p) {
  return Math.min(100, Math.round((p[3] / (p[4] * 2)) * 100))
}

function st(p) {
  return p[3] === 0 ? 2 : p[3] <= p[4] ? 1 : 0
}

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

export default function ProductDetail() {
  const { products, movements, selectedId, navigate, setSelectedId, setMoveType } =
    useApp()
  const p = products[selectedId]
  if (!p) return null

  const s = st(p)
  const mg = Math.round(((p[7] - p[6]) / p[6]) * 100)

  return (
    <section className="scr">
      <div className="top">
        <div className="row">
          <button
            className="ib"
            onClick={() => {
              setSelectedId(0)
              navigate('products')
            }}
            aria-label="Retour"
          >
            <Icon name="back" />
          </button>
          <h1 style={{ fontSize: '22px' }}>{p[0]}</h1>
        </div>
      </div>

      <div
        className="card"
        style={{ textAlign: 'center', padding: '22px' }}
      >
        <div
          className="th l"
          style={{ margin: '0 auto 12px' }}
        >
          {p[1]}
        </div>
        <h2 style={{ fontSize: '21px' }}>{p[0]}</h2>
        <p
          className="sub"
          style={{ margin: '2px 0 12px' }}
        >
          {p[2]}
        </p>
        <div
          style={{
            fontSize: '44px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          {p[3]}{' '}
          <span
            className="sub"
            style={{ fontSize: '15px', fontWeight: 600 }}
          >
            {p[5]}
          </span>
        </div>
        <span className={`bd ${cls[s]}`}>
          {lab[s]} · seuil {p[4]}
        </span>
        <div
          className={`bar ${cls[s]}`}
          style={{ marginTop: '14px' }}
        >
          <div
            style={{ width: `${Math.max(4, lv(p))}%` }}
          />
        </div>
      </div>

      <div className="g2" style={{ margin: '12px 0' }}>
        <div className="card">
          <span className="sub">Prix d'achat</span>
          <b>{F(p[6])} F</b>
        </div>
        <div className="card">
          <span className="sub">Prix de vente</span>
          <b>{F(p[7])} F</b>
        </div>
        <div className="card">
          <span className="sub">Marge</span>
          <b style={{ color: 'var(--g)' }}>
            +{mg} %
          </b>
        </div>
        <div className="card">
          <span className="sub">Valeur en stock</span>
          <b>{F(p[3] * p[6])} F</b>
        </div>
      </div>

      <div className="row" style={{ marginBottom: '18px' }}>
        <button
          className="btn"
          style={{ flex: 1 }}
          onClick={() => {
            setMoveType(1)
            navigate('move')
          }}
        >
          <Icon name="down" />
          Entrée
        </button>
        <button
          className="btn o"
          style={{ flex: 1 }}
          onClick={() => {
            setMoveType(0)
            navigate('move')
          }}
        >
          <Icon name="up" />
          Sortie
        </button>
      </div>

      <div className="sh">
        <h2>Historique</h2>
      </div>
      <div className="card" style={{ padding: '4px 14px' }}>
        {movements
          .filter((m) => m[1] === selectedId)
          .map((m, i) => (
            <MovementRow
              key={i}
              m={m}
              products={products}
            />
          ))}
      </div>
    </section>
  )
}
