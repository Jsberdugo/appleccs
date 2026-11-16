// PROVISIONAL: reemplazar con los datos reales del cliente.
export const STORE = {
  name: "Apple Caracas",
  whatsapp: "584120000000", // Con código de país, sin + ni espacios.
  whatsappLabel: "+58 412 000 0000",
  instagram: "", // URL completa. Vacío oculta el enlace.
  address: "Dirección por confirmar, Caracas, Venezuela",
  hours: "Horario por confirmar",
  mapQuery: "Caracas, Venezuela",
  paymentNote: "Precios en divisas: efectivo o USDT (Binance).",
};

// Orden preferido. Solo se muestran las categorías que tienen productos en el Sheet;
// las que no estén en esta lista aparecen al final.
export const CATEGORY_ORDER = [
  "iPhone",
  "iPad",
  "Apple Watch",
  "AirPods",
  "Accesorios",
];

// Se muestran solo si hay testimonios reales del cliente.
export const TESTIMONIALS: { name: string; text: string }[] = [];

export const SHEET_CSV_URL = (import.meta.env.VITE_SHEET_CSV_URL ?? "").trim();
export const CLOUDINARY_CLOUD = (
  import.meta.env.VITE_CLOUDINARY_CLOUD ?? ""
).trim();
// Worker de Cloudflare que cachea las fotos (ej. https://fotos.dominio.com). Vacío = directo a Cloudinary.
export const IMAGE_PROXY = (import.meta.env.VITE_IMAGE_PROXY ?? "")
  .trim()
  .replace(new RegExp("/+$"), "");
