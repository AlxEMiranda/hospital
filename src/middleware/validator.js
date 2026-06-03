const { body, param, query } = require('express-validator');

const validarCreacionPaciente = [
  body('nombre').trim().isLength({ min: 3, max: 60 }).withMessage('El nombre debe tener entre 3 y 60 caracteres').isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo puede contener letras'),
  body('apellido').trim().isLength({ min: 3, max: 60 }).withMessage('El apellido debe tener entre 3 y 60 caracteres').isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo puede contener letras'),
  body('edad').isInt({ min: 1, max: 120 }).withMessage('La edad debe ser un número entero entre 1 y 120'),
  body('dui').matches(/^\d{8}-\d$/).withMessage('El DUI debe tener el formato exacto 00000000-0'),
  body('diagnostico').trim().isLength({ min: 10 }).withMessage('El diagnóstico debe tener al menos 10 caracteres'),
  body('especialidad').isIn(['GENERAL', 'CARDIOLOGIA', 'PEDIATRIA', 'ORTOPEDIA', 'NEUROLOGIA']).withMessage('Especialidad no válida')
];

const validarActualizacionPaciente = [
  param('id').isUUID().withMessage('ID de paciente inválido'),
  body('nombre').trim().isLength({ min: 3, max: 60 }).withMessage('El nombre debe tener entre 3 y 60 caracteres'),
  body('apellido').trim().isLength({ min: 3, max: 60 }).withMessage('El apellido debe tener entre 3 y 60 caracteres'),
  body('edad').isInt({ min: 1, max: 120 }).withMessage('La edad debe ser un número entero entre 1 y 120'),
  body('dui').matches(/^\d{8}-\d$/).withMessage('El DUI debe tener el formato exacto 00000000-0'),
  body('diagnostico').trim().isLength({ min: 10 }).withMessage('El diagnóstico debe tener al menos 10 caracteres'),
  body('version').isInt({ min: 0 }).withMessage('La versión es obligatoria para actualizar (optimistic locking)')
];

const validarFiltros = [
  query('page').optional().isInt({ min: 0 }).withMessage('La página debe ser un número positivo'),
  query('size').optional().isInt({ min: 1, max: 100 }).withMessage('El tamaño debe estar entre 1 y 100'),
  query('estado').optional().isIn(['ACTIVO', 'INACTIVO', 'EN_TRATAMIENTO']).withMessage('Estado no válido'),
  query('edadMin').optional().isInt({ min: 0 }).withMessage('edadMin inválida'),
  query('edadMax').optional().isInt({ min: 0 }).withMessage('edadMax inválida')
];

module.exports = {
  validarCreacionPaciente,
  validarActualizacionPaciente,
  validarFiltros
};