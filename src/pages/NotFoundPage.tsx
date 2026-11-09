import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-32 text-center">
      <title>Página no encontrada | Apple Caracas</title>
      <h1 className="text-3xl font-extrabold">No encontramos esta página</h1>
      <Link to="/catalogo" className="mt-6 inline-block rounded-full bg-black px-6 py-3 font-bold text-white">Ver catálogo</Link>
    </section>
  )
}
