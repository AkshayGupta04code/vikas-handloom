import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { BUSINESS, fmt, mapsLink, telLink, waLink } from '../lib/business'
import { getPublicSettings } from '../lib/api'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={`grid h-10 w-10 place-items-center rounded-full border-2 font-serif text-lg font-bold ${light ? 'border-gold-light text-gold-light' : 'border-maroon text-maroon'}`} aria-hidden>VH</span>
      <span className="whitespace-nowrap leading-none"><span className={`block font-serif text-base font-bold tracking-wide sm:text-lg ${light ? 'text-white' : 'text-maroon'}`}>VIKAS HANDLOOM</span><span className={`block text-[10px] uppercase tracking-[.25em] ${light ? 'text-gold-light' : 'text-gold'}`}>Dewas &middot; M.P.</span></span>
    </span>
  )
}

function Countdown() {
  const { remainingMs, session } = useAuth()
  if (!session || session.role === 'ADMIN' || remainingMs === null) return null
  const s = Math.max(0, Math.floor(remainingMs / 1000))
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
  const text = d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m ${String(s % 60).padStart(2, '0')}s left`
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${s < 600 ? 'bg-red-100 text-red-700' : 'bg-gold/15 text-gold'}`} title="Time remaining on your access">&#9201; {text}</span>
}

const NAV = [['/', 'Home'], ['/shop', 'Shop'], ['/categories', 'Categories'], ['/showroom', 'Virtual Preview'], ['/about', 'About'], ['/contact', 'Contact']] as const

export default function Layout() {
  const { session, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const loc = useLocation(); const nav = useNavigate()
  const [announcement, setAnn] = useState('')
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  useEffect(() => { getPublicSettings().then((s) => setAnn(s.announcement ?? '')).catch(() => {}) }, [])
  const doLogout = async () => { await logout(); nav('/') }
  const link = ({ isActive }: { isActive: boolean }) => `rounded-full px-3 py-1.5 text-sm transition ${isActive ? 'bg-maroon text-white' : 'hover:bg-linen'}`

  return (
    <div className="flex min-h-screen flex-col">
      {announcement && <div className="bg-maroon px-4 py-1.5 text-center text-xs text-white">{announcement}</div>}
      <header className="sticky top-0 z-40 border-b border-sand/70 bg-ivory/90 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between gap-3">
          <Link to="/" aria-label="VIKAS HANDLOOM home"><Logo /></Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">{NAV.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={link}>{l}</NavLink>)}
            {session?.role === 'ADMIN' && <NavLink to="/admin" className={link}>Admin</NavLink>}</nav>
          <div className="flex items-center gap-2">
            <Countdown />
            {session ? <button className="btn-outline !py-1.5" onClick={doLogout}>Logout</button> : <Link to="/login" className="btn-primary !py-1.5">Login</Link>}
            <button className="btn-ghost !px-3 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <>&#10005;</> : <>&#9776;</>}</button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-sand/70 bg-ivory px-4 py-3 lg:hidden" aria-label="Mobile">
            <div className="grid gap-1">{NAV.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={link}>{l}</NavLink>)}{session?.role === 'ADMIN' && <NavLink to="/admin" className={link}>Admin dashboard</NavLink>}</div>
          </nav>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-16 bg-ink text-ivory">
      <div className="container-x grid gap-8 py-12 md:grid-cols-3">
        <div><Logo light /><p className="mt-4 max-w-xs text-sm text-ivory/70">{BUSINESS.tagline}</p></div>
        <div className="text-sm"><h4 className="mb-2 font-serif text-lg text-gold-light">Visit us</h4>
          <address className="not-italic text-ivory/80">{BUSINESS.addressLines.map((l) => <div key={l}>{l}</div>)}</address>
          <a className="mt-2 inline-block text-gold-light underline" href={mapsLink} target="_blank" rel="noreferrer">Open in Google Maps</a></div>
        <div className="text-sm"><h4 className="mb-2 font-serif text-lg text-gold-light">Call / WhatsApp</h4>
          {BUSINESS.general.map((n) => <div key={n}><a className="hover:text-gold-light" href={telLink(n)}>{fmt(n)}</a> &middot; <a className="text-gold-light" href={waLink(n, 'Hello VIKAS HANDLOOM, I have an enquiry.')} target="_blank" rel="noreferrer">WhatsApp</a></div>)}
          <div className="mt-2 rounded-lg bg-white/10 px-3 py-2"><span className="text-xs uppercase tracking-wide text-gold-light">Saree enquiries</span><br /><a href={telLink(BUSINESS.saree)}>{fmt(BUSINESS.saree)}</a> &middot; <a className="text-gold-light" href={waLink(BUSINESS.saree, 'Hello VIKAS HANDLOOM, I have a saree enquiry.')} target="_blank" rel="noreferrer">WhatsApp</a></div></div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-ivory/50">&copy; {new Date().getFullYear()} VIKAS HANDLOOM. Product images are watermarked; please do not copy or redistribute.</div>
    </footer>
  )
}
