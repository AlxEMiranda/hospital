/**
 * Modelo Usuario
 * Representa un usuario del sistema con autenticación JWT
 */
const bcrypt = require('bcryptjs');
const { dbHelpers } = require('../config/database');

class Usuario {
  constructor(data) {
    // Validar datos requeridos
    if (!data.usuario || !data.email || !data.rol) {
      throw new Error('FALTAN_CAMPOS_OBLIGATORIOS_USUARIO');
    }

    // Validar rol
    const rolesValidos = ['ADMIN', 'MEDICO', 'RECEPCION', 'AUDITOR'];
    if (!rolesValidos.includes(data.rol.toUpperCase())) {
      throw new Error('ROL_INVALIDO');
    }

    // Asignar propiedades
    this.id = data.id || dbHelpers.generateId();
    this.usuario = data.usuario.trim().toLowerCase();
    this.email = data.email.trim().toLowerCase();
    this.passwordHash = data.passwordHash || null;
    this.rol = data.rol.toUpperCase();
    this.activo = data.activo !== undefined ? data.activo : true;
    this.ultimoAcceso = data.ultimoAcceso || null;
  }

  /**
   * Hashea una contraseña
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica si una contraseña coincide con el hash
   */
  async verifyPassword(password) {
    if (!this.passwordHash) {
      return false;
    }
    return bcrypt.compare(password, this.passwordHash);
  }

  /**
   * Actualiza la contraseña
   */
  async setPassword(password) {
    this.passwordHash = await Usuario.hashPassword(password);
  }

  /**
   * Registra el último acceso
   */
  recordLogin() {
    this.ultimoAcceso = new Date().toISOString();
  }

  /**
   * Convierte a JSON (sin password hash)
   */
  toJSON(includeSensitive = false) {
    const json = {
      id: this.id,
      usuario: this.usuario,
      email: this.email,
      rol: this.rol,
      activo: this.activo,
      ultimoAcceso: this.ultimoAcceso
    };

    if (includeSensitive) {
      json.passwordHash = this.passwordHash;
    }

    return json;
  }

  /**
   * Crea instancia desde objeto plain
   */
  static from(data) {
    return new Usuario(data);
  }

  /**
   * Usuarios predefinidos para pruebas
   * En producción, estos deberían estar en una base de datos
   */
  static async getUsuariosPredefinidos() {
    const usuariosData = [
      {
        id: '1',
        usuario: 'admin',
        email: 'admin@hospital.com',
        password: 'Admin123!',
        rol: 'ADMIN'
      },
      {
        id: '2',
        usuario: 'dr.martinez',
        email: 'martinez@hospital.com',
        password: 'Medico123!',
        rol: 'MEDICO'
      },
      {
        id: '3',
        usuario: 'recepcion',
        email: 'recepcion@hospital.com',
        password: 'Recep123!',
        rol: 'RECEPCION'
      },
      {
        id: '4',
        usuario: 'auditor',
        email: 'auditor@hospital.com',
        password: 'Audita123!',
        rol: 'AUDITOR'
      }
    ];

    // Crear instancias con passwords hasheados
    const usuarios = [];
    for (const userData of usuariosData) {
      const usuario = new Usuario({
        id: userData.id,
        usuario: userData.usuario,
        email: userData.email,
        rol: userData.rol,
        activo: true
      });
      
      // Hashear password
      usuario.passwordHash = await Usuario.hashPassword(userData.password);
      usuarios.push(usuario);
    }

    return usuarios;
  }

  /**
   * Verifica permisos RBAC
   */
  static tienePermiso(rolUsuario, rolesRequeridos) {
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true; // Sin restricciones
    }
    return rolesRequeridos.includes(rolUsuario.toUpperCase());
  }

  /**
   * Jerarquía de roles (de mayor a menor privilegio)
   */
  static getRolHierarchy() {
    return {
      'ADMIN': 4,
      'MEDICO': 3,
      'RECEPCION': 2,
      'AUDITOR': 1
    };
  }

  /**
   * Verifica si un rol tiene al menos el nivel requerido
   */
  static hasMinimumRole(rolUsuario, rolMinimo) {
    const hierarchy = this.getRolHierarchy();
    const userLevel = hierarchy[rolUsuario.toUpperCase()] || 0;
    const requiredLevel = hierarchy[rolMinimo.toUpperCase()] || 0;
    return userLevel >= requiredLevel;
  }
}

module.exports = Usuario;