const rbac = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        codigo: 'ERR-AUTH-001',
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        mensaje: 'Usuario no autenticado',
        path: req.originalUrl
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        codigo: 'ERR-AUTH-002',
        timestamp: new Date().toISOString(),
        status: 403,
        error: 'Forbidden',
        mensaje: `El rol '${req.user.rol}' no tiene permisos para realizar esta acción`,
        path: req.originalUrl
      });
    }

    next();
  };
};

module.exports = rbac;