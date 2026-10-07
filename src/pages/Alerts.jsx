import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'

function st(p) {
  return p[3] === 0 ? 2 : p[3] <= p[4] ? 1 : 0
}
const cls = ['', 'w', 'r']
const lab = ['En stock', 'Stock bas', 'Rupture']

export default function Alerts() {
  const { products, suppliers, setSelectedId, setMoveType, navigate } =
    useApp()

  const alerts = useMemo(() => {
    return products
      .map((p, i) => [p, i])
      .filter(([p]) => st(p) > 0)
      .sort((a, b) => (b[0][3] === 0 ? 1 : -1))
  }, [products])

  return (
    <section className="scr">
      <div className="top">
        <div>
          <h1>Alertes</h1>
          <p className="sub">
            {alerts.length} produit(s) à réapprovisionner
          </p>
        </div>
      </div>

      <div className="list c2">
        {alerts.length > 0 ? (
          alerts.map(([p, i]) => {
            const s = st(p)
            const su = suppliers[p[8]]
            const orderQty = p[4] * 2 - p[3]
            return (
              <article
                key={i}
                className={`card al ${s === 2 ? 'r' : ''}`}
              >
                <div className="pr">
                  <div className="th">{p[1]}</div>
                  <div>
                    <b style={{ fontSize: '16px' }}>
                      {p[0]}
                    </b>
                    <p className="sub">
                      {su ? su[0] : ''}
                    </p>
                  </div>
                  <span className={`bd ${cls[s]}`}>
                    {lab[s]}
                  </span>
                </div>
                <div
                  className="row sb"
                  style={{ margin: '12px 0' }}
                >
                  <span className="sub">
                    Stock :{' '}
                    <b style={{ color: 'var(--t)' }}>
                      {p[3]}
                    </b>{' '}
                    / seuil {p[4]} {p[5]}
                  </span>
                  <span className="sub">
                    À commander :{' '}
                    <b style={{ color: 'var(--t)' }}>
                      {orderQty}
                    </b>
                  </span>
                </div>
                <div className="row">
                  <button
                    className="btn wa s"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Bonjour, je souhaite commander ${orderQty} ${p[5]} de ${p[0]}`
                      )
                      const phone = su
                        ? su[2].slice(1)
                        : ''
                      window.open(
                        `https://wa.me/${phone}?text=${text}`,
                        '_blank',
                        'noopener'
                      )
                    }}
                  >
                    <Icon name="chat" />
                    Commander
                  </button>
                  <button
                    className="btn o s"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setSelectedId(i)
                      setMoveType(1)
                      navigate('move')
                    }}
                  >
                    Entrée
                  </button>
                </div>
              </article>
            )
          })
        ) : (
          <div
            className="card sub"
            style={{
              padding: '30px',
              textAlign: 'center',
            }}
          >
            Aucune alerte. Votre stock est en bonne santé 🎉
          </div>
        )}
      </div>
    </section>
  )
}
