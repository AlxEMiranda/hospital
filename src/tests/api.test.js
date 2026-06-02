const request = require('supertest');
const app = require('../src/app');
const { database } = require('../src/config/database');

let tokenAdmin, tokenMedico, tokenRecep, pacienteId, versionActual;

describe(' API Hospitalaria - Pruebas de Integración', () => {
  
  beforeAll(async () => {
    // Limpiar DB antes de tests
    database.pacientes.clear();
    database.auditoria = [];
  });

  // 1. Login Exitoso
  test('1. Login exitoso como ADMIN', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ usuario: 'admin', contrasena: 'Admin2024!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    tokenAdmin = res.body.token;
  });

  // 2. Login Fallido
  test('2. Login con credenciales incorrectas (401)', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ usuario: 'admin', contrasena: 'wrong' });
    expect(res.status).toBe(401);
  });

  // 3. Acceso sin token
  test('3. Acceso sin token (401)', async () => {
    const res = await request(app).get('/api/v1/pacientes');
    expect(res.status).toBe(401);
  });

  // 4. Acceso con rol insuficiente
  test('4. Recepción intenta eliminar (403)', async () => {
    const resLogin = await request(app).post('/api/v1/auth/login').send({ usuario: 'recepcion', contrasena: 'Recep123!' });
    tokenRecep = resLogin.body.token;
    const res = await request(app).delete('/api/v1/pacientes/123').set('Authorization', `Bearer ${tokenRecep}`);
    expect(res.status).toBe(403);
  });

  // 5. Registrar Paciente Válido
  test('5. Registrar paciente válido (201)', async () => {
    const res = await request(app).post('/api/v1/pacientes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Juan', apellido: 'Perez', edad: 45, dui: '01234567-8',
        diagnostico: 'Hipertensión arterial controlada', especialidad: 'CARDIOLOGIA'
      });
    expect(res.status).toBe(201);
    pacienteId = res.body.data.id;
    versionActual = res.body.data.version;
  });

  // 6. Registro con datos inválidos
  test('6. Registrar paciente con datos inválidos (400)', async () => {
    const res = await request(app).post('/api/v1/pacientes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'J', edad: -5, dui: '123' });
    expect(res.status).toBe(400);
  });

  // 7. DUI Duplicado
  test('7. Registrar DUI duplicado (409)', async () => {
    const res = await request(app).post('/api/v1/pacientes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Maria', apellido: 'Lopez', edad: 30, dui: '01234567-8',
        diagnostico: 'Diagnostico de prueba duplicado', especialidad: 'GENERAL'
      });
    expect(res.status).toBe(409);
  });

  // 8. Listar con Paginación
  test('8. Listar pacientes paginado (200)', async () => {
    const res = await request(app).get('/api/v1/pacientes?page=0&size=5').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body).toHaveProperty('paginacion');
  });

  // 9. Filtrar por estado
  test('9. Filtrar por estado (200)', async () => {
    const res = await request(app).get('/api/v1/pacientes?estado=ACTIVO').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    res.body.data.forEach(p => expect(p.estado).toBe('ACTIVO'));
  });

  // 10. Agregar Consulta (Login Médico)
  test('10. Agregar consulta médica (201)', async () => {
    const resLogin = await request(app).post('/api/v1/auth/login').send({ usuario: 'dr.garcia', contrasena: 'Medico1!' });
    tokenMedico = resLogin.body.token;

    const res = await request(app).post(`/api/v1/pacientes/${pacienteId}/consultas`)
      .set('Authorization', `Bearer ${tokenMedico}`)
      .send({ medico: 'dr.garcia', notas: 'Paciente estable, continuar tratamiento', medicamentos: ['Losartan'] });
    expect(res.status).toBe(201);
  });

  // 11. Eliminación Lógica
  test('11. Eliminar paciente lógicamente (204)', async () => {
    const res = await request(app).delete(`/api/v1/pacientes/${pacienteId}`).set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(204);
  });

  // 12. Consultar Estadísticas
  test('12. Consultar estadísticas (200)', async () => {
    const res = await request(app).get('/api/v1/estadisticas').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalPacientes');
  });
});