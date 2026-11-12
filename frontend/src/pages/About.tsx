import { useEffect, useState } from 'react'
import { BUSINESS } from '../lib/business'
import { getPublicSettings } from '../lib/api'

export default function About() {
  const [about, setAbout] = useState(''); const [timings, setTimings] = useState('')
  useEffect(() => { getPublicSettings().then((s) => { setAbout(s.aboutText ?? ''); setTimings(s.shopTimings ?? '') }).catch(() => {}) }, [])
  return (
    <div className="container-x max-w-3xl py-10">
      <h1 className="text-4xl font-bold">About {BUSINESS.name}</h1>
      <p className="mt-2 font-serif text-xl italic text-maroon">{BUSINESS.tagline}</p>
      <div className="mt-6 space-y-4 text-ink/80">
        {about ? about.split('\n').map((l, i) => <p key={i}>{l}</p>) : <p>{BUSINESS.name} is a home-furnishing and clothing store in Dewas, Madhya Pradesh. We offer blankets, bedsheets, comforters, sofa covers, table covers, towels, pillow and cushion covers, doormats, carpets and curtains, along with sarees, suits and women&apos;s sweaters.</p>}
        <p>This website lets you browse our collection and preview furnishing products in a virtual room before visiting the shop. Prices and availability are confirmed in store or on call.</p>
      </div>
      <section className="mt-8"><h2 className="text-2xl font-semibold">Shop timings</h2><p className="mt-2 whitespace-pre-line text-ink/80">{timings || 'Shop timings will be announced here soon. Please call to confirm before visiting.'}</p></section>
      <section className="mt-8 rounded-xl bg-linen p-5 text-sm text-ink/80"><h2 className="mb-1 font-serif text-lg font-semibold">About image protection</h2>
        Product images are watermarked and shown at reduced size, and saving or dragging them is discouraged. A web page, however, cannot fully prevent screenshots, screen recording, developer tools or photographing a screen. Please respect our images and do not redistribute them.</section>
    </div>
  )
}