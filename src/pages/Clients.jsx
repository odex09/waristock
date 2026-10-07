import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'

export default function Clients() {
  const { navigate, movements, products } = useApp()

  const clients = movements
    .filter((m) => m[4] === 'Crédit')
    .map((m, i) => {
      const product = products[m[1]]
      const quantity = m[2] || 0
      const unitPrice = product ? product[7] : 0
      const totalAmount = quantity * unitPrice
      return {
        id: i,
        name: m[5] || 'Client',
        phone: m[6] || '',
        product: product ? product[0] : 'Produit inconnu',
        quantity,
        unitPrice,
        amount: totalAmount,
        due: m[7] || '',
        createdAt: m[8] || new Date().toISOString().split('T')[0],
      }
    })

  const waHref = (phone) => {
    const digits = phone.replace(/\D/g, '')
    const num = digits.startsWith('228') ? digits : `228${digits}`
    return `https://wa.me/${num}`
  }

  const totalAmount = clients.reduce((s, c) => s + c.amount, 0)

  return (
    <section className="scr">
      <div className="top">
        <div>
          <h1>Clients</h1>
          <p className="sub">Crédit clients</p>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 14 }}>
        <div className="card" style={{ flex: 1, padding: '14px', textAlign: 'center' }}>
          <div className="sub">Clients</div>
          <b style={{ fontSize: '22px', display: 'block', marginTop: 2 }}>{clients.length}</b>
        </div>
        <div className="card" style={{ flex: 1, padding: '14px', textAlign: 'center' }}>
          <div className="sub">Total dû</div>
          <b style={{ fontSize: '22px', display: 'block', marginTop: 2, color: 'var(--tc)' }}>{totalAmount.toLocaleString('fr-FR')} FCFA</b>
        </div>
      </div>

      <div className="list">
        {clients.length === 0 && (
          <div className="card sub" style={{ padding: '30px', textAlign: 'center' }}>
            Aucun crédit client enregistré
          </div>
        )}
        {clients.map((c) => (
          <div key={c.id} className="card credit">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <div className="meta-label">Client</div>
                <b style={{ fontSize: '15px', display: 'block', marginBottom: '2px' }}>{c.name}</b>
                <div className="sub">{c.phone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="meta-label">Montant dû</div>
                <div className="amount">{c.amount.toLocaleString('fr-FR')} FCFA</div>
              </div>
            </div>
            <div style={{ height: '1px', background: 'var(--l)', margin: '0 0 12px' }}></div>
            <div className="meta">
              <div className="meta-row">
                <span className="meta-label">Produit</span>
                <span className="meta-value">{c.product}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Quantité</span>
                <span className="meta-value">{c.quantity}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Prix unitaire</span>
                <span className="meta-value">{c.unitPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Créé le</span>
                <span className="meta-value">{c.createdAt}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Échéance</span>
                <span className="meta-value" style={{ color: c.due < new Date().toISOString().split('T')[0] ? 'var(--tc)' : 'inherit' }}>
                  {c.due}
                </span>
              </div>
            </div>
            {c.phone && (
              <a
                href={waHref(c.phone)}
                target="_blank"
                rel="noreferrer"
                className="wa-btn"
              >
                <Icon name="chat" />
                WhatsApp
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
