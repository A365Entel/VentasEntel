/**
 * Apps Script para conectar formulario web con Google Sheets
 * 
 * Instrucciones de instalación:
 * 1. Ir a https://script.google.com/
 * 2. Crear nuevo proyecto
 * 3. Copiar este código
 * 4. Publicar como Web App
 * 5. Copiar la URL del Web App y pegarla en el formulario (variable SCRIPT_URL)
 */

// ID de la hoja de cálculo
const SPREADSHEET_ID = '18B7qerhBBDhzMsXROMPCSjNsXh9xewelt5U3AjME7GY';
const SHEET_NAME = 'Ventas';

/**
 * Función que se ejecuta cuando se recibe una petición POST
 */
function doPost(e) {
  try {
    // Obtener los datos del formulario
    const data = JSON.parse(e.postData.contents);
    
    // Validar que los datos requeridos existan
    if (!data.fecha || !data.campana || !data.dni || !data.agente) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Faltan datos requeridos' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Calcular efectividad (ventas / llamadas)
    let efectividad = 0;
    if (data.llamadas && data.llamadas > 0) {
      efectividad = (data.ventas / data.llamadas).toFixed(2);
    }
    
    // Conectar con la hoja de cálculo
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    
    // Obtener la siguiente fila vacía
    const lastRow = sheet.getLastRow() + 1;
    
    // Si es la primera fila, agregar encabezados
    if (lastRow === 1) {
      sheet.getRange('A1:K1').setValues([[
        'Fecha', 
        'Supervisor',
        'Campaña', 
        'DNI', 
        'Agente',
        'User ID',
        'Objetivo Diario', 
        'Ventas', 
        'Llamadas', 
        'Efectividad (%)',
        'Fecha Registro'
      ]]);
    }
    
    // Agregar los datos a la fila correspondiente
    const rowData = [
      data.fecha,                    // Columna A: Fecha
      data.supervisor || '',        // Columna B: Supervisor
      data.campana,                  // Columna C: Campaña
      data.dni,                      // Columna D: DNI
      data.agente,                   // Columna E: Agente
      data.userId || '',            // Columna F: User ID
      data.objetivo || 0,           // Columna G: Objetivo Diario
      data.ventas || 0,              // Columna H: Ventas
      data.llamadas || 0,           // Columna I: Llamadas
      efectividad,                  // Columna J: Efectividad (calculado)
      new Date()                    // Columna K: Fecha de registro
    ];
    
    sheet.getRange(lastRow, 1, 1, 11).setValues([rowData]);
    
    // Responder con éxito
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'success', 
        message: 'Datos guardados correctamente',
        row: lastRow
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Manejar errores
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función para manejar peticiones GET (prueba de conexión)
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'success', 
      message: 'API de VentaEntel funcionando correctamente',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función para obtener todos los registros
 */
function getRecords() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return [];
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  return data;
}

/**
 * Función para obtener estadísticas de un agente
 */
function getAgentStats(dni) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return { totalVentas: 0, totalLlamadas: 0, efectividad: 0 };
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  
  let totalVentas = 0;
  let totalLlamadas = 0;
  
  // Filtrar por DNI del agente
  for (let i = 0; i < data.length; i++) {
    if (data[i][2] === dni) { // Columna C es el DNI
      totalVentas += data[i][5]; // Columna F son las ventas
      totalLlamadas += data[i][6]; // Columna G son las llamadas
    }
  }
  
  const efectividad = totalLlamadas > 0 ? (totalVentas / totalLlamadas * 100).toFixed(2) : 0;
  
  return {
    totalVentas,
    totalLlamadas,
    efectividad
  };
}