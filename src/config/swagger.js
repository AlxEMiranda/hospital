/**
 * Configuración de OpenAPI 3.0 (Swagger)
 * Documentación automática de la API Hospitalaria
 */

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API Hospitalaria - Parcial 4',
    version: '1.0.0',
    description: 'Sistema de gestión de pacientes con auditoría, caché y control de concurrencia. Implementa JWT + RBAC, paginación, validaciones y documentación OpenAPI 3.0.',
    contact: {
      name: 'Grupo de Desarrollo',
      email: 'estudiante@ufg.edu.sv'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Servidor de Desarrollo'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Autenticación y autorización JWT' },
    { name: 'Pacientes', description: 'Gestión de expedientes clínicos' },
    { name: 'Consultas', description: 'Historial médico y consultas' },
    { name: 'Auditoría', description: 'Registro de acciones del sistema' },
    { name: 'Estadísticas', description: 'Métricas y reportes' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT obtenido en /auth/login'
      }
    },
    schemas: {
      Paciente: {
        type: 'object',
        required: ['nombre', 'apellido', 'edad', 'dui', 'diagnostico'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único generado automáticamente',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          nombre: {
            type: 'string',
            minLength: 3,
            maxLength: 60,
            pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$',
            example: 'Juan Carlos'
          },
          apellido: {
            type: 'string',
            minLength: 3,
            maxLength: 60,
            example: 'Pérez García'
          },
          edad: {
            type: 'integer',
            minimum: 1,
            maximum: 120,
            example: 45
          },
          dui: {
            type: 'string',
            pattern: '^\\d{8}-\\d$',
            description: 'Documento Único de Identidad (formato: 00000000-0)',
            example: '01234567-8'
          },
          diagnostico: {
            type: 'string',
            minLength: 10,
            example: 'Hipertensión arterial controlada'
          },
          fechaIngreso: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha automática de creación',
            example: '2024-11-15T10:30:00.000Z'
          },
          estado: {
            type: 'string',
            enum: ['ACTIVO', 'INACTIVO', 'EN_TRATAMIENTO'],
            example: 'ACTIVO'
          },
          especialidad: {
            type: 'string',
            enum: ['GENERAL', 'CARDIOLOGIA', 'PEDIATRIA', 'ORTOPEDIA', 'NEUROLOGIA'],
            example: 'CARDIOLOGIA'
          },
          historialConsultas: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Consulta'
            }
          },
          version: {
            type: 'integer',
            description: 'Versión para optimistic locking',
            example: 0
          }
        }
      },
      Consulta: {
        type: 'object',
        required: ['medico', 'notas'],
        properties: {
          idConsulta: {
            type: 'string',
            format: 'uuid',
            example: '660e8400-e29b-41d4-a716-446655440001'
          },
          fecha: {
            type: 'string',
            format: 'date-time',
            example: '2024-11-15T10:30:00.000Z'
          },
          medico: {
            type: 'string',
            example: 'dr.garcia'
          },
          notas: {
            type: 'string',
            minLength: 10,
            example: 'Paciente estable, continuar tratamiento con Losartan 50mg'
          },
          medicamentos: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['Losartan 50mg', 'Aspirina 100mg']
          },
          seguimiento: {
            type: 'boolean',
            example: true
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          codigo: {
            type: 'string',
            example: 'ERR-PAC-001'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-11-15T10:30:00.000Z'
          },
          status: {
            type: 'integer',
            example: 400
          },
          error: {
            type: 'string',
            example: 'Bad Request'
          },
          mensaje: {
            type: 'string',
            example: 'Validación fallida'
          },
          detalles: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['El campo nombre es obligatorio']
          },
          path: {
            type: 'string',
            example: '/api/v1/pacientes'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['usuario', 'contrasena'],
        properties: {
          usuario: {
            type: 'string',
            example: 'admin'
          },
          contrasena: {
            type: 'string',
            example: 'Admin2024!'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token para autenticación'
          },
          usuario: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nombre: { type: 'string' },
              rol: { type: 'string' }
            }
          },
          expira_en: {
            type: 'string',
            example: '1h'
          }
        }
      },
      Paginacion: {
        type: 'object',
        properties: {
          paginaActual: {
            type: 'integer',
            example: 0
          },
          totalPaginas: {
            type: 'integer',
            example: 5
          },
          totalRegistros: {
            type: 'integer',
            example: 47
          },
          registrosPorPagina: {
            type: 'integer',
            example: 10
          }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticación de usuario y obtención de JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Autenticación exitosa',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse'
                }
              }
            }
          },
          '401': {
            description: 'Credenciales incorrectas',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/pacientes': {
      get: {
        tags: ['Pacientes'],
        summary: 'Listar pacientes con paginación y filtros',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Número de página (desde 0)'
          },
          {
            name: 'size',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Registros por página'
          },
          {
            name: 'estado',
            in: 'query',
            schema: { type: 'string', enum: ['ACTIVO', 'INACTIVO', 'EN_TRATAMIENTO'] }
          },
          {
            name: 'especialidad',
            in: 'query',
            schema: { type: 'string' }
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string' },
            description: 'Campo(s) de ordenamiento (separados por coma)'
          },
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'] }
          }
        ],
        responses: {
          '200': {
            description: 'Lista paginada de pacientes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Paciente' }
                    },
                    paginacion: { $ref: '#/components/schemas/Paginacion' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Pacientes'],
        summary: 'Registrar nuevo paciente',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Paciente'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Paciente creado exitosamente'
          },
          '400': {
            description: 'Datos inválidos'
          },
          '409': {
            description: 'DUI duplicado'
          }
        }
      }
    }
  }
};

module.exports = swaggerDocument;