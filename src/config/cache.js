/**
 * Configuración de Caché
 * Usamos node-cache para caché en memoria
 */
const NodeCache = require('node-cache');

// Configuración del caché
const cacheConfig = {
  stdTTL: 30, // Tiempo de vida por defecto: 30 segundos
  checkperiod: 60, // Verificar keys expiradas cada 60 segundos
  useClones: false, // No clonar objetos (mejor rendimiento)
  maxKeys: 100 // Máximo número de keys en caché
};

// Crear instancia del caché
const cache = new NodeCache(cacheConfig);

// Eventos del caché para debugging
cache.on('expired', (key, value) => {
  console.log(`⏰ Cache key expired: ${key}`);
});

cache.on('del', (key, value) => {
  console.log(`🗑️ Cache key deleted: ${key}`);
});

// Funciones helper para el caché
const cacheHelpers = {
  // Establecer valor en caché
  set: (key, value, ttl = null) => {
    if (ttl) {
      cache.set(key, value, ttl);
    } else {
      cache.set(key, value);
    }
  },

  // Obtener valor del caché
  get: (key) => {
    return cache.get(key);
  },

  // Eliminar key del caché
  del: (key) => {
    cache.del(key);
  },

  // Invalidar todas las keys que empiecen con un prefijo
  invalidateByPrefix: (prefix) => {
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        cache.del(key);
      }
    });
  },

  // Limpiar todo el caché
  flushAll: () => {
    cache.flushAll();
  },

  // Obtener estadísticas del caché
  getStats: () => {
    return cache.getStats();
  },

  // Verificar si existe una key
  has: (key) => {
    return cache.has(key);
  }
};

module.exports = { cache, cacheHelpers };