import { useEffect, useState } from 'react'
import { api, imageBlobUrl } from '../../lib/api'
import type { Template } from '../../lib/types'
import RoomCompositor, { DEFAULT_OPTS, type Pt } from '../../showroom/RoomCompositor'
import ProtectedImg from '../../components/ProtectedImg'
import Modal from '../../components/Modal'

const KINDS = ['bed', 'comforter', 'sofa', 'cushion', 'curtain', 'carpet', 'table']
interface Draft { id?: number; kind: string; name: string; mediaId?: number; src?: string; polys: Pt[][]; active: boolean }

export default function AdminPreviews() {
  const [list, setList] = useState<Template[]>([])
  const [d, setD] = useState<Draft | null>(null)
  const [err, setErr] = useState('')
  const load = () => api<Template[]>('/api/admin/templates').then(setList)
  useEffect(() => { load() }, [])

  const open = async (t?: Template) => {
    if (!t) { setD({ kind: 'bed', name: '', polys: [], active: true }); return }
    setD({ id: t.id, kind: t.kind, name: t.name, mediaId: t.mediaId, polys: JSON.parse(t.maskJson || '[]'), active: t.active, src: await imageBlobUrl(t.mediaId, true) })
  }
  const pickFile = async (file?: File) => {
    if (!file) return; setErr('')
    const fd = new FormData(); fd.append('file', file)
    try { const r = await api<{ id: number }>('/api/admin/media', { form: fd }); setD((x) => ({ ...x!, mediaId: r.id, src: URL.createObjectURL(file), polys: [] })) } catch (e) { setErr((e as Error).message) }
  }
  const save = async () => {
    if (!d?.mediaId || !d.name) { setErr('Add a name and a photo.'); return }
    try { await api(d.id ? `/api/admin/templates/${d.id}` : '/api/admin/templates', { method: d.id ? 'PUT' : 'POST', body: { kind: d.kind, name: d.name, mediaId: d.mediaId, maskJson: JSON.stringify(d.polys), active: d.active } }); setD(null); load() } catch (e) { setErr((e as Error).message) }
  }
  return (
    <div>
      <p className="mb-4 max-w-2xl text-sm text-ink/70">Upload a room photo (e.g. a made-up bed or sofa) and outline the area where fabrics should appear. Customers can then try designs on it under <b>Virtual Preview &rarr; Our rooms</b>.</p>
      <button className="btn-primary mb-4" onClick={() => open()}>+ Add preview room</button>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{list.map((t) => <div key={t.id} className="card overflow-hidden"><ProtectedImg id={t.mediaId} className="aspect-[4/3]" /><div className="p-3 text-sm"><div className="font-medium">{t.name}</div><div className="text-xs text-ink/60">{t.kind} {t.active ? '' : '(hidden)'}</div>
        <div className="mt-2 flex gap-1"><button className="btn-outline !px-3 !py-1 !text-xs" onClick={() => open(t)}>Edit</button><button className="btn-ghost !px-3 !py-1 !text-xs text-red-600" onClick={async () => { if (confirm('Delete this preview room?')) { await api(`/api/admin/templates/${t.id}`, { method: 'DELETE' }); load() } }}>Delete</button></div></div></div>)}</div>
      {list.length === 0 && <p className="text-ink/60">No preview rooms yet.</p>}
      {d && <Modal title={d.id ? 'Edit preview room' : 'Add preview room'} onClose={() => setD(null)} wide>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className="label">Name</label><input className="input" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></div>
          <div><label className="label">Type</label><select className="input" value={d.kind} onChange={(e) => setD({ ...d, kind: e.target.value })}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></div>
          <div><label className="label">Photo</label><input type="file" accept="image/jpeg,image/png" onChange={(e) => pickFile(e.target.files?.[0])} /></div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-maroon" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} />Visible to customers</label>
        {d.src && <div className="mt-4"><RoomCompositor src={d.src} fabric={{ kind: 'pattern', pattern: 'Stripes', color: '#7a1f2b' }} polygons={d.polys} onChange={(p) => setD({ ...d, polys: p })} editable opts={DEFAULT_OPTS} /></div>}
        {err && <div role="alert" className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</div>}
        <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setD(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></div></Modal>}
    </div>
  )
}