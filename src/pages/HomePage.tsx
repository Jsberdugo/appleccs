import { useState } from 'react'
import type React from 'react'
import { Link } from 'react-router'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard'
import { useReveal } from '../hooks/useReveal'
import { CATEGORIES, STORE, TESTIMONIALS } from '../config'
import { whatsappUrl } from '../lib/cart'
import { useCatalog } from '../lib/catalog'

const STEPS = [
  ['Elige', 'Explora el catálogo y selecciona capacidad, color y condición.'],
  ['Agrega', 'Suma al carrito todo lo que quieras llevarte.'],
  ['Envía', 'Tu pedido llega escrito a nuestro WhatsApp en un toque.'],
  ['Coordina', 'Confirmamos disponibilidad, pago y entrega contigo.'],
]

const BENEFITS = [
  ['Catálogo al día', 'Modelos, opciones y precios en un solo lugar.'],
  ['Pedido en un toque', 'Sin formularios ni registros.'],
  ['Atención directa', 'Hablas con la tienda, no con un robot.'],
  ['En Caracas', 'Coordinamos contigo la entrega o tu visita.'],
]

const STORAGE_GUIDE = [
  ['128 GB', 'Uso diario', 'Redes, mensajes y fotos, guardando lo importante en la nube.'],
  ['256 GB', 'El equilibrio', 'Muchas fotos, videos y apps sin estar liberando espacio.'],
  ['512 GB', 'Creadores', 'Video frecuente y archivos pesados siempre contigo.'],
  ['1 TB', 'Sin límites', 'Para producir contenido y no borrar nada.'],
]

const FAQ = [
  ['¿Cómo hago un pedido?', 'Agrega los productos al carrito y toca "Enviar pedido por WhatsApp". El mensaje se escribe solo con lo que elegiste.'],
  ['¿Pago en la página?', 'No. La página no procesa pagos ni te pide datos bancarios. El pago se coordina directamente con la tienda por WhatsApp.'],
  ['¿El producto está disponible?', 'Al recibir tu pedido confirmamos la disponibilidad y el precio antes de cerrar la compra.'],
  ['¿Puedo pedir varios productos a la vez?', 'Sí. El carrito reúne todo y lo envía en un solo mensaje.'],
  ['¿No encuentras lo que buscas?', 'Escríbenos por WhatsApp y te decimos qué opciones hay.'],
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="py-5">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 text-left font-bold">
        {question}
        <span aria-hidden="true" className={`text-xl transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <p className="overflow-hidden text-neutral-600"><span className="block pt-3">{answer}</span></p>
      </div>
    </div>
  )
}

export function HomePage() {
  const { products, status } = useCatalog()
  const featured = products.filter((p) => p.featured && p.available)
  const highlights = (featured.length ? featured : products).slice(0, 4)
  useReveal(status)

  return (
    <>
      <section className="overflow-hidden bg-black text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-28">
          <div>
            <p className="animate-fade-up text-sm font-semibold text-neutral-400">Tienda Apple en Caracas</p>
            <h1 className="animate-fade-up mt-4 text-5xl [animation-delay:100ms] leading-[1.02] font-extrabold tracking-tight sm:text-7xl">
              Tu próximo Apple empieza aquí.
            </h1>
            <p className="animate-fade-up mt-6 max-w-md text-lg text-neutral-300 [animation-delay:200ms]">
              iPhone, iPad, Mac y accesorios. Arma tu pedido en minutos y te atendemos directo por WhatsApp.
            </p>
            <div className="animate-fade-up mt-9 flex flex-wrap gap-3 [animation-delay:300ms]">
              <Link to="/catalogo" className="rounded-full bg-white px-7 py-4 font-bold text-black transition hover:scale-105 hover:bg-neutral-200">Ver catálogo</Link>
              <a href={whatsappUrl(`Hola, ${STORE.name}. Quisiera información.`)} target="_blank" rel="noreferrer" className="rounded-full border border-white/40 px-7 py-4 font-bold transition hover:scale-105 hover:bg-white/10">Escríbenos</a>
            </div>
          </div>
          <div className="animate-fade-up mx-auto flex items-end gap-4 [animation-delay:250ms]" aria-hidden="true">
            <div className="animate-float h-64 w-32 rounded-[1.8rem] border-2 border-white/30 sm:h-96 sm:w-48 sm:rounded-[2.5rem]" />
            <div className="animate-float h-48 w-24 rounded-[1.4rem] bg-white [animation-delay:-3s] sm:h-72 sm:w-36 sm:rounded-[2rem]" />
          </div>
        </div>
      </section>

      <section className="border-b border-black/10">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {BENEFITS.map(([title, text], i) => (
            <div key={title} className="reveal" style={{ '--delay': `${i * 90}ms` } as React.CSSProperties}>
              <dt className="font-extrabold">{title}</dt>
              <dd className="mt-1 text-sm text-neutral-600">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="reveal text-3xl font-extrabold tracking-tight sm:text-4xl">Compra por categoría</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Link key={c} style={{ '--delay': `${i * 70}ms` } as React.CSSProperties} to={`/catalogo?categoria=${encodeURIComponent(c)}`} className="reveal group flex h-28 items-end justify-between rounded-2xl bg-neutral-100 p-5 font-bold hover:bg-black hover:text-white sm:h-40 sm:text-xl [transition-property:opacity,transform,background-color,color]">
              {c}<span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="reveal text-3xl font-extrabold tracking-tight sm:text-4xl">Destacados</h2>
          <Link to="/catalogo" className="text-sm font-bold underline">Ver todo</Link>
        </div>
        <div className="mt-8">
          {status === 'loading' && <ProductGridSkeleton count={4} />}
          {status === 'error' && <p className="text-neutral-500">No pudimos cargar los productos. Escríbenos por WhatsApp.</p>}
          {status === 'ready' && <ProductGrid products={highlights} />}
        </div>
      </section>

      <section className="bg-neutral-100">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="reveal text-3xl font-extrabold tracking-tight sm:text-4xl">Comprar es simple</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="reveal" style={{ '--delay': `${i * 110}ms` } as React.CSSProperties}>
                <span className="text-sm font-bold text-neutral-500">0{i + 1}</span>
                <h3 className="mt-2 text-xl font-extrabold">{title}</h3>
                <p className="mt-2 text-neutral-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="reveal max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">¿Cuánta capacidad necesitas?</h2>
          <p className="reveal mt-4 max-w-xl text-neutral-400">Una guía rápida para elegir sin pagar de más ni quedarte corto.</p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
            {STORAGE_GUIDE.map(([size, title, text], i) => (
              <div key={size} className="reveal bg-black p-6 hover:bg-neutral-900 [transition-property:opacity,transform,background-color]" style={{ '--delay': `${i * 100}ms` } as React.CSSProperties}>
                <p className="text-4xl font-extrabold tracking-tight">{size}</p>
                <h3 className="mt-6 font-bold">{title}</h3>
                <p className="mt-2 text-sm text-neutral-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {TESTIMONIALS.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="reveal text-3xl font-extrabold tracking-tight sm:text-4xl">Lo que dicen nuestros clientes</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="rounded-2xl border border-black/15 p-6">
                <p>{t.text}</p>
                <footer className="mt-4 text-sm font-bold">{t.name}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-20 sm:px-6 md:grid-cols-[1fr_2fr]">
        <h2 className="reveal text-3xl font-extrabold tracking-tight sm:text-4xl">Preguntas frecuentes</h2>
        <div className="divide-y divide-black/15 border-y border-black/15">
          {FAQ.map(([question, answer]) => <FaqItem key={question} question={question} answer={answer} />)}
        </div>
      </section>

      <section id="ubicacion" className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="reveal text-3xl font-extrabold tracking-tight sm:text-4xl">Visítanos</h2>
          <p className="mt-5 font-semibold">{STORE.address}</p>
          <p className="mt-1 text-neutral-600">{STORE.hours}</p>
          <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.mapQuery)}`} className="mt-6 inline-block rounded-full bg-black px-6 py-3 font-bold text-white hover:bg-neutral-800">Cómo llegar</a>
        </div>
        <iframe
          title={`Ubicación de ${STORE.name}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(STORE.mapQuery)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="reveal h-80 w-full rounded-2xl border-0 grayscale md:h-[26rem]"
        />
      </section>
    </>
  )
}
