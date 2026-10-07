import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'

export default function Suppliers() {
  const { suppliers, navigate } = useApp()

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
            Fournisseurs
          </h1>
        </div>
      </div>

      <div className="list">
        {suppliers.map((s, i) => (
          <article
            key={i}
            className="card"
          >
            <div
              className="row"
              style={{ marginBottom: '12px' }}
            >
              <div className="th">🏪</div>
              <div>
                <b style={{ fontSize: '16px' }}>
                  {s[0]}
                </b>
                <p className="sub">{s[1]}</p>
              </div>
            </div>
            <div className="row">
              <button
                className="btn o s"
                style={{ flex: 1 }}
                onClick={() =>
                  window.open(`tel:${s[2]}`, '_self')
                }
              >
                <Icon name="phone" />
                Appeler
              </button>
              <button
                className="btn wa s"
                style={{ flex: 1 }}
                onClick={() =>
                  window.open(
                    `https://wa.me/${s[2].slice(1)}`,
                    '_blank',
                    'noopener'
                  )
                }
              >
                <Icon name="chat" />
                WhatsApp
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
