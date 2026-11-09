# Apple Caracas

Tienda con catálogo y pedidos por WhatsApp. React, Vite y Tailwind CSS v4.

```bash
npm install
npm run dev
```

- Datos del negocio (WhatsApp, dirección, horario, redes): `src/config.ts`.
- Catálogo: ver `.env.example`. Sin URL configurada se usan los productos de `src/data/demo.ts`.
- Publicar: `npm run build` y subir `dist` a Cloudflare Pages.

## Google Sheet

Importa `plantilla-catalogo.csv`. Comparte la hoja como "cualquiera con el enlace puede ver".

Una fila por variante. Las filas con el mismo `codigo` forman un solo producto, y nombre, categoría y descripción solo van en la primera.

- Columnas fijas: codigo, nombre, categoria, precio, disponible, foto, descripcion, destacado.
- Cualquier otra columna es un atributo y crea su selector en la web (Capacidad, Color, RAM, Correa...).
- Celda de atributo vacía: ese atributo no aplica a esa fila.
- "Negro, Blanco" en una celda crea una variante por valor.
- disponible vacío cuenta como sí. Precio vacío usa el de la primera fila o muestra Consultar.
- Si la columna mezcla números y texto, dale formato de texto plano para que Google no descarte valores.
