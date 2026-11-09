import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ProductGrid, ProductImage } from '../components/ProductCard'
import { STORE } from '../config'
import { addToCart, optionsText, whatsappUrl } from '../lib/cart'
import { displayPrice, money, useCatalog } from '../lib/catalog'
import type { Product, Variant } from '../lib/catalog'
import { NotFoundPage } from './NotFoundPage'

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
          <div className="aspect-square rounded-3xl bg-neutral-100 p-8"><ProductImage product={product} src={image} /></div>
          {product.images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.images.map((src) => (
                <button key={src} type="button" aria-label="Ver foto" onClick={() => setImage(src)} className={`h-16 w-16 rounded-xl bg-neutral-100 p-1 ${image === src ? 'ring-2 ring-black' : ''}`}><img src={src} alt="" className="h-full w-full object-contain" /></button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-neutral-500">{product.category}</p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold">{variant.price === null ? displayPrice(product) : money(variant.price)}</p>
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
                      className={`rounded-full border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${selected ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'} ${exact || selected ? '' : 'text-neutral-400 line-through'}`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}

          <div className="mt-8 grid gap-3">
            <button type="button" disabled={!variant.available} onClick={() => addToCart({ code: product.code, options: variant.options })} className="rounded-full bg-black py-4 font-bold text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-600">
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
  if (status === 'loading') return <p className="px-4 py-32 text-center text-neutral-500">Cargando...</p>
  const product = products.find((p) => p.code === code)
  if (!product) return <NotFoundPage />
  const related = products.filter((p) => p.code !== code && p.category === product.category && p.available).slice(0, 4)
  return <Detail key={product.code} product={product} related={related} />
}
