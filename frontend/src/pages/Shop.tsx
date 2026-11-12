import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Category, Filters, Product, ProductPage } from '../lib/types'
import ProductCard from '../components/ProductCard'
import QuickView from '../components/QuickView'
import SearchBar from '../components/SearchBar'

export default function Shop() {
  const [sp, setSp] = useSearchParams()
  const [data, setData] = useState<ProductPage | null>(null)
  const [cats, setCats] = useState<Category[]>([])
  const [filters, setFilters] = useState<Filters | null>(null)
  const [quick, setQuick] = useState<Product | null>(null)
  const [err, setErr] = useState('')
  const [showF, setShowF] = useState(false)
  useEffect(() => { api<Category[]>('/api/categories').then(setCats); api<Filters>('/api/filters').then(setFilters) }, [])
  const qs = sp.toString()
  useEffect(() => {
    setData(null); setErr('')
    const p = new URLSearchParams(sp); p.set('size_', '12')
    api<ProductPage>(`/api/products?${p}`).then(setData).catch((e) => setErr(e.message))
  }, [qs])  // eslint-disable-line
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); n.delete('page'); setSp(n) }
  const page = Number(sp.get('page') ?? 0)
  const sel = (k: string, label: string, opts: string[] = []) => (
    <div><label className="label" htmlFor={k}>{label}</label><select id={k} className="input" value={sp.get(k) ?? ''} onChange={(e) => set(k, e.target.value)}><option value="">All</option>{opts.map((o) => <option key={o}>{o}</option>)}</select></div>
  )
  return (
    <div className="container-x py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">Shop</h1>
      <SearchBar className="mt-4 max-w-2xl" initial={sp.get('q') ?? ''} key={sp.get('q') ?? ''} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside>
          <button className="btn-outline mb-3 w-full lg:hidden" onClick={() => setShowF(!showF)}>{showF ? 'Hide filters' : 'Show filters'}</button>
          <div className={`card space-y-4 p-4 ${showF ? '' : 'hidden'} lg:block`}>
            <div><label className="label" htmlFor="cat">Category</label>
              <select id="cat" className="input" value={sp.get('category') ?? ''} onChange={(e) => set('category', e.target.value)}><option value="">All categories</option>
                {['HOME_FURNISHING', 'CLOTHING'].map((g) => <optgroup key={g} label={g === 'CLOTHING' ? 'Clothing' : 'Home Furnishing'}>{cats.filter((c) => c.group === g).map((c) => <option key={c.id} value={c.slug}>{c.name} ({c.productCount})</option>)}</optgroup>)}</select></div>
            {sel('color', 'Colour', filters?.colors)}{sel('pattern', 'Pattern', filters?.patterns)}{sel('design', 'Design', filters?.designs)}{sel('size', 'Size', filters?.sizes)}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sp.get('inStock') === 'true'} onChange={(e) => set('inStock', e.target.checked ? 'true' : '')} className="accent-maroon" />In stock only</label>
            <div className="flex flex-wrap gap-1.5">{[['featured', 'Featured'], ['newArrival', 'New'], ['popular', 'Popular']].map(([k, l]) => <button key={k} className={`chip ${sp.get(k) ? 'chip-on' : ''}`} onClick={() => set(k, sp.get(k) ? '' : 'true')}>{l}</button>)}</div>
            <button className="btn-ghost w-full" onClick={() => setSp(new URLSearchParams())}>Clear all</button>
          </div>
        </aside>
        <section>
          <div className="mb-4 flex items-center justify-between text-sm"><span className="text-ink/70">{data ? `${data.total} product${data.total === 1 ? '' : 's'}` : 'Loading...'}</span>
            <label className="flex items-center gap-2">Sort<select className="input !w-auto" value={sp.get('sort') ?? ''} onChange={(e) => set('sort', e.target.value)}><option value="">Newest</option><option value="name">Name A-Z</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></label></div>
          {err && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}
          {data && data.items.length === 0 && <div className="card p-10 text-center text-ink/60">No products match. Try clearing a filter.</div>}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">{data?.items.map((p) => <ProductCard key={p.id} p={p} onQuick={setQuick} />)}
            {!data && !err && Array.from({ length: 6 }, (_, i) => <div key={i} className="card aspect-[3/4] animate-pulse bg-sand/30" />)}</div>
          {data && data.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2"><button className="btn-outline" disabled={page === 0} onClick={() => { const n = new URLSearchParams(sp); n.set('page', String(page - 1)); setSp(n) }}>Previous</button>
              <span className="text-sm">Page {page + 1} of {data.pages}</span>
              <button className="btn-outline" disabled={page + 1 >= data.pages} onClick={() => { const n = new URLSearchParams(sp); n.set('page', String(page + 1)); setSp(n) }}>Next</button></div>
          )}
        </section>
      </div>
      {quick && <QuickView p={quick} onClose={() => setQuick(null)} />}
    </div>
  )
}
