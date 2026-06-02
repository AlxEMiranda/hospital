const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const {
  validarCreacionPaciente,
  validarActualizacionPaciente,
  validarFiltros
} = require('../middleware/validator');

// Todas las rutas requieren autenticación JWT
router.use(auth);

/**
 * @openapi
 * /api/v1/pacientes:
 *   get:
 *     summary: Listar pacientes con paginación, filtros y ordenamiento
 *     tags: [Pacientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [ACTIVO, INACTIVO, EN_TRATAMIENTO] }
 *       - in: query
 *         name: especialidad
 *         schema: { type: string }
 *       - in: query
 *         name: edadMin
 *         schema: { type: integer }
 *       - in: query
 *         name: edadMax
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, example: "nombre,edad" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Lista paginada de pacientes (con caché de 30s)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get('/',
  rbac(['MEDICO', 'ADMIN', 'AUDITOR']),
  validarFiltros,
  pacienteController.listar
);

/**
 * @openapi
 * /api/v1/pacientes/search:
 *   get:
 *     summary: Búsqueda avanzada por nombre, DUI o diagnóstico
 *     tags: [Pacientes]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: dui
 *         schema: { type: string }
 *       - in: query
 *         name: diagnostico
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
router.get('/search',
  rbac(['MEDICO', 'ADMIN']),
  pacienteController.buscar
);

/**
 * @openapi
 * /api/v1/pacientes/export/csv:
 *   get:
 *     summary: Exportar pacientes activos a CSV
 *     tags: [Pacientes]
 *     responses:
 *       200:
 *         description: Archivo CSV
 *         content:
 *           text/csv:
 *             schema: { type: string }
 */
router.get('/export/csv',
  rbac(['ADMIN']),
  pacienteController.exportarCSV
);

/**
 * @openapi
 * /api/v1/pacientes:
 *   post:
 *     summary: Registrar nuevo paciente
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Paciente'
 *     responses:
 *       201:
 *         description: Paciente creado
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: DUI duplicado
 */
router.post('/',
  rbac(['ADMIN']),
  validarCreacionPaciente,
  pacienteController.crear
);

/**
 * @openapi
 * /api/v1/pacientes/{id}:
 *   get:
 *     summary: Obtener paciente por ID (con historial)
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Paciente encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/:id',
  rbac(['MEDICO', 'ADMIN']),
  pacienteController.obtenerPorId
);

/**
 * @openapi
 * /api/v1/pacientes/{id}:
 *   put:
 *     summary: Actualizar expediente (con optimistic locking)
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [version]
 *             properties:
 *               version:
 *                 type: integer
 *                 description: Versión actual para optimistic locking
 *     responses:
 *       200:
 *         description: Actualizado
 *       409:
 *         description: Conflicto de versión (ERR-PAC-010)
 */
router.put('/:id',
  rbac(['MEDICO', 'ADMIN']),
  validarActualizacionPaciente,
  pacienteController.actualizar
);

/**
 * @openapi
 * /api/v1/pacientes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado del paciente (ACTIVO/INACTIVO/EN_TRATAMIENTO)
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO, EN_TRATAMIENTO]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/estado',
  rbac(['ADMIN']),
  pacienteController.cambiarEstado
);

/**
 * @openapi
 * /api/v1/pacientes/{id}:
 *   delete:
 *     summary: Eliminación lógica (cambia estado a INACTIVO)
 *     tags: [Pacientes]
 *     responses:
 *       204:
 *         description: Eliminado lógicamente
 */
router.delete('/:id',
  rbac(['ADMIN']),
  pacienteController.eliminar
);

/**
 * @openapi
 * /api/v1/pacientes/{id}/historial:
 *   get:
 *     summary: Historial clínico completo
 *     tags: [Pacientes]
 *     responses:
 *       200:
 *         description: Historial con consultas
 */
router.get('/:id/historial',
  rbac(['MEDICO', 'ADMIN']),
  pacienteController.obtenerPorId // Reutiliza el mismo controller
);

/**
 * @openapi
 * /api/v1/pacientes/{id}/version:
 *   get:
 *     summary: Obtener versión actual para optimistic locking
 *     tags: [Pacientes]
 *     responses:
 *       200:
 *         description: Versión y metadatos
 */
router.get('/:id/version',
  rbac(['MEDICO', 'ADMIN']),
  pacienteController.obtenerVersion
);

/**
 * @openapi
 * /api/v1/pacientes/{id}/consultas:
 *   post:
 *     summary: Agregar consulta médica al historial
 *     tags: [Consultas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [medico, notas]
 *             properties:
 *               medico: { type: string }
 *               notas: { type: string, minLength: 10 }
 *               medicamentos: { type: array, items: { type: string } }
 *               seguimiento: { type: boolean }
 *     responses:
 *       201:
 *         description: Consulta agregada
 */
router.post('/:id/consultas',
  rbac(['MEDICO']),
  pacienteController.agregarConsulta
);

module.exports = router;