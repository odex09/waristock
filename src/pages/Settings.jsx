import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'

export default function Settings() {
  const { economyMode, setEconomyMode, showToast, navigate } = useApp()

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
            defaultValue="Boutique Tokoin"
          />
        </label>
        <label className="fld">
          <span>Ville / Pays</span>
          <input
            type="text"
            defaultValue="Lomé, Togo"
          />
        </label>
        <label
          className="fld"
          style={{ margin: 0 }}
        >
          <span>Devise</span>
          <select>
            <option>FCFA (XOF)</option>
            <option>GNF</option>
            <option>GHS</option>
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
        <button
          onClick={() =>
            showToast('Sauvegarde envoyée ✓')
          }
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 4px',
            fontWeight: 600,
            textAlign: 'left',
            background: 'none',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          Sauvegarder maintenant
          <span className="rg">›</span>
        </button>
      </div>

      <button
        className="btn f"
        style={{ marginTop: '16px' }}
        onClick={() => showToast('Paramètres enregistrés ✓')}
      >
        Enregistrer
      </button>
    </section>
  )
}
