# Worker de fotos

Sirve las fotos de Cloudinary desde el caché de Cloudflare. Cloudinary entrega cada foto una sola vez y Cloudflare la repite sin costo. Así el plan gratis de Cloudinary no se agota aunque la página tenga muchas visitas.

Requisito: el dominio de la tienda ya activo en la cuenta de Cloudflare del cliente.

## Instalar desde el panel de Cloudflare (sin comandos)

1. Cloudflare > **Workers & Pages** > **Create** > **Create Worker**.
2. Nombre: `fotos-apple-caracas`. Toca **Deploy**.
3. Toca **Edit code**, borra todo, pega el contenido de `src/index.js` y toca **Deploy**.
4. Vuelve al Worker > **Settings** > **Variables and Secrets** > **Add**:
   - Tipo: Text
   - Nombre: `CLOUD_NAME`
   - Valor: el Cloud name de Cloudinary
   - Toca **Deploy**.
5. **Settings** > **Domains & Routes** > **Add** > **Custom domain**: `fotos.DOMINIO.com` (con el dominio real).
6. Prueba en el navegador, cambiando el código por uno que tenga foto:
   `https://fotos.DOMINIO.com/image/upload/f_webp,q_auto,w_400/CODIGO`

## Conectar la web

1. En el `.env` del proyecto agrega:
   ```
   VITE_IMAGE_PROXY=https://fotos.DOMINIO.com
   ```
2. `npm run build` y sube `dist`.

Si el Worker falla, borra esa línea, compila de nuevo y las fotos vuelven a cargar directo de Cloudinary.

## Notas

- El caché de Cloudflare solo funciona en el dominio propio (`fotos.DOMINIO.com`), no en la dirección `workers.dev`.
- Plan gratis de Workers: 100.000 peticiones al día. Las fotos en caché también cuentan, así que si algún día se acerca al límite, se puede pasar a una regla de caché sin Worker.
