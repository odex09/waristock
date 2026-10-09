import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'
import { COUNTRY_CODES, PHONE_RULES, validatePhone } from '../lib/phone'

const CASH_PAYMENT = 'Espèces'
const CREDIT_PAYMENT = 'Crédit'

export default function Move() {
  const {
    products,
    selectedId,
    setSelectedId,
    moveType,
    setMoveType,
    paymentMethod,
    setPaymentMethod,
    recordStockMovement,
    showToast,
    navigate,
  } = useApp()
  const [qty, setQty] = useState(1)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCountryCode, setClientCountryCode] = useState('+228')
  const [dueDate, setDueDate] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [showProductOptions, setShowProductOptions] = useState(false)
  const [savingMovement, setSavingMovement] = useState(false)

  const getToday = () => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  }

  const p = products[selectedId]
  const payments = moveType ? [CASH_PAYMENT] : [CASH_PAYMENT, CREDIT_PAYMENT]
  const filteredProducts = products
    .map((product, index) => ({ product, index }))
    .filter(({ product }) =>
      product[0].toLowerCase().includes(productSearch.trim().toLowerCase())
    )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const save = async () => {
    if (!p) {
      showToast('Sélectionnez un produit')
      return
    }
    const n = qty || 1
    if (!moveType && n > p[3]) {
      showToast(`Stock insuffisant : ${p[3]} ${p[5]}`)
      return
    }
    if (!moveType && paymentMethod === 1) {
      setShowCreditModal(true)
      return
    }
    setSavingMovement(true)
    try {
      const { error, pendingSync } = await recordStockMovement({
        productIndex: selectedId,
        quantity: n,
        type: moveType ? 'entry' : 'exit',
        paymentMethod: 'cash',
      })
      if (error) {
        showToast(error.message || 'Impossible d’enregistrer le mouvement')
        return
      }
      showToast(pendingSync
        ? 'Mouvement enregistré hors ligne, synchronisation en attente.'
        : moveType ? 'Entrée enregistrée ✓' : 'Sortie enregistrée ✓')
      navigate('detail')
    } catch (error) {
      showToast(error.message || 'Impossible d’enregistrer le mouvement')
    } finally {
      setSavingMovement(false)
    }
  }

  const confirmCredit = async () => {
    if (!p) {
      showToast('Sélectionnez un produit')
      return
    }
    if (!clientName.trim()) {
      showToast('Veuillez entrer le nom du client')
      return
    }
    const phoneValidation = validatePhone(clientCountryCode, clientPhone)
    if (!phoneValidation.valid) {
      showToast(phoneValidation.message)
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
    setSavingMovement(true)
    try {
      const { error, pendingSync } = await recordStockMovement({
        productIndex: selectedId,
        quantity: qty || 1,
        type: 'exit',
        paymentMethod: 'credit',
        clientName: clientName.trim(),
        clientPhone: `${clientCountryCode}${clientPhone}`,
        dueDate,
      })
      if (error) {
        showToast(error.message || 'Impossible d’enregistrer le crédit')
        return
      }
      setShowCreditModal(false)
      setClientName('')
      setClientPhone('')
      setClientCountryCode('+228')
      setDueDate('')
      showToast(pendingSync
        ? 'Crédit enregistré hors ligne, synchronisation en attente.'
        : 'Crédit client enregistré avec succès ✓')
      navigate('detail')
    } catch (error) {
      showToast(error.message || 'Impossible d’enregistrer le crédit')
    } finally {
      setSavingMovement(false)
    }
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
          onClick={() => {
            setMoveType(1)
            setPaymentMethod(0)
          }}
        >
          Entrée
        </button>
        <button
          className={`ou ${!moveType ? 'on' : ''}`}
          onClick={() => {
            setMoveType(0)
            setPaymentMethod(0)
          }}
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
        <div className="fld product-picker">
          <span>Produit</span>
          <input
            type="search"
            role="combobox"
            aria-label="Rechercher un produit"
            aria-autocomplete="list"
            aria-expanded={showProductOptions}
            aria-controls="move-product-options"
            placeholder={products.length ? 'Rechercher un produit...' : 'Aucun produit enregistré'}
            value={showProductOptions ? productSearch : p?.[0] || ''}
            disabled={products.length === 0}
            onFocus={() => {
              setProductSearch('')
              setShowProductOptions(true)
            }}
            onChange={(event) => {
              setProductSearch(event.target.value)
              setShowProductOptions(true)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setShowProductOptions(false)
              } else if (event.key === 'Enter' && showProductOptions) {
                event.preventDefault()
                const firstMatch = filteredProducts[0]
                if (firstMatch) {
                  setSelectedId(firstMatch.index)
                  setShowProductOptions(false)
                }
              }
            }}
            onBlur={() => setShowProductOptions(false)}
          />
          {showProductOptions && (
            <div
              className="product-picker-options"
              id="move-product-options"
              role="listbox"
            >
              {filteredProducts.length ? filteredProducts.map(({ product, index }) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={index === selectedId}
                  key={product[9] || index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSelectedId(index)
                    setProductSearch('')
                    setShowProductOptions(false)
                  }}
                >
                  {product[0]}
                </button>
              )) : (
                <span className="sub">Aucun produit trouvé.</span>
              )}
            </div>
          )}
        </div>

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
        <div className="pay" style={{ gridTemplateColumns: `repeat(${payments.length}, 1fr)` }}>
          {payments.map((m, i) => (
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
          disabled={savingMovement}
        >
          {savingMovement ? 'Enregistrement...' : moveType
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
                maxLength={120}
                placeholder="Ex: Aminata K."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <label className="fld">
              <span>Numéro WhatsApp</span>
              <div className="ph">
                <select
                  aria-label="Indicatif du client"
                  value={clientCountryCode}
                  onChange={(event) => {
                    setClientCountryCode(event.target.value)
                    setClientPhone('')
                  }}
                >
                  {COUNTRY_CODES.filter((country) => country.enabled).map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder={PHONE_RULES[clientCountryCode]?.format || 'Numéro'}
                  value={clientPhone}
                  onChange={(event) => {
                    const maxLength = PHONE_RULES[clientCountryCode]?.length || 0
                    setClientPhone(event.target.value.replace(/\D/g, '').slice(0, maxLength))
                  }}
                  aria-label="Numéro de téléphone du client"
                />
              </div>
              <small className="sub">
                {COUNTRY_CODES.find((country) => country.code === clientCountryCode)?.country}
                {' · Format : '}
                {PHONE_RULES[clientCountryCode]?.format}
              </small>
            </label>
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
                onClick={() => !savingMovement && setShowCreditModal(false)}
                disabled={savingMovement}
              >
                Annuler
              </button>
              <button
                className="btn au"
                type="button"
                onClick={confirmCredit}
                disabled={savingMovement}
              >
                {savingMovement ? 'Enregistrement...' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
