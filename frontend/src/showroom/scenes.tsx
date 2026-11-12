import { useId, type ReactNode } from 'react'
import { NEUTRAL, tile, type Fabric } from '../lib/fabric'

export type SceneKind = 'bed' | 'sofa' | 'curtain' | 'carpet' | 'table'
export type SceneMode = 'bedsheet' | 'comforter' | 'pillow' | 'sofaCover' | 'cushion' | 'curtain' | 'carpet' | 'table'
export const WALLS: Record<string, [string, string]> = { Cream: ['#f1e8d8', '#e3d6bd'], Sage: ['#dfe6d6', '#c8d3bb'], Blush: ['#f3e0dc', '#e4c8c2'], Grey: ['#e4e4e2', '#cfcfcc'] }

function FabricDef({ id, fabric, scale = 1.2 }: { id: string; fabric: Fabric; scale?: number }) {
  if (fabric.kind === 'image')
    return <pattern id={id} width={240} height={240} patternUnits="userSpaceOnUse"><image href={fabric.src} width={240} height={240} preserveAspectRatio="xMidYMid slice" /></pattern>
  const t = tile(fabric.pattern, fabric.color)
  return <pattern id={id} width={t.size} height={t.size} patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`} dangerouslySetInnerHTML={{ __html: t.svg }} />
}

interface P { p: string }
const U = (p: string, n: string) => `url(#${p}${n})`

function Room({ p, wall, floorY = 385, children }: P & { wall: string; floorY?: number; children?: ReactNode }) {
  const [w1, w2] = WALLS[wall] ?? WALLS.Cream
  return (
    <g>
      <defs>
        <linearGradient id={`${p}wall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={w1} /><stop offset="1" stopColor={w2} /></linearGradient>
        <linearGradient id={`${p}floor`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8825c" /><stop offset="1" stopColor="#7d5b3c" /></linearGradient>
        <linearGradient id={`${p}shade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset=".55" stopColor="#000" stopOpacity=".02" /><stop offset="1" stopColor="#000" stopOpacity=".3" /></linearGradient>
        <linearGradient id={`${p}pleat`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".34" /><stop offset=".5" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#000" stopOpacity=".34" /></linearGradient>
        <pattern id={`${p}pl`} width="34" height="10" patternUnits="userSpaceOnUse"><rect width="34" height="10" fill={U(p, 'pleat')} /></pattern>
        <radialGradient id={`${p}glow`} cx=".5" cy=".3" r=".7"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <filter id={`${p}blur`}><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <rect width="800" height={floorY} fill={U(p, 'wall')} />
      <rect y={floorY - 14} width="800" height="14" fill="#fff" opacity=".55" />
      <rect y={floorY} width="800" height={520 - floorY} fill={U(p, 'floor')} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M${i * 110 - 40} 520 L${i * 100 + 160} ${floorY}`} stroke="#000" strokeOpacity=".08" />)}
      <rect width="800" height="520" fill={U(p, 'glow')} />
      {children}
    </g>
  )
}

function Shadow({ p, x, y, w }: P & { x: number; y: number; w: number }) {
  return <ellipse cx={x + w / 2} cy={y} rx={w / 2 + 10} ry="14" fill="#000" opacity=".22" filter={U(p, 'blur')} />
}

/* ---------------- BED ---------------- */
function Bed({ p, double, sheet, pillow, comforter, wall }: P & { double: boolean; sheet: string; pillow: string; comforter: boolean; wall: string }) {
  const w = double ? 480 : 300, x = 400 - w / 2, top = comforter ? 278 : 292
  const pillows = double ? [x + 28, x + w / 2 + 6] : [x + 38]
  const pw = double ? w / 2 - 34 : w - 76
  return (
    <Room p={p} wall={wall}>
      <Shadow p={p} x={x - 30} y={462} w={w + 60} />
      <rect x={x - 18} y="130" width={w + 36} height="215" rx="16" fill="#6b4a35" />
      <rect x={x - 4} y="146" width={w + 8} height="185" rx="10" fill="#7d5a41" /><rect x={x - 4} y="146" width={w + 8} height="185" rx="10" fill={U(p, 'shade')} />
      {/* mattress top */}
      <polygon points={`${x + 12},${top} ${x + w - 12},${top} ${x + w + 24},378 ${x - 24},378`} fill={sheet} />
      <polygon points={`${x + 12},${top} ${x + w - 12},${top} ${x + w + 24},378 ${x - 24},378`} fill={U(p, 'shade')} />
      {!comforter && <polygon points={`${x + 12},${top} ${x + w - 12},${top} ${x + w - 4},${top + 22} ${x + 4},${top + 22}`} fill="#fff" opacity=".22" />}
      {comforter && [1, 2, 3, 4].map((i) => <path key={i} d={`M${x + 12 - i * 9 + 2},${top + i * 20} L${x + w - 12 + i * 9 - 2},${top + i * 20}`} stroke="#000" strokeOpacity=".16" strokeWidth="2" strokeDasharray="6 5" />)}
      {comforter && Array.from({ length: double ? 7 : 4 }, (_, i) => <path key={i} d={`M${x + 12 + ((i + 1) * (w - 24)) / (double ? 8 : 5)},${top} L${x - 24 + ((i + 1) * (w + 48)) / (double ? 8 : 5)},378`} stroke="#000" strokeOpacity=".14" strokeWidth="2" strokeDasharray="6 5" />)}
      {/* pillows */}
      {pillows.map((px, i) => (
        <g key={i}>
          <rect x={px} y="228" width={pw} height="78" rx="34" fill={pillow} />
          <rect x={px} y="228" width={pw} height="78" rx="34" fill={U(p, 'shade')} />
          <path d={`M${px + 18},246 Q${px + pw / 2},232 ${px + pw - 18},246`} stroke="#fff" strokeOpacity=".4" strokeWidth="3" fill="none" />
        </g>
      ))}
      {/* front drape */}
      <path d={`M${x - 24},378 L${x + w + 24},378 L${x + w + 24},${comforter ? 452 : 440} Q${x + w / 2},${comforter ? 474 : 456} ${x - 24},${comforter ? 452 : 440} Z`} fill={sheet} />
      <path d={`M${x - 24},378 L${x + w + 24},378 L${x + w + 24},${comforter ? 452 : 440} Q${x + w / 2},${comforter ? 474 : 456} ${x - 24},${comforter ? 452 : 440} Z`} fill="#000" opacity=".16" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${x - 10 + (i * (w + 20)) / 6},380 L${x - 14 + (i * (w + 28)) / 6},446`} stroke="#000" strokeOpacity=".1" strokeWidth="5" />)}
      <rect x={x - 28} y="450" width={w + 56} height="22" rx="4" fill="#5a3d2b" />
      <rect x={x - 22} y="470" width="16" height="26" fill="#4a3123" /><rect x={x + w + 6} y="470" width="16" height="26" fill="#4a3123" />
      {/* bedside */}
      {[x - 130, x + w + 44].map((tx, i) => (
        <g key={i}>
          <rect x={tx} y="360" width="86" height="104" rx="6" fill="#7d5a41" /><rect x={tx + 8} y="372" width="70" height="30" rx="3" fill="#6b4a35" /><circle cx={tx + 43} cy="387" r="3" fill="#e2c47a" />
          <rect x={tx + 38} y="318" width="10" height="42" fill="#b98b2e" /><path d={`M${tx + 20},322 L${tx + 66},322 L${tx + 54},282 L${tx + 32},282Z`} fill="#f7ecd0" />
        </g>
      ))}
    </Room>
  )
}

/* ---------------- SOFA ---------------- */
function Sofa({ p, seats, ell, body, cushion, throws, wall }: P & { seats: number; ell: boolean; body: string; cushion: string; throws: string | null; wall: string }) {
  const sw = 165, total = seats * sw + 92 + (ell ? 150 : 0), x0 = (800 - total) / 2, mainW = seats * sw + 92
  const seatXs = Array.from({ length: seats }, (_, i) => x0 + 46 + i * sw)
  const over = (xx: number, yy: number, ww: number, hh: number, rx: number, fill: string, op = 1) => (
    <g><rect x={xx} y={yy} width={ww} height={hh} rx={rx} fill={fill} opacity={op} /><rect x={xx} y={yy} width={ww} height={hh} rx={rx} fill={U(p, 'shade')} /></g>
  )
  return (
    <Room p={p} wall={wall}>
      <rect x="80" y="70" width="150" height="110" fill="#f4efe6" stroke="#cbbfa9" strokeWidth="6" /><rect x="86" y="76" width="138" height="98" fill="#cfe3ee" /><path d="M86 150 Q130 120 160 140 T224 130 V174 H86Z" fill="#9cc29a" opacity=".7" />
      <Shadow p={p} x={x0} y={440} w={total} />
      {over(x0 + 24, 200, mainW - 48, 160, 30, body)}
      {seatXs.map((sx, i) => <g key={i}>{over(sx + 2, 218, sw - 8, 128, 22, cushion)}<path d={`M${sx + 10},232 Q${sx + sw / 2},224 ${sx + sw - 16},232`} stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" /></g>)}
      {over(x0, 250, 50, 178, 24, body)}
      {!ell && over(x0 + mainW - 50, 250, 50, 178, 24, body)}
      {seatXs.map((sx, i) => <g key={i}>{over(sx, 338, sw - 4, 64, 16, cushion)}</g>)}
      {ell && over(x0 + mainW - 50, 352, 200, 66, 18, cushion)}
      {ell && <rect x={x0 + mainW - 50} y="410" width="200" height="40" rx="8" fill={body} />}
      {ell && <rect x={x0 + mainW - 50} y="410" width="200" height="40" rx="8" fill="#000" opacity=".2" />}
      <rect x={x0 + 8} y="400" width={mainW - 16} height="42" rx="8" fill={body} /><rect x={x0 + 8} y="400" width={mainW - 16} height="42" rx="8" fill="#000" opacity=".2" />
      {[x0 + 20, x0 + mainW - 40, ...(ell ? [x0 + total - 30] : [])].map((lx, i) => <rect key={i} x={lx} y="440" width="14" height="22" rx="3" fill="#4a3123" />)}
      {throws && [[x0 + 62, 292, -12], [x0 + mainW - 130, 292, 14]].map(([cx, cy, r], i) => (
        <g key={i} transform={`rotate(${r} ${cx + 38} ${cy + 38})`}><rect x={cx} y={cy} width="76" height="76" rx="14" fill={throws} /><rect x={cx} y={cy} width="76" height="76" rx="14" fill={U(p, 'shade')} /><path d={`M${cx + 6},${cy + 6} L${cx + 70},${cy + 70} M${cx + 70},${cy + 6} L${cx + 6},${cy + 70}`} stroke="#000" strokeOpacity=".1" /></g>
      ))}
    </Room>
  )
}

/* ---------------- CURTAINS ---------------- */
function Curtains({ p, door, fab, wall }: P & { door: boolean; fab: string; wall: string }) {
  const bottom = door ? 445 : 400
  const panel = (x: number, w: number) => {
    const d = `M${x},104 H${x + w} V${bottom - 6} Q${x + w * 0.75},${bottom + 8} ${x + w / 2},${bottom - 4} T${x},${bottom - 6} Z`
    return (
      <g>
        <path d={d} fill={fab} /><path d={d} fill={U(p, 'pl')} opacity=".7" /><path d={d} fill={U(p, 'shade')} />
        {Array.from({ length: Math.floor(w / 28) + 1 }, (_, i) => <circle key={i} cx={x + 8 + i * 28} cy="102" r="4" fill="#b98b2e" />)}
      </g>
    )
  }
  return (
    <Room p={p} wall={wall}>
      {door ? (
        <g>
          <rect x="300" y="108" width="200" height="337" fill="#f4efe6" stroke="#cbbfa9" strokeWidth="8" />
          <rect x="312" y="120" width="176" height="325" fill="#8a6446" /><rect x="326" y="136" width="70" height="120" rx="4" fill="#775539" /><rect x="404" y="136" width="70" height="120" rx="4" fill="#775539" />
          <rect x="326" y="272" width="70" height="150" rx="4" fill="#775539" /><rect x="404" y="272" width="70" height="150" rx="4" fill="#775539" /><circle cx="470" cy="300" r="6" fill="#e2c47a" />
        </g>
      ) : (
        <g>
          <rect x="268" y="112" width="264" height="226" fill="#f4efe6" stroke="#cbbfa9" strokeWidth="8" />
          <defs><linearGradient id={`${p}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fd0ee" /><stop offset="1" stopColor="#e6f3f8" /></linearGradient></defs>
          <rect x="278" y="122" width="244" height="206" fill={U(p, 'sky')} /><circle cx="470" cy="165" r="22" fill="#fff5c2" /><path d="M278 300 Q330 250 380 285 T522 270 V328 H278Z" fill="#8fbf8a" />
          <path d="M400 122 V328 M278 225 H522" stroke="#f4efe6" strokeWidth="6" />
          <rect x="250" y="338" width="300" height="10" fill="#e9e0d0" />
        </g>
      )}
      <rect x="196" y="90" width="408" height="9" rx="4" fill="#4b3a2c" /><circle cx="196" cy="94" r="8" fill="#b98b2e" /><circle cx="604" cy="94" r="8" fill="#b98b2e" />
      {panel(206, 130)}{panel(464, 130)}
      <path d={`M${206},${bottom - 120} Q${300},${bottom - 100} ${336},${bottom - 120}`} stroke="#b98b2e" strokeWidth="6" fill="none" opacity=".0" />
      <Shadow p={p} x={206} y={bottom + 12} w={390} />
    </Room>
  )
}

/* ---------------- CARPET ---------------- */
function Carpet({ p, fab, wall }: P & { fab: string; wall: string }) {
  const pts = '210,400 590,400 720,508 80,508'
  return (
    <Room p={p} wall={wall} floorY={360}>
      <rect x="180" y="190" width="440" height="140" rx="26" fill="#cfc6b8" /><rect x="200" y="206" width="400" height="90" rx="18" fill="#dcd4c7" /><rect x="168" y="250" width="50" height="110" rx="20" fill="#cfc6b8" /><rect x="582" y="250" width="50" height="110" rx="20" fill="#cfc6b8" />
      <polygon points={pts} fill={fab} /><polygon points={pts} fill={U(p, 'shade')} />
      <polygon points="232,412 568,412 676,496 124,496" fill="none" stroke="#e2c47a" strokeWidth="3" opacity=".8" />
      <polygon points="232,412 568,412 676,496 124,496" fill="none" stroke="#000" strokeOpacity=".15" strokeWidth="1" strokeDasharray="4 4" />
      <rect x="320" y="420" width="160" height="40" rx="6" fill="#7d5a41" /><rect x="326" y="456" width="10" height="20" fill="#5a3d2b" /><rect x="464" y="456" width="10" height="20" fill="#5a3d2b" />
    </Room>
  )
}

/* ---------------- TABLE ---------------- */
function Table({ p, fab, wall }: P & { fab: string; wall: string }) {
  const top = '230,290 570,290 640,340 160,340'
  return (
    <Room p={p} wall={wall}>
      <Shadow p={p} x={140} y={478} w={520} />
      {[120, 650].map((cx, i) => <g key={i}><rect x={cx} y="250" width="40" height="150" rx="10" fill="#7d5a41" /><rect x={cx - 10} y="340" width="60" height="26" rx="8" fill="#8a6446" /><rect x={cx} y="366" width="8" height="100" fill="#5a3d2b" /><rect x={cx + 32} y="366" width="8" height="100" fill="#5a3d2b" /></g>)}
      <polygon points={top} fill={fab} /><polygon points={top} fill={U(p, 'shade')} />
      <path d="M160,340 L640,340 L640,456 Q620,474 600,456 T560,456 T520,456 T480,456 T440,456 T400,456 T360,456 T320,456 T280,456 T240,456 T200,456 T160,456 Z" fill={fab} />
      <path d="M160,340 L640,340 L640,456 Q620,474 600,456 T560,456 T520,456 T480,456 T440,456 T400,456 T360,456 T320,456 T280,456 T240,456 T200,456 T160,456 Z" fill="#000" opacity=".16" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${190 + i * 52},342 L${186 + i * 54},452`} stroke="#000" strokeOpacity=".1" strokeWidth="6" />)}
      <path d="M390 288 q-8 -40 4 -62 M400 288 q2 -50 -6 -78" stroke="#4b6a54" strokeWidth="3" fill="none" /><circle cx="394" cy="224" r="9" fill="#d96b8b" /><circle cx="394" cy="208" r="8" fill="#e8b4c2" />
      <path d="M380 288 h40 l-6 -34 h-28z" fill="#cfe3ee" stroke="#9fbfd0" />
    </Room>
  )
}

export interface SceneProps { kind: SceneKind; variant: string; mode: SceneMode; fabric: Fabric; wall?: string; className?: string }

export default function Scene({ kind, variant, mode, fabric, wall = 'Cream', className = '' }: SceneProps) {
  const p = useId().replace(/:/g, '')
  const fa = `${p}fa`
  const F = U(p, 'fa')
  const n = '#d9d2c5'
  let body: ReactNode
  if (kind === 'bed') {
    const double = variant === 'double'
    body = <Bed p={p} double={double} wall={wall} comforter={mode === 'comforter'} sheet={mode === 'pillow' ? n : F} pillow={mode === 'pillow' || mode === 'bedsheet' ? F : '#f1ece3'} />
  } else if (kind === 'sofa') {
    const seats = variant === 'single' ? 1 : variant === 'two' ? 2 : 3
    body = <Sofa p={p} seats={seats} ell={variant === 'l'} wall={wall} body={mode === 'cushion' ? '#9aa3a8' : F} cushion={mode === 'cushion' ? '#9aa3a8' : F} throws={mode === 'cushion' ? F : null} />
  } else if (kind === 'curtain') body = <Curtains p={p} door={variant === 'door'} fab={F} wall={wall} />
  else if (kind === 'carpet') body = <Carpet p={p} fab={F} wall={wall} />
  else body = <Table p={p} fab={F} wall={wall} />
  return (
    <svg viewBox="0 0 800 520" className={`protected block h-full w-full ${className}`} role="img" aria-label={`${kind} preview with ${fabric.label ?? 'selected fabric'}`} onContextMenu={(e) => e.preventDefault()}>
      <defs><FabricDef id={fa} fabric={fabric ?? NEUTRAL} scale={kind === 'carpet' ? 1.6 : 1.1} /></defs>
      {body}
    </svg>
  )
}