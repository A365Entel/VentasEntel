# 📊 Sistema de Registro de Ventas - VentaEntel

Sistema de formularios web conectados a Google Sheets para el registro diario de ventas y llamadas de agentes.

## 📁 Estructura del Proyecto

```
VentaEntel/
├── public/
│   └── index.html          # Formulario web
├── scripts/
│   ├── appsscript.gs      # Código Apps Script (Google Sheets)
│   └── importAgents.js    # Script para importar agentes desde CSV
├── secrets/
│   └── (aquí va el archivo serviceAccount.json)
├── agents.csv             # Archivo CSV de ejemplo con agentes
├── package.json           # Dependencias Node.js
├── .env.example           # Ejemplo de variables de entorno
└── README.md              # Este archivo
```

## 🚀 Pasos de Configuración

### 1. Crear el Service Account en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Ve a **APIs y servicios > Credenciales**
4. Clic en **Crear credenciales > Cuenta de servicio**
5. Completa los datos:
   - Nombre de cuenta: `venta-entel`
   - ID: `venta-entel`
   - Descripción: `Cuenta para sistema de ventas`
6. Clic en **Crear y continuar**
7. En rol, selecciona **Propietario** (o Editor)
8. Clic en **Continuar > Listo**

### 2. Descargar la clave JSON

1. En la lista de cuentas de servicio, haz clic en la que creaste
2. Ve a la pestaña **Claves**
3. Clic en **Agregar clave > Crear nueva clave**
4. Selecciona **JSON** y clic en **Crear**
5. Guarda el archivo en `secrets/serviceAccount.json`

### 3. Compartir tu Google Sheets

1. Crea una nueva hoja de cálculo en [Google Sheets](https://sheets.google.com/)
2. Nombra las pestañas:
   - `Ventas` - para los registros del formulario
   - `Agentes` - para la base de datos de agentes
3. Comparte la hoja con el email del service account (algo como `venta-entel@proyecto.iam.gserviceaccount.com`)
4. **Importante**: Copia el ID de la URL (está entre `/d/` y `/edit`)

### 4. Configurar el Apps Script

1. Ve a [Google Apps Script](https://script.google.com/)
2. Clic en **Nuevo proyecto**
3. Copia el contenido de `scripts/appsscript.gs`
4. Reemplaza `TU_SPREADSHEET_ID` con tu ID de hoja de cálculo
5. Clic en **Implementar > Nueva implementación**
6. Selecciona **Web app**
7. Configura:
   - Descripción: `API VentaEntel`
   - Ejecutar como: `Yo`
   - Acceso: `Cualquier usuario`
8. Clic en **Implementar**
9. Copia la **URL del Web app** (algo como `https://script.google.com/macros/s/XXX/exec`)

### 5. Configurar el formulario

1. Edita `public/index.html`
2. Reemplaza `TU_SCRIPT_ID` en la variable `SCRIPT_URL` con el ID de tu Web App

### 6. Instalar dependencias (para importar agentes)

```powershell
cd C:\Users\A365\Documents\A365\Entel\VentaEntel
npm install
```

### 7. Configurar variables de entorno

```powershell
# Copia el archivo de ejemplo
copy .env.example .env

# Edita .env con tus datos
```

## 📝 Uso del Formulario

1. Abre `public/index.html` en un navegador
2. Llena los campos:
   - **Fecha**: Se llena automáticamente
   - **Supervisor**: Selecciona del dropdown (57 supervisores)
   - **Campaña**: Selecciona del dropdown
   - **DNI**: Se autocompleta al seleccionar agente
   - **Agente**: Selecciona del dropdown
   - **User ID**: Se autocompleta al seleccionar agente
   - **Objetivo**: Se autocompleta al seleccionar agente
   - **Ventas**: Ventas realizadas
   - **Llamadas**: Total de llamadas realizadas
3. Clic en **Enviar Registro**

Los datos se enviarán a Google Sheets y se calculará automáticamente la **Efectividad** (ventas/llamadas).

## 📥 Importar Agentes desde CSV

### Formato del CSV

```csv
dni,nombre,userId,campana
49083428,Arias Londoño Olga Lucia,AAP_OLARIAS,Entel - Portabilidad Empresas
```

### Ejecutar la importación

```powershell
cd C:\Users\A365\Documents\A365\Entel\VentaEntel

# Configurar variables de entorno
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\A365\Documents\A365\Entel\VentaEntel\secrets\serviceAccount.json"
$env:GOOGLE_CLOUD_PROJECT="TU_PROJECT_ID"
$env:GCLOUD_PROJECT="TU_PROJECT_ID"

# Importar agentes
node .\scripts\importAgents.js .\agents.csv
```

## 📊 Columnas en Google Sheets

| Columna | Campo | Descripción |
|---------|-------|-------------|
| A | Fecha | Fecha del registro |
| B | Supervisor | Nombre del supervisor |
| C | Campaña | Nombre de la campaña |
| D | DNI | Documento de identidad |
| E | Agente | Nombre del agente |
| F | User ID | ID del usuario |
| G | Objetivo Diario | Meta de llamadas |
| H | Ventas | Cantidad de ventas |
| I | Llamadas | Total de llamadas |
| J | Efectividad | Ratio calculado automáticamente |
| K | Fecha Registro | Timestamp del sistema |

## 🔧 Solución de Problemas

### Error: "No access"
- Verifica que compartiste la hoja con el email del service account

### Error: "Script not found"
- Verifica que desplegaste el Apps Script como Web App

### Error: "Invalid credentials"
- Verifica que el archivo JSON está en la ruta correcta

## 📄 Licencia

MIT
