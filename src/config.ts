// PROVISIONAL: reemplazar con los datos reales del cliente.
export const STORE = {
  name: 'Apple Caracas',
  whatsapp: '584120000000', // Con código de país, sin + ni espacios.
  whatsappLabel: '+58 412 000 0000',
  instagram: '', // URL completa. Vacío oculta el enlace.
  address: 'Dirección por confirmar, Caracas, Venezuela',
  hours: 'Horario por confirmar',
  mapQuery: 'Caracas, Venezuela',
}

export const CATEGORIES = ['iPhone', 'iPad', 'Mac', 'Apple Watch', 'AirPods', 'Accesorios']

// Se muestran solo si hay testimonios reales del cliente.
export const TESTIMONIALS: { name: string; text: string }[] = []

export const SHEET_CSV_URL = (import.meta.env.VITE_SHEET_CSV_URL ?? '').trim()
export const CLOUDINARY_CLOUD = (import.meta.env.VITE_CLOUDINARY_CLOUD ?? '').trim()
