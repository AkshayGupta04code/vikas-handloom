import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Product } from '../lib/types'
import { money } from '../lib/format'
import { BUSINESS, fmt, telLink, waLink } from '../lib/business'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'
import FabricSwatch from '../components/FabricSwatch'
import { previewFor } from '../showroom/modes'

function Zoom({ children }: { children: ReactNode }) {
  const [o, setO] = useState<string | null>(null)
  const [on, setOn] = useState(false)
  return (
    <div className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-sand bg-white"
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setO(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`) }}
      onMouseEnter={() => setOn(true)} onMouseLeave={() => { setOn(false); setO(null) }} onClick={() => setOn(!on)}>
      <div className="h-full w-full transition-transform duration-200" style={{ transform: on ? 'scale(2.2)' : 'none', transformOrigin: o ?? 'center' }}>{children}</div>
      <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] shadow">Hover / tap to zoom</span>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const [p, setP] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [img, setImg] = useState(0)
  const [vi, setVi] = useState(-1)
  const [err, setErr] = useState('')
  useEffect(() => {
    setP(null); setErr(''); setImg(0); setVi(-1)
    api<Product>(`/api/products/${id}`).then(setP).catch((e) => setErr(e.message))
    api<Product[]>(`/api/products/${id}/related`).then(setRelated).catch(() => setRelated([]))
  }, [id])
  if (err) return <div className="container-x py-16 text-center"><p>{err}</p><Link className="btn-primary mt-4" to="/shop">Back to shop</Link></div>
  if (!p) return <div className="container-x py-16">Loading...</div>

  const v = vi >= 0 ? p.variants[vi] : null
  const color = v?.colorHex ?? p.colorHex
  const price = v?.price ?? p.price
  const stock = v ? v.stock : p.stock
  const isSaree = p.categorySlug === 'sarees'
  const num = isSaree ? BUSINESS.saree : BUSINESS.general[0]
  const msg = `Hello VIKAS HANDLOOM, I am interested in "${p.name}"${v ? ` (${v.label}${v.size ? ', ' + v.size : ''})` : ''}. Is it available?`
  const pv = previewFor(p.categorySlug)

  return (
    <div className="container-x py-8">
      <nav className="mb-4 text-sm text-ink/60"><Link to="/categories" className="hover:text-maroon">Categories</Link> / <Link to={`/shop?category=${p.categorySlug}`} className="hover:text-maroon">{p.categoryName}</Link></nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Zoom>{p.imageIds.length ? <ProductImage product={p} index={img} className="h-full w-full" /> : <FabricSwatch pattern={p.pattern} color={color} />}</Zoom>
          {p.imageIds.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto">{p.imageIds.map((_, i) => <button key={i} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === img ? 'border-maroon' : 'border-transparent'}`}><ProductImage product={p} index={i} className="h-full w-full" /></button>)}</div>}
          {p.demo && <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-xs text-ink/70">Demonstration product with a generated fabric preview. Real photographs, prices and stock will be added by the shop.</p>}
        </div>
        <div className="space-y-4">
          <div><div className="text-xs uppercase tracking-widest text-gold">{p.categoryName}</div><h1 className="text-3xl font-bold leading-tight">{p.name}</h1></div>
          <div className="text-3xl font-semibold text-maroon">{money(price)}</div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{stock > 0 ? `In stock (${stock})` : 'Out of stock'}</span>
          <p className="text-ink/80">{p.description}</p>
          <dl className="grid grid-cols-[120px_1fr] gap-y-1.5 text-sm">
            {[['Colour', p.color], ['Size', v?.size ?? p.size], ['Pattern', p.pattern], ['Design', p.design]].map(([k, val]) => val ? <Fragment key={k}><dt className="text-ink/50">{k}</dt><dd>{val}</dd></Fragment> : null)}
          </dl>
          {p.variants.length > 0 && (
            <div><div className="label">Variants</div><div className="flex flex-wrap gap-2">
              <button className={`chip ${vi < 0 ? 'chip-on' : ''}`} onClick={() => setVi(-1)}>Default</button>
              {p.variants.map((x, i) => <button key={i} className={`chip gap-1.5 ${vi === i ? 'chip-on' : ''}`} onClick={() => setVi(i)}>{x.colorHex && <i className="inline-block h-3 w-3 rounded-full border border-white/60" style={{ background: x.colorHex }} />}{x.label}{x.size ? ` / ${x.size}` : ''}</button>)}</div></div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <a className="btn-primary" href={telLink(num)}>&#128222; Call {isSaree ? 'saree desk' : ''} {fmt(num)}</a>
            <a className="btn-gold" href={waLink(num, msg)} target="_blank" rel="noreferrer">WhatsApp enquiry</a>
            {pv && <Link className="btn-outline" to={`/showroom?mode=${pv.mode}${pv.variant ? '&variant=' + pv.variant : ''}&product=${p.id}`}>Visualize it in your home</Link>}
          </div>
          {isSaree && <p className="text-xs text-ink/60">Saree enquiries are handled on a dedicated number.</p>}
        </div>
      </div>
      {related.length > 0 && <section className="mt-14"><h2 className="mb-4 text-2xl font-semibold">Related products</h2><div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div></section>}
    </div>
  )
}
