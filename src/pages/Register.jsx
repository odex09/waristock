import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useAuthContext } from '../context/AuthContext'
import { COUNTRY_CODES, validatePhone } from '../lib/phone'

export default function Register() {
  const { navigate, showToast } = useApp()
  const { register, loading, error } = useAuthContext()
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [countryCode, setCountryCode] = useState('+228')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [localError, setLocalError] = useState('')
  const inputs = useRef([])

  const selectedRule = COUNTRY_CODES.find((c) => c.code === countryCode)
  const isCountryEnabled = selectedRule?.enabled || false

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)
    setLocalError('')
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    setPhone(digits)
    setLocalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!shopName.trim()) {
      const msg = 'Nom de la boutique requis'
      setLocalError(msg)
      showToast(msg)
      return
    }

    if (!isCountryEnabled) {
      const msg = 'Pays non disponible pour le moment.'
      setLocalError(msg)
      showToast(msg)
      return
    }

    const validation = validatePhone(countryCode, phone)
    if (!validation.valid) {
      const msg = validation.message
      setLocalError(msg)
      showToast(msg)
      return
    }

    const password = otp.join('')
    if (password.length < 4) {
      const msg = 'Code secret requis'
      setLocalError(msg)
      showToast(msg)
      return
    }

    const { error } = await register(countryCode, validation.formatted || phone, password, {
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      countryCode,
      currency: 'XOF',
    })
    if (error) {
      const msg = error.message || 'Inscription échouée'
      setLocalError(msg)
      showToast(msg)
    } else {
      showToast('Compte créé ✓')
      navigate('home')
    }
  }

  return (
    <section className="log pat">
      <div>
        <div className="lg">
          <img
            src="/favicon.svg"
            alt="WariStock"
            style={{ width: 48, height: 48, borderRadius: 15, display: 'block' }}
          />
          WariStock
        </div>
      </div>
      <div className="sheet">
        <h2 style={{ fontSize: '19px', marginBottom: '4px' }}>Créer un compte</h2>
        <p
          className="sub"
          style={{ marginBottom: '14px' }}
        >
          Remplissez vos informations pour commencer.
        </p>
        {(localError || error) && (
          <div style={{
            background: 'var(--tcl)',
            color: 'var(--tc)',
            padding: '10px 14px',
            borderRadius: 12,
            marginBottom: 14,
            fontSize: 13,
            fontWeight: 600
          }}>
            {localError || error?.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="fld">
            <span>Nom de la boutique</span>
            <input
              type="text"
              placeholder="Ex: Boutique Tokoin"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
          </div>
          <div className="fld">
            <span>Nom du gérant</span>
            <input
              type="text"
              placeholder="Ex: Afi Mensah"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>
          <div className="ph fld">
            <select
              aria-label="Pays"
              value={countryCode}
              onChange={(e) => {
                const code = e.target.value
                setCountryCode(code)
                const rule = COUNTRY_CODES.find((c) => c.code === code)
                if (rule && !rule.enabled) {
                  setLocalError('Disponible prochainement')
                } else {
                  setLocalError('')
                  setPhone('')
                }
              }}
              style={{
                opacity: isCountryEnabled ? 1 : 0.6,
                cursor: isCountryEnabled ? 'pointer' : 'not-allowed',
              }}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code} disabled={!c.enabled}>
                  {c.flag} {c.country} {c.code} {c.enabled ? '' : '(À venir)'}
                </option>
              ))}
            </select>
            <input
              type="tel"
              inputMode="numeric"
              placeholder={isCountryEnabled ? `Ex: ${selectedRule?.country || ''} → ${selectedRule?.format || ''}` : 'Bientôt disponible'}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              disabled={!isCountryEnabled}
              style={{
                opacity: isCountryEnabled ? 1 : 0.5,
                cursor: isCountryEnabled ? 'text' : 'not-allowed',
              }}
            />
          </div>
          {isCountryEnabled && phone.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--m)', marginTop: -8, marginBottom: 10 }}>
              Format : {selectedRule?.country} → ex: {selectedRule?.format}
            </div>
          )}
          {!isCountryEnabled && (
            <div style={{ fontSize: 12, color: 'var(--tc)', marginTop: -8, marginBottom: 10 }}>
              🇹🇬🇧🇯 Togo et Bénin disponibles pour le moment
            </div>
          )}
          <div className="fld">
            <span>Code secret</span>
            <div className="otp">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputs.current[index] = el)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  placeholder="•"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                />
              ))}
            </div>
          </div>
          <button
            className="btn f"
            type="submit"
            disabled={loading || !isCountryEnabled}
            style={{
              opacity: (loading || !isCountryEnabled) ? 0.7 : 1,
              cursor: (loading || !isCountryEnabled) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', opacity: 0.9, fontSize: '13px', fontWeight: 600 }}
            onClick={() => {
              setLocalError('')
              navigate('login')
            }}
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </section>
  )
}
