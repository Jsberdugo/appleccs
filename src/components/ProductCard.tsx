import { useState } from 'react'
import { Link } from 'react-router'
import { displayPrice, imageUrl } from '../lib/catalog'
import type { Product } from '../lib/catalog'

export function ProductImage({ product, src, width = 400 }: { product: Product; src?: string; width?: 400 | 800 }) {
  const original = src ?? product.images[0]
  const url = original && imageUrl(original, width)
  const [failed, setFailed] = useState('')
  const [loaded, setLoaded] = useState('')
  if (url && failed !== url) {
    return (
      <img
        src={url}
        alt={product.name}
        loading="lazy"
        onLoad={() => setLoaded(url)}
        onError={() => setFailed(url)}
        className={`h-full w-full object-contain transition duration-500 ${loaded === url ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      />
    )
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
    <Link to={`/producto/${product.code}`} className="group block transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 p-6 transition-colors duration-300 group-hover:bg-neutral-200">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105"><ProductImage product={product} /></div>
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
      {products.map((p, i) => (
        <div key={p.code} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 11) * 60}ms` }}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="skeleton mt-3 h-3 w-16 rounded-full" />
          <div className="skeleton mt-2 h-4 w-3/4 rounded-full" />
          <div className="skeleton mt-2 h-4 w-1/3 rounded-full" />
        </div>
      ))}
    </div>
  )
}
