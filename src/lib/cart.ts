import { useSyncExternalStore } from 'react'
import { STORE } from '../config'
import { findVariant, money, sameOptions } from './catalog'
import type { Options, Product } from './catalog'

// El carrito guarda la selección, no el precio: siempre se calcula con el catálogo vigente.
export type CartItem = { code: string; options: Options; qty: number }
export type CartLine = CartItem & { product: Product; price: number | null }

const KEY = 'iphone-ccs:cart:v2'
const listeners = new Set<() => void>()
const EMPTY: CartItem[] = []

function read(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((x) => x?.code && x.options && x.qty > 0) : EMPTY
  } catch {
    return EMPTY
  }
}

let items = read()
let open = false
const emit = () => listeners.forEach((fn) => fn())

function save(next: CartItem[]) {
  items = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // El carrito sigue funcionando durante esta visita.
  }
  emit()
}

const same = (a: Omit<CartItem, 'qty'>, b: Omit<CartItem, 'qty'>) =>
  a.code === b.code && sameOptions(a.options, b.options)

function subscribe(fn: () => void) {
  listeners.add(fn)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      items = read()
      fn()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('storage', onStorage)
  }
}

export const useCartItems = () => useSyncExternalStore(subscribe, () => items)
export const useCartOpen = () => useSyncExternalStore(subscribe, () => open)

export function setCartOpen(value: boolean) {
  open = value
  emit()
}

export function addToCart(item: Omit<CartItem, 'qty'>, qty = 1) {
  const found = items.some((x) => same(x, item))
  save(found ? items.map((x) => (same(x, item) ? { ...x, qty: x.qty + qty } : x)) : [...items, { ...item, qty }])
  setCartOpen(true)
}

export function setQty(item: CartItem, qty: number) {
  save(qty > 0 ? items.map((x) => (same(x, item) ? { ...x, qty } : x)) : items.filter((x) => !same(x, item)))
}

export const clearCart = () => save([])

export function cartLines(cart: CartItem[], products: Product[]): CartLine[] {
  return cart.flatMap((item) => {
    const product = products.find((p) => p.code === item.code)
    const variant = product && findVariant(product, item.options)
    return product && variant?.available ? [{ ...item, product, price: variant.price }] : []
  })
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + (l.price ?? 0) * l.qty, 0)
}

export const optionsText = (options: Options) => Object.values(options).join(' · ')

export function whatsappUrl(text: string) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`
}

export function orderMessage(lines: CartLine[]) {
  const body = lines.map((l, i) => {
    const options = optionsText(l.options)
    const price = l.price === null ? 'precio por confirmar' : money(l.price * l.qty)
    return `${i + 1}. ${l.product.name}${options ? ` (${options})` : ''} x${l.qty}: ${price}`
  })
  const pending = lines.some((l) => l.price === null)
  return [
    `Hola, ${STORE.name}. Quiero hacer este pedido:`,
    '',
    ...body,
    '',
    `Total estimado: ${money(cartTotal(lines))}${pending ? ' + productos por confirmar' : ''}`,
    '',
    '¿Me confirman la disponibilidad?',
  ].join('\n')
}
