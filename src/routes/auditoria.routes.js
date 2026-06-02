const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

/**
 * @openapi
 * /api/v1/auditoria:
 *   get:
 *     summary: Listar eventos de auditoría
 *     tags: [Auditoría]
 *     responses:
 *       200:
 *         description: Lista de eventos
 */
router.get('/',
  rbac(['AUDITOR', 'ADMIN']),
  auditoriaController.listarEventos
);

module.exports = router;