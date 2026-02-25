import React, { useState, useEffect } from 'react';
import './DashboardOverview.css';

const DashboardOverview = ({ doctorData }) => {
  const [stats, setStats] = useState({
    todayAppointments: 5,
    weekAppointments: 23,
    totalPatients: 142,
    unreadMessages: 8
  });

  const [nextAppointments, setNextAppointments] = useState([
    { id: 1, patient: 'María González', time: '10:00 AM', type: 'Consulta' },
    { id: 2, patient: 'Juan Pérez', time: '11:30 AM', type: 'Seguimiento' },
    { id: 3, patient: 'Ana Martínez', time: '2:00 PM', type: 'Consulta' }
  ]);

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2>Bienvenido, Dr. {doctorData?.name || 'Usuario'}</h2>
        <p className="overview-date">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">Citas Hoy</p>
            <p className="stat-value">{stats.todayAppointments}</p>
          </div>
        </div>

        <div className="stat-card stat-secondary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Pacientes Esta Semana</p>
            <p className="stat-value">{stats.weekAppointments}</p>
          </div>
        </div>

        <div className="stat-card stat-tertiary">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <p className="stat-label">Total de Pacientes</p>
            <p className="stat-value">{stats.totalPatients}</p>
          </div>
        </div>

        <div className="stat-card stat-quaternary">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <p className="stat-label">Mensajes No Leídos</p>
            <p className="stat-value">{stats.unreadMessages}</p>
          </div>
        </div>
      </div>

      <div className="overview-section">
        <h3>Próximas Citas</h3>
        <div className="appointments-list">
          {nextAppointments.length > 0 ? (
            nextAppointments.map((apt) => (
              <div key={apt.id} className="appointment-item">
                <div className="appointment-time">
                  <span className="appointment-icon">⏰</span>
                  <span className="appointment-hour">{apt.time}</span>
                </div>
                <div className="appointment-details">
                  <p className="appointment-patient">{apt.patient}</p>
                  <p className="appointment-type">{apt.type}</p>
                </div>
                <button className="appointment-action">Ver</button>
              </div>
            ))
          ) : (
            <p className="empty-state">No hay citas programadas</p>
          )}
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-section">
          <h3>Actividad Reciente</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">✓</span>
              <div>
                <p className="activity-title">Cita completada</p>
                <p className="activity-description">Con Carlos López</p>
                <p className="activity-time">hace 2 horas</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📝</span>
              <div>
                <p className="activity-title">Historial actualizado</p>
                <p className="activity-description">Paciente: María González</p>
                <p className="activity-time">hace 4 horas</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">💬</span>
              <div>
                <p className="activity-title">Nuevo mensaje</p>
                <p className="activity-description">De: Juan Pérez</p>
                <p className="activity-time">hace 30 minutos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-section">
          <h3>Recordatorios</h3>
          <div className="reminders-list">
            <div className="reminder-item reminder-high">
              <span className="reminder-icon">🔴</span>
              <div>
                <p className="reminder-title">Cita urgente</p>
                <p className="reminder-description">En 15 minutos con Dr. Consulta</p>
              </div>
            </div>
            <div className="reminder-item reminder-medium">
              <span className="reminder-icon">🟡</span>
              <div>
                <p className="reminder-title">Preguntar por síntomas</p>
                <p className="reminder-description">Durante próxima cita de María</p>
              </div>
            </div>
            <div className="reminder-item reminder-low">
              <span className="reminder-icon">🟢</span>
              <div>
                <p className="reminder-title">Seguimiento de paciente</p>
                <p className="reminder-description">Ana Martinez - el próximo jueves</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
