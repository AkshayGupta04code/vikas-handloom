import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { fabricToImage, type Fabric } from '../lib/fabric'

export type Pt = [number, number]   // normalised 0..1
export interface Handle { toPng: () => string | null }
export interface Opts { strength: number; scale: number; blend: GlobalCompositeOperation; feather: number }
export const DEFAULT_OPTS: Opts = { strength: 0.85, scale: 1.2, blend: 'multiply', feather: 1.5 }

/**
 * Basic client-side image compositor ("PlacementProvider" for the free tier):
 * the user outlines a region (polygon mask); the fabric is tiled inside it and blended with the
 * original photo (multiply keeps the photo's light and shadow). Nothing is uploaded to any server.
 * Future AI placement can replace this component behind the same props (image + masks + fabric).
 */
const RoomCompositor = forwardRef<Handle, {
  src: string; fabric: Fabric; polygons: Pt[][]; onChange?: (p: Pt[][]) => void; editable?: boolean; opts?: Opts; maxWidth?: number
}>(function RoomCompositor({ src, fabric, polygons, onChange, editable = false, opts = DEFAULT_OPTS, maxWidth = 1000 }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [fab, setFab] = useState<HTMLImageElement | null>(null)
  const [current, setCurrent] = useState<Pt[]>([])

  useEffect(() => { setImg(null); const i = new Image(); i.onload = () => setImg(i); i.src = src }, [src])
  const fabKey = fabric.kind === 'image' ? fabric.src : `${fabric.pattern}|${fabric.color}`
  useEffect(() => { let live = true; fabricToImage(fabric, opts.scale).then((i) => live && setFab(i)).catch(() => {}); return () => { live = false } }, [fabKey, opts.scale])  // eslint-disable-line

  const draw = useCallback((overlay: boolean) => {
    const c = canvas.current
    if (!c || !img) return
    const w = Math.min(maxWidth, img.naturalWidth), h = Math.round((img.naturalHeight * w) / img.naturalWidth)
    c.width = w; c.height = h
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0, w, h)
    const path = (g: CanvasRenderingContext2D, poly: Pt[]) => { g.beginPath(); poly.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h))); g.closePath() }
    const regions = polygons.filter((p) => p.length >= 3)
    if (fab && regions.length) {
      const layer = document.createElement('canvas'); layer.width = w; layer.height = h
      const mask = document.createElement('canvas'); mask.width = w; mask.height = h
      const lg = layer.getContext('2d')!, mg = mask.getContext('2d')!
      const pat = lg.createPattern(fab, 'repeat')!
      const scale = fabric.kind === 'image' ? (w / 4 / fab.naturalWidth) * opts.scale / 1.2 : 0.5
      pat.setTransform(new DOMMatrix().scale(scale))
      lg.fillStyle = pat; lg.fillRect(0, 0, w, h)
      mg.filter = `blur(${opts.feather}px)`; mg.fillStyle = '#000'
      regions.forEach((r) => { path(mg, r); mg.fill() })
      lg.globalCompositeOperation = 'destination-in'; lg.drawImage(mask, 0, 0)
      ctx.save(); ctx.globalCompositeOperation = opts.blend; ctx.globalAlpha = opts.strength; ctx.drawImage(layer, 0, 0); ctx.restore()
    }
    if (overlay && editable) {
      const all = [...polygons, current]
      all.forEach((poly, k) => {
        if (!poly.length) return
        ctx.lineWidth = 2; ctx.strokeStyle = '#ff2d6f'; ctx.fillStyle = 'rgba(255,45,111,.12)'
        ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)))
        if (k < polygons.length) { ctx.closePath(); ctx.fill() }
        ctx.stroke()
        poly.forEach(([x, y], i) => { ctx.beginPath(); ctx.arc(x * w, y * h, i === 0 && k === polygons.length ? 7 : 4, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke() })
      })
    }
  }, [img, fab, polygons, current, opts, editable, fabric.kind, maxWidth])

  useEffect(() => draw(true), [draw])
  useImperativeHandle(ref, () => ({ toPng: () => { draw(false); const u = canvas.current?.toDataURL('image/png') ?? null; draw(true); return u } }), [draw])

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editable || !canvas.current) return
    const r = canvas.current.getBoundingClientRect()
    const pt: Pt = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]
    if (current.length >= 3) {
      const [fx, fy] = current[0]
      if (Math.hypot((fx - pt[0]) * r.width, (fy - pt[1]) * r.height) < 14) { close(); return }
    }
    setCurrent([...current, pt])
  }
  const close = () => { if (current.length >= 3) { onChange?.([...polygons, current]); setCurrent([]) } }

  return (
    <div>
      <div className="protected overflow-hidden rounded-xl border border-sand bg-linen" onContextMenu={(e) => e.preventDefault()}>
        {!img && <div className="grid h-64 place-items-center text-sm text-ink/50">Loading photo...</div>}
        <canvas ref={canvas} onPointerDown={onPointer} className={`block h-auto w-full ${editable ? 'cursor-crosshair touch-none' : ''} ${img ? '' : 'hidden'}`} />
      </div>
      {editable && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink/70">Tap around the bed / sofa / curtain edge. Tap the first point (or press Close) to finish a region.</span>
          <button className="btn-outline !py-1" disabled={current.length < 3} onClick={close}>Close region</button>
          <button className="btn-ghost !py-1" disabled={!current.length} onClick={() => setCurrent(current.slice(0, -1))}>Undo point</button>
          <button className="btn-ghost !py-1" disabled={!current.length && !polygons.length} onClick={() => { setCurrent([]); onChange?.([]) }}>Clear all</button>
        </div>
      )}
    </div>
  )
})
export default RoomCompositor