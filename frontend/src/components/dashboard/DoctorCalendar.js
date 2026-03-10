import React, { useState, useEffect, useCallback } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { appointmentAPI, patientAPI } from '../../api/client';
import './DoctorCalendar.css';

const STATUS_LABEL = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};
const STATUS_COLOR = {
  pending: '#ed8936',
  confirmed: '#48bb78',
  completed: '#667eea',
  cancelled: '#f56565',
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const buildDateStr = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// ─── Modal nueva cita ──────────────────────────────────────────────────────────
const NewAppointmentModal = ({ onClose, onCreated }) => {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    patient_id: '',
    appointment_date: '',
    appointment_time: '09:00',
    appointment_type: 'presencial',
    reason: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    patientAPI.forDoctor().then(r => setPatients(r.data || [])).catch(() => {});
  }, []);

  const filteredPatients = patients.filter(p => {
    const name = `${p.user?.first_name} ${p.user?.last_name}`.toLowerCase();
    const email = p.user?.email?.toLowerCase() || '';
    return name.includes(query.toLowerCase()) || email.includes(query.toLowerCase());
  });

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    setForm(f => ({ ...f, patient_id: p.id }));
    setQuery(`${p.user?.first_name} ${p.user?.last_name}`.trim());
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.patient_id) { setError('Selecciona un paciente.'); return; }
    if (!form.appointment_date) { setError('Indica la fecha.'); return; }
    if (!form.reason.trim()) { setError('Ingresa el motivo de la consulta.'); return; }

    const datetime = `${form.appointment_date}T${form.appointment_time}:00`;
    setSaving(true);
    try {
      await appointmentAPI.create({
        patient_id: form.patient_id,
        appointment_date: datetime,
        appointment_type: form.appointment_type,
        reason: form.reason,
        status: 'confirmed',
      });
      onCreated();
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'string'
          ? data
          : Object.values(data || {}).flat().join(' ') || 'Error al crear la cita.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nueva Cita</h3>
          <button className="modal-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Paciente</label>
            <div className="patient-search-wrapper">
              <SearchIcon className="search-icon" fontSize="small" />
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowDropdown(true); setSelectedPatient(null); setForm(f => ({ ...f, patient_id: '' })); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Buscar paciente..."
                autoComplete="off"
              />
              {showDropdown && query.length > 0 && (
                <ul className="patient-dropdown">
                  {filteredPatients.length === 0
                    ? <li className="no-results">Sin resultados</li>
                    : filteredPatients.map(p => (
                        <li key={p.id} onClick={() => handleSelectPatient(p)}>
                          <PersonIcon fontSize="small" />
                          <span>{p.user?.first_name} {p.user?.last_name}</span>
                          <span className="patient-email">{p.user?.email}</span>
                        </li>
                      ))
                  }
                </ul>
              )}
            </div>
            {selectedPatient && (
              <p className="selected-patient-info">
                ✅ {selectedPatient.user?.first_name} {selectedPatient.user?.last_name} — ID {selectedPatient.id}
              </p>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={form.appointment_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input
                type="time"
                value={form.appointment_time}
                onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Tipo de consulta</label>
            <select
              value={form.appointment_type}
              onChange={e => setForm(f => ({ ...f, appointment_type: e.target.value }))}
            >
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
          <div className="form-group">
            <label>Motivo de consulta</label>
            <textarea
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              rows={3}
              placeholder="Describe el motivo de la consulta..."
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────────
const DoctorCalendar = ({ doctorData, onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadAppointments = useCallback(() => {
    setLoading(true);
    appointmentAPI.getAll()
      .then(response => setAppointments(response.data?.results || response.data || []))
      .catch(err => console.error('Error loading appointments:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  const handleAction = async (apt, action) => {
    setActionLoading(apt.id);
    try {
      if (action === 'confirm') await appointmentAPI.confirm(apt.id);
      else if (action === 'complete') await appointmentAPI.complete(apt.id);
      else if (action === 'cancel') await appointmentAPI.cancel(apt.id);
      showToast(
        action === 'confirm' ? 'Cita confirmada ✓'
        : action === 'complete' ? 'Cita completada ✓'
        : 'Cita cancelada ✓'
      );
      loadAppointments();
    } catch {
      showToast('Error al actualizar la cita');
    } finally {
      setActionLoading(null);
    }
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const getDateStr = (apt) => apt.appointment_date?.substring(0, 10) || '';
  const getTimeStr = (apt) => {
    if (!apt.appointment_date) return '';
    return new Date(apt.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };
  const getPatientName = (apt) => {
    if (apt.patient?.user) {
      const n = `${apt.patient.user.first_name} ${apt.patient.user.last_name}`.trim();
      return n || `Paciente #${apt.patient.id}`;
    }
    return `Paciente #${apt.patient?.id || '?'}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} className="calendar-day empty" />);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = buildDateStr(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayApts = appointments.filter(a => getDateStr(a) === dateStr);
      const isToday =
        i === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();
      const isSelected = selectedDay === dateStr;
      days.push(
        <div
          key={`d-${i}`}
          className={`calendar-day${isToday ? ' today' : ''}${dayApts.length ? ' has-appointments' : ''}${isSelected ? ' selected' : ''}`}
          onClick={() => setSelectedDay(isSelected ? null : dateStr)}
        >
          <span className="day-number">{i}</span>
          {dayApts.length > 0 && (
            <div className="day-appointments">
              {dayApts.slice(0, 3).map((_, idx) => <div key={idx} className="appointment-dot" />)}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const todayStr = buildDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const displayApts = selectedDay
    ? appointments.filter(a => getDateStr(a) === selectedDay)
    : appointments.filter(a => getDateStr(a) === todayStr);
  const displayLabel = selectedDay
    ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'Hoy';
  const upcomingApts = appointments
    .filter(a => (a.status === 'pending' || a.status === 'confirmed') && getDateStr(a) >= todayStr)
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
    .slice(0, 5);

  return (
    <>
      {toast && <div className="calendar-toast">{toast}</div>}

      <div className="doctor-calendar">
        {/* ── Calendario ── */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={prevMonth} className="nav-button"><ChevronLeftIcon /></button>
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={nextMonth} className="nav-button"><ChevronRightIcon /></button>
          </div>
          <div className="calendar-weekdays">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="weekday">{d}</div>
            ))}
          </div>
          <div className="calendar-days">
            {loading
              ? <p style={{ padding: '20px', color: '#718096', gridColumn: '1/-1' }}>Cargando…</p>
              : renderCalendar()
            }
          </div>
          <div className="calendar-legend">
            <div className="legend-item"><span className="legend-dot today-dot" /><span>Hoy</span></div>
            <div className="legend-item"><span className="legend-dot appointment-dot" /><span>Con citas</span></div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="appointments-sidebar">
          <div className="sidebar-section">
            <h4><TodayIcon fontSize="small" /> {displayLabel}</h4>
            {displayApts.length > 0 ? (
              <div className="appointments-today">
                {displayApts.map((apt) => (
                  <div key={apt.id} className="appointment-card">
                    <div className="appointment-header">
                      <span className="appointment-time">
                        <AccessTimeIcon fontSize="small" /> {getTimeStr(apt)}
                      </span>
                      <span
                        className="appointment-badge"
                        style={{ background: STATUS_COLOR[apt.status] || '#718096' }}
                      >
                        {STATUS_LABEL[apt.status] || apt.status}
                      </span>
                    </div>
                    <div className="appointment-body">
                      <p className="appointment-patient-name">
                        <PersonIcon fontSize="small" /> {getPatientName(apt)}
                      </p>
                      {apt.reason && <p className="appointment-reason">{apt.reason}</p>}
                      {apt.appointment_type && (
                        <span className="appointment-type-badge">{apt.appointment_type}</span>
                      )}
                    </div>
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <div className="appointment-actions">
                        {apt.status === 'pending' && (
                          <button
                            className="action-btn confirm"
                            disabled={actionLoading === apt.id}
                            onClick={() => handleAction(apt, 'confirm')}
                          >
                            <CheckCircleIcon fontSize="small" />
                            {actionLoading === apt.id ? '…' : 'Confirmar'}
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            className="action-btn complete"
                            disabled={actionLoading === apt.id}
                            onClick={() => handleAction(apt, 'complete')}
                          >
                            <DoneAllIcon fontSize="small" />
                            {actionLoading === apt.id ? '…' : 'Completar'}
                          </button>
                        )}
                        <button
                          className="action-btn cancel"
                          disabled={actionLoading === apt.id}
                          onClick={() => handleAction(apt, 'cancel')}
                        >
                          <CancelIcon fontSize="small" />
                          {actionLoading === apt.id ? '…' : 'Cancelar'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-appointments">No hay citas para este día</p>
            )}
          </div>

          <div className="sidebar-section">
            <h4>Próximas Citas</h4>
            <div className="upcoming-appointments">
              {upcomingApts.length > 0 ? upcomingApts.map((apt) => (
                <div key={apt.id} className="upcoming-item">
                  <span className="upcoming-date">{getDateStr(apt).substring(5)}</span>
                  <span className="upcoming-time">{getTimeStr(apt)}</span>
                  <span className="upcoming-patient">{getPatientName(apt)}</span>
                  <span
                    className="upcoming-status-dot"
                    style={{ background: STATUS_COLOR[apt.status] }}
                    title={STATUS_LABEL[apt.status]}
                  />
                </div>
              )) : (
                <p className="empty-appointments">No hay citas próximas</p>
              )}
            </div>
          </div>

          <button className="btn-new-appointment" onClick={() => setShowModal(true)}>
            <AddIcon /> Nueva Cita
          </button>
        </div>
      </div>

      {showModal && (
        <NewAppointmentModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            loadAppointments();
            showToast('¡Cita creada exitosamente! ✓');
          }}
        />
      )}
    </>
  );
};

export default DoctorCalendar;
