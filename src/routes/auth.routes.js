const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Autenticación de usuario y obtención de JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario, contrasena]
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: admin
 *               contrasena:
 *                 type: string
 *                 example: Admin123!
 *     responses:
 *       200:
 *         description: Token JWT generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 usuario: { type: object }
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', authController.login);

module.exports = router;