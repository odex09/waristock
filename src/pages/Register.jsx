import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

export default function Register() {
  const { navigate } = useApp()
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputs = useRef([])

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('home')
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
            <select aria-label="Pays">
              <option value="+228">🇹🇬 Togo +228</option>
              <option value="+229">🇧🇯 Bénin +229</option>
              <option value="+225">🇨🇮 Côte d'Ivoire +225</option>
              <option value="+221">🇸🇳 Sénégal +221</option>
              <option value="+223">🇲🇱 Mali +223</option>
              <option value="+226">🇧🇫 Burkina Faso +226</option>
              <option value="+233">🇬🇭 Ghana +233</option>
            </select>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Numéro"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="fld">
            <span>Code secret</span>
            <div className="otp">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputs.current[index] = el)}
                  type="text"
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
          >
            Créer le compte
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', opacity: 0.9, fontSize: '13px', fontWeight: 600 }}
            onClick={() => navigate('login')}
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </section>
  )
}
