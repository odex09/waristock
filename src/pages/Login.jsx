import { useApp } from '../context/AppContext'
import { useState, useRef } from 'react'

export default function Login() {
  const { navigate } = useApp()
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
            defaultValue=""
          />
        </div>
        <div className="fld">
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
          onClick={() => navigate('home')}
        >
          Se connecter
        </button>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', opacity: 0.9, fontSize: '13px', fontWeight: 600 }}
            onClick={() => navigate('register')}
          >
            Créer un compte
          </button>
        </div>
      </div>
    </section>
  )
}
