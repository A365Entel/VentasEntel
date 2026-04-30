/**
 * Script para importar agentes desde un archivo CSV a Google Sheets
 * 
 * Uso:
 * node importAgents.js ./agents.csv
 * 
 * Formato del CSV:
 * dni,nombre,userId,campana
 * 49083428,Arias Londoño Olga Lucia,AAP_OLARIAS,Entel - Portabilidad Empresas
 */

const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');
const { JWT } = require('google-auth-library');

// Cargar variables de entorno
require('dotenv').config();

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || 'TU_SPREADSHEET_ID';
const SHEET_NAME = 'Agentes';

/**
 * Lee un archivo CSV y lo convierte a array de objetos
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('El archivo CSV debe tener al menos un encabezado y una fila de datos');
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const agents = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const agent = {};
    
    headers.forEach((header, index) => {
      agent[header] = values[index] || '';
    });
    
    agents.push(agent);
  }
  
  return agents;
}

/**
 * Conecta con Google Sheets y obtiene la hoja de agentes
 */
async function getSheet() {
  // Usar autenticación con service account
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  let sheet = doc.sheets.find(s => s.title === SHEET_NAME);
  
  if (!sheet) {
    // Crear la hoja si no existe
    sheet = await doc.addSheet({ title: SHEET_NAME, gridProperties: { rowCount: 1000, columnCount: 10 } });
  }
  
  return sheet;
}

/**
 * Importa los agentes a Google Sheets
 */
async function importAgents(agents) {
  const sheet = await getSheet();
  
  // Obtener la siguiente fila vacía
  const lastRow = sheet.rowCount + 1;
  
  // Si es la primera vez, agregar encabezados
  if (lastRow === 1) {
    await sheet.setHeaderRow(['DNI', 'Nombre', 'User ID', 'Campaña', 'Fecha Alta']);
  }
  
  // Agregar los agentes
  const rows = agents.map(agent => [
    agent.dni,
    agent.nombre,
    agent.userId,
    agent.campana,
    new Date().toISOString()
  ]);
  
  await sheet.addRows(rows);
  
  return rows.length;
}

/**
 * Función principal
 */
async function main() {
  try {
    // Obtener la ruta del archivo CSV
    const csvPath = process.argv[2];
    
    if (!csvPath) {
      console.error('❌ Error: Debes especificar la ruta del archivo CSV');
      console.log('   Uso: node importAgents.js ./agents.csv');
      process.exit(1);
    }
    
    // Verificar que el archivo existe
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Error: El archivo ${csvPath} no existe`);
      process.exit(1);
    }
    
    console.log('📂 Leyendo archivo CSV...');
    const agents = parseCSV(csvPath);
    console.log(`   ✓ Se encontraron ${agents.length} agentes`);
    
    console.log('🔐 Conectando con Google Sheets...');
    const count = await importAgents(agents);
    console.log(`   ✓ Se importaron ${count} agentes correctamente`);
    
    console.log('\n✅ Importación completada!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { parseCSV, importAgents };