import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import { money } from '../lib/format'
import Modal from './Modal'
import ProductImage from './ProductImage'

export default function QuickView({ p, onClose }: { p: Product; onClose: () => void }) {
  return (
    <Modal title={p.name} onClose={onClose} wide>
      <div className="grid gap-5 sm:grid-cols-2">
        <ProductImage product={p} className="aspect-square rounded-xl" />
        <div className="space-y-3 text-sm">
          <div className="text-xs uppercase tracking-wide text-gold">{p.categoryName}</div>
          <div className="text-2xl font-semibold text-maroon">{money(p.price)}</div>
          <p className="text-ink/75">{p.description}</p>
          <dl className="grid grid-cols-2 gap-1 text-xs"><dt className="text-ink/50">Colour</dt><dd>{p.color ?? '-'}</dd><dt className="text-ink/50">Pattern</dt><dd>{p.pattern ?? '-'}</dd><dt className="text-ink/50">Size</dt><dd>{p.size ?? '-'}</dd><dt className="text-ink/50">Availability</dt><dd className={p.inStock ? 'text-green-700' : 'text-red-600'}>{p.inStock ? 'In stock' : 'Out of stock'}</dd></dl>
          <Link to={`/product/${p.id}`} className="btn-primary" onClick={onClose}>View full details</Link>
        </div>
      </div>
    </Modal>
  )
}