# Fotos del catálogo: configuración paso a paso

El cliente sube las fotos a una carpeta de Google Drive. Un script del Sheet las pasa a Cloudinary y escribe el enlace en la columna `foto`. El cliente nunca entra a Cloudinary, así que no necesita VPN.

Usa la **misma cuenta de Google** dueña del Sheet del catálogo para todo.

---

## 1. Cloudinary (con VPN, una sola vez)

1. Entra a cloudinary.com y crea una cuenta gratis. Usa el correo de Google del cliente.
2. Si al registrarte pregunta para qué la usarás, elige cualquier opción. No cambia nada.
3. En el menú de la izquierda ve a **Settings** (engranaje) > **API Keys**.
4. Copia y guarda estos tres datos:
   - **Cloud name**: aparece arriba, junto al nombre de la cuenta.
   - **API Key**: un número largo.
   - **API Secret**: toca el ojo para verlo. No lo compartas con nadie.

No hay que configurar nada más en Cloudinary.

---

## 2. Revisar el Sheet

1. La hoja del catálogo debe tener en la fila 1 las columnas `codigo` y `foto`, como la plantilla.
2. Cada producto debe tener su `codigo` escrito antes de subir sus fotos.

---

## 3. Instalar el script

1. Abre el Sheet del catálogo.
2. Menú **Extensiones** > **Apps Script**. Se abre una pestaña nueva.
3. Arriba a la izquierda, donde dice "Proyecto sin título", ponle **Fotos Apple Caracas**.
4. En el archivo `Código.gs`, borra todo lo que haya.
5. Abre el archivo `subir-fotos.gs` (está en la carpeta `apps-script` del proyecto), copia todo su contenido y pégalo ahí.
6. Toca el ícono de guardar (disquete) o presiona Ctrl + S.
7. Cierra esa pestaña y **recarga el Sheet** (F5).
8. Después de unos segundos aparece un menú nuevo arriba: **Fotos**.

---

## 4. Configurar (una sola vez)

1. Menú **Fotos** > **Configurar (primera vez)**.
2. Google pide permisos:
   - Toca **Continuar** y elige la cuenta.
   - Si sale "Google no verificó esta app", toca **Configuración avanzada** > **Ir a Fotos Apple Caracas (no seguro)**. Es normal: el script es tuyo y no está publicado.
   - Toca **Permitir**.
3. Vuelve a abrir **Fotos** > **Configurar (primera vez)**. La primera vez solo pide los permisos.
4. Pega en cada ventana el **Cloud name**, la **API Key** y el **API Secret**.
5. Al final aparece el enlace de la carpeta **Fotos nuevas - Apple Caracas**, creada en tu Drive. También se crea **Fotos subidas - Apple Caracas**.

Las claves quedan guardadas dentro del script. No aparecen en el Sheet ni en la web.

---

## 5. Probar

1. Renombra una foto con el código de un producto que ya esté en el Sheet, por ejemplo `ipad-pro-m5.jpg`.
2. Súbela a la carpeta **Fotos nuevas - Apple Caracas**.
3. Menú **Fotos** > **Subir fotos nuevas**.
4. Revisa:
   - La columna `foto` de ese producto ya tiene un enlace de Cloudinary.
   - La foto pasó a la carpeta **Fotos subidas**.
   - Hay una hoja nueva, **Registro de fotos**, con el resultado.
5. Recarga la web: el producto ya muestra la foto.

---

## 6. Opcional: subida automática

Menú **Fotos** > **Activar subida automática (cada 15 min)**.

Así el cliente solo sube las fotos a la carpeta y no tiene que tocar el botón. Se apaga con **Desactivar subida automática**.

---

## Instrucciones para el cliente

1. **Nombre de la foto = código del producto** en el Sheet. Ejemplo: `ipad-pro-m5.jpg`.
2. **Más fotos del mismo producto**: agrega un número. Ejemplo: `ipad-pro-m5-2.jpg`, `ipad-pro-m5-3.jpg`.
3. Sube las fotos a la carpeta **Fotos nuevas - Apple Caracas**. Desde el teléfono se puede con la app de Google Drive.
4. En el Sheet toca **Fotos** > **Subir fotos nuevas**, o espera 15 minutos si está activada la subida automática.
5. Si una foto no se sube, la razón aparece en la hoja **Registro de fotos**. Corrige el nombre y vuelve a intentar.

**Para cambiar una foto**: sube otra con el mismo nombre. Reemplaza a la anterior.

**Formatos**: JPG, PNG o HEIC (las del iPhone sirven tal cual). Máximo 10 MB por foto.

---

## Si el cliente usa otro correo de Google

Comparte con él la carpeta **Fotos nuevas - Apple Caracas** como **Editor**. Así puede subir fotos desde su cuenta, y el script las procesa igual.

Ten en cuenta que cualquier editor del Sheet puede abrir el script y ver las claves de Cloudinary. Da acceso de editor solo a personas de confianza.
