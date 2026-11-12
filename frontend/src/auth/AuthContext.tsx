import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, clearImageCache, clearSession, loadSession, login as apiLogin, setUnauthorizedHandler, type Session } from '../lib/api'

interface Ctx {
  session: Session | null
  remainingMs: number | null
  logoutReason: string | null
  login: (u: string, p: string) => Promise<Session>
  logout: (reason?: string) => Promise<void>
  clearReason: () => void
}
const AuthCtx = createContext<Ctx>(null as never)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const [now, setNow] = useState(Date.now())
  const [logoutReason, setReason] = useState<string | null>(null)

  const finish = useCallback((reason?: string) => {
    clearSession(); clearImageCache(); setSession(null)
    if (reason) setReason(reason)
  }, [])

  const logout = useCallback(async (reason?: string) => {
    if (loadSession()) { try { await api('/api/auth/logout', { method: 'POST', body: {} }) } catch { /* already invalid */ } }
    finish(reason)
  }, [finish])

  useEffect(() => setUnauthorizedHandler(() => finish('Your session has ended or access was revoked. Please log in again.')), [finish])

  // Tick every second for the countdown; auto-logout when the assigned period ends.
  useEffect(() => {
    if (!session) return
    const t = setInterval(() => {
      setNow(Date.now())
      if (new Date(session.expiresAt).getTime() <= Date.now() + session.clockSkewMs) finish('Your access period has ended. Please contact VIKAS HANDLOOM for new credentials.')
    }, 1000)
    return () => clearInterval(t)
  }, [session, finish])

  // Validate with the server on load (catches revocation done while the tab was closed).
  useEffect(() => { if (session) api('/api/auth/me').catch(() => {}) }, [])  // eslint-disable-line

  const value = useMemo<Ctx>(() => ({
    session,
    remainingMs: session ? new Date(session.expiresAt).getTime() - (now + session.clockSkewMs) : null,
    logoutReason,
    login: async (u, p) => { const s = await apiLogin(u, p); setReason(null); setSession(s); return s },
    logout, clearReason: () => setReason(null),
  }), [session, now, logoutReason, logout])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}