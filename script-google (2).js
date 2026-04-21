// ══════════════════════════════════════════════════════════════════════════════
//  TRANSPOAPP — Google Apps Script
//  Pegá este código en script.google.com y desplegalo como app web
// ══════════════════════════════════════════════════════════════════════════════

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
// Cambiá este valor por el ID de tu Google Sheet
// Lo encontrás en la URL: docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
const SHEET_ID = "https://script.google.com/macros/s/AKfycbyRbFclb7AT8xwqOR3KaNTGdjpLjGduLEsEVTKshih7f-jZvCs1Iixu1apDgtwrloNg/exec";

// ── HOJAS DE CÁLCULO ──────────────────────────────────────────────────────────
const HOJA_VIAJES   = "Viajes";        // estado actual de cada viaje
const HOJA_HISTORIAL = "Historial";    // cada cambio queda registrado

// ══════════════════════════════════════════════════════════════════════════════
//  FUNCIÓN PRINCIPAL — recibe los datos de la app
// ══════════════════════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.openById(SHEET_ID);

    inicializarHojas(ss);

    if (datos.accion === "NUEVO_VIAJE") {
      agregarViaje(ss, datos);
    } else if (datos.accion === "CAMBIO_ESTADO") {
      actualizarEstado(ss, datos);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Permitir llamadas desde el navegador (CORS) ───────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput("TranspoApp Scripts OK")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ══════════════════════════════════════════════════════════════════════════════
//  AGREGAR VIAJE NUEVO
// ══════════════════════════════════════════════════════════════════════════════
function agregarViaje(ss, datos) {
  const hoja = ss.getSheetByName(HOJA_VIAJES);

  // Buscar si el viaje ya existe (por si se envía doble)
  const ids = hoja.getRange(2, 1, Math.max(hoja.getLastRow() - 1, 1), 1).getValues().flat();
  if (ids.includes(datos.id)) return;

  hoja.appendRow([
    datos.id,
    datos.fecha,
    datos.hora,
    datos.chofer,
    datos.patente,
    datos.origen,
    "Pendiente",          // Estado actual
    datos.timestamp,      // Fecha/hora de creación
    ""                    // Última actualización
  ]);

  // También registrar en historial
  registrarHistorial(ss, datos.timestamp, datos.id, datos.chofer, datos.patente, datos.origen, datos.fecha, "-", "Pendiente");
}

// ══════════════════════════════════════════════════════════════════════════════
//  ACTUALIZAR ESTADO DE UN VIAJE
// ══════════════════════════════════════════════════════════════════════════════
function actualizarEstado(ss, datos) {
  const hoja      = ss.getSheetByName(HOJA_VIAJES);
  const ultimaFila = hoja.getLastRow();

  if (ultimaFila < 2) return;

  const ids = hoja.getRange(2, 1, ultimaFila - 1, 1).getValues().flat();
  const fila = ids.indexOf(datos.id);

  if (fila === -1) return; // no encontrado

  const filaReal = fila + 2; // +2 porque empieza en fila 2 y el índice es base 0

  // Actualizar columna Estado (columna 7) y Última actualización (columna 9)
  hoja.getRange(filaReal, 7).setValue(datos.estadoNuevo);
  hoja.getRange(filaReal, 9).setValue(datos.timestamp);

  // Colorear fila según estado
  colorearFila(hoja, filaReal, datos.estadoNuevo);

  // Registrar en historial
  registrarHistorial(ss, datos.timestamp, datos.id, datos.chofer, datos.patente, datos.origen, datos.fecha, datos.estadoAnterior, datos.estadoNuevo);
}

// ══════════════════════════════════════════════════════════════════════════════
//  REGISTRAR EN HISTORIAL
// ══════════════════════════════════════════════════════════════════════════════
function registrarHistorial(ss, timestamp, id, chofer, patente, origen, fecha, estadoAnterior, estadoNuevo) {
  const hoja = ss.getSheetByName(HOJA_HISTORIAL);
  hoja.appendRow([timestamp, id, chofer, patente, origen, fecha, estadoAnterior, estadoNuevo]);
}

// ══════════════════════════════════════════════════════════════════════════════
//  COLORES POR ESTADO
// ══════════════════════════════════════════════════════════════════════════════
function colorearFila(hoja, fila, estado) {
  const colores = {
    "Pendiente":  "#FEF3C7",
    "Llegué":     "#DBEAFE",
    "En Viaje":   "#EDE9FE",
    "Finalizado": "#D1FAE5",
  };
  const color = colores[estado] || "#FFFFFF";
  hoja.getRange(fila, 1, 1, 9).setBackground(color);
}

// ══════════════════════════════════════════════════════════════════════════════
//  INICIALIZAR HOJAS (crea encabezados si no existen)
// ══════════════════════════════════════════════════════════════════════════════
function inicializarHojas(ss) {

  // ── Hoja Viajes ──────────────────────────────────────────────────────────
  let hojaViajes = ss.getSheetByName(HOJA_VIAJES);
  if (!hojaViajes) {
    hojaViajes = ss.insertSheet(HOJA_VIAJES);
  }
  if (hojaViajes.getLastRow() === 0) {
    const headers = ["ID Viaje", "Fecha", "Hora Carga", "Chofer", "Patente", "Planta Origen", "Estado Actual", "Creado", "Última actualización"];
    hojaViajes.appendRow(headers);

    // Formato del encabezado
    const rango = hojaViajes.getRange(1, 1, 1, headers.length);
    rango.setBackground("#1E40AF");
    rango.setFontColor("#FFFFFF");
    rango.setFontWeight("bold");
    rango.setFontSize(11);

    // Ancho de columnas
    hojaViajes.setColumnWidth(1, 90);
    hojaViajes.setColumnWidth(2, 100);
    hojaViajes.setColumnWidth(3, 100);
    hojaViajes.setColumnWidth(4, 160);
    hojaViajes.setColumnWidth(5, 100);
    hojaViajes.setColumnWidth(6, 160);
    hojaViajes.setColumnWidth(7, 120);
    hojaViajes.setColumnWidth(8, 150);
    hojaViajes.setColumnWidth(9, 150);

    hojaViajes.setFrozenRows(1);
  }

  // ── Hoja Historial ───────────────────────────────────────────────────────
  let hojaHist = ss.getSheetByName(HOJA_HISTORIAL);
  if (!hojaHist) {
    hojaHist = ss.insertSheet(HOJA_HISTORIAL);
  }
  if (hojaHist.getLastRow() === 0) {
    const headers = ["Fecha y Hora", "ID Viaje", "Chofer", "Patente", "Planta Origen", "Fecha Viaje", "Estado Anterior", "Estado Nuevo"];
    hojaHist.appendRow(headers);

    const rango = hojaHist.getRange(1, 1, 1, headers.length);
    rango.setBackground("#059669");
    rango.setFontColor("#FFFFFF");
    rango.setFontWeight("bold");
    rango.setFontSize(11);

    hojaHist.setColumnWidth(1, 160);
    hojaHist.setColumnWidth(2, 90);
    hojaHist.setColumnWidth(3, 160);
    hojaHist.setColumnWidth(4, 100);
    hojaHist.setColumnWidth(5, 160);
    hojaHist.setColumnWidth(6, 100);
    hojaHist.setColumnWidth(7, 130);
    hojaHist.setColumnWidth(8, 130);

    hojaHist.setFrozenRows(1);
  }
}
