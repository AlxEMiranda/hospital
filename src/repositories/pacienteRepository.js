/**
 * Repositorio de Pacientes
 * Acceso a datos en memoria con soporte de:
 * - Paginación
 * - Filtros dinámicos (estado, especialidad, edad, diagnóstico)
 * - Ordenamiento múltiple
 * - Búsqueda avanzada
 */
const { database, dbHelpers } = require('../config/database');
const Paciente = require('../models/Paciente');

class PacienteRepository {

  /**
   * Crear nuevo paciente
   */
  async create(paciente) {
    if (!(paciente instanceof Paciente)) {
      paciente = new Paciente(paciente);
    }
    database.pacientes.set(paciente.id, paciente);
    return paciente;
  }

  /**
   * Buscar por ID
   */
  async findById(id) {
    const paciente = database.pacientes.get(id);
    if (!paciente || paciente.estado === 'INACTIVO') return null;
    return paciente;
  }

  /**
   * Buscar por DUI (incluye inactivos para validar unicidad)
   */
  async findByDUI(dui) {
    for (const paciente of database.pacientes.values()) {
      if (paciente.dui === dui) return paciente;
    }
    return null;
  }

  /**
   * Listar con paginación, filtros y ordenamiento
   * Cumple requisito: GET /api/v1/pacientes con filtros avanzados
   */
  async findAll({
    page = 0,
    size = 10,
    filtros = {},
    sortBy = 'nombre',
    order = 'asc'
  } = {}) {

    // 1. Obtener todos los pacientes activos
    let resultados = Array.from(database.pacientes.values())
      .filter(p => p.estado !== 'INACTIVO');

    // 2. Aplicar filtros dinámicos
    if (filtros.estado) {
      resultados = resultados.filter(p => p.estado === filtros.estado);
    }
    if (filtros.especialidad) {
      resultados = resultados.filter(p => p.especialidad === filtros.especialidad);
    }
    if (filtros.edadMin !== undefined) {
      resultados = resultados.filter(p => p.edad >= parseInt(filtros.edadMin));
    }
    if (filtros.edadMax !== undefined) {
      resultados = resultados.filter(p => p.edad <= parseInt(filtros.edadMax));
    }
    if (filtros.diagnostico) {
      const diag = filtros.diagnostico.toLowerCase();
      resultados = resultados.filter(p => 
        p.diagnostico.toLowerCase().includes(diag)
      );
    }

    // 3. Ordenamiento múltiple (soporta sortBy=nombre,edad)
    const camposOrden = sortBy.split(',');
    resultados.sort((a, b) => {
      for (const campo of camposOrden) {
        const valA = a[campo];
        const valB = b[campo];
        let comparacion = 0;
        
        if (typeof valA === 'string') {
          comparacion = valA.localeCompare(valB);
        } else {
          comparacion = valA - valB;
        }
        
        if (comparacion !== 0) {
          return order === 'desc' ? -comparacion : comparacion;
        }
      }
      return 0;
    });

    // 4. Paginación
    const totalRegistros = resultados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / size));
    const paginaActual = Math.max(0, Math.min(page, totalPaginas - 1));
    const inicio = paginaActual * size;
    const data = resultados.slice(inicio, inicio + size);

    return {
      data: data.map(p => p.toJSON()),
      paginacion: {
        paginaActual,
        totalPaginas,
        totalRegistros,
        registrosPorPagina: size
      }
    };
  }

  /**
   * Actualizar paciente
   */
  async update(paciente) {
    if (!database.pacientes.has(paciente.id)) return null;
    database.pacientes.set(paciente.id, paciente);
    return paciente;
  }

  /**
   * Búsqueda avanzada por nombre, DUI o diagnóstico
   * Endpoint: GET /api/v1/pacientes/search?q=juan&dui=0123&diagnostico=hiper
   */
  async search({ q, dui, diagnostico } = {}) {
    const resultados = Array.from(database.pacientes.values())
      .filter(p => p.estado !== 'INACTIVO');

    let filtrados = resultados;

    if (q) {
      const query = q.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        p.apellido.toLowerCase().includes(query) ||
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(query)
      );
    }
    if (dui) {
      filtrados = filtrados.filter(p => p.dui.includes(dui));
    }
    if (diagnostico) {
      const diag = diagnostico.toLowerCase();
      filtrados = filtrados.filter(p => p.diagnostico.toLowerCase().includes(diag));
    }

    return filtrados.map(p => p.toJSON(true));
  }

  /**
   * Obtener solo pacientes activos (para exportar CSV)
   */
  async findAllActivos() {
    return Array.from(database.pacientes.values())
      .filter(p => p.estado !== 'INACTIVO')
      .map(p => p.toJSON());
  }

  /**
   * Calcular estadísticas generales
   */
  async calcularEstadisticas() {
    const pacientes = Array.from(database.pacientes.values());
    const activos = pacientes.filter(p => p.estado !== 'INACTIVO');
    const totalPacientes = activos.length;

    const porEstado = {
      activos: activos.filter(p => p.estado === 'ACTIVO').length,
      inactivos: pacientes.filter(p => p.estado === 'INACTIVO').length,
      enTratamiento: activos.filter(p => p.estado === 'EN_TRATAMIENTO').length
    };

    const porEspecialidad = activos.reduce((acc, p) => {
      acc[p.especialidad] = (acc[p.especialidad] || 0) + 1;
      return acc;
    }, {});

    const edadPromedio = totalPacientes > 0
      ? activos.reduce((sum, p) => sum + p.edad, 0) / totalPacientes
      : 0;

    const pacientesConSeguimiento = activos.filter(p =>
      p.historialConsultas && p.historialConsultas.some(c => c.seguimiento === true)
    ).length;

    return {
      totalPacientes,
      porEstado,
      porEspecialidad,
      edadPromedio: Math.round(edadPromedio * 10) / 10,
      pacientesConSeguimiento,
      ultimaActualizacion: new Date().toISOString()
    };
  }
}

// Exportar instancia singleton
module.exports = new PacienteRepository();