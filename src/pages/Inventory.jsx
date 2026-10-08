import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'

export default function Inventory() {
  const { products, setProducts, showToast, navigate, isOnline } = useApp()
  const [counts, setCounts] = useState(
    products.map((p) => p[3])
  )

  const validate = () => {
    const updated = [...products]
    counts.forEach((c, i) => {
      updated[i] = [...updated[i]]
      updated[i][3] = c
    })
    setProducts(updated)
    showToast('Inventaire validé ✓')
    navigate('home')
  }

  return (
    <section className="scr n">
      <div className="top">
        <div className="row">
          <button
            className="ib"
            onClick={() => navigate('more')}
            aria-label="Retour"
          >
            <Icon name="back" />
          </button>
          <h1 style={{ fontSize: '22px' }}>
            Inventaire
          </h1>
        </div>
      </div>

      <p
        className="sub"
        style={{ marginBottom: '14px' }}
      >
        Comptez vos produits et corrigez les écarts.
      </p>

      <div className="list">
        {products.map((p, i) => (
          <div
            key={i}
            className="card pr"
          >
            <div className="th">
              {p[1]?.startsWith('/') || p[1]?.startsWith('http') ? (
                <img
                  src={p[1]}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 'inherit',
                  }}
                  onError={(event) => {
                    event.currentTarget.src = '/favicon.svg'
                  }}
                />
              ) : (
                p[1] || <img src="/favicon.svg" alt="" />
              )}
            </div>
            <div>
              <b>{p[0]}</b>
              <span className="sub">
                Théorique : {p[3]} {p[5]}
              </span>
            </div>
            <input
              className="cnt"
              type="number"
              min="0"
              inputMode="numeric"
              value={counts[i]}
              onChange={(e) => {
                const arr = [...counts]
                arr[i] = +e.target.value || 0
                setCounts(arr)
              }}
              aria-label={`Quantité comptée ${p[0]}`}
            />
          </div>
        ))}
      </div>

      <button
        className="btn f"
        style={{ marginTop: '16px' }}
        onClick={validate}
        disabled={!isOnline}
      >
        {isOnline ? "Valider l'inventaire" : 'Connexion requise pour valider'}
      </button>
    </section>
  )
}
