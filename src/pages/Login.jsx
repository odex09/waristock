import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useAuthContext } from '../context/AuthContext'
import { COUNTRY_CODES, validatePhone, formatPhone } from '../lib/phone'

export default function Login() {
  const { navigate, showToast } = useApp()
  const { login, loading, error } = useAuthContext()
  const [countryCode, setCountryCode] = useState('+228')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [localError, setLocalError] = useState('')
  const inputs = useRef([])

  const selectedRule = COUNTRY_CODES.find((c) => c.code === countryCode)

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

    const { error } = await login(countryCode, validation.formatted || phone, password)
    if (error) {
      const msg = error.message || 'Connexion échouée'
      setLocalError(msg)
      showToast(msg)
    } else {
      showToast('Connexion réussie ✓')
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
        <h1>Votre stock, sous contrôle.</h1>
        <p>
          Entrées, sorties, ruptures et fournisseurs. Simple, même avec une
          connexion faible.
        </p>
      </div>
      <div className="sheet">
        <h2 style={{ fontSize: '19px', marginBottom: '4px' }}>Connexion</h2>
        <p
          className="sub"
          style={{ marginBottom: '14px' }}
        >
          Entrez votre numéro et code secret.
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
                opacity: selectedRule?.enabled ? 1 : 0.5,
                cursor: selectedRule?.enabled ? 'pointer' : 'not-allowed',
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
              placeholder={selectedRule?.enabled ? `Ex: ${selectedRule.country} → ${COUNTRY_CODES.find((x)=>x.code===countryCode)?.country || ''}` : 'Bientôt disponible'}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              disabled={!selectedRule?.enabled}
              style={{
                opacity: selectedRule?.enabled ? 1 : 0.5,
                cursor: selectedRule?.enabled ? 'text' : 'not-allowed',
              }}
            />
          </div>
          {selectedRule?.enabled && phone.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--m)', marginTop: -8, marginBottom: 10 }}>
              Format : {COUNTRY_CODES.find((x)=>x.code===countryCode)?.country || ''} → ex: 90 00 00 00
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
            disabled={loading || !selectedRule?.enabled}
            style={{
              opacity: (loading || !selectedRule?.enabled) ? 0.7 : 1,
              cursor: (loading || !selectedRule?.enabled) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', opacity: 0.9, fontSize: '13px', fontWeight: 600 }}
            onClick={() => {
              setLocalError('')
              navigate('register')
            }}
          >
            Créer un compte
          </button>
        </div>
      </div>
    </section>
  )
}
