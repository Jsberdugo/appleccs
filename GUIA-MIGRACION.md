# Migración a la cuenta del cliente + Worker de fotos

Orden recomendado. Haz cada parte completa antes de pasar a la siguiente.

- **Cuenta personal**: tu Google actual, donde está hoy el Sheet.
- **Cuenta del cliente**: el Gmail nuevo que creaste para la tienda.

Tip: abre la cuenta del cliente en una **ventana de incógnito** o en otro perfil de Chrome. Así no se mezcla con tu cuenta personal.

---

## Parte 1. Copiar el Sheet a la cuenta del cliente

1. En la **cuenta personal**, abre el Sheet del catálogo y copia su enlace (Compartir > Copiar enlace).
2. En la **cuenta del cliente**, pega ese enlace en el navegador.
3. Menú **Archivo** > **Hacer una copia**.
   - Nombre: `Catálogo Apple Caracas`.
   - Carpeta: Mi unidad.
   - Toca **Hacer una copia**. Se abre la copia, ya en la cuenta del cliente.
4. Revisa que la copia tenga sus pestañas:
   - **Hoja 1**: el catálogo.
   - **Hoja 2**: las instrucciones.
   - **Registro de fotos**: puedes borrarla, se crea sola otra vez.
5. **No cambies los títulos de la fila 1** del catálogo.

La copia trae el script, pero **no** trae las claves de Cloudinary, las carpetas ni la subida automática. Eso se configura en la Parte 2.

---

## Parte 2. Configurar el script en la cuenta del cliente

1. En la copia: **Extensiones** > **Apps Script**.
2. Verifica que el código sea la versión más nueva:
   - Busca la palabra `version` (Ctrl + F).
   - Si **no** aparece, borra todo, pega el contenido de `apps-script/subir-fotos.gs` y guarda (Ctrl + S).
3. Cierra la pestaña de Apps Script y **recarga el Sheet** (F5). Aparece el menú **Fotos**.
4. **Fotos** > **Configurar (primera vez)**.
   - Google pide permisos. Elige la **cuenta del cliente**.
   - "Google no verificó esta app": **Configuración avanzada** > **Ir a ... (no seguro)** > **Permitir**.
5. Vuelve a abrir **Fotos** > **Configurar (primera vez)** y pega los datos de Cloudinary del cliente:
   - **Cloud name**
   - **API Key**
   - **API Secret**

   Están en Cloudinary > **Settings** > **API Keys**. Esto ya no necesita VPN si los tienes guardados. Si no los tienes, entra a Cloudinary con VPN una vez para copiarlos.
6. Al final aparece el enlace de la carpeta **Fotos nuevas - Apple Caracas**. Ya está en el Drive del cliente, junto con **Fotos subidas - Apple Caracas**.
7. Opcional: **Fotos** > **Activar subida automática (cada 15 min)**.

---

## Parte 3. Compartir el Sheet

1. En la copia, toca **Compartir**.
2. **Acceso general**: "Cualquier persona con el enlace" > rol **Lector**.
3. Si el dueño de la tienda va a editar desde su correo personal, agrégalo en "Personas con acceso" como **Editor**.
   - Cualquier editor puede ver las claves de Cloudinary dentro del script. Solo personas de confianza.
4. Si el cliente subirá fotos desde su correo personal, comparte también con él la carpeta **Fotos nuevas - Apple Caracas** como **Editor**.

---

## Parte 4. Cargar los productos y las fotos

1. **Productos**: agrega al catálogo las filas de los productos nuevos, cada uno con su `codigo`.
2. **Fotos**: renombra cada foto con el código de su producto.
   - Foto principal: `ipad-pro-m5.jpg`
   - Más fotos del mismo producto: `ipad-pro-m5-2.jpg`, `ipad-pro-m5-3.jpg`
3. Entra a drive.google.com con la **cuenta del cliente**, abre **Fotos nuevas - Apple Caracas** y arrastra las fotos.
4. En el Sheet: **Fotos** > **Subir fotos nuevas**.
   - Si son muchas y aparece "Quedan fotos", tócalo otra vez.
5. Revisa la hoja **Registro de fotos**: si alguna no se subió, ahí dice por qué.

Las fotos que ya estaban subidas siguen funcionando: sus enlaces están en la columna `foto` y viven en Cloudinary, no en Drive.

---

## Parte 5. Conectar la web al Sheet nuevo

1. En la copia, copia la dirección del navegador estando **en la pestaña del catálogo**. Se ve así:
   `https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit#gid=ESTE_ES_EL_GID`
2. Pásame esa dirección y actualizo el `.env`. O hazlo tú: en `VITE_SHEET_CSV_URL` cambia el ID y el número después de `gid=`.
3. `npm run build`.
4. Sube la carpeta `dist` a Cloudflare Pages (proyecto de la tienda).
5. Abre la web y revisa que el catálogo cargue con las fotos.

---

## Parte 6. Limpiar tu cuenta personal

Solo cuando la web ya cargue desde el Sheet nuevo.

1. En el Sheet **viejo**: **Fotos** > **Desactivar subida automática**, si la activaste.
2. Borra el Sheet viejo de tu Drive.
3. Borra las carpetas **Fotos nuevas - Apple Caracas** y **Fotos subidas - Apple Caracas** de tu Drive personal.
4. Vacía la papelera de Drive.

---

## Parte 7. Worker de fotos (cuando el dominio esté activo)

Requisito: el dominio de la tienda ya está agregado y activo en la cuenta de Cloudflare del cliente.

1. Cloudflare > **Workers & Pages** > **Create** > **Create Worker**.
2. Nombre: `fotos-apple-caracas` > **Deploy**.
3. **Edit code**: borra todo, pega el contenido de `worker-fotos/src/index.js` > **Deploy**.
4. En el Worker: **Settings** > **Variables and Secrets** > **Add**:
   - Tipo: **Text**
   - Nombre: `CLOUD_NAME`
   - Valor: el Cloud name de Cloudinary
   - **Deploy**
5. **Settings** > **Domains & Routes** > **Add** > **Custom domain**: `fotos.DOMINIO.com`, con el dominio real.
6. Prueba en el navegador, con un código que tenga foto:
   `https://fotos.DOMINIO.com/image/upload/f_webp,q_auto,w_400/CODIGO`

   Debe verse la foto.
7. En el `.env` agrega:
   ```
   VITE_IMAGE_PROXY=https://fotos.DOMINIO.com
   ```
8. `npm run build` y sube `dist`.

Si algo falla, borra la línea `VITE_IMAGE_PROXY`, compila y sube de nuevo: las fotos vuelven a cargar directo de Cloudinary.

---

## Lista final

- [ ] Sheet copiado en la cuenta del cliente
- [ ] Script con la versión nueva y configurado con las claves de Cloudinary
- [ ] Carpetas de fotos en el Drive del cliente
- [ ] Sheet compartido como Lector
- [ ] Productos y fotos cargados
- [ ] Web apuntando al Sheet nuevo y publicada
- [ ] Sheet y carpetas borrados de la cuenta personal
- [ ] Worker instalado y `VITE_IMAGE_PROXY` en el `.env`

Pendiente del cliente: número de WhatsApp, dirección, horario, Instagram y logo.
