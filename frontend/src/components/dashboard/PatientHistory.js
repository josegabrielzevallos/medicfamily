import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { appointmentAPI } from '../../api/client';
import './PatientHistory.css';

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    setLoading(true);
    appointmentAPI.getAll()
      .then(response => {
        const all = response.data?.results || response.data || [];
        setAppointments(all);

        // Build unique patient map from appointments
        const patientMap = {};
        all.forEach(apt => {
          if (!apt.patient) return;
          const pid = apt.patient.id;
          if (!patientMap[pid]) {
            const u = apt.patient.user || {};
            patientMap[pid] = {
              id: pid,
              name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || `Paciente #${pid}`,
              email: u.email || '—',
              phone: apt.patient.phone || '—',
              blood_type: apt.patient.blood_type || '',
              appointments: [],
            };
          }
          patientMap[pid].appointments.push(apt);
        });

        // Sort each patient's appointments descending and compute last visit
        const derived = Object.values(patientMap).map(p => {
          const sorted = [...p.appointments].sort(
            (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)
          );
          return {
            ...p,
            lastVisit: sorted[0]?.appointment_date || null,
            lastReason: sorted[0]?.reason || '—',
            totalVisits: sorted.length,
            hasActive: sorted.some(a => a.status === 'pending' || a.status === 'confirmed'),
          };
        });

        setPatients(derived.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit)));
      })
      .catch(err => console.error('Error loading patients:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'Todos' ||
      (filterStatus === 'Activo' && p.hasActive) ||
      (filterStatus === 'Inactivo' && !p.hasActive);
    return matchesSearch && matchesStatus;
  });

  const selectedApts = selectedPatient
    ? appointments
        .filter(a => a.patient?.id === selectedPatient.id)
        .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
    : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusLabel = { pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' };

  return (
    <div className="patient-history">
      <div className="patients-list-container">
        <div className="list-controls">
          <div className="search-wrapper">
            <SearchIcon className="search-icon-inner" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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

        {loading ? (
          <p style={{ padding: '30px', color: '#718096', textAlign: 'center' }}>Cargando pacientes…</p>
        ) : (
          <div className="patients-table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Última Cita</th>
                  <th>Citas</th>
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
                      <span className="patient-initial">{patient.name.charAt(0).toUpperCase()}</span>
                      {patient.name}
                    </td>
                    <td>{patient.email}</td>
                    <td>{formatDate(patient.lastVisit)}</td>
                    <td>{patient.totalVisits}</td>
                    <td>
                      <span className={`status-badge ${patient.hasActive ? 'status-activo' : 'status-inactivo'}`}>
                        {patient.hasActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-row-action view-btn" onClick={() => setSelectedPatient(patient)}>Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPatients.length === 0 && (
              <div className="empty-state-table"><p>No se encontraron pacientes</p></div>
            )}
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="patient-detail">
          <div className="detail-header">
            <h3>Información del Paciente</h3>
            <button className="close-btn" onClick={() => setSelectedPatient(null)}>
              <CloseIcon />
            </button>
          </div>

          <div className="detail-content">
            <div className="patient-header-info">
              <div className="patient-avatar">
                <PersonIcon sx={{ fontSize: 40, color: '#667eea' }} />
              </div>
              <div className="patient-main-info">
                <h4>{selectedPatient.name}</h4>
                {selectedPatient.blood_type && <p>Grupo sanguíneo: <strong>{selectedPatient.blood_type}</strong></p>}
              </div>
            </div>

            <div className="detail-section">
              <h5>Información de Contacto</h5>
              <div className="info-row">
                <label><PhoneIcon fontSize="small" /> Teléfono</label>
                <p>{selectedPatient.phone}</p>
              </div>
              <div className="info-row">
                <label><EmailIcon fontSize="small" /> Email</label>
                <p>{selectedPatient.email}</p>
              </div>
            </div>

            <div className="detail-section">
              <h5><CalendarMonthIcon fontSize="small" /> Historial de Citas ({selectedApts.length})</h5>
              <div className="appointments-history">
                {selectedApts.length > 0 ? selectedApts.map(apt => (
                  <div key={apt.id} className="history-item">
                    <span className="history-date">{formatDate(apt.appointment_date)}</span>
                    <span className="history-reason">
                      {apt.reason || apt.appointment_type || 'Consulta'} —{' '}
                      <span className={`history-status status-${apt.status}`}>
                        {statusLabel[apt.status] || apt.status}
                      </span>
                    </span>
                  </div>
                )) : (
                  <p style={{ color: '#a0aec0' }}>No hay citas registradas</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
