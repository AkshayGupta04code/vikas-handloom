// Procedural fabric patterns shared by SVG scenes and the canvas compositor.
export const PATTERNS = ['Solid', 'Stripes', 'Checks', 'Floral', 'Geometric', 'Zigzag', 'Dots'] as const
export type PatternName = (typeof PATTERNS)[number]

export type Fabric =
  | { kind: 'pattern'; pattern: string; color: string; label?: string }
  | { kind: 'image'; src: string; label?: string }

export const PRESET_COLORS = ['#2f3e8f', '#7a1f2b', '#2f6b4a', '#d19a1f', '#1f7a7a', '#d96b8b', '#e8e0d2', '#3a3a3a', '#8b5e3c', '#6c4f9c']
export const NEUTRAL: Fabric = { kind: 'pattern', pattern: 'Solid', color: '#d9d2c5' }

export function shade(hex: string, amt: number): string {
  const h = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#888888'
  const n = parseInt(h.slice(1), 16)
  const f = (c: number) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('')
}

export function normalizePattern(p?: string | null): PatternName {
  const f = PATTERNS.find((x) => x.toLowerCase() === (p ?? '').toLowerCase())
  return f ?? 'Solid'
}

export function tile(pattern: string, color: string): { size: number; svg: string } {
  const light = shade(color, 0.45), dark = shade(color, -0.3)
  const flower = (cx: number, cy: number) => {
    let s = ''
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 * Math.PI) / 180
      s += `<circle cx="${cx + 9 * Math.cos(a)}" cy="${cy + 9 * Math.sin(a)}" r="6" fill="${light}" opacity=".9"/>`
    }
    return s + `<circle cx="${cx}" cy="${cy}" r="4" fill="#e2c47a"/>`
  }
  switch (normalizePattern(pattern)) {
    case 'Stripes':
      return { size: 24, svg: `<rect width="24" height="24" fill="${color}"/><rect width="7" height="24" fill="${light}"/><rect x="13" width="3" height="24" fill="${dark}"/>` }
    case 'Checks':
      return { size: 40, svg: `<rect width="40" height="40" fill="${color}"/><rect width="20" height="20" fill="${light}" opacity=".55"/><rect x="20" y="20" width="20" height="20" fill="${light}" opacity=".55"/><rect x="20" width="20" height="20" fill="${dark}" opacity=".18"/>` }
    case 'Floral':
      return { size: 60, svg: `<rect width="60" height="60" fill="${color}"/>${flower(30, 30)}${flower(0, 0)}${flower(60, 0)}${flower(0, 60)}${flower(60, 60)}<ellipse cx="12" cy="40" rx="6" ry="3" fill="${dark}" opacity=".6"/><ellipse cx="48" cy="18" rx="6" ry="3" fill="${dark}" opacity=".6"/>` }
    case 'Geometric':
      return { size: 40, svg: `<rect width="40" height="40" fill="${color}"/><polygon points="20,2 38,20 20,38 2,20" fill="none" stroke="${light}" stroke-width="2"/><polygon points="20,12 28,20 20,28 12,20" fill="${dark}" opacity=".5"/>` }
    case 'Zigzag':
      return { size: 40, svg: `<rect width="40" height="40" fill="${color}"/><polyline points="0,10 10,0 20,10 30,0 40,10" fill="none" stroke="${light}" stroke-width="3"/><polyline points="0,30 10,20 20,30 30,20 40,30" fill="none" stroke="${dark}" stroke-width="3"/>` }
    case 'Dots':
      return { size: 24, svg: `<rect width="24" height="24" fill="${color}"/><circle cx="6" cy="6" r="3" fill="${light}"/><circle cx="18" cy="18" r="3" fill="${light}"/>` }
    default:
      return { size: 20, svg: `<rect width="20" height="20" fill="${color}"/>` }
  }
}

/** Rasterise a fabric into a canvas pattern source (used by the room compositor). */
export function fabricToImage(f: Fabric, scale = 1.2): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    if (f.kind === 'image') { img.src = f.src; return }
    const t = tile(f.pattern, f.color)
    const px = Math.round(t.size * scale * 2)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${t.size} ${t.size}">${t.svg}</svg>`
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  })
}