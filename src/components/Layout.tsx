import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { CATEGORIES, STORE } from '../config'
import { setCartOpen, useCartItems, whatsappUrl } from '../lib/cart'
import { CartDrawer } from './CartDrawer'

function Logo() {
  return (
    <Link to="/" className="text-lg font-extrabold tracking-tight">
      Apple<span className="font-light">Caracas</span>
    </Link>
  )
}

export function Layout() {
  const { pathname, hash } = useLocation()
  const count = useCartItems().reduce((n, x) => n + x.qty, 0)

  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-4 text-sm font-semibold sm:gap-7">
            <Link to="/catalogo" className="hover:underline">Catálogo</Link>
            <Link to="/#ubicacion" className="hover:underline">Ubicación</Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrito, ${count} productos`}
              className="flex h-10 items-center gap-2 rounded-full bg-black px-4 text-white hover:bg-neutral-800"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
              {count}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="bg-black text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3 sm:px-6">
          <div>
            <p className="text-lg font-extrabold">{STORE.name}</p>
            <p className="mt-2 text-sm text-neutral-400">{STORE.address}</p>
            <p className="text-sm text-neutral-400">{STORE.hours}</p>
          </div>
          <div>
            <p className="text-sm font-bold">Productos</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-400">
              {CATEGORIES.map((c) => (
                <li key={c}><Link className="hover:text-white" to={`/catalogo?categoria=${encodeURIComponent(c)}`}>{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold">Contacto</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-400">
              <li><a className="hover:text-white" target="_blank" rel="noreferrer" href={whatsappUrl(`Hola, ${STORE.name}.`)}>WhatsApp {STORE.whatsappLabel}</a></li>
              {STORE.instagram && <li><a className="hover:text-white" target="_blank" rel="noreferrer" href={STORE.instagram}>Instagram</a></li>}
            </ul>
          </div>
        </div>
        <p className="border-t border-white/15 px-4 py-5 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} {STORE.name}.        </p>
      </footer>
      <CartDrawer />
    </div>
  )
}
