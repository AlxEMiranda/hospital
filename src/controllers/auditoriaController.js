const auditoriaService = require('../services/auditoriaService');

class AuditoriaController {
  async listarEventos(req, res, next) {
    try {
      const eventos = await auditoriaService.listarTodos();
      res.json({
        timestamp: new Date().toISOString(),
        status: 200,
        totalEventos: eventos.length,
        data: eventos
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditoriaController();