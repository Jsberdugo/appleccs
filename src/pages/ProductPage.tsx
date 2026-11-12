import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ProductGrid, ProductImage } from '../components/ProductCard'
import { STORE } from '../config'
import { addToCart, optionsText, whatsappUrl } from '../lib/cart'
import { displayPrice, imageUrl, money, useCatalog } from '../lib/catalog'
import type { Product, Variant } from '../lib/catalog'
import { NotFoundPage } from './NotFoundPage'

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Cargando producto">
      <div className="skeleton h-4 w-20 rounded-full" />
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="skeleton aspect-square rounded-3xl" />
        <div>
          <div className="skeleton h-3 w-16 rounded-full" />
          <div className="skeleton mt-3 h-10 w-3/4 rounded-xl" />
          <div className="skeleton mt-4 h-7 w-28 rounded-xl" />
          <div className="skeleton mt-6 h-4 w-full rounded-full" />
          <div className="skeleton mt-2 h-4 w-5/6 rounded-full" />
          {[0, 1].map((i) => (
            <div key={i} className="mt-7 flex gap-2">
              {[0, 1, 2].map((j) => <div key={j} className="skeleton h-9 w-20 rounded-full" />)}
            </div>
          ))}
          <div className="skeleton mt-8 h-14 w-full rounded-full" />
          <div className="skeleton mt-3 h-14 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}

function Detail({ product, related }: { product: Product; related: Product[] }) {
  const [variant, setVariant] = useState<Variant>(product.variants.find((v) => v.available) ?? product.variants[0])
  const [image, setImage] = useState(variant.images[0] ?? product.images[0])
  const stock = product.variants.filter((v) => v.available)
  const options = optionsText(variant.options)
  const ask = `Hola, ${STORE.name}. Quiero información sobre ${product.name}${options ? ` (${options})` : ''}.`

  // Cuántas de las otras opciones elegidas conserva cada variante.
  const matches = (v: Variant, attr: string) =>
    product.attributes.filter((a) => a.name !== attr && v.options[a.name] === variant.options[a.name]).length

  const choose = (attr: string, value: string) => {
    const next = stock
      .filter((v) => v.options[attr] === value)
      .sort((a, b) => matches(b, attr) - matches(a, attr))[0]
    if (!next) return
    setVariant(next)
    if (next.images[0]) setImage(next.images[0])
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <title>{`${product.name} | Apple Caracas`}</title>
      <Link to="/catalogo" className="text-sm font-semibold underline">← Catálogo</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div>
          <div className="animate-fade-up aspect-square overflow-hidden rounded-3xl bg-neutral-100 p-8"><div key={image} className="animate-fade-in h-full w-full"><ProductImage product={product} src={image} width={800} /></div></div>
          {product.images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.images.map((src) => (
                <button key={src} type="button" aria-label="Ver foto" onClick={() => setImage(src)} className={`h-16 w-16 rounded-xl bg-neutral-100 p-1 transition hover:scale-105 ${image === src ? 'ring-2 ring-black' : ''}`}><img src={imageUrl(src, 160)} alt="" loading="lazy" className="h-full w-full object-contain" /></button>
              ))}
            </div>
          )}
        </div>
        <div className="animate-fade-up [animation-delay:120ms]">
          <p className="text-sm text-neutral-500">{product.category}</p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{product.name}</h1>
          <p key={variant.price ?? ''} className="animate-fade-in mt-3 text-2xl font-bold">{variant.price === null ? displayPrice(product) : money(variant.price)}</p>
          {product.description && <p className="mt-5 text-neutral-600">{product.description}</p>}

          {product.attributes.map((attr) => (
            <fieldset key={attr.name} className="mt-6">
              <legend className="text-sm font-bold">{attr.name}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {attr.values.map((value) => {
                  const selected = variant.options[attr.name] === value
                  const candidates = stock.filter((v) => v.options[attr.name] === value)
                  const exact = candidates.some((v) => matches(v, attr.name) === product.attributes.length - 1)
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      disabled={!candidates.length}
                      onClick={() => choose(attr.name, value)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${selected ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'} ${exact || selected ? '' : 'text-neutral-400 line-through'}`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}

          <div className="mt-8 grid gap-3">
            <button type="button" disabled={!variant.available} onClick={() => addToCart({ code: product.code, options: variant.options })} className="rounded-full bg-black py-4 font-bold text-white transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-600">
              {variant.available ? 'Agregar al carrito' : 'Agotado'}
            </button>
            <a href={whatsappUrl(ask)} target="_blank" rel="noreferrer" className="rounded-full border border-black py-4 text-center font-bold hover:bg-neutral-100">Preguntar por WhatsApp</a>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-extrabold">También te puede interesar</h2>
          <div className="mt-6"><ProductGrid products={related} /></div>
        </section>
      )}
    </div>
  )
}

export function ProductPage() {
  const { code } = useParams()
  const { products, status } = useCatalog()
  if (status === 'loading') return <DetailSkeleton />
  const product = products.find((p) => p.code === code)
  if (!product) return <NotFoundPage />
  const related = products.filter((p) => p.code !== code && p.category === product.category && p.available).slice(0, 4)
  return <Detail key={product.code} product={product} related={related} />
}
