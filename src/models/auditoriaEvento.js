/**
 * Modelo AuditoriaEvento
 * Registra acciones críticas en el sistema
 */
const { dbHelpers } = require('../config/database');

class AuditoriaEvento {
  constructor(data) {
    // Validar datos requeridos
    if (!data.usuario || !data.accion || !data.recursoId) {
      throw new Error('FALTAN_CAMPOS_OBLIGATORIOS_AUDITORIA');
    }

    // Validar acción
    const accionesValidas = ['CREATE', 'UPDATE', 'DELETE', 'ESTADO_CHANGE', 'LOGIN', 'LOGOUT'];
    if (!accionesValidas.includes(data.accion)) {
      throw new Error('ACCION_INVALIDA');
    }

    // Asignar propiedades
    this.id = data.id || dbHelpers.generateId();
    this.usuario = data.usuario;
    this.accion = data.accion;
    this.recursoId = data.recursoId;
    this.detalles = data.detalles || '';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.ip = data.ip || null;
    this.userAgent = data.userAgent || null;
  }

  /**
   * Convierte a JSON
   */
  toJSON() {
    return {
      id: this.id,
      usuario: this.usuario,
      accion: this.accion,
      recursoId: this.recursoId,
      detalles: this.detalles,
      timestamp: this.timestamp,
      ip: this.ip,
      userAgent: this.userAgent
    };
  }

  /**
   * Crea instancia desde objeto plain
   */
  static from(data) {
    return new AuditoriaEvento(data);
  }

  /**
   * Crea un evento de creación
   */
  static create(usuario, recursoId, detalles = '') {
    return new AuditoriaEvento({
      usuario,
      accion: 'CREATE',
      recursoId,
      detalles
    });
  }

  /**
   * Crea un evento de actualización
   */
  static update(usuario, recursoId, detalles = '') {
    return new AuditoriaEvento({
      usuario,
      accion: 'UPDATE',
      recursoId,
      detalles
    });
  }

  /**
   * Crea un evento de eliminación
   */
  static delete(usuario, recursoId, detalles = '') {
    return new AuditoriaEvento({
      usuario,
      accion: 'DELETE',
      recursoId,
      detalles
    });
  }

  /**
   * Crea un evento de cambio de estado
   */
  static estadoChange(usuario, recursoId, nuevoEstado) {
    return new AuditoriaEvento({
      usuario,
      accion: 'ESTADO_CHANGE',
      recursoId,
      detalles: `Estado cambiado a: ${nuevoEstado}`
    });
  }
}

module.exports = AuditoriaEvento;