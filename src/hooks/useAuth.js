import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCachedProfile, saveCachedProfile } from '../lib/offlineStore'
import {
  getSession,
  signInWithPhone,
  signUpWithPhone,
  signOut,
  updateProfile as saveProfile,
} from '../services/auth'

const initialState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
}

export function useAuth() {
  const [state, setState] = useState(initialState)

  const loadSession = useCallback(async () => {
    try {
      const session = await getSession()
      if (session?.user) {
        let cachedProfile = null
        try {
          cachedProfile = await getCachedProfile(session.user.id)
        } catch (error) {
          console.warn('Impossible de lire le profil hors ligne :', error)
        }
        if (cachedProfile) {
          setState({
            user: session.user,
            profile: cachedProfile,
            loading: false,
            error: null,
          })
        }
        if (!navigator.onLine) {
          setState((current) => ({
            ...current,
            user: session.user,
            profile: cachedProfile || current.profile,
            loading: false,
            error: null,
          }))
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setState({
          user: session.user,
          profile: data || cachedProfile,
          loading: false,
          error: error && !cachedProfile ? error : null,
        })
        if (data) {
          try {
            await saveCachedProfile(session.user.id, data)
          } catch (cacheError) {
            console.warn('Impossible de mettre le profil en cache hors ligne :', cacheError)
          }
        }
      } else {
        setState((s) => ({ ...s, loading: false }))
      }
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }))
    }
  }, [])

  useEffect(() => {
    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setState({ ...initialState, loading: false })
          return
        }

        if (session?.user) {
          loadSession()
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [loadSession])

  const login = useCallback(async (countryCode, phone, password) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    const { data, error } = await signInWithPhone(countryCode, phone, password)
    if (error) {
      setState((s) => ({ ...s, loading: false, error }))
      return { error }
    }
    await loadSession()
    return { data, error: null }
  }, [loadSession])

  const register = useCallback(async (countryCode, phone, password, shopData) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    const { data, error } = await signUpWithPhone(countryCode, phone, password, shopData)
    if (error) {
      setState((s) => ({ ...s, loading: false, error }))
      return { error }
    }
    await loadSession()
    return { data, error: null }
  }, [loadSession])

  const updateProfile = useCallback(async (updates) => {
    if (!state.user) {
      const error = { message: 'Vous devez être connecté pour modifier votre profil.' }
      setState((s) => ({ ...s, error }))
      return { error }
    }

    const { data, error } = await saveProfile(state.user.id, updates)
    if (error) {
      setState((s) => ({ ...s, error }))
      return { error }
    }

    setState((s) => ({ ...s, profile: data, error: null }))
    try {
      await saveCachedProfile(state.user.id, data)
    } catch (cacheError) {
      console.warn('Le profil est enregistré en ligne, mais son cache a échoué :', cacheError)
    }
    return { data, error: null }
  }, [state.user])

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    const { error } = await signOut()
    if (error) {
      setState((s) => ({ ...s, loading: false, error }))
      return { error }
    }
    setState({ ...initialState, loading: false })
    return { error }
  }, [])

  return {
    ...state,
    login,
    register,
    updateProfile,
    logout,
    reload: loadSession,
  }
}
