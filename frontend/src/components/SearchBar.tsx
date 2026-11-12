import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import type { Suggestion } from '../lib/types'

export default function SearchBar({ className = '', initial = '' }: { className?: string; initial?: string }) {
  const [q, setQ] = useState(initial)
  const [sugs, setSugs] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const nav = useNavigate(); const { session } = useAuth()
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session || q.trim().length < 2) { setSugs([]); return }
    const t = setTimeout(() => api<Suggestion[]>(`/api/search/suggest?q=${encodeURIComponent(q)}`).then(setSugs).catch(() => setSugs([])), 200)
    return () => clearTimeout(t)
  }, [q, session])
  useEffect(() => { const h = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false); document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])

  const go = (e?: FormEvent) => { e?.preventDefault(); setOpen(false); nav(`/shop?q=${encodeURIComponent(q.trim())}`) }
  const pick = (s: Suggestion) => { setOpen(false); nav(s.type === 'product' ? `/product/${s.id}` : `/shop?category=${s.slug}`) }
  return (
    <div ref={box} className={`relative ${className}`}>
      <form onSubmit={go} role="search" className="flex overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-sand focus-within:ring-2 focus-within:ring-maroon">
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder="Search bedsheets, curtains, sarees, colour, pattern..." className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm outline-none" aria-label="Search products" aria-autocomplete="list" />
        <button className="bg-maroon px-5 text-sm font-medium text-white hover:bg-maroon-dark">Search</button>
      </form>
      {open && sugs.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-sand bg-white text-sm shadow-soft" role="listbox">
          {sugs.map((s) => <li key={s.type + s.id}><button className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-linen" onClick={() => pick(s)}><span>{s.label}</span><span className="text-[11px] uppercase text-gold">{s.type}</span></button></li>)}
        </ul>
      )}
    </div>
  )
}