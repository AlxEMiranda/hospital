const Paciente = require('../models/Paciente');
const Consulta = require('../models/Consulta');
const pacienteRepository = require('../repositories/pacienteRepository');
const auditoriaService = require('../services/auditoriaService');
const { cacheHelpers } = require('../config/cache');
const { exportToCSV } = require('../utils/exportCSV');

class PacienteController {

  // Helper para invalidar caché - como función independiente
  _invalidarCachePacientes() {
    cacheHelpers.invalidateByPrefix('pacientes_lista');
    cacheHelpers.invalidateByPrefix('stats');
  }

  // 1. LISTAR (GET /api/v1/pacientes) - CON CACHÉ
  listar = async (req, res, next) => {
    try {
      const { page = 0, size = 10, estado, especialidad, edadMin, edadMax, sortBy = 'nombre', order = 'asc' } = req.query;
      
      const cacheKey = `pacientes_lista_${page}_${size}_${estado}_${especialidad}_${sortBy}`;
      
      const cachedData = cacheHelpers.get(cacheKey);
      if (cachedData) {
        console.log(`[CACHE HIT] ${cacheKey}`);
        return res.json({
          timestamp: new Date().toISOString(),
          status: 200,
          origen: 'CACHE',
          ...cachedData
        });
      }

      console.log(`[CACHE MISS] Buscando en repositorio...`);
      const resultado = await pacienteRepository.findAll({
        page: parseInt(page),
        size: parseInt(size),
        filtros: { estado, especialidad, edadMin, edadMax },
        sortBy,
        order
      });

      cacheHelpers.set(cacheKey, resultado, 30);

      res.json({
        timestamp: new Date().toISOString(),
        status: 200,
        origen: 'DB',
        ...resultado
      });

    } catch (error) {
      next(error);
    }
  }

  // 2. OBTENER POR ID
  obtenerPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const paciente = await pacienteRepository.findById(id);
      
      if (!paciente || paciente.estado === 'INACTIVO') {
        const err = new Error('PACIENTE_NOT_FOUND');
        err.detalles = `id=${id}`;
        throw err;
      }

      res.json({
        timestamp: new Date().toISOString(),
        status: 200,
        data: paciente.toJSON(true)
      });

    } catch (error) {
      next(error);
    }
  }

  // 3. CREAR (POST /api/v1/pacientes)
  crear = async (req, res, next) => {
    try {
      const pacienteData = { ...req.body, creadoPor: req.user.usuario };
      
      const existente = await pacienteRepository.findByDUI(pacienteData.dui);
      if (existente) {
        const err = new Error('DUI_DUPLICADO');
        err.detalles = `dui=${pacienteData.dui}`;
        throw err;
      }

      const nuevoPaciente = new Paciente(pacienteData);
      await pacienteRepository.create(nuevoPaciente);

      await auditoriaService.registrar(req.user.usuario, 'CREATE', nuevoPaciente.id, `Paciente ${nuevoPaciente.nombre} ${nuevoPaciente.apellido} registrado`);

      this._invalidarCachePacientes();

      res.status(201).json({
        timestamp: new Date().toISOString(),
        status: 201,
        mensaje: 'Paciente creado exitosamente',
        data: nuevoPaciente.toJSON()
      });

    } catch (error) {
      next(error);
    }
  }

  // 4. ACTUALIZAR (PUT /api/v1/pacientes/:id) - OPTIMISTIC LOCKING
  actualizar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const versionEnviada = parseInt(req.body.version);

      if (isNaN(versionEnviada)) {
        throw new Error('CONFLICT_VERSION');
      }

      const pacienteExistente = await pacienteRepository.findById(id);
      if (!pacienteExistente) {
        const err = new Error('PACIENTE_NOT_FOUND');
        err.detalles = `id=${id}`;
        throw err;
      }

      if (pacienteExistente.version !== versionEnviada) {
        const err = new Error('CONFLICT_VERSION');
        err.detalles = `Versión enviada: ${versionEnviada}, Versión actual: ${pacienteExistente.version}`;
        throw err;
      }

      pacienteExistente.nombre = req.body.nombre;
      pacienteExistente.apellido = req.body.apellido;
      pacienteExistente.edad = req.body.edad;
      pacienteExistente.dui = req.body.dui;
      pacienteExistente.diagnostico = req.body.diagnostico;
      pacienteExistente.especialidad = req.body.especialidad;
      pacienteExistente.incrementVersion(req.user.usuario);

      await pacienteRepository.update(pacienteExistente);

      await auditoriaService.registrar(req.user.usuario, 'UPDATE', id, `Expediente actualizado de v${versionEnviada} a v${pacienteExistente.version}`);
      this._invalidarCachePacientes();

      res.json({
        timestamp: new Date().toISOString(),
        status: 200,
        mensaje: 'Paciente actualizado exitosamente',
        data: pacienteExistente.toJSON()
      });

    } catch (error) {
      next(error);
    }
  }

  // 5. CAMBIAR ESTADO (PATCH /api/v1/pacientes/:id/estado)
  cambiarEstado = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      const paciente = await pacienteRepository.findById(id);
      if (!paciente) {
        const err = new Error('PACIENTE_NOT_FOUND');
        err.detalles = `id=${id}`;
        throw err;
      }

      paciente.cambiarEstado(estado, req.user.usuario);
      await pacienteRepository.update(paciente);

      await auditoriaService.registrar(req.user.usuario, 'ESTADO_CHANGE', id, `Estado cambiado a ${estado}`);
      this._invalidarCachePacientes();

      res.json({
        timestamp: new Date().toISOString(),
        status: 200,
        mensaje: 'Estado actualizado',
        data: { id: paciente.id, estado: paciente.estado, version: paciente.version }
      });

    } catch (error) {
      next(error);
    }
  }

  // 6. ELIMINAR LÓGICAMENTE (DELETE /api/v1/pacientes/:id)
  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const paciente = await pacienteRepository.findById(id);
      
      if (!paciente) {
        const err = new Error('PACIENTE_NOT_FOUND');
        err.detalles = `id=${id}`;
        throw err;
      }

      paciente.estado = 'INACTIVO';
      paciente.incrementVersion(req.user.usuario);
      await pacienteRepository.update(paciente);

      await auditoriaService.registrar(req.user.usuario, 'DELETE', id, 'Eliminación lógica realizada');
      this._invalidarCachePacientes();

      res.status(204).send();

    } catch (error) {
      next(error);
    }
  }

  // 7. AGREGAR CONSULTA (POST /api/v1/pacientes/:id/consultas)
  agregarConsulta = async (req, res, next) => {
    try {
      const { id } = req.params;
      const paciente = await pacienteRepository.findById(id);
      
      if (!paciente) {
        const err = new Error('PACIENTE_NOT_FOUND');
        err.detalles = `id=${id}`;
        throw err;
      }

      const nuevaConsulta = new Consulta({ ...req.body, medico: req.user.usuario });
      paciente.agregarConsulta(nuevaConsulta);
      
      await pacienteRepository.update(paciente);
      await auditoriaService.registrar(req.user.usuario, 'UPDATE', id, 'Nueva consulta médica agregada');

      res.status(201).json({
        timestamp: new Date().toISOString(),
        status: 201,
        mensaje: 'Consulta agregada exitosamente',
        data: nuevaConsulta.toJSON()
      });

    } catch (error) {
      next(error);
    }
  }

  // 8. OBTENER VERSIÓN (GET /api/v1/pacientes/:id/version)
  obtenerVersion = async (req, res, next) => {
    try {
      const { id } = req.params;
      const paciente = await pacienteRepository.findById(id);
      
      if (!paciente) {
        const err = new Error('PACIENTE_NOT_FOUND');
        throw err;
      }

      res.json({
        timestamp: new Date().toISOString(),
        status: 200,
        data: {
          id: paciente.id,
          version: paciente.version,
          modificadoPor: paciente.modificadoPor,
          fechaModificacion: paciente.fechaModificacion
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // 9. EXPORTAR CSV (GET /api/v1/pacientes/export/csv)
  exportarCSV = async (req, res, next) => {
    try {
      const pacientesActivos = await pacienteRepository.findAllActivos();
      const csvContent = exportToCSV(pacientesActivos);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=pacientes.csv');
      
      await auditoriaService.registrar(req.user.usuario, 'EXPORT', 'SISTEMA', `Exportación CSV de ${pacientesActivos.length} pacientes`);
      
      res.status(200).send(csvContent);

    } catch (error) {
      next(error);
    }
  }

  // 10. BÚSQUEDA AVANZADA (GET /api/v1/pacientes/search)
  buscar = async (req, res, next) => {
    try {
      const { q, dui } = req.query;
      const resultados = await pacienteRepository.search({ q, dui });
      
      res.json({
        timestamp: new Date().toISOString(),
        status: 200,
        totalResultados: resultados.length,
        data: resultados
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PacienteController();