const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        codigo: 'ERR-AUTH-001',
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        mensaje: 'Token de autenticación ausente o mal formateado',
        path: req.originalUrl
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.secret);
    
    // Adjuntar usuario decodificado al request
    req.user = {
      id: decoded.id,
      usuario: decoded.usuario,
      rol: decoded.rol
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        codigo: 'ERR-AUTH-003',
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        mensaje: 'Token expirado',
        path: req.originalUrl
      });
    }
    
    return res.status(401).json({
      codigo: 'ERR-AUTH-002',
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'Unauthorized',
      mensaje: 'Token inválido',
      path: req.originalUrl
    });
  }
};

module.exports = authMiddleware;