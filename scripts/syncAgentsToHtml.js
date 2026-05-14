const fs = require('fs');
const path = require('path');

const csvPath = process.argv[2] || path.join(__dirname, '..', 'agents.csv');
const htmlPath = process.argv[3] || path.join(__dirname, '..', 'public', 'index.html');

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((csvRow) => csvRow.some((value) => value.trim()));
}

function readAgents(filePath) {
  const csv = fs.readFileSync(filePath, 'latin1').replace(/^\uFEFF/, '');
  const rows = parseCSV(csv);
  const headers = rows.shift().map((header) => header.trim());

  return rows
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, (row[index] || '').trim()]))
    )
    .filter((agent) => agent.dni && agent.nombre)
    .map((agent) => ({
      dni: agent.dni,
      nombre: agent.nombre,
      userId: agent.userId || '',
      campana: agent.campana || '',
    }));
}

function syncAgents(agents, filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const agentsJs = agents
    .map((agent) => `            ${JSON.stringify(agent)}`)
    .join(',\n');

  const replacement = `// Base de datos de agentes (desde CSV actualizado - ${agents.length} agentes)
        const agentesDB = [
${agentsJs}
        ];`;

  const agentsBlockPattern =
    /\/\/ Base de datos de agentes \(desde CSV actualizado - \d+ agentes\)\s*const\s+agentesDB\s*=\s*\[[\s\S]*?\n\s*\];/;

  let foundAgentsBlock = false;
  const updatedHtml = html.replace(agentsBlockPattern, () => {
    foundAgentsBlock = true;
    return replacement;
  });

  if (!foundAgentsBlock) {
    throw new Error('No se encontro el bloque agentesDB en el HTML.');
  }

  const changed = updatedHtml !== html;
  if (changed) {
    fs.writeFileSync(filePath, updatedHtml, 'utf8');
  }

  return changed;
}

const agents = readAgents(csvPath);
const changed = syncAgents(agents, htmlPath);
console.log(
  changed
    ? `Agentes sincronizados: ${agents.length}`
    : `Agentes ya estaban sincronizados: ${agents.length}`
);
