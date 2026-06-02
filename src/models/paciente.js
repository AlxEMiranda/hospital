/**
 * Modelo Paciente
 * Representa el expediente clínico de un paciente
 */
const { dbHelpers } = require('../config/database');

class Paciente {
  constructor(data) {
    // Validar datos requeridos
    if (!data.nombre || !data.apellido || !data.edad || !data.dui || !data.diagnostico) {
      throw new Error('FALTAN_CAMPOS_OBLIGATORIOS');
    }

    // Validar formato de DUI
    if (!Paciente.validarDUI(data.dui)) {
      throw new Error('DUI_FORMATO_INVALIDO');
    }

    // Validar edad
    if (data.edad < 1 || data.edad > 120) {
      throw new Error('EDAD_INVALIDA');
    }

    // Validar especialidad
    const especialidadesValidas = ['GENERAL', 'CARDIOLOGIA', 'PEDIATRIA', 'ORTOPEDIA', 'NEUROLOGIA', 'DERMATOLOGIA'];
    if (data.especialidad && !especialidadesValidas.includes(data.especialidad.toUpperCase())) {
      throw new Error('ESPECIALIDAD_INVALIDA');
    }

    // Asignar propiedades
    this.id = data.id || dbHelpers.generateId();
    this.nombre = data.nombre.trim();
    this.apellido = data.apellido.trim();
    this.edad = parseInt(data.edad);
    this.dui = data.dui.trim();
    this.diagnostico = data.diagnostico.trim();
    this.fechaIngreso = data.fechaIngreso || new Date().toISOString();
    this.estado = data.estado || 'ACTIVO'; // ACTIVO | INACTIVO | EN_TRATAMIENTO
    this.especialidad = data.especialidad ? data.especialidad.toUpperCase() : 'GENERAL';
    this.historialConsultas = data.historialConsultas || [];
    
    // Auditoría
    this.creadoPor = data.creadoPor || 'sistema';
    this.modificadoPor = data.modificadoPor || null;
    this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
    this.fechaModificacion = data.fechaModificacion || null;
    
    // Optimistic locking
    this.version = data.version || 0;
  }

  /**
   * Incrementa la versión del paciente (optimistic locking)
   */
  incrementVersion(usuario) {
    this.version++;
    this.fechaModificacion = new Date().toISOString();
    this.modificadoPor = usuario;
  }

  /**
   * Agrega una consulta al historial
   */
  agregarConsulta(consulta) {
    this.historialConsultas.push(consulta);
    this.incrementVersion(this.modificadoPor);
  }

  /**
   * Cambia el estado del paciente
   */
  cambiarEstado(nuevoEstado, usuario) {
    const estadosValidos = ['ACTIVO', 'INACTIVO', 'EN_TRATAMIENTO'];
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error('ESTADO_INVALIDO');
    }
    this.estado = nuevoEstado;
    this.incrementVersion(usuario);
  }

  /**
   * Valida formato de DUI (00000000-0)
   */
  static validarDUI(dui) {
    return /^\d{8}-\d$/.test(dui);
  }

  /**
   * Convierte el objeto a JSON (eliminando datos sensibles si es necesario)
   */
  toJSON(includeHistorial = false) {
    const json = {
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      edad: this.edad,
      dui: this.dui,
      diagnostico: this.diagnostico,
      fechaIngreso: this.fechaIngreso,
      estado: this.estado,
      especialidad: this.especialidad,
      creadoPor: this.creadoPor,
      modificadoPor: this.modificadoPor,
      fechaCreacion: this.fechaCreacion,
      fechaModificacion: this.fechaModificacion,
      version: this.version
    };

    if (includeHistorial) {
      json.historialConsultas = this.historialConsultas;
    }

    return json;
  }

  /**
   * Crea una instancia desde un objeto plain
   */
  static from(data) {
    return new Paciente(data);
  }
}

module.exports = Paciente;