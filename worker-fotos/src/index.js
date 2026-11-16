// Worker de fotos de Apple Caracas.
// Pide cada foto a Cloudinary una sola vez y la sirve desde el caché de Cloudflare.
//
// Solo acepta los tamaños que usa la web, para que nadie pueda generar
// transformaciones nuevas y gastar los créditos de Cloudinary.
const ALLOWED = /^\/image\/upload\/(f_webp,q_auto,w_(?:160|400|800))\/((?:v\d+\/)?[A-Za-z0-9][A-Za-z0-9\-/.]*)$/

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Método no permitido', { status: 405 })
    }

    const url = new URL(request.url)
    const match = url.pathname.match(ALLOWED)
    if (!match || match[2].includes('..') || !env.CLOUD_NAME) {
      return new Response('No encontrado', { status: 404 })
    }

    const cache = caches.default
    const key = new Request(url.origin + url.pathname)
    const cached = await cache.match(key)
    if (cached) return cached

    const upstream = await fetch(`https://res.cloudinary.com/${env.CLOUD_NAME}/image/upload/${match[1]}/${match[2]}`)
    if (!upstream.ok) {
      return new Response('No encontrado', {
        status: upstream.status === 404 ? 404 : 502,
        headers: { 'Cache-Control': 'public, max-age=60' },
      })
    }

    const response = new Response(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'image/webp',
        // Navegador: 1 día. Caché de Cloudflare: 30 días.
        // Al reemplazar una foto cambia su URL (versión), así que nunca se ve la vieja.
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    })
    ctx.waitUntil(cache.put(key, response.clone()))
    return response
  },
}
