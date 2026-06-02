const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const Usuario = require('../models/Usuario');
const { database } = require('../config/database');

class AuthController {
  
  // Inicializar usuarios en memoria al arrancar (simulación de DB)
  async inicializarUsuarios() {
    if (database.usuarios.size === 0) {
      const usuarios = await Usuario.getUsuariosPredefinidos();
      usuarios.forEach(u => database.usuarios.set(u.usuario, u));
    }
  }

  async login(req, res, next) {
    try {
      await this.inicializarUsuarios(); // Asegurar que existan
      
      const { usuario, contrasena } = req.body;

      if (!usuario || !contrasena) {
        return res.status(400).json({
          codigo: 'ERR-AUTH-004',
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          mensaje: 'Usuario y contraseña son obligatorios',
          path: req.originalUrl
        });
      }

      const user = database.usuarios.get(usuario.toLowerCase());

      if (!user) {
        return res.status(401).json({
          codigo: 'ERR-AUTH-005',
          timestamp: new Date().toISOString(),
          status: 401,
          error: 'Unauthorized',
          mensaje: 'Credenciales incorrectas',
          path: req.originalUrl
        });
      }

      const isValid = await user.verifyPassword(contrasena);

      if (!isValid) {
        return res.status(401).json({
          codigo: 'ERR-AUTH-005',
          timestamp: new Date().toISOString(),
          status: 401,
          error: 'Unauthorized',
          mensaje: 'Credenciales incorrectas',
          path: req.originalUrl
        });
      }

      // Generar JWT
      const token = jwt.sign(
        { id: user.id, usuario: user.usuario, rol: user.rol },
        config.secret,
        { expiresIn: config.expiresIn }
      );

      user.recordLogin();

      res.status(200).json({
        timestamp: new Date().toISOString(),
        status: 200,
        mensaje: 'Autenticación exitosa',
        token: token,
        usuario: {
          id: user.id,
          nombre: user.usuario,
          rol: user.rol
        },
        expira_en: config.expiresIn
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();