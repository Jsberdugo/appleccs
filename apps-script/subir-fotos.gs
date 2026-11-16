/**
 * Apple Caracas: sube a Cloudinary las fotos de la carpeta "Fotos nuevas" de Drive
 * y escribe su enlace en la columna "foto" del catálogo.
 *
 * Nombre de la foto = código del producto (ipad-pro-m5.jpg).
 * Fotos adicionales: código + número (ipad-pro-m5-2.jpg, ipad-pro-m5-3.jpg).
 */

const CARPETA_NUEVAS = 'Fotos nuevas - Apple Caracas';
const CARPETA_SUBIDAS = 'Fotos subidas - Apple Caracas';
const HOJA_REGISTRO = 'Registro de fotos';
const MAX_BYTES = 10 * 1024 * 1024; // Límite del plan gratis de Cloudinary.
const TIEMPO_MAX_MS = 5 * 60 * 1000; // Google corta los scripts a los 6 minutos.
const EXTENSIONES = /\.(jpe?g|png|webp|heic|heif|gif|avif)$/i;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Fotos')
    .addItem('Subir fotos nuevas', 'subirFotos')
    .addSeparator()
    .addItem('Configurar (primera vez)', 'configurar')
    .addItem('Activar subida automática (cada 15 min)', 'activarAutomatico')
    .addItem('Desactivar subida automática', 'desactivarAutomatico')
    .addToUi();
}

function configurar() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();
  const campos = [
    ['CLOUD_NAME', 'Cloud name'],
    ['API_KEY', 'API Key'],
    ['API_SECRET', 'API Secret'],
  ];
  for (const [clave, etiqueta] of campos) {
    const actual = props.getProperty(clave) ? ' Déjalo vacío para conservar el actual.' : '';
    const r = ui.prompt('Cloudinary: ' + etiqueta, 'Pégalo aquí.' + actual, ui.ButtonSet.OK_CANCEL);
    if (r.getSelectedButton() !== ui.Button.OK) return;
    const valor = r.getResponseText().trim();
    if (valor) props.setProperty(clave, valor);
  }
  const nuevas = carpeta_(CARPETA_NUEVAS, 'NUEVAS_ID');
  carpeta_(CARPETA_SUBIDAS, 'SUBIDAS_ID');
  ui.alert(
    'Listo',
    'Sube las fotos a esta carpeta de Drive:\n\n' + CARPETA_NUEVAS + '\n' + nuevas.getUrl() +
      '\n\nLuego usa el menú Fotos > Subir fotos nuevas.',
    ui.ButtonSet.OK,
  );
}

function subirFotos() {
  const inicio = Date.now();
  const props = PropertiesService.getScriptProperties();
  const cloud = props.getProperty('CLOUD_NAME');
  const key = props.getProperty('API_KEY');
  const secret = props.getProperty('API_SECRET');
  if (!cloud || !key || !secret) return aviso_('Falta configurar Cloudinary: menú Fotos > Configurar.');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const nuevas = carpeta_(CARPETA_NUEVAS, 'NUEVAS_ID');
    const subidas = carpeta_(CARPETA_SUBIDAS, 'SUBIDAS_ID');
    const catalogo = leerCatalogo_();
    if (!catalogo) return aviso_('No encontré la hoja del catálogo con las columnas "codigo" y "foto".');

    const archivos = nuevas.getFiles();
    let subidasOk = 0;
    let problemas = 0;
    let faltanPorSubir = false;

    while (archivos.hasNext()) {
      if (Date.now() - inicio > TIEMPO_MAX_MS) {
        faltanPorSubir = true;
        break;
      }
      const archivo = archivos.next();
      const nombre = archivo.getName();
      const publicId = slug_(nombre.replace(/\.[^.]+$/, ''));
      const codigo = codigoDe_(publicId, catalogo);

      let error = '';
      if (!EXTENSIONES.test(nombre)) error = 'No es una imagen (usa JPG, PNG o HEIC).';
      else if (!codigo) error = 'El nombre no coincide con ningún código del catálogo.';
      else if (archivo.getSize() > MAX_BYTES) error = 'Pesa más de 10 MB.';

      if (!error) {
        const res = subir_(archivo.getBlob(), publicId, cloud, key, secret);
        if (res.error) error = 'Cloudinary: ' + res.error;
        else {
          agregarFoto_(catalogo, codigo, res.url, publicId === codigo, publicId);
          archivo.moveTo(subidas);
          registrar_(nombre, 'Subida para el producto ' + codigo);
          subidasOk++;
          continue;
        }
      }

      problemas++;
      // Avisa una sola vez por archivo para no llenar el registro.
      const marca = 'AVISO_' + archivo.getId();
      if (props.getProperty(marca) !== error) {
        registrar_(nombre, error);
        props.setProperty(marca, error);
      }
    }

    if (subidasOk || problemas) {
      let msg = subidasOk + ' foto(s) subida(s).';
      if (problemas) msg += ' ' + problemas + ' con problemas: revisa la hoja "' + HOJA_REGISTRO + '".';
      if (faltanPorSubir) msg += ' Quedan fotos: vuelve a tocar "Subir fotos nuevas".';
      aviso_(msg);
    } else {
      aviso_('No hay fotos nuevas en la carpeta.');
    }
  } finally {
    lock.releaseLock();
  }
}

function activarAutomatico() {
  desactivarAutomatico();
  ScriptApp.newTrigger('subirFotos').timeBased().everyMinutes(15).create();
  aviso_('Subida automática activada: cada 15 minutos.');
}

function desactivarAutomatico() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'subirFotos')
    .forEach((t) => ScriptApp.deleteTrigger(t));
}

// ---------- Funciones internas ----------

function slug_(s) {
  return String(s)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function carpeta_(nombre, clave) {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(clave);
  if (id) {
    try {
      const f = DriveApp.getFolderById(id);
      if (!f.isTrashed()) return f;
    } catch (e) {
      // La carpeta ya no existe: se busca o se crea de nuevo.
    }
  }
  const encontradas = DriveApp.getFoldersByName(nombre);
  const carpeta = encontradas.hasNext() ? encontradas.next() : DriveApp.createFolder(nombre);
  props.setProperty(clave, carpeta.getId());
  return carpeta;
}

function leerCatalogo_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const hoja of ss.getSheets()) {
    const valores = hoja.getDataRange().getDisplayValues();
    const titulos = (valores[0] || []).map(slug_);
    const iCodigo = titulos.indexOf('codigo');
    const iNombre = titulos.indexOf('nombre');
    const iFoto = titulos.indexOf('foto');
    if (iCodigo < 0 || iFoto < 0) continue;
    const filas = {};
    for (let r = 1; r < valores.length; r++) {
      const codigo = slug_(valores[r][iCodigo] || (iNombre >= 0 ? valores[r][iNombre] : ''));
      if (codigo && !(codigo in filas)) filas[codigo] = r + 1;
    }
    return { hoja, iFoto, filas };
  }
  return null;
}

// "ipad-pro-m5-2" pertenece al producto "ipad-pro-m5".
function codigoDe_(publicId, catalogo) {
  if (!catalogo || !publicId) return '';
  if (publicId in catalogo.filas) return publicId;
  return Object.keys(catalogo.filas)
    .filter((c) => publicId.indexOf(c + '-') === 0)
    .sort((a, b) => b.length - a.length)[0] || '';
}

function agregarFoto_(catalogo, codigo, url, principal, publicId) {
  const celda = catalogo.hoja.getRange(catalogo.filas[codigo], catalogo.iFoto + 1);
  const urls = String(celda.getDisplayValue())
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter((x) => x && x !== url && !x.endsWith('/' + publicId));
  if (principal) urls.unshift(url);
  else urls.push(url);
  celda.setValue(urls.join(', '));
}

function subir_(blob, publicId, cloud, key, secret) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const firma = 'invalidate=true&overwrite=true&public_id=' + publicId + '&timestamp=' + timestamp + secret;
  const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, firma, Utilities.Charset.UTF_8)
    .map((b) => ('0' + (b & 255).toString(16)).slice(-2))
    .join('');
  const res = UrlFetchApp.fetch('https://api.cloudinary.com/v1_1/' + cloud + '/image/upload', {
    method: 'post',
    muteHttpExceptions: true,
    payload: {
      file: blob,
      api_key: key,
      timestamp: timestamp,
      public_id: publicId,
      overwrite: 'true',
      invalidate: 'true',
      signature: signature,
    },
  });
  if (res.getResponseCode() === 200) {
    // La versión cambia al reemplazar la foto, así ningún caché muestra la vieja.
    const version = JSON.parse(res.getContentText()).version;
    return { url: 'https://res.cloudinary.com/' + cloud + '/image/upload/v' + version + '/' + publicId };
  }
  let detalle = 'HTTP ' + res.getResponseCode();
  try {
    detalle = JSON.parse(res.getContentText()).error.message || detalle;
  } catch (e) {
    // Respuesta sin JSON: se deja el código HTTP.
  }
  return { error: detalle };
}

function registrar_(archivo, mensaje) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(HOJA_REGISTRO);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_REGISTRO);
    hoja.appendRow(['Fecha', 'Archivo', 'Resultado']);
  }
  hoja.appendRow([new Date(), archivo, mensaje]);
}

function aviso_(mensaje) {
  SpreadsheetApp.getActiveSpreadsheet().toast(mensaje, 'Fotos', 10);
}
