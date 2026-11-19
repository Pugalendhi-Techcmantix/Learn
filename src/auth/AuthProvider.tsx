import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchMe, login, logout } from '../api/auth'
import { refreshAccessToken, setAccessToken, setOnSessionExpired } from '../api/client'
import type { User } from '../api/types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    // If a refresh fails later (cookie expired or revoked), drop back to the login page.
    setOnSessionExpired(() => {
      setUser(null)
      setStatus('anonymous')
    })

    // On page load the in-memory access token is gone. The httpOnly refresh cookie can
    // get a new one, so a reload keeps you signed in.
    let cancelled = false
    async function restoreSession() {
      try {
        await refreshAccessToken()
        const me = await fetchMe()
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      } catch {
        if (!cancelled) setStatus('anonymous')
      }
    }
    void restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await login(email, password)
    setAccessToken(result.accessToken)
    setUser(result.user)
    setStatus('authenticated')
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logout()
    } finally {
      // Even if the server call fails, this browser should forget the session.
      setAccessToken(null)
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
