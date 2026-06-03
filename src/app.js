/**
 * 🏥 API Hospitalaria - Archivo Principal
 * Parcial 4 - Desarrollo de Aplicaciones Web
 * 
 * Este archivo configura y arranca el servidor Express,
 * integrando todos los middlewares, rutas y documentación.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

// Configuraciones
const swaggerDocument = require('./config/swagger');
const routes = require('./routes');

// Middlewares personalizados
const errorHandler = require('./middleware/errorHandler');

// ========================================
// INICIALIZACIÓN DE EXPRESS
// ========================================
const app = express();

// ========================================
// MIDDLEWARES GLOBALES
// ========================================

// Seguridad HTTP (protege contra XSS, clickjacking, etc.)
app.use(helmet());

// CORS - Permitir peticiones desde otros dominios
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logs de peticiones HTTP en consola
app.use(morgan(process.env.LOG_LEVEL || 'dev'));

// Parsear body en formato JSON
app.use(express.json());

// Parsear body en formato URL-encoded (para formularios)
app.use(express.urlencoded({ extended: true }));

// ========================================
// DOCUMENTACIÓN OPENAPI 3.0 (SWAGGER)
// ========================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Hospitalaria - Documentación',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true
  }
}));

// ========================================
// RUTAS DE LA API
// ========================================
app.use('/api', routes);

// ========================================
// RUTA RAÍZ (Información general)
// ========================================
app.get('/', (req, res) => {
  res.json({
    nombre: 'API Hospitalaria',
    version: '1.0.0',
    descripcion: 'Sistema de gestión de pacientes con auditoría, caché y control de concurrencia',
    endpoints: {
      documentacion: '/api-docs',
      health: '/api/health',
      auth: '/api/v1/auth',
      pacientes: '/api/v1/pacientes',
      auditoria: '/api/v1/auditoria',
      estadisticas: '/api/v1/estadisticas'
    },
    tecnologias: ['Node.js', 'Express', 'JWT', 'Swagger'],
    autor: 'Parcial 4 - Desarrollo Web'
  });
});

// ========================================
// MANEJADOR DE RUTAS NO ENCONTRADAS (404)
// ========================================
app.use((req, res, next) => {
  res.status(404).json({
    codigo: 'ERR-SYS-404',
    timestamp: new Date().toISOString(),
    status: 404,
    error: 'Not Found',
    mensaje: `La ruta ${req.originalUrl} no existe`,
    path: req.originalUrl
  });
});

// ========================================
// MANEJADOR GLOBAL DE ERRORES
// (Debe ir SIEMPRE al final, después de las rutas)
// ========================================
app.use(errorHandler);

// ========================================
// INICIO DEL SERVIDOR
// ========================================
// Solo iniciar si el archivo se ejecuta directamente (no en tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🏥 API HOSPITALARIA - PARCIAL 4         ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║   🚀 Servidor: http://localhost:${PORT}      ║`);
    console.log(`║   📚 Swagger: http://localhost:${PORT}/api-docs ║`);
    console.log(`║   🏥 Health:  http://localhost:${PORT}/api/health ║`);
    console.log('╠════════════════════════════════════════════╣');
    console.log('║   👥 USUARIOS DE PRUEBA                    ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log('║   admin       | Admin2024!  | ADMIN        ║');
    console.log('║   dr.garcia   | Medico1!    | MEDICO       ║');
    console.log('║   recepcion   | Recep123!   | RECEPCION    ║');
    console.log('║   auditor     | Audita123!  | AUDITOR      ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
  });
}

// ========================================
// EXPORTAR APP (para pruebas con Jest)
// ========================================
module.exports = app;