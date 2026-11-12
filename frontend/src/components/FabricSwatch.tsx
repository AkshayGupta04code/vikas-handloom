import { useId } from 'react'
import { tile, normalizePattern } from '../lib/fabric'

/** Generated fabric preview used for demo products that have no photograph yet. */
export default function FabricSwatch({ pattern, color, className = '' }: { pattern?: string; color?: string; className?: string }) {
  const id = useId().replace(/:/g, '')
  const t = tile(normalizePattern(pattern), color ?? '#8b5e3c')
  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" className={`protected h-full w-full ${className}`} role="img" aria-label={`${pattern ?? 'Solid'} fabric`} onContextMenu={(e) => e.preventDefault()}>
      <defs>
        <pattern id={`${id}p`} width={t.size} height={t.size} patternUnits="userSpaceOnUse" patternTransform="scale(1.3)" dangerouslySetInnerHTML={{ __html: t.svg }} />
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset=".35" stopColor="#000" stopOpacity=".12" />
          <stop offset=".6" stopColor="#fff" stopOpacity=".12" /><stop offset="1" stopColor="#000" stopOpacity=".32" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill={`url(#${id}p)`} />
      <rect width="300" height="300" fill={`url(#${id}f)`} />
      <path d="M0 210 Q150 170 300 215 L300 300 L0 300Z" fill="#000" opacity=".12" />
    </svg>
  )
}