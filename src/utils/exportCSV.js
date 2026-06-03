function exportToCSV(pacientes) {
  if (!pacientes || pacientes.length === 0) return '';

  // BOM para que Excel lea correctamente tildes y ñ
  const BOM = '\uFEFF'; 
  const headers = ['ID', 'Nombre', 'Apellido', 'Edad', 'DUI', 'Diagnóstico', 'Especialidad', 'Estado', 'Fecha Ingreso'];
  
  const rows = pacientes.map(p => [
    p.id,
    `"${p.nombre}"`,
    `"${p.apellido}"`,
    p.edad,
    `"${p.dui}"`,
    `"${p.diagnostico.replace(/"/g, '""')}"`,
    p.especialidad,
    p.estado,
    p.fechaIngreso
  ]);

  return BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

module.exports = { exportToCSV };