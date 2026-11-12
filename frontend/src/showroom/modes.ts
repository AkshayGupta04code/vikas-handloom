import type { SceneKind, SceneMode } from './scenes'

export interface ModeDef { id: SceneMode | 'myroom' | 'gallery'; label: string; icon: string; kind?: SceneKind; variants?: [string, string][]; cats: (v: string) => string[] }
export const MODES: ModeDef[] = [
  { id: 'bedsheet', label: 'Bedsheets', icon: '\u{1F6CF}', kind: 'bed', variants: [['single', 'Single bed'], ['double', 'Double bed']], cats: (v) => [v === 'single' ? 'single-bedsheets' : 'double-bedsheets'] },
  { id: 'comforter', label: 'Comforters', icon: '\u2601', kind: 'bed', variants: [['single', 'Single bed'], ['double', 'Double bed']], cats: () => ['comforters'] },
  { id: 'pillow', label: 'Pillow covers', icon: '\u25AD', kind: 'bed', variants: [['single', 'Single bed'], ['double', 'Double bed']], cats: () => ['pillow-covers'] },
  { id: 'sofaCover', label: 'Sofa covers', icon: '\u{1F6CB}', kind: 'sofa', variants: [['single', 'Single'], ['two', '2-seater'], ['three', '3-seater'], ['l', 'L-shaped']], cats: () => ['sofa-covers'] },
  { id: 'cushion', label: 'Cushions', icon: '\u25C6', kind: 'sofa', variants: [['two', '2-seater'], ['three', '3-seater'], ['l', 'L-shaped']], cats: () => ['cushion-covers', 'cushions'] },
  { id: 'curtain', label: 'Curtains', icon: '\u25A5', kind: 'curtain', variants: [['window', 'Window'], ['door', 'Door']], cats: (v) => [v === 'door' ? 'door-curtains' : 'window-curtains'] },
  { id: 'carpet', label: 'Carpets', icon: '\u25A6', kind: 'carpet', cats: () => ['carpets'] },
  { id: 'table', label: 'Table covers', icon: '\u25AD', kind: 'table', cats: () => ['table-covers'] },
  { id: 'gallery', label: 'Our rooms', icon: '\u{1F5BC}', cats: () => [] },
  { id: 'myroom', label: 'Upload my room', icon: '\u{1F4F7}', cats: () => [] },
]

/** Which preview mode/variant best shows a product from the given category slug. */
export function previewFor(slug: string): { mode: string; variant?: string } | null {
  const m: Record<string, { mode: string; variant?: string }> = {
    'single-bedsheets': { mode: 'bedsheet', variant: 'single' }, 'double-bedsheets': { mode: 'bedsheet', variant: 'double' },
    comforters: { mode: 'comforter', variant: 'double' }, blankets: { mode: 'comforter', variant: 'double' }, 'pillow-covers': { mode: 'pillow', variant: 'double' },
    'sofa-covers': { mode: 'sofaCover', variant: 'three' }, 'cushion-covers': { mode: 'cushion', variant: 'three' }, cushions: { mode: 'cushion', variant: 'three' },
    'window-curtains': { mode: 'curtain', variant: 'window' }, 'door-curtains': { mode: 'curtain', variant: 'door' },
    carpets: { mode: 'carpet' }, 'table-covers': { mode: 'table' },
  }
  return m[slug] ?? null
}