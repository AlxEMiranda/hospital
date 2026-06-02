/**
 * Configuración de JWT (JSON Web Tokens)
 */
require('dotenv').config();

module.exports = {
  // Clave secreta para firmar tokens (en producción usar variable de entorno)
  secret: process.env.JWT_SECRET || 'hospital_secret_key_2024_change_in_production',
  
  // Tiempo de expiración del token
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  
  // Algoritmo de encriptación
  algorithm: 'HS256',
  
  // Emisor del token
  issuer: 'hospital-api',
  
  // Audiencia del token
  audience: 'hospital-client'
};