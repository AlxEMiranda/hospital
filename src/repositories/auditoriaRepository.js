/**
 * Repositorio de Auditoría
 * Almacena eventos inmutablemente (solo append)
 */
const { database } = require('../config/database');

class AuditoriaRepository {

  /**
   * Registrar nuevo evento
   */
  async create(evento) {
    const eventos = database.auditoria;
    eventos.push({
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...evento
    });
    // Mantener solo últimos 1000 eventos para no saturar memoria
    if (eventos.length > 1000) {
      eventos.splice(0, eventos.length - 1000);
    }
    return evento;
  }

  /**
   * Listar todos los eventos
   */
  async findAll() {
    return [...database.auditoria].reverse(); // Más recientes primero
  }

  /**
   * Listar por usuario
   */
  async findByUsuario(usuario) {
    return database.auditoria
      .filter(e => e.usuario === usuario)
      .reverse();
  }

  /**
   * Limpiar eventos (solo para tests)
   */
  async clearAll() {
    database.auditoria = [];
  }
}

module.exports = new AuditoriaRepository();