import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import { money } from '../lib/format'
import ProductImage from './ProductImage'

export default function ProductCard({ p, onQuick }: { p: Product; onQuick?: (p: Product) => void }) {
  return (
    <article className="group card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <Link to={`/product/${p.id}`} aria-label={p.name}><ProductImage product={p} className="aspect-square transition duration-500 group-hover:scale-105" /></Link>
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {p.newArrival && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold uppercase text-white">New</span>}
          {p.demo && <span className="rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Demo</span>}
          {!p.inStock && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Out of stock</span>}
        </div>
        {onQuick && <button onClick={() => onQuick(p)} className="absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-white/95 py-1.5 text-xs font-medium opacity-0 shadow transition group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100">Quick view</button>}
      </div>
      <div className="p-3.5">
        <div className="text-[11px] uppercase tracking-wide text-gold">{p.categoryName}</div>
        <Link to={`/product/${p.id}`} className="line-clamp-2 font-medium leading-snug hover:text-maroon">{p.name}</Link>
        <div className="mt-1 flex items-center justify-between text-sm"><span className="font-semibold text-maroon">{money(p.price)}</span>
          {p.colorHex && <span className="flex items-center gap-1 text-xs text-ink/60"><i className="inline-block h-3 w-3 rounded-full border border-sand" style={{ background: p.colorHex }} />{p.color}</span>}</div>
      </div>
    </article>
  )
}