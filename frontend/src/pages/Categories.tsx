import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Category } from '../lib/types'
import FabricSwatch from '../components/FabricSwatch'
import ProtectedImg from '../components/ProtectedImg'
import { PATTERNS } from '../lib/fabric'

export function CategoryCard({ c, i }: { c: Category; i: number }) {
  return (
    <Link to={`/shop?category=${c.slug}`} className="group card relative block overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden transition duration-500 group-hover:scale-105">
        {c.imageId ? <ProtectedImg id={c.imageId} className="h-full w-full" /> : <FabricSwatch pattern={PATTERNS[i % PATTERNS.length]} color={c.accentColor} />}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white"><div className="font-serif text-lg font-semibold leading-tight">{c.name}</div><div className="text-xs text-white/80">{c.productCount} product{c.productCount === 1 ? '' : 's'}</div></div>
    </Link>
  )
}

export default function Categories() {
  const [cats, setCats] = useState<Category[] | null>(null)
  useEffect(() => { api<Category[]>('/api/categories').then(setCats).catch(() => setCats([])) }, [])
  const group = (g: string, title: string) => (
    <section className="mt-8"><h2 className="mb-4 text-2xl font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{cats?.filter((c) => c.group === g).map((c, i) => <CategoryCard key={c.id} c={c} i={i} />)}</div></section>
  )
  return (
    <div className="container-x py-8"><h1 className="text-3xl font-bold sm:text-4xl">Categories</h1><p className="text-ink/70">Home furnishing and clothing collections.</p>
      {!cats ? <p className="mt-6">Loading...</p> : <>{group('HOME_FURNISHING', 'Home Furnishing')}{group('CLOTHING', 'Clothing')}</>}</div>
  )
}