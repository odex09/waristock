import { useApp } from '../context/AppContext'

const PERIODS = ['Semaine', 'Mois', 'Année']
const BARS = [
  [40, 62, 55, 80, 70, 100, 48],
  [55, 70, 64, 76, 90, 84, 100],
  [62, 72, 80, 88, 76, 95, 100],
]

const TOP_PRODUCTS = [
  ['Riz parfumé 25 kg', 92, '🍚'],
  ['Eau minérale 1,5 L', 78, '💧'],
  ['Huile végétale 5 L', 61, '🛢️'],
  ['Savon de ménage', 44, '🧼'],
]

export default function Reports() {
  const { period, setPeriod } = useApp()
  const bars = BARS[period]

  return (
    <section className="scr">
      <div className="top">
        <div>
          <h1>Rapports</h1>
          <p className="sub">
            Vos ventes et vos marges
          </p>
        </div>
      </div>

      <div className="seg">
        {PERIODS.map((t, i) => (
          <button
            key={i}
            className={period === i ? 'on' : ''}
            onClick={() => setPeriod(i)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="g2" style={{ marginBottom: '12px' }}>
        <div className="card">
          <span className="sub">Ventes</span>
          <b>1 842 000 F</b>
          <span
            style={{
              color: 'var(--g)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            ↑ 12 %
          </span>
        </div>
        <div className="card">
          <span className="sub">Marge brute</span>
          <b>312 500 F</b>
          <span
            style={{
              color: 'var(--g)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            ↑ 8 %
          </span>
        </div>
      </div>

      <div className="two">
        <div className="card">
          <h2 style={{ fontSize: '17px' }}>
            Ventes par jour
          </h2>
          <div
            className="bars"
            role="img"
            aria-label="Graphique des ventes"
          >
            {bars.map((h, i) => (
              <div
                key={i}
                className={i === bars.length - 1 ? 'on' : ''}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="bl">
            {'LMMJVSD'.split('').map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h2
            style={{
              fontSize: '17px',
              marginBottom: '10px',
            }}
          >
            Produits les plus vendus
          </h2>
          {TOP_PRODUCTS.map((t, i) => (
            <div key={i} className="mv">
              <div
                className="th"
                style={{
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  borderRadius: '12px',
                }}
              >
                {t[2]}
              </div>
              <div>
                <b style={{ fontSize: '14px' }}>
                  {t[0]}
                </b>
                <div className="bar">
                  <div style={{ width: `${t[1]}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
