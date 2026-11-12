import { useEffect, useState } from 'react'
import { imageBlobUrl } from '../lib/api'

/** Loads an authenticated, watermarked image via fetch+blob, with basic save/drag deterrents. */
export default function ProtectedImg({ id, alt = '', className = '', original = false, onUrl }: { id: number; alt?: string; className?: string; original?: boolean; onUrl?: (u: string) => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    let live = true
    setUrl(null); setErr(false)
    imageBlobUrl(id, original).then((u) => { if (live) { setUrl(u); onUrl?.(u) } }).catch(() => live && setErr(true))
    return () => { live = false }
  }, [id, original])  // eslint-disable-line
  return (
    <div className={`protected relative overflow-hidden bg-linen ${className}`} onContextMenu={(e) => e.preventDefault()}>
      {url && <img src={url} alt={alt} draggable={false} className="h-full w-full object-cover" onDragStart={(e) => e.preventDefault()} />}
      {!url && !err && <div className="absolute inset-0 animate-pulse bg-sand/40" />}
      {err && <div className="absolute inset-0 grid place-items-center text-xs text-ink/50">Image unavailable</div>}
      {/* transparent shield so long-press / right-click never hits the <img> directly */}
      <div className="absolute inset-0" />
    </div>
  )
}