const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { database } = require('../config/database');

// ========================================
// INICIALIZAR USUARIOS PREDEFINIDOS
// ========================================
let usuariosInicializados = false;

async function inicializarUsuarios() {
  if (usuariosInicializados || database.usuarios.size > 0) {
    return;
  }

  console.log('👥 Inicializando usuarios predefinidos...');

  const usuariosData = [
    { id: '1', usuario: 'admin', email: 'admin@hospital.com', password: 'Admin2024!', rol: 'ADMIN' },
    { id: '2', usuario: 'dr.garcia', email: 'garcia@hospital.com', password: 'Medico1!', rol: 'MEDICO' },
    { id: '3', usuario: 'recepcion', email: 'recepcion@hospital.com', password: 'Recep123!', rol: 'RECEPCION' },
    { id: '4', usuario: 'auditor', email: 'auditor@hospital.com', password: 'Audita123!', rol: 'AUDITOR' }
  ];

  for (const data of usuariosData) {
    const usuario = new Usuario({
      id: data.id,
      usuario: data.usuario,
      email: data.email,
      rol: data.rol,
      activo: true
    });
    usuario.passwordHash = await Usuario.hashPassword(data.password);
    database.usuarios.set(data.usuario, usuario);
  }

  usuariosInicializados = true;
  console.log(`${database.usuarios.size} usuarios inicializados`);
}

// Ejecutar inicialización al cargar el módulo
inicializarUsuarios().catch(err => {
  console.error('❌ Error inicializando usuarios:', err);
});

// ========================================
// CONTROLADOR DE AUTENTICACIÓN
// ========================================
const authController = {
  async login(req, res, next) {
    try {
      // Asegurar que los usuarios estén inicializados
      if (!usuariosInicializados) {
        await inicializarUsuarios();
      }

      const { usuario, contrasena } = req.body;

      // Validar datos de entrada
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

      console.log(`🔐 Intento de login: ${usuario}`);

      // Buscar usuario
      const user = database.usuarios.get(usuario.toLowerCase());

      if (!user) {
        console.log(`❌ Usuario no encontrado: ${usuario}`);
        return res.status(401).json({
          codigo: 'ERR-AUTH-005',
          timestamp: new Date().toISOString(),
          status: 401,
          error: 'Unauthorized',
          mensaje: 'Credenciales incorrectas',
          path: req.originalUrl
        });
      }

      // Verificar contraseña
      const isValid = await user.verifyPassword(contrasena);

      if (!isValid) {
        console.log(`❌ Contraseña incorrecta para: ${usuario}`);
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
        { 
          id: user.id, 
          usuario: user.usuario, 
          rol: user.rol 
        },
        process.env.JWT_SECRET || 'hospital_secret_key_2024',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      user.recordLogin();

      console.log(`✅ Login exitoso: ${usuario} (${user.rol})`);

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
        expira_en: process.env.JWT_EXPIRES_IN || '1h'
      });

    } catch (error) {
      console.error('❌ Error en login:', error);
      next(error);
    }
  }
};

module.exports = authController;