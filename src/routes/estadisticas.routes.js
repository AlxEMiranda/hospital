const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

/**
 * @openapi
 * /api/v1/estadisticas:
 *   get:
 *     summary: Estadísticas generales del sistema (con caché de 5 min)
 *     tags: [Estadísticas]
 *     responses:
 *       200:
 *         description: JSON con estadísticas
 */
router.get('/',
  rbac(['ADMIN']),
  estadisticasController.obtenerEstadisticas
);

module.exports = router;