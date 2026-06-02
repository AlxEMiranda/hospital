/**
 * Servicio de Auditoría
 * Orquesta el registro automático de eventos críticos
 */
const auditoriaRepository = require('../repositories/auditoriaRepository');

class AuditoriaService {

  /**
   * Registrar evento de auditoría
   * @param {string} usuario - Usuario autenticado que realiza la acción
   * @param {string} accion - CREATE | UPDATE | DELETE | ESTADO_CHANGE | EXPORT
   * @param {string} recursoId - ID del recurso afectado
   * @param {string} detalles - Descripción opcional
   */
  async registrar(usuario, accion, recursoId, detalles = '') {
    const evento = {
      usuario,
      accion,
      recursoId,
      detalles,
      timestamp: new Date().toISOString(),
      ip: null, // Podría extraerse de req.ip en middleware
      userAgent: null
    };
    return await auditoriaRepository.create(evento);
  }

  /**
   * Listar todos los eventos (con caché de 30s idealmente)
   */
  async listarTodos() {
    return await auditoriaRepository.findAll();
  }

  /**
   * Filtrar por usuario
   */
  async porUsuario(usuario) {
    return await auditoriaRepository.findByUsuario(usuario);
  }
}

module.exports = new AuditoriaService();