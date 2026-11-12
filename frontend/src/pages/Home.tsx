import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import type { Category, Product, ProductPage } from '../lib/types'
import { BUSINESS, fmt, telLink } from '../lib/business'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import Scene from '../showroom/scenes'
import { CategoryCard } from './Categories'
import type { Fabric } from '../lib/fabric'

const DEMO: Fabric[] = [
  { kind: 'pattern', pattern: 'Floral', color: '#7a1f2b', label: 'Maroon floral' }, { kind: 'pattern', pattern: 'Stripes', color: '#2f3e8f', label: 'Indigo stripes' },
  { kind: 'pattern', pattern: 'Geometric', color: '#1f7a7a', label: 'Teal geometric' }, { kind: 'pattern', pattern: 'Checks', color: '#d19a1f', label: 'Mustard checks' },
]

function Row({ title, q, link }: { title: string; q: string; link: string }) {
  const [items, setItems] = useState<Product[]>([])
  useEffect(() => { api<ProductPage>(`/api/products?${q}&size_=4`).then((d) => setItems(d.items)).catch(() => {}) }, [q])
  if (!items.length) return null
  return (
    <section className="container-x mt-14"><div className="mb-4 flex items-end justify-between"><h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2><Link to={link} className="text-sm text-maroon underline">View all</Link></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div></section>
  )
}

export default function Home() {
  const { session } = useAuth()
  const [cats, setCats] = useState<Category[]>([])
  const [k, setK] = useState(0)
  useEffect(() => { const t = setInterval(() => setK((x) => (x + 1) % DEMO.length), 2600); return () => clearInterval(t) }, [])
  useEffect(() => { if (session) api<Category[]>('/api/categories').then(setCats).catch(() => {}) }, [session])

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-maroon-dark via-maroon to-indigo text-white">
        <div className="absolute inset-0 opacity-[.12]" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0 2px,transparent 2px 14px),repeating-linear-gradient(-45deg,#fff 0 2px,transparent 2px 14px)' }} aria-hidden />
        <div className="container-x relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-fadeUp">
            <p className="mb-3 text-xs uppercase tracking-[.3em] text-gold-light">Home furnishing &amp; clothing &middot; Dewas</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Make Every Corner of Your Home Beautiful.</h1>
            <p className="mt-4 max-w-lg text-white/80">Bedsheets, curtains, sofa covers, carpets, sarees and more &mdash; and see them in a room before you buy.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link to="/shop" className="btn-gold">Shop Now</Link><Link to="/categories" className="btn border border-white/60 text-white hover:bg-white hover:text-maroon">Explore Collections</Link></div>
            <SearchBar className="mt-8 max-w-xl" />
            {!session && <p className="mt-3 text-xs text-white/70">The catalogue is available with temporary credentials issued by the shop. <Link to="/login" className="text-gold-light underline">Log in</Link></p>}
          </div>
          <div className="animate-fadeUp">
            <div className="protected overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl"><div className="aspect-[800/520] bg-white"><Scene kind="bed" variant="double" mode="bedsheet" fabric={DEMO[k]} /></div></div>
            <div className="mt-3 flex items-center justify-between text-sm text-white/80"><span>Live preview: {DEMO[k].label}</span><Link to="/showroom" className="text-gold-light underline">Try it yourself &rarr;</Link></div>
          </div>
        </div>
      </section>

      <section className="container-x -mt-8 relative z-10 grid gap-4 md:grid-cols-3">
        {[['Visualize it in your home', 'Apply bedsheets, curtains, sofa covers and carpets to realistic rooms, or upload your own room.', '/showroom'],
          ['Two collections', 'Home furnishing from blankets to carpets, plus sarees, suits and sweaters.', '/categories'],
          ['Visit the shop', BUSINESS.addressLines.join(' '), '/contact']].map(([t, d, to]) => (
          <Link key={t} to={to} className="card p-5 transition hover:-translate-y-1"><h3 className="text-lg font-semibold text-maroon">{t}</h3><p className="mt-1 text-sm text-ink/70">{d}</p></Link>))}
      </section>

      {session ? (
        <>
          <section className="container-x mt-14"><div className="mb-4 flex items-end justify-between"><h2 className="text-2xl font-semibold sm:text-3xl">Shop by category</h2><Link to="/categories" className="text-sm text-maroon underline">All categories</Link></div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">{cats.slice(0, 8).map((c, i) => <CategoryCard key={c.id} c={c} i={i} />)}</div></section>
          <Row title="Featured products" q="featured=true" link="/shop?featured=true" />
          <Row title="New arrivals" q="newArrival=true" link="/shop?newArrival=true" />
          <Row title="Popular collections" q="popular=true" link="/shop?popular=true" />
        </>
      ) : (
        <section className="container-x mt-14"><div className="card grid items-center gap-6 p-8 md:grid-cols-[1fr_auto]">
          <div><h2 className="text-2xl font-semibold sm:text-3xl">Browse the full collection</h2><p className="mt-2 max-w-xl text-ink/70">Our catalogue and virtual showroom are opened for customers with temporary access. Call or message the shop to receive your username and password.</p></div>
          <div className="flex flex-wrap gap-3"><Link to="/login" className="btn-primary">Login</Link><a href={telLink(BUSINESS.general[0])} className="btn-outline">Call {fmt(BUSINESS.general[0])}</a></div></div></section>
      )}
    </>
  )
}