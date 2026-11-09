import { useEffect } from 'react'
import { Link } from 'react-router'
import { money, useCatalog } from '../lib/catalog'
import { cartLines, cartTotal, clearCart, optionsText, orderMessage, setCartOpen, setQty, useCartItems, useCartOpen, whatsappUrl } from '../lib/cart'

export function CartDrawer() {
  const open = useCartOpen()
  const items = useCartItems()
  const { products, status } = useCatalog()
  const lines = cartLines(items, products)
  const pending = lines.some((l) => l.price === null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Cerrar carrito" className="absolute inset-0 h-full w-full bg-black/50" onClick={() => setCartOpen(false)} />
      <aside role="dialog" aria-modal="true" aria-label="Carrito" className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white">
        <div className="flex items-center justify-between border-b border-black/10 p-5">
          <h2 className="text-lg font-extrabold">Tu pedido</h2>
          <button type="button" autoFocus onClick={() => setCartOpen(false)} className="text-sm font-semibold underline">Cerrar</button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-neutral-500">{status === 'loading' ? 'Cargando...' : 'Tu carrito está vacío.'}</p>
            <Link to="/catalogo" onClick={() => setCartOpen(false)} className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Ver catálogo</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-black/10 overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.code + JSON.stringify(l.options)} className="py-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-bold">{l.product.name}</p>
                      <p className="text-sm text-neutral-500">{optionsText(l.options)}</p>
                    </div>
                    <p className="font-bold whitespace-nowrap">{l.price === null ? 'Consultar' : money(l.price * l.qty)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-black/20">
                      <button type="button" aria-label="Quitar uno" className="h-9 w-9" onClick={() => setQty(l, l.qty - 1)}>−</button>
                      <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                      <button type="button" aria-label="Agregar uno" className="h-9 w-9" onClick={() => setQty(l, l.qty + 1)}>+</button>
                    </div>
                    <button type="button" className="text-sm text-neutral-500 underline" onClick={() => setQty(l, 0)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-black/10 p-5">
              <div className="flex justify-between text-lg font-extrabold">
                <span>Total estimado</span>
                <span>{money(cartTotal(lines))}{pending ? ' +' : ''}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">Confirmamos disponibilidad, pago y entrega por WhatsApp.</p>
              <a
                href={whatsappUrl(orderMessage(lines))}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block rounded-full bg-black py-4 text-center font-bold text-white hover:bg-neutral-800"
              >
                Enviar pedido por WhatsApp
              </a>
              <button type="button" onClick={clearCart} className="mt-3 w-full text-sm text-neutral-500 underline">Vaciar carrito</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
