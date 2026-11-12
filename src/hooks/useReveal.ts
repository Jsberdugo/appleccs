import { useEffect } from 'react'

// Anima los elementos .reveal al entrar en pantalla. Se vuelve a ejecutar cuando cambia `dep`.
export function useReveal(dep?: unknown) {
  useEffect(() => {
    const items = document.querySelectorAll('.reveal:not(.is-visible)')
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.classList.add('is-visible')
          // Sin retraso para el hover una vez que ya apareció.
          setTimeout(() => el.style.setProperty('--delay', '0ms'), 1500)
          io.unobserve(e.target)
        }
      }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [dep])
}
