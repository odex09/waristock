import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'

export default function Settings() {
  const { economyMode, setEconomyMode, showToast, navigate, auth } = useApp()
  const [profileDraft, setProfileDraft] = useState(null)
  const profile = profileDraft || auth.profile || {
    shop_name: '',
    owner_name: '',
    city: '',
    currency: 'XOF',
  }

  const updateField = (field, value) => {
    setProfileDraft((current) => ({
      ...(current || auth.profile || {}),
      [field]: value,
    }))
  }

  const saveSettings = async () => {
    if (!profile.shop_name.trim()) {
      showToast('Nom de la boutique requis')
      return
    }

    const { error } = await auth.updateProfile({
      shop_name: profile.shop_name.trim(),
      owner_name: profile.owner_name.trim(),
      city: profile.city.trim(),
      currency: profile.currency,
    })
    if (error) {
      showToast(error.message || 'Impossible d’enregistrer les paramètres')
      return
    }

    showToast('Paramètres enregistrés ✓')
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
            Paramètres
          </h1>
        </div>
      </div>

      <div
        className="card"
        style={{ marginBottom: '12px' }}
      >
        <label className="fld">
          <span>Nom de la boutique</span>
          <input
            type="text"
            maxLength={100}
            value={profile.shop_name}
            onChange={(event) => updateField('shop_name', event.target.value)}
          />
        </label>
        <label className="fld">
          <span>Nom du gérant</span>
          <input
            type="text"
            maxLength={100}
            value={profile.owner_name}
            onChange={(event) => updateField('owner_name', event.target.value)}
          />
        </label>
        <label className="fld">
          <span>Ville / Pays</span>
          <input
            type="text"
            maxLength={100}
            value={profile.city}
            onChange={(event) => updateField('city', event.target.value)}
          />
        </label>
        <label
          className="fld"
          style={{ margin: 0 }}
        >
          <span>Devise</span>
          <select value={profile.currency} onChange={(event) => updateField('currency', event.target.value)}>
            <option value="XOF">FCFA (XOF)</option>
            <option value="GNF">GNF</option>
            <option value="GHS">GHS</option>
          </select>
        </label>
      </div>

      <div
        className="card mn"
        style={{ padding: '4px 14px' }}
      >
        <button
          onClick={() => {
            setEconomyMode(!economyMode)
            showToast(
              economyMode
                ? 'Mode économie activé'
                : 'Mode économie désactivé'
            )
          }}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 4px',
            borderBottom: '1px solid var(--l)',
            fontWeight: 600,
            textAlign: 'left',
            background: 'none',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          Mode économie de données
          <span
            className={`tg ${economyMode ? 'on' : ''}`}
            role="switch"
            aria-checked={!!economyMode}
          />
        </button>
      </div>

      <button
        className="btn f"
        style={{ marginTop: '16px' }}
        type="button"
        onClick={saveSettings}
        disabled={auth.loading}
      >
        Enregistrer
      </button>
    </section>
  )
}
