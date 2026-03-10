import React, { useState, useEffect } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { appointmentAPI } from '../../api/client';
import './Reports.css';

const Reports = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    setLoading(true);
    appointmentAPI.getAll()
      .then(r => setAppointments(r.data?.results || r.data || []))
      .catch(err => console.error('Error loading reports:', err))
      .finally(() => setLoading(false));
  }, []);

  // Filter appointments by period
  const now = new Date();
  const filtered = appointments.filter(apt => {
    if (!apt.appointment_date) return false;
    const d = new Date(apt.appointment_date);
    if (period === 'monthly') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (period === 'quarterly') {
      const q = Math.floor(now.getMonth() / 3);
      return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear();
    }
    if (period === 'yearly') {
      return d.getFullYear() === now.getFullYear();
    }
    return true; // 'all'
  });

  const total = filtered.length;
  const completed = filtered.filter(a => a.status === 'completed').length;
  const cancelled = filtered.filter(a => a.status === 'cancelled').length;
  const pending = filtered.filter(a => a.status === 'pending' || a.status === 'confirmed').length;

  // Unique patients
  const uniquePatientIds = new Set(filtered.map(a => a.patient?.id).filter(Boolean));
  const uniquePatients = uniquePatientIds.size;

  // Income from completed appointments with consultation_fee
  const totalIncome = filtered
    .filter(a => a.status === 'completed' && a.doctor?.consultation_fee)
    .reduce((sum, a) => sum + parseFloat(a.doctor.consultation_fee || 0), 0);

  // Appointment type breakdown
  const typeBreakdown = filtered.reduce((acc, a) => {
    const t = a.appointment_type || 'Consulta';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Monthly count for bar chart (last 6 months)
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString('es-ES', { month: 'short' });
    const count = appointments.filter(a => {
      if (!a.appointment_date) return false;
      const ad = new Date(a.appointment_date);
      return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
    }).length;
    return { label, count };
  });
  const maxCount = Math.max(...last6.map(m => m.count), 1);

  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="reports">
      <div className="reports-header">
        <h2>Reportes y Estadísticas</h2>
        <div className="report-filters">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="monthly">Este mes</option>
            <option value="quarterly">Este trimestre</option>
            <option value="yearly">Este año</option>
            <option value="all">Todo el tiempo</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>Cargando estadísticas…</p>
      ) : (
        <>
          <div className="reports-grid">
            <div className="report-card">
              <div className="report-icon"><CalendarMonthIcon fontSize="large" /></div>
              <div className="report-content">
                <p className="report-label">Total de Citas</p>
                <p className="report-value">{total}</p>
                <p className="report-detail">{pending} pendientes</p>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon"><CheckCircleIcon fontSize="large" style={{ color: '#48bb78' }} /></div>
              <div className="report-content">
                <p className="report-label">Completadas</p>
                <p className="report-value">{completed}</p>
                <p className="report-detail">Tasa: {completionRate}%</p>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon"><CancelIcon fontSize="large" style={{ color: '#f56565' }} /></div>
              <div className="report-content">
                <p className="report-label">Canceladas</p>
                <p className="report-value">{cancelled}</p>
                <p className="report-detail">{total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0'}% del total</p>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon"><PeopleIcon fontSize="large" style={{ color: '#764ba2' }} /></div>
              <div className="report-content">
                <p className="report-label">Pacientes Atendidos</p>
                <p className="report-value">{uniquePatients}</p>
                <p className="report-detail">pacientes únicos</p>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon"><AttachMoneyIcon fontSize="large" style={{ color: '#ed8936' }} /></div>
              <div className="report-content">
                <p className="report-label">Ingresos Estimados</p>
                <p className="report-value">S/ {totalIncome.toFixed(2)}</p>
                <p className="report-detail">de citas completadas</p>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon"><BarChartIcon fontSize="large" style={{ color: '#4facfe' }} /></div>
              <div className="report-content">
                <p className="report-label">Tasa de Finalización</p>
                <p className="report-value">{completionRate}%</p>
                <p className="report-detail">{completed} de {total} citas</p>
              </div>
            </div>
          </div>

          {Object.keys(typeBreakdown).length > 0 && (
            <div className="reports-section">
              <h3>Tipos de Consulta</h3>
              <div className="type-breakdown">
                {Object.entries(typeBreakdown).map(([type, count]) => (
                  <div key={type} className="type-item">
                    <span className="type-name">{type}</span>
                    <div className="type-bar-wrapper">
                      <div
                        className="type-bar"
                        style={{ width: `${(count / total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="type-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="reports-section">
            <h3>Actividad Mensual (últimos 6 meses)</h3>
            <div className="activity-chart">
              <div className="bar-chart">
                {last6.map((m, i) => (
                  <div key={i} className="bar-item">
                    <div className="bar-container">
                      <div
                        className="bar"
                        style={{ height: `${(m.count / maxCount) * 100}%` }}
                        title={`${m.count} citas`}
                      ></div>
                    </div>
                    <span className="bar-label">{m.label}</span>
                    <span className="bar-value">{m.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
