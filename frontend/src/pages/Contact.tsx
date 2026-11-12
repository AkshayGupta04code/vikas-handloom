import { useEffect, useState } from 'react'
import { BUSINESS, fmt, mapsEmbed, mapsLink, telLink, waLink } from '../lib/business'
import { getPublicSettings } from '../lib/api'

export default function Contact() {
  const [timings, setTimings] = useState('')
  useEffect(() => { getPublicSettings().then((s) => setTimings(s.shopTimings ?? '')).catch(() => {}) }, [])
  return (
    <div className="container-x py-10">
      <h1 className="text-4xl font-bold">Contact us</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card p-5"><h2 className="font-serif text-xl font-semibold">General enquiries</h2>
            <div className="mt-3 space-y-3">{BUSINESS.general.map((n) => <div key={n} className="flex flex-wrap items-center gap-2"><span className="w-32 text-lg font-medium">{fmt(n)}</span><a className="btn-primary !py-1.5" href={telLink(n)}>&#128222; Call</a><a className="btn-gold !py-1.5" href={waLink(n, 'Hello VIKAS HANDLOOM, I have an enquiry.')} target="_blank" rel="noreferrer">WhatsApp</a></div>)}</div></div>
          <div className="rounded-2xl border-2 border-gold bg-gold/10 p-5"><h2 className="font-serif text-xl font-semibold text-maroon">Saree enquiries</h2><p className="text-sm text-ink/70">Dedicated number for sarees only</p>
            <div className="mt-3 flex flex-wrap items-center gap-2"><span className="w-32 text-lg font-medium">{fmt(BUSINESS.saree)}</span><a className="btn-primary !py-1.5" href={telLink(BUSINESS.saree)}>&#128222; Call</a><a className="btn-gold !py-1.5" href={waLink(BUSINESS.saree, 'Hello VIKAS HANDLOOM, I have a saree enquiry.')} target="_blank" rel="noreferrer">WhatsApp</a></div></div>
          <div className="card p-5"><h2 className="font-serif text-xl font-semibold">Address</h2><address className="mt-2 not-italic text-ink/80">{BUSINESS.addressLines.map((l) => <div key={l}>{l}</div>)}</address><a className="btn-outline mt-3" href={mapsLink} target="_blank" rel="noreferrer">Open in Google Maps</a></div>
          <div className="card p-5"><h2 className="font-serif text-xl font-semibold">Shop timings</h2><p className="mt-2 whitespace-pre-line text-ink/80">{timings || 'Timings will be updated soon. Please call to confirm before visiting.'}</p></div>
        </div>
        <div className="card min-h-[360px] overflow-hidden"><iframe title="VIKAS HANDLOOM location" src={mapsEmbed} className="h-full min-h-[420px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
      </div>
    </div>
  )
}