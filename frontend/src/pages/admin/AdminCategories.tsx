import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../lib/api'
import type { Category } from '../../lib/types'
import Modal from '../../components/Modal'
import ProtectedImg from '../../components/ProtectedImg'

type Form = { id?: number; name: string; group: string; description: string; accentColor: string; imageId: number | null; sortOrder: number }

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([])
  const [form, setForm] = useState<Form | null>(null)
  const [err, setErr] = useState('')
  const load = () => api<Category[]>('/api/categories').then(setCats)
  useEffect(() => { load() }, [])
  const f = (k: keyof Form, v: unknown) => setForm((x) => ({ ...x!, [k]: v }))
  const save = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    try { await api(form!.id ? `/api/admin/categories/${form!.id}` : '/api/admin/categories', { method: form!.id ? 'PUT' : 'POST', body: form }); setForm(null); load() } catch (x) { setErr((x as Error).message) }
  }
  const del = async (c: Category) => { if (!confirm(`Delete category "${c.name}"?`)) return; try { await api(`/api/admin/categories/${c.id}`, { method: 'DELETE' }); load() } catch (x) { alert((x as Error).message) } }
  const upload = async (file?: File) => { if (!file) return; const fd = new FormData(); fd.append('file', file); try { const r = await api<{ id: number }>('/api/admin/media', { form: fd }); f('imageId', r.id) } catch (x) { setErr((x as Error).message) } }
  return (
    <div>
      <div className="mb-4 flex justify-end"><button className="btn-primary" onClick={() => setForm({ name: '', group: 'HOME_FURNISHING', description: '', accentColor: '#8b5e3c', imageId: null, sortOrder: cats.length })}>+ Add category</button></div>
      <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-linen text-xs uppercase text-ink/60"><tr><th className="p-3">Name</th><th>Group</th><th>Products</th><th>Order</th><th /></tr></thead>
        <tbody>{cats.map((c) => <tr key={c.id} className="border-t border-sand/60"><td className="p-3 font-medium"><i className="mr-2 inline-block h-3 w-3 rounded-full" style={{ background: c.accentColor }} />{c.name}</td><td>{c.group === 'CLOTHING' ? 'Clothing' : 'Home furnishing'}</td><td>{c.productCount}</td><td>{c.sortOrder}</td>
          <td className="p-3 text-right"><button className="btn-ghost !py-1" onClick={() => setForm({ id: c.id, name: c.name, group: c.group, description: c.description ?? '', accentColor: c.accentColor, imageId: c.imageId ?? null, sortOrder: c.sortOrder })}>Edit</button><button className="btn-ghost !py-1 text-red-600" onClick={() => del(c)}>Delete</button></td></tr>)}</tbody></table></div>
      {form && <Modal title={form.id ? 'Edit category' : 'Add category'} onClose={() => setForm(null)}>
        <form onSubmit={save} className="space-y-3">
          <div><label className="label">Name *</label><input className="input" required value={form.name} onChange={(e) => f('name', e.target.value)} /></div>
          <div><label className="label">Group</label><select className="input" value={form.group} onChange={(e) => f('group', e.target.value)}><option value="HOME_FURNISHING">Home furnishing</option><option value="CLOTHING">Clothing</option></select></div>
          <div><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => f('description', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Accent colour</label><input type="color" className="h-10 w-full" value={form.accentColor} onChange={(e) => f('accentColor', e.target.value)} /></div><div><label className="label">Sort order</label><input className="input" type="number" value={form.sortOrder} onChange={(e) => f('sortOrder', Number(e.target.value))} /></div></div>
          <div><label className="label">Cover photo (optional)</label><div className="flex items-center gap-3">{form.imageId && <ProtectedImg id={form.imageId} className="h-16 w-16 rounded-lg" />}<input type="file" accept="image/jpeg,image/png" onChange={(e) => upload(e.target.files?.[0])} />{form.imageId && <button type="button" className="text-sm text-red-600" onClick={() => f('imageId', null)}>Remove</button>}</div></div>
          {err && <div role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</div>}
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form></Modal>}
    </div>
  )
}