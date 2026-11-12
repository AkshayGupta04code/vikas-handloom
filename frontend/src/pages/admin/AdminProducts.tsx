import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../lib/api'
import type { Category, Filters, Product, ProductPage, Variant } from '../../lib/types'
import { money } from '../../lib/format'
import Modal from '../../components/Modal'
import ProductImage from '../../components/ProductImage'
import ProtectedImg from '../../components/ProtectedImg'

type Form = { id?: number; name: string; description: string; price: string; categoryId: string; color: string; colorHex: string; size: string; pattern: string; design: string; stock: string; featured: boolean; newArrival: boolean; popular: boolean; demo: boolean; imageIds: number[]; variants: Variant[] }
const blank = (categoryId = ''): Form => ({ name: '', description: '', price: '', categoryId, color: '', colorHex: '#8b5e3c', size: '', pattern: '', design: '', stock: '0', featured: false, newArrival: false, popular: false, demo: false, imageIds: [], variants: [] })

export default function AdminProducts() {
  const [data, setData] = useState<ProductPage | null>(null)
  const [cats, setCats] = useState<Category[]>([])
  const [filters, setFilters] = useState<Filters | null>(null)
  const [q, setQ] = useState(''); const [page, setPage] = useState(0)
  const [form, setForm] = useState<Form | null>(null)
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const load = () => api<ProductPage>(`/api/products?q=${encodeURIComponent(q)}&page=${page}&size_=15&sort=name`).then(setData)
  useEffect(() => { api<Category[]>('/api/categories').then(setCats); api<Filters>('/api/filters').then(setFilters) }, [])
  useEffect(() => { load() }, [q, page])  // eslint-disable-line

  const edit = (p: Product) => setForm({ id: p.id, name: p.name, description: p.description ?? '', price: p.price?.toString() ?? '', categoryId: String(p.categoryId), color: p.color ?? '', colorHex: p.colorHex ?? '#8b5e3c', size: p.size ?? '', pattern: p.pattern ?? '', design: p.design ?? '', stock: String(p.stock), featured: p.featured, newArrival: p.newArrival, popular: p.popular, demo: p.demo, imageIds: p.imageIds, variants: p.variants })
  const f = (k: keyof Form, v: unknown) => setForm((x) => ({ ...x!, [k]: v }))

  const upload = async (files: FileList | null) => {
    if (!files) return; setErr(''); setBusy(true)
    try { for (const file of Array.from(files)) { const fd = new FormData(); fd.append('file', file); const r = await api<{ id: number }>('/api/admin/media', { form: fd }); setForm((x) => ({ ...x!, imageIds: [...x!.imageIds, r.id] })) } }
    catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }
  const save = async (e: FormEvent) => {
    e.preventDefault(); if (!form) return; setErr(''); setBusy(true)
    const body = { ...form, price: form.price === '' ? null : Number(form.price), categoryId: Number(form.categoryId), stock: Number(form.stock) || 0, variants: form.variants.map((v) => ({ ...v, price: v.price ?? null, stock: Number(v.stock) || 0 })) }
    try { await api(form.id ? `/api/admin/products/${form.id}` : '/api/admin/products', { method: form.id ? 'PUT' : 'POST', body }); setForm(null); load() }
    catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  const del = async (p: Product) => { if (confirm(`Delete "${p.name}"? This cannot be undone.`)) { await api(`/api/admin/products/${p.id}`, { method: 'DELETE' }); load() } }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3"><input className="input max-w-xs" placeholder="Search products..." value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} />
        <button className="btn-primary ml-auto" onClick={() => setForm(blank(String(cats[0]?.id ?? '')))}>+ Add product</button></div>
      <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-linen text-xs uppercase text-ink/60"><tr><th className="p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th /></tr></thead>
        <tbody>{data?.items.map((p) => <tr key={p.id} className="border-t border-sand/60">
          <td className="flex items-center gap-3 p-3"><ProductImage product={p} className="h-12 w-12 shrink-0 rounded-lg" /><span className="font-medium">{p.name}</span></td>
          <td>{p.categoryName}</td><td>{money(p.price)}</td><td className={p.stock === 0 ? 'text-red-600' : ''}>{p.stock}</td>
          <td className="text-xs">{[p.featured && 'Featured', p.newArrival && 'New', p.popular && 'Popular', p.demo && 'Demo'].filter(Boolean).join(', ')}</td>
          <td className="whitespace-nowrap p-3 text-right"><button className="btn-ghost !py-1" onClick={() => edit(p)}>Edit</button><button className="btn-ghost !py-1 text-red-600" onClick={() => del(p)}>Delete</button></td></tr>)}</tbody></table>
        {data && data.items.length === 0 && <p className="p-6 text-center text-ink/60">No products found.</p>}</div>
      {data && data.pages > 1 && <div className="mt-4 flex items-center justify-center gap-3"><button className="btn-outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span className="text-sm">Page {page + 1} / {data.pages}</span><button className="btn-outline" disabled={page + 1 >= data.pages} onClick={() => setPage(page + 1)}>Next</button></div>}

      {form && (
        <Modal title={form.id ? 'Edit product' : 'Add product'} onClose={() => setForm(null)} wide>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">Name *</label><input className="input" required value={form.name} onChange={(e) => f('name', e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input" rows={3} maxLength={2000} value={form.description} onChange={(e) => f('description', e.target.value)} /></div>
            <div><label className="label">Category *</label><select className="input" required value={form.categoryId} onChange={(e) => f('categoryId', e.target.value)}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label">Price (INR) - leave empty for &quot;price on request&quot;</label><input className="input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => f('price', e.target.value)} /></div>
            <div><label className="label">Stock</label><input className="input" type="number" min="0" value={form.stock} onChange={(e) => f('stock', e.target.value)} /></div>
            <div><label className="label">Size</label><input className="input" list="sizes" value={form.size} onChange={(e) => f('size', e.target.value)} /><datalist id="sizes">{filters?.sizes.map((s) => <option key={s} value={s} />)}</datalist></div>
            <div><label className="label">Colour name</label><input className="input" list="colors" value={form.color} onChange={(e) => f('color', e.target.value)} /><datalist id="colors">{filters?.colors.map((s) => <option key={s} value={s} />)}</datalist></div>
            <div><label className="label">Colour swatch (used for previews)</label><input type="color" className="h-10 w-full cursor-pointer rounded-lg border border-sand" value={form.colorHex} onChange={(e) => f('colorHex', e.target.value)} /></div>
            <div><label className="label">Pattern (Solid, Stripes, Checks, Floral, Geometric, Zigzag, Dots)</label><input className="input" list="patterns" value={form.pattern} onChange={(e) => f('pattern', e.target.value)} /><datalist id="patterns">{Array.from(new Set(['Solid', 'Stripes', 'Checks', 'Floral', 'Geometric', 'Zigzag', 'Dots', ...(filters?.patterns ?? [])])).map((s) => <option key={s} value={s} />)}</datalist></div>
            <div><label className="label">Design</label><input className="input" list="designs" value={form.design} onChange={(e) => f('design', e.target.value)} /><datalist id="designs">{filters?.designs.map((s) => <option key={s} value={s} />)}</datalist></div>
            <div className="flex flex-wrap gap-4 sm:col-span-2 text-sm">{(['featured', 'newArrival', 'popular', 'demo'] as const).map((k) => <label key={k} className="flex items-center gap-2"><input type="checkbox" className="accent-maroon" checked={form[k]} onChange={(e) => f(k, e.target.checked)} />{k === 'newArrival' ? 'New arrival' : k === 'demo' ? 'Demo item' : k[0].toUpperCase() + k.slice(1)}</label>)}</div>
            <div className="sm:col-span-2"><label className="label">Photographs (JPG/PNG, max 8 MB each)</label>
              <div className="flex flex-wrap gap-2">{form.imageIds.map((id, i) => <div key={id} className="relative h-20 w-20"><ProtectedImg id={id} className="h-20 w-20 rounded-lg" />{i === 0 && <span className="absolute bottom-0 left-0 rounded-tr bg-maroon px-1 text-[10px] text-white">Main</span>}<button type="button" className="absolute -right-1 -top-1 z-10 h-5 w-5 rounded-full bg-red-600 text-xs text-white" onClick={() => f('imageIds', form.imageIds.filter((x) => x !== id))} aria-label="Remove photo">&times;</button></div>)}
                <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-sand text-2xl text-ink/40 hover:border-maroon">+<input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => upload(e.target.files)} /></label></div></div>
            <div className="sm:col-span-2"><div className="label">Variants</div>
              {form.variants.map((v, i) => <div key={i} className="mb-2 grid grid-cols-[1fr_auto_1fr_90px_80px_auto] items-center gap-2">
                <input className="input" placeholder="Label" value={v.label} onChange={(e) => f('variants', form.variants.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input type="color" className="h-9 w-10" value={v.colorHex ?? '#888888'} onChange={(e) => f('variants', form.variants.map((x, j) => (j === i ? { ...x, colorHex: e.target.value } : x)))} />
                <input className="input" placeholder="Size" value={v.size ?? ''} onChange={(e) => f('variants', form.variants.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))} />
                <input className="input" type="number" placeholder="Price" value={v.price ?? ''} onChange={(e) => f('variants', form.variants.map((x, j) => (j === i ? { ...x, price: e.target.value === '' ? null : Number(e.target.value) } : x)))} />
                <input className="input" type="number" placeholder="Stock" min="0" value={v.stock} onChange={(e) => f('variants', form.variants.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x)))} />
                <button type="button" className="text-red-600" onClick={() => f('variants', form.variants.filter((_, j) => j !== i))} aria-label="Remove variant">&times;</button></div>)}
              <button type="button" className="btn-outline !py-1" onClick={() => f('variants', [...form.variants, { label: '', colorHex: form.colorHex, size: form.size, price: null, stock: 0 }])}>+ Add variant</button></div>
            {err && <div role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700 sm:col-span-2">{err}</div>}
            <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save product'}</button></div>
          </form>
        </Modal>
      )}
    </div>
  )
}