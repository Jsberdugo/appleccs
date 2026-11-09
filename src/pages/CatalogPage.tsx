import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ProductGrid } from '../components/ProductCard'
import { CATEGORIES } from '../config'
import { useCatalog } from '../lib/catalog'

export function CatalogPage() {
  const { products, status, isDemo } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const active = params.get('categoria') ?? ''
  const extra = [...new Set(products.map((p) => p.category))].filter((c) => !CATEGORIES.includes(c))
  const term = search.trim().toLowerCase()
  const visible = products.filter((p) => (!active || p.category === active) && (!term || p.name.toLowerCase().includes(term)))
  const chip = (label: string, value: string) => (
    <button
      key={label}
      type="button"
      aria-pressed={active === value}
      onClick={() => setParams(value ? { categoria: value } : {})}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${active === value ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'}`}
    >
      {label}
    </button>
  )

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <title>Catálogo | Apple Caracas</title>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Catálogo</h1>
      {isDemo && <p className="mt-3 text-sm text-neutral-500">Productos de prueba. El catálogo real se carga desde Google Sheets.</p>}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar producto"
        aria-label="Buscar producto"
        className="mt-8 w-full rounded-full border border-black/20 px-5 py-3 focus:border-black focus:outline-none sm:max-w-sm"
      />
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {chip('Todos', '')}
        {[...CATEGORIES, ...extra].map((c) => chip(c, c))}
      </div>
      <div className="mt-8">
        {status === 'loading' && <p className="text-neutral-500">Cargando productos...</p>}
        {status === 'error' && <p className="text-neutral-500">No pudimos cargar el catálogo. Intenta de nuevo en unos minutos.</p>}
        {status === 'ready' && (visible.length ? <ProductGrid products={visible} /> : <p className="py-16 text-center text-neutral-500">No hay productos con ese filtro.</p>)}
      </div>
    </section>
  )
}
