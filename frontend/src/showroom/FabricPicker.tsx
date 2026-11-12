import { useEffect, useState } from 'react'
import { api, imageBlobUrl } from '../lib/api'
import { normalizePattern, PATTERNS, PRESET_COLORS, tile, type Fabric } from '../lib/fabric'
import type { Product, ProductPage } from '../lib/types'
import { Link } from 'react-router-dom'

export interface Pick { fabric: Fabric; product?: Product }

function Dot({ pattern, color, on, label, onClick }: { pattern: string; color: string; on: boolean; label: string; onClick: () => void }) {
  const t = tile(pattern, color)
  return (
    <button onClick={onClick} title={label} aria-label={label} aria-pressed={on}
      className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition hover:scale-105 ${on ? 'border-maroon ring-2 ring-maroon/30' : 'border-white shadow'}`}>
      <svg viewBox="0 0 56 56" className="h-full w-full"><defs><pattern id={`d${pattern}${color.slice(1)}`} width={t.size} height={t.size} patternUnits="userSpaceOnUse" dangerouslySetInnerHTML={{ __html: t.svg }} /></defs><rect width="56" height="56" fill={`url(#d${pattern}${color.slice(1)})`} /></svg>
    </button>
  )
}

/** Fabric choices = real catalogue products in the given categories + a free custom colour/pattern builder. */
export default function FabricPicker({ categories, value, onPick, initialProductId }: { categories: string[]; value: Pick; onPick: (p: Pick) => void; initialProductId?: number }) {
  const [products, setProducts] = useState<Product[]>([])
  const [custom, setCustom] = useState({ pattern: 'Stripes', color: '#2f3e8f' })
  const key = categories.join(',')

  useEffect(() => {
    let live = true
    Promise.all(categories.map((c) => api<ProductPage>(`/api/products?category=${c}&size_=40`))).then(async (pages) => {
      if (!live) return
      const items = pages.flatMap((p) => p.items)
      setProducts(items)
      const init = initialProductId ? items.find((i) => i.id === initialProductId) : undefined
      if (init) await choose(init)
    }).catch(() => {})
    return () => { live = false }
  }, [key])  // eslint-disable-line

  async function choose(p: Product) {
    if (p.imageIds[0]) {
      const src = await imageBlobUrl(p.imageIds[0])
      onPick({ fabric: { kind: 'image', src, label: p.name }, product: p })
    } else onPick({ fabric: { kind: 'pattern', pattern: normalizePattern(p.pattern), color: p.colorHex ?? '#888888', label: p.name }, product: p })
  }
  const setC = (c: Partial<typeof custom>) => {
    const n = { ...custom, ...c }
    setCustom(n); onPick({ fabric: { kind: 'pattern', pattern: n.pattern, color: n.color, label: 'Custom design' } })
  }
  const on = (p: Product) => value.product?.id === p.id

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Designs from our collection {products.some((p) => p.demo) && <span className="normal-case text-gold">(demo items)</span>}</div>
        {products.length === 0 ? <p className="text-sm text-ink/60">No products in this category yet. Use the custom builder below.</p> : (
          <div className="flex flex-wrap gap-2">
            {products.map((p) => <Dot key={p.id} pattern={normalizePattern(p.pattern)} color={p.colorHex ?? '#888888'} on={on(p)} label={`${p.name}${p.pattern ? ' - ' + p.pattern : ''}`} onClick={() => choose(p)} />)}
          </div>
        )}
        {value.product && <p className="mt-2 text-sm">Selected: <Link className="font-medium text-maroon underline" to={`/product/${value.product.id}`}>{value.product.name}</Link></p>}
      </div>
      <div>
        <div className="label">Try any colour &amp; pattern</div>
        <div className="mb-2 flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => <button key={c} aria-label={`Colour ${c}`} onClick={() => setC({ color: c })} className={`h-7 w-7 rounded-full border-2 ${custom.color === c && !value.product ? 'border-ink' : 'border-white shadow'}`} style={{ background: c }} />)}
          <input type="color" value={custom.color} onChange={(e) => setC({ color: e.target.value })} className="h-7 w-10 cursor-pointer rounded" aria-label="Custom colour" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PATTERNS.map((pt) => <button key={pt} className={`chip ${custom.pattern === pt && !value.product ? 'chip-on' : ''}`} onClick={() => setC({ pattern: pt })}>{pt}</button>)}
        </div>
      </div>
    </div>
  )
}