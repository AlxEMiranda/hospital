/**
 * Configuración de Base de Datos (In-Memory para este proyecto)
 * En producción se conectaría a PostgreSQL/MySQL/MongoDB
 */

// Almacenamiento en memoria usando Map para mejor rendimiento
const database = {
  pacientes: new Map(),
  usuarios: new Map(),
  auditoria: new Map(),
  consultas: new Map()
};

// Métodos utilitarios para el repositorio
const dbHelpers = {
  // Generar ID único tipo UUID
  generateId: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Limpiar toda la base de datos (solo para tests)
  clearAll: () => {
    database.pacientes.clear();
    database.usuarios.clear();
    database.auditoria.clear();
    database.consultas.clear();
  },

  // Obtener estadísticas de la BD
  getStats: () => ({
    pacientes: database.pacientes.size,
    usuarios: database.usuarios.size,
    auditoria: database.auditoria.size,
    consultas: database.consultas.size
  })
};

module.exports = { database, dbHelpers };