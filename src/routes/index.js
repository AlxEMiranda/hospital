/**
 * Router principal de la aplicación
 * Centraliza todos los routers por módulo bajo /api/v1
 */
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const pacienteRoutes = require('./paciente.routes');
const auditoriaRoutes = require('./auditoria.routes');
const estadisticasRoutes = require('./estadisticas.routes');

// ========================================
// Versionado de API (/api/v1/...)
// ========================================
router.use('/v1/auth', authRoutes);
router.use('/v1/pacientes', pacienteRoutes);
router.use('/v1/auditoria', auditoriaRoutes);
router.use('/v1/estadisticas', estadisticasRoutes);

// Health check (sin versión, para monitoreo)
router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;