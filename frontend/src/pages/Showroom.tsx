import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Template } from '../lib/types'
import { NEUTRAL } from '../lib/fabric'
import Scene, { WALLS } from '../showroom/scenes'
import FabricPicker, { type Pick } from '../showroom/FabricPicker'
import RoomCompositor, { DEFAULT_OPTS, type Handle, type Pt } from '../showroom/RoomCompositor'
import ProtectedImg from '../components/ProtectedImg'
import { imageBlobUrl } from '../lib/api'
import { MODES } from '../showroom/modes'

const wm = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'260\' height=\'160\'><text x=\'20\' y=\'90\' font-family=\'sans-serif\' font-size=\'20\' font-weight=\'700\' fill=\'white\' fill-opacity=\'.28\' transform=\'rotate(-24 130 80)\'>VIKAS HANDLOOM</text></svg>')}")`

function MyRoom() {
  const [src, setSrc] = useState<string | null>(null)
  const [polys, setPolys] = useState<Pt[][]>([])
  const [what, setWhat] = useState('bed')
  const [opts, setOpts] = useState(DEFAULT_OPTS)
  const [pick, setPick] = useState<Pick>({ fabric: { kind: 'pattern', pattern: 'Floral', color: '#7a1f2b', label: 'Custom design' } })
  const ref = useRef<Handle>(null)
  const cats: Record<string, string[]> = { bed: ['single-bedsheets', 'double-bedsheets', 'comforters'], sofa: ['sofa-covers'], curtain: ['window-curtains', 'door-curtains'], carpet: ['carpets'], table: ['table-covers'], cushion: ['cushion-covers', 'pillow-covers'] }
  useEffect(() => () => { if (src) URL.revokeObjectURL(src) }, [src])

  const download = () => {
    const u = ref.current?.toPng(); if (!u) return
    const a = document.createElement('a'); a.href = u; a.download = 'my-room-preview.png'; a.click()
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        {!src ? (
          <label className="grid h-80 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-sand bg-white p-6 text-center hover:border-maroon">
            <div><div className="text-4xl">&#128247;</div><div className="mt-2 font-serif text-xl">Upload a photo of your room</div>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink/60">A bed, sofa, window, carpet or table. JPG/PNG. The photo stays in your browser &mdash; it is never uploaded.</p>
              <span className="btn-primary mt-4">Choose photo</span></div>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSrc(URL.createObjectURL(f)); setPolys([]) } }} />
          </label>
        ) : <RoomCompositor ref={ref} src={src} fabric={pick.fabric} polygons={polys} onChange={setPolys} editable opts={opts} />}
        <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-ink/80">
          <b>How this works &amp; its limits.</b> This is a basic 2D compositor: you outline the area and the design is tiled inside it and blended with your photo (so original light and shadows stay).
          It does <b>not</b> understand 3D shape, folds or perspective, so patterns will look flat and edges depend on how carefully you outline. It is a quick guide, not a photograph of the final product.
          The code is structured so an AI placement service can be plugged in later; no AI is used today.
        </div>
      </div>
      <div className="card space-y-4 p-5">
        <div><div className="label">What are you covering?</div>
          <select className="input" value={what} onChange={(e) => setWhat(e.target.value)}>
            <option value="bed">Bed (bedsheet / comforter)</option><option value="sofa">Sofa cover</option><option value="curtain">Curtain</option><option value="carpet">Carpet</option><option value="table">Table cover</option><option value="cushion">Cushion / pillow</option>
          </select></div>
        <FabricPicker key={what} categories={cats[what]} value={pick} onPick={setPick} />
        <div className="grid gap-3 border-t border-sand pt-4 text-sm">
          <label>Strength <b>{Math.round(opts.strength * 100)}%</b><input type="range" min="0.2" max="1" step="0.05" value={opts.strength} onChange={(e) => setOpts({ ...opts, strength: +e.target.value })} className="w-full accent-maroon" /></label>
          <label>Pattern size <b>{opts.scale.toFixed(1)}x</b><input type="range" min="0.5" max="3" step="0.1" value={opts.scale} onChange={(e) => setOpts({ ...opts, scale: +e.target.value })} className="w-full accent-maroon" /></label>
          <label>Edge softness <b>{opts.feather}px</b><input type="range" min="0" max="6" step="0.5" value={opts.feather} onChange={(e) => setOpts({ ...opts, feather: +e.target.value })} className="w-full accent-maroon" /></label>
          <label>Blend <select className="input mt-1" value={opts.blend} onChange={(e) => setOpts({ ...opts, blend: e.target.value as GlobalCompositeOperation })}>
            <option value="multiply">Multiply (best for light / white items)</option><option value="overlay">Overlay</option><option value="soft-light">Soft light</option><option value="source-over">Normal (covers original)</option></select></label>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" disabled={!src} onClick={download}>Download preview</button>
          {src && <label className="btn-outline cursor-pointer">New photo<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSrc(URL.createObjectURL(f)); setPolys([]) } }} /></label>}
        </div>
      </div>
    </div>
  )
}

function Gallery() {
  const [list, setList] = useState<Template[] | null>(null)
  const [sel, setSel] = useState<Template | null>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [pick, setPick] = useState<Pick>({ fabric: { kind: 'pattern', pattern: 'Stripes', color: '#2f3e8f', label: 'Custom design' } })
  useEffect(() => { api<Template[]>('/api/preview/templates').then(setList).catch(() => setList([])) }, [])
  useEffect(() => { setSrc(null); if (sel) imageBlobUrl(sel.mediaId).then(setSrc) }, [sel])
  const polys: Pt[][] = useMemo(() => { try { return JSON.parse(sel?.maskJson ?? '[]') } catch { return [] } }, [sel])
  const cats: Record<string, string[]> = { bed: ['single-bedsheets', 'double-bedsheets', 'comforters'], sofa: ['sofa-covers'], curtain: ['window-curtains', 'door-curtains'], carpet: ['carpets'], table: ['table-covers'], cushion: ['cushion-covers'], comforter: ['comforters'] }
  if (list === null) return <p>Loading...</p>
  if (!list.length) return <div className="card p-8 text-center text-ink/70">No shop-curated rooms have been added yet. Ask the shop, or use <b>Upload my room</b> to try your own photo.</div>
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        {sel && src ? <RoomCompositor src={src} fabric={pick.fabric} polygons={polys} opts={{ ...DEFAULT_OPTS, strength: 0.9 }} /> : <div className="grid h-72 place-items-center rounded-2xl bg-linen text-ink/60">Pick a room below</div>}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {list.map((t) => <button key={t.id} onClick={() => setSel(t)} className={`overflow-hidden rounded-xl border-2 text-left ${sel?.id === t.id ? 'border-maroon' : 'border-transparent'}`}><ProtectedImg id={t.mediaId} className="aspect-[4/3]" /><div className="px-2 py-1 text-xs">{t.name}</div></button>)}
        </div>
      </div>
      <div className="card p-5">{sel ? <FabricPicker key={sel.id} categories={cats[sel.kind] ?? []} value={pick} onPick={setPick} /> : <p className="text-sm text-ink/60">Choose a room to start.</p>}</div>
    </div>
  )
}

export default function Showroom() {
  const [sp, setSp] = useSearchParams()
  const mode = MODES.find((m) => m.id === sp.get('mode')) ?? MODES[0]
  const variant = sp.get('variant') && mode.variants?.some((v) => v[0] === sp.get('variant')) ? sp.get('variant')! : mode.variants?.[mode.variants.length > 1 ? 1 : 0][0] ?? ''
  const [wall, setWall] = useState('Cream')
  const [pick, setPick] = useState<Pick>({ fabric: NEUTRAL })
  const productId = sp.get('product') ? Number(sp.get('product')) : undefined
  useEffect(() => { setPick({ fabric: { kind: 'pattern', pattern: 'Stripes', color: '#2f3e8f', label: 'Custom design' } }) }, [mode.id, variant])
  const set = (o: Record<string, string>) => setSp({ ...Object.fromEntries(sp), ...o }, { replace: true })

  return (
    <div className="container-x py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">Visualize it in your home</h1>
      <p className="mt-1 max-w-2xl text-ink/70">Pick a product type, then try designs and colours instantly. These are illustrative previews &mdash; real fabric tone and texture may vary slightly.</p>
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2">
        {MODES.map((m) => <button key={m.id} onClick={() => setSp({ mode: m.id })} className={`chip whitespace-nowrap !px-4 !py-2 text-sm ${m.id === mode.id ? 'chip-on' : ''}`}><span className="mr-1.5">{m.icon}</span>{m.label}</button>)}
      </div>
      <div className="mt-4">
        {mode.id === 'myroom' ? <MyRoom /> : mode.id === 'gallery' ? <Gallery /> : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="protected relative overflow-hidden rounded-2xl border border-sand shadow-soft no-print-protect">
              <div className="aspect-[800/520]"><Scene kind={mode.kind!} variant={variant} mode={mode.id as never} fabric={pick.fabric} wall={wall} /></div>
              <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: wm }} />
              <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()} />
              <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs shadow">{pick.fabric.label ?? 'Custom design'}</div>
            </div>
            <div className="card space-y-5 p-5">
              {mode.variants && <div><div className="label">Model</div><div className="flex flex-wrap gap-1.5">{mode.variants.map(([v, l]) => <button key={v} className={`chip ${v === variant ? 'chip-on' : ''}`} onClick={() => set({ variant: v })}>{l}</button>)}</div></div>}
              <div><div className="label">Wall colour</div><div className="flex gap-2">{Object.entries(WALLS).map(([n, [c]]) => <button key={n} title={n} aria-label={n} onClick={() => setWall(n)} className={`h-7 w-7 rounded-full border-2 ${wall === n ? 'border-ink' : 'border-white shadow'}`} style={{ background: c }} />)}</div></div>
              <FabricPicker key={mode.id + variant} categories={mode.cats(variant)} value={pick} onPick={setPick} initialProductId={productId} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}