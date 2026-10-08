import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from './Icons'

export default function LogoutButton({ children, className = '', style }) {
  const { auth, navigate, showToast } = useApp()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const confirmLogout = async () => {
    setLoading(true)
    const { error } = await auth.logout()
    setLoading(false)

    if (error) {
      showToast(error.message || 'La déconnexion a échoué')
      return
    }

    setConfirming(false)
    navigate('login')
  }

  return (
    <>
      <button
        type="button"
        className={className}
        style={style}
        onClick={() => setConfirming(true)}
      >
        {children || (
          <>
            <Icon name="logout" />
            Déconnexion
          </>
        )}
      </button>
      {confirming && (
        <div
          className="modal-overlay"
          onClick={() => !loading && setConfirming(false)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="logout-dialog-title">Confirmer la déconnexion</h2>
            <p className="sub" style={{ marginBottom: 18 }}>
              Voulez-vous vraiment vous déconnecter de votre compte ?
            </p>
            <div className="row">
              <button
                type="button"
                className="btn o"
                onClick={() => setConfirming(false)}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn"
                onClick={confirmLogout}
                disabled={loading}
              >
                {loading ? 'Déconnexion...' : 'Confirmer'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
