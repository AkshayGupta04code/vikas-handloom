import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { BUSINESS, fmt, telLink, waLink } from '../lib/business'

export default function Login() {
  const { login, session, logoutReason, clearReason } = useAuth()
  const nav = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from
  const [u, setU] = useState(''); const [p, setP] = useState('')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  if (session) return <Navigate to={from ?? (session.role === 'ADMIN' ? '/admin' : '/shop')} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(''); clearReason()
    try { const s = await login(u.trim(), p); nav(from ?? (s.role === 'ADMIN' ? '/admin' : '/shop'), { replace: true }) }
    catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return (
    <div className="container-x grid place-items-center py-14">
      <div className="card w-full max-w-md p-8 animate-fadeUp">
        <h1 className="text-3xl font-bold text-maroon">Welcome</h1>
        <p className="mt-1 text-sm text-ink/70">Log in with the username and password given to you by VIKAS HANDLOOM. Your access is temporary and set by the shop.</p>
        {(logoutReason || err) && <div role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err || logoutReason}</div>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div><label className="label" htmlFor="u">Username</label><input id="u" className="input" autoComplete="username" autoCapitalize="none" value={u} onChange={(e) => setU(e.target.value)} required /></div>
          <div><label className="label" htmlFor="p">Password</label><input id="p" type="password" className="input" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} required /></div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        </form>
        <div className="mt-6 border-t border-sand pt-4 text-sm text-ink/70">No credentials? Ask the shop: <a className="text-maroon underline" href={telLink(BUSINESS.general[0])}>{fmt(BUSINESS.general[0])}</a> or <a className="text-maroon underline" href={waLink(BUSINESS.general[0], 'Hello, I would like access to the VIKAS HANDLOOM website.')} target="_blank" rel="noreferrer">WhatsApp us</a>.</div>
      </div>
    </div>
  )
}