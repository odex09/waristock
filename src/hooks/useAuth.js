import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getSession, signInWithPhone, signUpWithPhone, signOut } from '../services/auth'

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
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setState({
          user: session.user,
          profile: data || null,
          loading: false,
          error: error || null,
        })
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
          setState(initialState)
          return
        }

        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setState({
            user: session.user,
            profile: data || null,
            loading: false,
            error: error || null,
          })
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

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    const { error } = await signOut()
    setState(initialState)
    return { error }
  }, [])

  return {
    ...state,
    login,
    register,
    logout,
    reload: loadSession,
  }
}
