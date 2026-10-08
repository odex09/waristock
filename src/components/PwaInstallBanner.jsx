import { useEffect, useRef, useState } from 'react'

const INSTALLED_KEY = 'waristock-pwa-installed'

function isAppInstalled() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  if (isStandalone) return true

  try {
    return window.localStorage.getItem(INSTALLED_KEY) === 'true'
  } catch {
    return false
  }
}

function rememberInstallation() {
  try {
    window.localStorage.setItem(INSTALLED_KEY, 'true')
  } catch {
    // Standalone display mode still hides the banner when local storage is unavailable.
  }
}

export default function PwaInstallBanner() {
  const [installed, setInstalled] = useState(isAppInstalled)
  const [visible, setVisible] = useState(!isAppInstalled())
  const [canInstall, setCanInstall] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [installError, setInstallError] = useState('')
  const installPrompt = useRef(null)
  const installedRef = useRef(installed)
  const reappearTimer = useRef(null)

  useEffect(() => {
    const markInstalled = () => {
      installedRef.current = true
      rememberInstallation()
      setInstalled(true)
      setVisible(false)
      setShowHelp(false)
      window.clearTimeout(reappearTimer.current)
    }
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      if (installedRef.current) return
      installPrompt.current = event
      setCanInstall(true)
    }
    const handleDisplayModeChange = (event) => {
      if (event.matches) markInstalled()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', markInstalled)
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    standaloneQuery.addEventListener('change', handleDisplayModeChange)

    if (standaloneQuery.matches || window.navigator.standalone === true) {
      markInstalled()
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', markInstalled)
      standaloneQuery.removeEventListener('change', handleDisplayModeChange)
      window.clearTimeout(reappearTimer.current)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    setShowHelp(false)
    window.clearTimeout(reappearTimer.current)
    reappearTimer.current = window.setTimeout(() => {
      if (!installedRef.current) setVisible(true)
    }, 3000)
  }

  const install = async () => {
    setInstallError('')
    const prompt = installPrompt.current
    if (!prompt) {
      setShowHelp((current) => !current)
      return
    }

    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      installPrompt.current = null
      setCanInstall(false)
      if (outcome === 'accepted') dismiss()
    } catch (error) {
      setInstallError(error.message || 'Impossible de lancer l’installation dans ce navigateur.')
    }
  }

  if (installed || !visible) return null

  return (
    <aside className="pwa-banner" aria-label="Installer WariStock">
      <img className="pwa-banner-icon" src="/icon-192.png" alt="" />
      <div className="pwa-banner-copy">
        <strong>WariStock</strong>
        <span>Installez l’application pour y accéder rapidement</span>
      </div>
      <button className="pwa-banner-install" onClick={install}>
        Installer
      </button>
      <button
        className="pwa-banner-close"
        onClick={dismiss}
        aria-label="Fermer la proposition d’installation"
      >
        ×
      </button>
      {showHelp && (
        <p className="pwa-banner-help" role="status">
          Ouvrez le menu de votre navigateur, puis choisissez « Installer l’application »
          ou « Ajouter à l’écran d’accueil ».
        </p>
      )}
      {!canInstall && !showHelp && (
        <span className="pwa-banner-hint">Application mobile</span>
      )}
      {installError && (
        <p className="pwa-banner-help" role="alert">
          {installError}
        </p>
      )}
    </aside>
  )
}
