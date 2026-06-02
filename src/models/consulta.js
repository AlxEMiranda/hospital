/**
 * Modelo Consulta
 * Representa una consulta médica en el historial del paciente
 */
const { dbHelpers } = require('../config/database');

class Consulta {
  constructor(data) {
    // Validar datos requeridos
    if (!data.medico || !data.notas) {
      throw new Error('FALTAN_CAMPOS_OBLIGATORIOS_CONSULTA');
    }

    // Validar longitud de notas
    if (data.notas.length < 10) {
      throw new Error('NOTAS_MUY_CORTAS');
    }

    // Asignar propiedades
    this.idConsulta = data.idConsulta || dbHelpers.generateId();
    this.fecha = data.fecha || new Date().toISOString();
    this.medico = data.medico.trim();
    this.notas = data.notas.trim();
    this.medicamentos = data.medicamentos || [];
    this.seguimiento = data.seguimiento || false;
  }

  /**
   * Agrega un medicamento a la consulta
   */
  agregarMedicamento(medicamento) {
    if (medicamento && medicamento.trim()) {
      this.medicamentos.push(medicamento.trim());
    }
  }

  /**
   * Convierte a JSON
   */
  toJSON() {
    return {
      idConsulta: this.idConsulta,
      fecha: this.fecha,
      medico: this.medico,
      notas: this.notas,
      medicamentos: this.medicamentos,
      seguimiento: this.seguimiento
    };
  }

  /**
   * Crea instancia desde objeto plain
   */
  static from(data) {
    return new Consulta(data);
  }
}

module.exports = Consulta;