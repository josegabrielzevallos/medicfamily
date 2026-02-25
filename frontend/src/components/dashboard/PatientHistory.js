import React, { useState } from 'react';
import './PatientHistory.css';

const PatientHistory = () => {
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'María González',
      age: 35,
      gender: 'Femenino',
      phone: '(+51) 987 654 321',
      email: 'maria@email.com',
      lastVisit: '2026-02-20',
      reason: 'Dolor de cabeza',
      status: 'Activo'
    },
    {
      id: 2,
      name: 'Juan Pérez',
      age: 42,
      gender: 'Masculino',
      phone: '(+51) 987 123 456',
      email: 'juan@email.com',
      lastVisit: '2026-02-18',
      reason: 'Hipertensión',
      status: 'Activo'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      age: 28,
      gender: 'Femenino',
      phone: '(+51) 987 789 012',
      email: 'ana@email.com',
      lastVisit: '2026-02-10',
      reason: 'Revisión general',
      status: 'Activo'
    },
    {
      id: 4,
      name: 'Carlos López',
      age: 50,
      gender: 'Masculino',
      phone: '(+51) 987 456 789',
      email: 'carlos@email.com',
      lastVisit: '2026-01-30',
      reason: 'Control de peso',
      status: 'Inactivo'
    }
  ]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="patient-history">
      <div className="patients-list-container">
        <div className="list-controls">
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option>Todos</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>

        <div className="patients-table-wrapper">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Teléfono</th>
                <th>Última Cita</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className={`patient-row ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <td className="patient-name">
                    <span className="patient-initial">{patient.name.charAt(0)}</span>
                    {patient.name}
                  </td>
                  <td>{patient.age}</td>
                  <td>{patient.phone}</td>
                  <td>{new Date(patient.lastVisit).toLocaleDateString('es-ES')}</td>
                  <td>
                    <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-row-action view-btn">Ver</button>
                    <button className="btn-row-action edit-btn">✎</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="empty-state-table">
            <p>No se encontraron pacientes</p>
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="patient-detail">
          <div className="detail-header">
            <h3>Información del Paciente</h3>
            <button className="close-btn" onClick={() => setSelectedPatient(null)}>✕</button>
          </div>

          <div className="detail-content">
            <div className="patient-header-info">
              <div className="patient-avatar"></div>
              <div className="patient-main-info">
                <h4>{selectedPatient.name}</h4>
                <p>{selectedPatient.age} años - {selectedPatient.gender}</p>
              </div>
            </div>

            <div className="detail-section">
              <h5>Información de Contacto</h5>
              <div className="info-row">
                <label>Teléfono</label>
                <p>{selectedPatient.phone}</p>
              </div>
              <div className="info-row">
                <label>Email</label>
                <p>{selectedPatient.email}</p>
              </div>
            </div>

            <div className="detail-section">
              <h5>Historial Médico</h5>
              <div className="info-row">
                <label>Última Cita</label>
                <p>{new Date(selectedPatient.lastVisit).toLocaleDateString('es-ES')}</p>
              </div>
              <div className="info-row">
                <label>Motivo Última Consulta</label>
                <p>{selectedPatient.reason}</p>
              </div>
              <div className="info-row">
                <label>Estado</label>
                <span className={`status-badge status-${selectedPatient.status.toLowerCase()}`}>
                  {selectedPatient.status}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h5>Historial de Citas</h5>
              <div className="appointments-history">
                <div className="history-item">
                  <span className="history-date">20 Feb 2026</span>
                  <span className="history-reason">Dolor de cabeza - Completa</span>
                </div>
                <div className="history-item">
                  <span className="history-date">15 Feb 2026</span>
                  <span className="history-reason">Seguimiento - Completa</span>
                </div>
                <div className="history-item">
                  <span className="history-date">08 Feb 2026</span>
                  <span className="history-reason">Revisión general - Completa</span>
                </div>
              </div>
            </div>

            <div className="detail-actions">
              <button className="btn-action primary">📅 Nueva Cita</button>
              <button className="btn-action secondary">📝 Ver Historial Completo</button>
              <button className="btn-action danger">📋 Descargar Reporte</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
