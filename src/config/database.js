/**
 * Configuración de Base de Datos (In-Memory para este proyecto)
 * En producción se conectaría a PostgreSQL/MySQL/MongoDB
 */

// Almacenamiento en memoria usando Map para mejor rendimiento

const database = {
  pacientes: new Map(),
  usuarios: new Map(),
  auditoria: [],  // ✅ CORREGIDO: era Map(), debe ser array []
  consultas: new Map()
};

const dbHelpers = {
  generateId: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  clearAll: () => {
    database.pacientes.clear();
    database.usuarios.clear();
    database.auditoria = [];
    database.consultas.clear();
  },

  getStats: () => ({
    pacientes: database.pacientes.size,
    usuarios: database.usuarios.size,
    auditoria: database.auditoria.length,
    consultas: database.consultas.size
  })
};

module.exports = { database, dbHelpers };