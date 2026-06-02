const pacienteRepository = require('../repositories/pacienteRepository');
const { cacheHelpers } = require('../config/cache');

class EstadisticasController {
  async obtenerEstadisticas(req, res, next) {
    try {
      // Usar caché para estadísticas también (5 minutos)
      const cacheKey = 'stats_globales';
      const cached = cacheHelpers.get(cacheKey);
      if (cached) return res.json({ timestamp: new Date().toISOString(), status: 200, origen: 'CACHE', data: cached });

      const stats = await pacienteRepository.calcularEstadisticas();
      
      cacheHelpers.set(cacheKey, stats, 300); // 5 minutos

      res.json({
        timestamp: new Date().toISOString(),
        status: 200,
        origen: 'DB',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EstadisticasController();