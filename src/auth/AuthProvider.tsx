import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { fetchMe, login, logout } from '../api/auth'
import {
  isRequestTimeout,
  refreshAccessToken,
  setAccessToken,
  setOnSessionExpired,
} from '../api/client'
import type { User } from '../api/types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const restoreAttempt = useRef(0)

  const restoreSession = useCallback(async () => {
    const attempt = ++restoreAttempt.current

    try {
      await refreshAccessToken()
      const me = await fetchMe()
      if (attempt !== restoreAttempt.current) return
      setUser(me)
      setStatus('authenticated')
    } catch (error) {
      if (attempt !== restoreAttempt.current) return
      setAccessToken(null)
      setUser(null)
      setStatus(isRequestTimeout(error) ? 'restore-error' : 'anonymous')
    }
  }, [])

  const retrySessionRestore = useCallback(async () => {
    setStatus('loading')
    await restoreSession()
  }, [restoreSession])

  useEffect(() => {
    // If a refresh fails later (cookie expired or revoked), drop back to the login page.
    setOnSessionExpired(() => {
      setUser(null)
      setStatus('anonymous')
    })

    // On page load the in-memory access token is gone. The httpOnly refresh cookie can
    // get a new one, so a reload keeps you signed in.
    const restoreTimer = window.setTimeout(() => void restoreSession(), 0)
    return () => {
      window.clearTimeout(restoreTimer)
      restoreAttempt.current += 1
      setOnSessionExpired(() => {})
    }
  }, [restoreSession])

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
    () => ({ user, status, retrySessionRestore, signIn, signOut }),
    [user, status, retrySessionRestore, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
