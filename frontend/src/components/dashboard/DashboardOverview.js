import React, { useState, useEffect } from 'react';
import TodayIcon from '@mui/icons-material/Today';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MessageIcon from '@mui/icons-material/Message';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { appointmentAPI } from '../../api/client';
import './DashboardOverview.css';

const DashboardOverview = ({ doctorData, onNavigate }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalAppointments: 0,
  });

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    appointmentAPI.getAll()
      .then(response => {
        const all = response.data?.results || response.data || [];
        setAppointments(all);
        const today = all.filter(a => a.appointment_date && a.appointment_date.startsWith(todayStr));
        const pending = all.filter(a => a.status === 'pending' || a.status === 'confirmed');
        const completed = all.filter(a => a.status === 'completed');
        setStats({
          todayAppointments: today.length,
          pendingAppointments: pending.length,
          completedAppointments: completed.length,
          totalAppointments: all.length,
        });
      })
      .catch(err => console.error('Error fetching appointments:', err))
      .finally(() => setLoading(false));
  }, [todayStr]);

  const upcoming = appointments
    .filter(a => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
    .slice(0, 5);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusLabel = (status) => ({
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }[status] || status);

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2>Bienvenido, Dr. {doctorData?.name || 'Usuario'}</h2>
        <p className="overview-date">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon"><TodayIcon fontSize="large" /></div>
          <div className="stat-content">
            <p className="stat-label">Citas Hoy</p>
            <p className="stat-value">{loading ? '…' : stats.todayAppointments}</p>
          </div>
        </div>
        <div className="stat-card stat-secondary">
          <div className="stat-icon"><AccessTimeIcon fontSize="large" /></div>
          <div className="stat-content">
            <p className="stat-label">Citas Pendientes</p>
            <p className="stat-value">{loading ? '…' : stats.pendingAppointments}</p>
          </div>
        </div>
        <div className="stat-card stat-tertiary">
          <div className="stat-icon"><CheckCircleIcon fontSize="large" /></div>
          <div className="stat-content">
            <p className="stat-label">Completadas</p>
            <p className="stat-value">{loading ? '…' : stats.completedAppointments}</p>
          </div>
        </div>
        <div className="stat-card stat-quaternary">
          <div className="stat-icon"><CalendarMonthIcon fontSize="large" /></div>
          <div className="stat-content">
            <p className="stat-label">Total de Citas</p>
            <p className="stat-value">{loading ? '…' : stats.totalAppointments}</p>
          </div>
        </div>
      </div>

      <div className="overview-section">
        <h3>Próximas Citas</h3>
        <div className="appointments-list">
          {loading ? (
            <p className="empty-state">Cargando citas…</p>
          ) : upcoming.length > 0 ? (
            upcoming.map((apt) => {
              const patientName = apt.patient?.user
                ? `${apt.patient.user.first_name} ${apt.patient.user.last_name}`.trim()
                : `Paciente #${apt.patient?.id || '?'}`;
              return (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-time">
                    <AccessTimeIcon fontSize="small" className="appointment-icon" />
                    <span className="appointment-hour">{formatDateTime(apt.appointment_date)}</span>
                  </div>
                  <div className="appointment-details">
                    <p className="appointment-patient"><PersonIcon fontSize="small" /> {patientName}</p>
                    <p className="appointment-type">{apt.appointment_type || 'Consulta'}</p>
                  </div>
                  <span className={`appointment-status status-${apt.status}`}>{statusLabel(apt.status)}</span>
                </div>
              );
            })
          ) : (
            <p className="empty-state">No hay citas pendientes</p>
          )}
        </div>
      </div>

      <div className="overview-section quick-actions-section">
        <h3>Acciones Rápidas</h3>
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => onNavigate && onNavigate('calendar')}>
            <TodayIcon /> Ver Calendario
          </button>
          <button className="quick-action-btn" onClick={() => onNavigate && onNavigate('availability')}>
            <AccessTimeIcon /> Disponibilidad
          </button>
          <button className="quick-action-btn" onClick={() => onNavigate && onNavigate('profile')}>
            <PersonIcon /> Editar Perfil
          </button>
          <button className="quick-action-btn" onClick={() => onNavigate && onNavigate('messages')}>
            <MessageIcon /> Mensajes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
