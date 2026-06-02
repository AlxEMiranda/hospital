const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  // Mapeo de errores internos a códigos de negocio (Requisito Parcial 4)
  const codigosError = {
    'PACIENTE_NOT_FOUND': { codigo: 'ERR-PAC-004', status: 404, error: 'Not Found' },
    'DUI_DUPLICADO': { codigo: 'ERR-PAC-009', status: 409, error: 'Conflict' },
    'CONFLICT_VERSION': { codigo: 'ERR-PAC-010', status: 409, error: 'Conflict' },
    'ESTADO_INVALIDO': { codigo: 'ERR-PAC-005', status: 400, error: 'Bad Request' },
    'FALTAN_CAMPOS_OBLIGATORIOS': { codigo: 'ERR-PAC-001', status: 400, error: 'Bad Request' },
    'DUI_FORMATO_INVALIDO': { codigo: 'ERR-PAC-002', status: 400, error: 'Bad Request' },
    'EDAD_INVALIDA': { codigo: 'ERR-PAC-003', status: 400, error: 'Bad Request' }
  };

  const mapped = codigosError[err.message] || { codigo: 'ERR-SYS-500', status: 500, error: 'Internal Server Error' };

  // Si es un error de express-validator
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      codigo: 'ERR-PAC-001',
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Bad Request',
      mensaje: 'Error de validación en los datos de entrada',
      detalles: err.array().map(e => e.msg),
      path: req.originalUrl
    });
  }

  res.status(mapped.status).json({
    codigo: mapped.codigo,
    timestamp: new Date().toISOString(),
    status: mapped.status,
    error: mapped.error,
    mensaje: err.message || 'Error inesperado del servidor',
    detalle: err.detalles || null,
    path: req.originalUrl
  });
};

module.exports = errorHandler;