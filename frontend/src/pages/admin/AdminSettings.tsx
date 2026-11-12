import { useEffect, useState } from 'react'
import { api, getPublicSettings } from '../../lib/api'
import type { Settings } from '../../lib/types'

export default function AdminSettings() {
  const [s, setS] = useState<Settings>({}); const [msg, setMsg] = useState('')
  useEffect(() => { getPublicSettings().then(setS) }, [])
  const save = async () => { try { setS(await api<Settings>('/api/admin/settings', { method: 'PUT', body: s })); setMsg('Saved.') } catch (e) { setMsg((e as Error).message) } }
  const area = (k: string, label: string, hint: string, rows = 4) => <div><label className="label">{label}</label><textarea className="input" rows={rows} value={s[k] ?? ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /><p className="mt-1 text-xs text-ink/50">{hint}</p></div>
  return (
    <div className="card max-w-2xl space-y-5 p-6">
      {area('shopTimings', 'Shop timings', 'Shown on the About and Contact pages. Leave empty to show "timings will be updated soon". One line per day is fine.')}
      {area('announcement', 'Announcement bar', 'Optional single line shown at the very top of every page (e.g. festival offers).', 2)}
      {area('aboutText', 'About text', 'Optional. Replaces the default About paragraph. New line = new paragraph.', 6)}
      <div className="flex items-center gap-3"><button className="btn-primary" onClick={save}>Save settings</button><span className="text-sm text-ink/70">{msg}</span></div>
    </div>
  )
}