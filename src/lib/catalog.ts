import { useEffect, useState } from 'react'
import { CLOUDINARY_CLOUD, SHEET_CSV_URL } from '../config'
import { DEMO_ROWS } from '../data/demo'

export type Options = Record<string, string>

export type Variant = {
  options: Options
  price: number | null
  images: string[]
  available: boolean
}

export type Product = {
  code: string
  name: string
  category: string
  description: string
  images: string[]
  featured: boolean
  available: boolean
  attributes: { name: string; values: string[] }[]
  variants: Variant[]
}

export type CatalogState = {
  products: Product[]
  status: 'loading' | 'ready' | 'error'
  isDemo: boolean
}

const CACHE_KEY = 'iphone-ccs:catalog'
const FIXED = new Set(['codigo', 'nombre', 'categoria', 'precio', 'disponible', 'foto', 'descripcion', 'destacado'])

const normalize = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase()

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') field += c
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

export function parsePrice(raw: string): number | null {
  let s = raw.replace(/[^\d.,]/g, '')
  if (!s) return null
  const comma = s.lastIndexOf(',')
  const dot = s.lastIndexOf('.')
  if (comma >= 0 && dot >= 0) {
    s = comma > dot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (comma >= 0) {
    s = /,\d{1,2}$/.test(s) ? s.replace(',', '.') : s.replace(/,/g, '')
  } else if (/\.\d{3}$/.test(s)) {
    s = s.replace(/\./g, '')
  }
  const n = Number(s)
  return Number.isFinite(n) && n > 0 ? n : null
}

const list = (s = '') => s.split(',').map((x) => x.trim()).filter(Boolean)
const slug = (s: string) => normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const yes = (s = '') => ['si', 'x', 'true', '1'].includes(normalize(s))
const no = (s = '') => ['no', 'false', '0', 'agotado'].includes(normalize(s))
const unique = <T,>(xs: T[]) => [...new Set(xs)]

function optimize(url: string) {
  return url.includes('res.cloudinary.com') && url.includes('/image/upload/')
    ? url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_800/')
    : url
}

// Una celda con "Negro, Blanco" genera una variante por cada valor.
function expand(attrs: [string, string][]): Options[] {
  return attrs.reduce<Options[]>(
    (acc, [name, cell]) => {
      const values = list(cell)
      return values.length ? acc.flatMap((o) => values.map((v) => ({ ...o, [name]: v }))) : acc
    },
    [{}],
  )
}

function toProducts(rows: Record<string, string>[]): Product[] {
  const products = new Map<string, Product>()
  const basePrices = new Map<string, number | null>()

  for (const row of rows) {
    const fixed: Record<string, string> = {}
    const attrs: [string, string][] = []
    for (const [header, value] of Object.entries(row)) {
      const key = normalize(header)
      if (FIXED.has(key)) fixed[key] = value.trim()
      else if (key) attrs.push([header.trim(), value])
    }

    const code = slug(fixed.codigo || fixed.nombre || '')
    if (!code) continue
    let product = products.get(code)
    if (!product) {
      if (!fixed.nombre) continue
      product = {
        code,
        name: fixed.nombre,
        category: fixed.categoria || 'Otros',
        description: fixed.descripcion ?? '',
        images: [],
        featured: false,
        available: false,
        attributes: [],
        variants: [],
      }
      products.set(code, product)
      basePrices.set(code, parsePrice(fixed.precio ?? ''))
    }

    product.featured ||= yes(fixed.destacado)
    const images = (fixed.foto ?? '').split(/[,\n]/).map((x) => x.trim()).filter((x) => x.startsWith('https://')).map(optimize)
    const price = parsePrice(fixed.precio ?? '') ?? basePrices.get(code) ?? null
    for (const options of expand(attrs)) {
      product.variants.push({ options, price, images, available: !no(fixed.disponible) })
    }
  }

  return [...products.values()].map((p) => {
    const names = unique(p.variants.flatMap((v) => Object.keys(v.options)))
    let images = unique(p.variants.flatMap((v) => v.images))
    if (!images.length && CLOUDINARY_CLOUD) {
      images = [`https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto,w_800/${p.code}`]
    }
    return {
      ...p,
      images,
      available: p.variants.some((v) => v.available),
      attributes: names.map((name) => ({
        name,
        values: unique(p.variants.map((v) => v.options[name]).filter(Boolean)),
      })),
    }
  })
}

export function csvToProducts(text: string): Product[] {
  const [head, ...body] = parseCsv(text)
  if (!head) return []
  return toProducts(body.map((cells) => Object.fromEntries(head.map((h, i) => [h, cells[i] ?? '']))))
}

let request: Promise<CatalogState> | null = null

const demoState = (): CatalogState => ({ products: toProducts(DEMO_ROWS), status: 'ready', isDemo: true })

function loadCatalog(): Promise<CatalogState> {
  if (!SHEET_CSV_URL) return Promise.resolve(demoState())
  request ??= fetch(SHEET_CSV_URL, { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.text()
    })
    .then((text) => {
      const products = csvToProducts(text)
      if (!products.length) throw new Error('Catálogo vacío')
      try {
        localStorage.setItem(CACHE_KEY, text)
      } catch {
        // Sin almacenamiento solo se pierde la copia de respaldo.
      }
      return { products, status: 'ready', isDemo: false } as CatalogState
    })
    .catch(() => {
      let cached: string | null = null
      try {
        cached = localStorage.getItem(CACHE_KEY)
      } catch {
        // Se informa el error abajo.
      }
      const products = cached ? csvToProducts(cached) : []
      if (!products.length && import.meta.env.DEV) return demoState()
      return { products, status: products.length ? 'ready' : 'error', isDemo: false } as CatalogState
    })
  return request
}

export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({ products: [], status: 'loading', isDemo: false })
  useEffect(() => {
    let active = true
    loadCatalog().then((next) => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [])
  return state
}

export const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

export const sameOptions = (a: Options, b: Options) => {
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k])
}

export const findVariant = (p: Product, options: Options) => p.variants.find((v) => sameOptions(v.options, options))

export function displayPrice(p: Product): string {
  const pool = p.variants.some((v) => v.available) ? p.variants.filter((v) => v.available) : p.variants
  const prices = pool.map((v) => v.price).filter((x): x is number => x !== null)
  if (!prices.length) return 'Consultar'
  const low = Math.min(...prices)
  return new Set(prices).size > 1 || prices.length < pool.length ? `Desde ${money(low)}` : money(low)
}
