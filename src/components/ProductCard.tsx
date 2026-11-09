import { useState } from 'react'
import { Link } from 'react-router'
import { displayPrice } from '../lib/catalog'
import type { Product } from '../lib/catalog'

export function ProductImage({ product, src }: { product: Product; src?: string }) {
  const url = src ?? product.images[0]
  const [failed, setFailed] = useState('')
  if (url && failed !== url) {
    return <img src={url} alt={product.name} loading="lazy" onError={() => setFailed(url)} className="h-full w-full object-contain" />
  }
  return (
    <div className="flex h-full w-full items-center justify-center" role="img" aria-label={`${product.name}, foto pendiente`}>
      <svg viewBox="0 0 80 120" className="h-1/2 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="14" y="4" width="52" height="112" rx="10" />
        <path d="M34 104h12" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/producto/${product.code}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 p-6 transition group-hover:bg-neutral-200">
        <ProductImage product={product} />
        {!product.available && <span className="absolute top-3 left-3 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">Agotado</span>}
      </div>
      <p className="mt-3 text-xs text-neutral-500">{product.category}</p>
      <h3 className="font-bold">{product.name}</h3>
      <p className="text-sm font-semibold">{displayPrice(product)}</p>
    </Link>
  )
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.code} product={p} />)}
    </div>
  )
}
