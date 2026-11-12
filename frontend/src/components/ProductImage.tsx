import type { Product } from '../lib/types'
import FabricSwatch from './FabricSwatch'
import ProtectedImg from './ProtectedImg'

export default function ProductImage({ product, index = 0, className = '' }: { product: Pick<Product, 'imageIds' | 'pattern' | 'colorHex' | 'name'>; index?: number; className?: string }) {
  const id = product.imageIds[index]
  return id ? <ProtectedImg id={id} alt={product.name} className={className} /> : (
    <div className={`overflow-hidden ${className}`}><FabricSwatch pattern={product.pattern} color={product.colorHex} /></div>
  )
}