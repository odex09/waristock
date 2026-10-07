import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'

const PAYMENTS = [
  'Espèces',
  'Orange Money',
  'Moov Money',
  'MTN MoMo',
  'Wave',
  'Crédit',
]

export default function Move() {
  const {
    products,
    setProducts,
    selectedId,
    setSelectedId,
    moveType,
    setMoveType,
    paymentMethod,
    setPaymentMethod,
    movements,
    setMovements,
    showToast,
    navigate,
  } = useApp()
  const [qty, setQty] = useState(1)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [dueDate, setDueDate] = useState('')

  const getToday = () => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  }

  const p = products[selectedId]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const save = () => {
    const n = qty || 1
    if (!moveType && n > p[3]) {
      showToast(`Stock insuffisant : ${p[3]} ${p[5]}`)
      return
    }
    if (!moveType && paymentMethod === 5) {
      setShowCreditModal(true)
      return
    }
    const updated = products.map((prod, i) =>
      i === selectedId
        ? [...prod.slice(0, 3), prod[3] + (moveType ? n : -n), ...prod.slice(4)]
        : prod
    )
    setProducts(updated)
    setMovements([
      [moveType, selectedId, n, 'À l\'instant', PAYMENTS[paymentMethod]],
      ...movements,
    ])
    showToast(moveType ? 'Entrée enregistrée ✓' : 'Sortie enregistrée ✓')
    navigate('detail')
  }

  const confirmCredit = () => {
    if (!clientName.trim()) {
      showToast('Veuillez entrer le nom du client')
      return
    }
    if (!clientPhone.trim()) {
      showToast('Veuillez entrer le numéro de téléphone')
      return
    }
    if (!dueDate) {
      showToast('Veuillez définir la date d\'échéance')
      return
    }
    if (dueDate < getToday()) {
      showToast('La date d\'échéance ne peut pas être dans le passé')
      return
    }
    const n = qty || 1
    const updated = products.map((prod, i) =>
      i === selectedId
        ? [...prod.slice(0, 3), prod[3] + (moveType ? n : -n), ...prod.slice(4)]
        : prod
    )
    setProducts(updated)
    setMovements([
      [moveType, selectedId, n, 'À l\'instant', PAYMENTS[paymentMethod], clientName.trim(), clientPhone.trim(), dueDate, new Date().toISOString().split('T')[0]],
      ...movements,
    ])
    setShowCreditModal(false)
    setClientName('')
    setClientPhone('')
    setDueDate('')
    showToast('Sortie enregistrée ✓')
    navigate('detail')
  }

  return (
    <section className="scr n">
      <div className="top">
        <div className="row">
          <button
            className="ib"
            onClick={() => navigate('home')}
            aria-label="Retour"
          >
            <Icon name="back" />
          </button>
          <h1 style={{ fontSize: '22px' }}>
            Nouveau mouvement
          </h1>
        </div>
      </div>

      <div className="seg">
        <button
          className={`in ${moveType ? 'on' : ''}`}
          onClick={() => setMoveType(1)}
        >
          Entrée
        </button>
        <button
          className={`ou ${!moveType ? 'on' : ''}`}
          onClick={() => setMoveType(0)}
        >
          Sortie
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <label className="fld">
          <span>Produit</span>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(+e.target.value)
            }}
          >
            {products.map((x, i) => (
              <option
                key={i}
                value={i}
              >
                {x[1]} {x[0]}
              </option>
            ))}
          </select>
        </label>

        <span
          className="sub"
          style={{
            display: 'block',
            textAlign: 'center',
          }}
        >
          Quantité ({p ? p[5] : ''})
        </span>
        <div className="stp">
          <button
            type="button"
            aria-label="Moins"
            onClick={() => setQty(Math.max(1, qty - 1))}
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, +e.target.value || 1))
            }
            inputMode="numeric"
            aria-label="Quantité"
          />
          <button
            type="button"
            aria-label="Plus"
            onClick={() => setQty(qty + 1)}
          >
            +
          </button>
        </div>

        <span
          className="sub"
          style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: 700,
          }}
        >
          {moveType ? 'Payé par' : 'Encaissé par'}
        </span>
        <div className="pay">
          {PAYMENTS.map((m, i) => (
            <button
              key={i}
              type="button"
              className={paymentMethod === i ? 'on' : ''}
              onClick={() => setPaymentMethod(i)}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          className="btn f"
          style={
            !moveType ? { background: 'var(--tc)' } : {}
          }
          type="submit"
        >
          {moveType
            ? 'Enregistrer l\'entrée'
            : 'Enregistrer la sortie'}
        </button>
      </form>

      {showCreditModal && (
        <div className="modal-overlay" onClick={() => setShowCreditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Crédit client</h2>
            <div className="fld">
              <span>Nom du client</span>
              <input
                type="text"
                placeholder="Ex: Aminata K."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="fld">
              <span>Numéro WhatsApp</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="90 12 34 56"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
            <div className="fld">
              <span>Date d'échéance</span>
              <input
                type="date"
                min={getToday()}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="row">
              <button
                className="btn o"
                type="button"
                onClick={() => setShowCreditModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn au"
                type="button"
                onClick={confirmCredit}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
