import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../lib/api'
import type { CustomerUser, Issued } from '../../lib/types'
import Modal from '../../components/Modal'

const toLocal = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : undefined)
const fmtD = (iso?: string) => (iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-')
const rem = (s?: number | null) => { if (s == null) return '-'; if (s <= 0) return '0'; const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m` }
const badge: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-800', EXPIRED: 'bg-gray-200 text-gray-700', DISABLED: 'bg-red-100 text-red-700', SCHEDULED: 'bg-blue-100 text-blue-800' }

export default function AdminCustomers() {
  const [users, setUsers] = useState<CustomerUser[]>([])
  const [filter, setFilter] = useState('ALL')
  const [issued, setIssued] = useState<Issued[] | null>(null)
  const [edit, setEdit] = useState<CustomerUser | null>(null)
  const [err, setErr] = useState('')
  const [g, setG] = useState({ label: '', count: 1, start: toLocal(new Date().toISOString()), days: 7, until: '', usage: '' })
  const load = () => api<CustomerUser[]>('/api/admin/users').then(setUsers)
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [])

  const generate = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    try {
      const res = await api<Issued[]>('/api/admin/users/generate', { method: 'POST', body: {
        label: g.label || undefined, count: g.count, validFrom: fromLocal(g.start), validUntil: fromLocal(g.until), validDays: g.until ? undefined : g.days, usageMinutes: g.usage ? Number(g.usage) : undefined } })
      setIssued(res); load()
    } catch (x) { setErr((x as Error).message) }
  }
  const act = async (path: string, method = 'POST', body: unknown = {}) => { try { const r = await api<unknown>(path, { method, body }); load(); return r } catch (x) { alert((x as Error).message) } }
  const reset = async (u: CustomerUser) => {
    if (!confirm(`Reset password for ${u.username}? Their current sessions will be logged out.`)) return
    const r = (await act(`/api/admin/users/${u.id}/reset`, 'POST', { restartUsageWindow: confirm('Also restart their usage timer (start counting again from their next login)?') })) as Issued | undefined
    if (r) setIssued([r])
  }
  const shown = users.filter((u) => filter === 'ALL' || u.status === filter)
  const copyAll = () => navigator.clipboard.writeText(issued!.map((i) => `Username: ${i.username}\nPassword: ${i.password}`).join('\n\n'))
  const saveEdit = async (e: FormEvent) => {
    e.preventDefault(); if (!edit) return
    await act(`/api/admin/users/${edit.id}`, 'PUT', { activeFrom: edit.activeFrom, expiresAt: edit.expiresAt, usageMinutes: edit.usageMinutes ?? 0, note: edit.note ?? '' }); setEdit(null)
  }

  return (
    <div className="space-y-8">
      <section className="card p-5"><h2 className="font-serif text-xl font-semibold">Generate customer credentials</h2>
        <p className="text-sm text-ink/60">Random username and password are created for each customer. The password is shown only once.</p>
        <form onSubmit={generate} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className="label">Customer name / note</label><input className="input" value={g.label} onChange={(e) => setG({ ...g, label: e.target.value })} placeholder="e.g. Mrs. Sharma" /></div>
          <div><label className="label">How many accounts</label><input className="input" type="number" min={1} max={50} value={g.count} onChange={(e) => setG({ ...g, count: Number(e.target.value) })} /></div>
          <div><label className="label">Active from</label><input className="input" type="datetime-local" value={g.start} onChange={(e) => setG({ ...g, start: e.target.value })} /></div>
          <div><label className="label">Valid for (days)</label><input className="input" type="number" min={1} value={g.days} disabled={!!g.until} onChange={(e) => setG({ ...g, days: Number(e.target.value) })} /></div>
          <div><label className="label">...or expires on (overrides days)</label><input className="input" type="datetime-local" value={g.until} onChange={(e) => setG({ ...g, until: e.target.value })} /></div>
          <div><label className="label">Usage limit after first login (minutes, optional)</label><input className="input" type="number" min={1} value={g.usage} onChange={(e) => setG({ ...g, usage: e.target.value })} placeholder="e.g. 120" /></div>
          {err && <div role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700 sm:col-span-2 lg:col-span-3">{err}</div>}
          <div className="sm:col-span-2 lg:col-span-3"><button className="btn-primary">Generate credentials</button></div>
        </form></section>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2"><h2 className="mr-3 font-serif text-xl font-semibold">Customer accounts</h2>
          {['ALL', 'ACTIVE', 'SCHEDULED', 'EXPIRED', 'DISABLED'].map((s) => <button key={s} className={`chip ${filter === s ? 'chip-on' : ''}`} onClick={() => setFilter(s)}>{s[0] + s.slice(1).toLowerCase()}</button>)}</div>
        <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-linen text-xs uppercase text-ink/60"><tr><th className="p-3">Username</th><th>Note</th><th>Status</th><th>Active from</th><th>Expires</th><th>Usage limit</th><th>Left</th><th>Last login</th><th /></tr></thead>
          <tbody>{shown.map((u) => <tr key={u.id} className="border-t border-sand/60">
            <td className="p-3 font-mono">{u.username}</td><td>{u.note}</td><td><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge[u.status]}`}>{u.status}</span></td>
            <td>{fmtD(u.activeFrom)}</td><td>{fmtD(u.effectiveExpiry ?? u.expiresAt)}</td><td>{u.usageMinutes ? `${u.usageMinutes} min` : '-'}</td><td>{u.status === 'ACTIVE' ? rem(u.remainingSeconds) : '-'}</td><td>{fmtD(u.lastLoginAt)}</td>
            <td className="whitespace-nowrap p-3 text-right">
              {u.enabled ? <button className="btn-ghost !py-1 text-red-600" onClick={() => confirm(`Revoke ${u.username}? They will be logged out immediately.`) && act(`/api/admin/users/${u.id}/revoke`)}>Revoke</button> : <button className="btn-ghost !py-1 text-green-700" onClick={() => act(`/api/admin/users/${u.id}/enable`)}>Enable</button>}
              <button className="btn-ghost !py-1" onClick={() => setEdit(u)}>Edit</button><button className="btn-ghost !py-1" onClick={() => reset(u)}>Reset</button>
              <button className="btn-ghost !py-1 text-red-600" onClick={() => confirm(`Permanently delete ${u.username}?`) && act(`/api/admin/users/${u.id}`, 'DELETE')}>Delete</button></td></tr>)}</tbody></table>
          {shown.length === 0 && <p className="p-6 text-center text-ink/60">No accounts.</p>}</div>
      </section>

      {issued && <Modal title="New credentials - copy now" onClose={() => setIssued(null)}>
        <p className="mb-3 rounded-lg bg-gold/10 p-3 text-sm">Passwords are stored only as BCrypt hashes and <b>cannot be shown again</b>. Share them with the customer now (or use Reset later).</p>
        <div className="space-y-2">{issued.map((i) => <div key={i.username} className="rounded-lg border border-sand p-3 font-mono text-sm"><div>Username: <b>{i.username}</b></div><div>Password: <b>{i.password}</b></div><div className="mt-1 font-sans text-xs text-ink/60">Valid until {fmtD(i.user.effectiveExpiry ?? i.user.expiresAt)}{i.user.usageMinutes ? ` - ${i.user.usageMinutes} min after first login` : ''}</div></div>)}</div>
        <div className="mt-4 flex justify-end gap-2"><button className="btn-outline" onClick={copyAll}>Copy all</button><button className="btn-primary" onClick={() => window.print()}>Print</button></div></Modal>}

      {edit && <Modal title={`Edit ${edit.username}`} onClose={() => setEdit(null)}>
        <form onSubmit={saveEdit} className="space-y-3">
          <div><label className="label">Active from</label><input className="input" type="datetime-local" value={toLocal(edit.activeFrom)} onChange={(e) => setEdit({ ...edit, activeFrom: fromLocal(e.target.value) })} /></div>
          <div><label className="label">Expires on</label><input className="input" type="datetime-local" value={toLocal(edit.expiresAt)} onChange={(e) => setEdit({ ...edit, expiresAt: fromLocal(e.target.value) })} /></div>
          <div><label className="label">Usage limit after first login (minutes, 0 = none)</label><input className="input" type="number" min={0} value={edit.usageMinutes ?? 0} onChange={(e) => setEdit({ ...edit, usageMinutes: Number(e.target.value) })} /></div>
          <div><label className="label">Note</label><input className="input" value={edit.note ?? ''} onChange={(e) => setEdit({ ...edit, note: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary">Save</button></div></form></Modal>}
    </div>
  )
}