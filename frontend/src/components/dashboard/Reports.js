import React, { useState } from 'react';
import './Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [reports, setReports] = useState([
    {
      id: 1,
      title: 'Reporte de Citas - Febrero 2026',
      date: '2026-02-28',
      type: 'appointments',
      stats: { total: 45, completed: 42, cancelled: 3 }
    },
    {
      id: 2,
      title: 'Reporte de Pacientes - Febrero 2026',
      date: '2026-02-28',
      type: 'patients',
      stats: { new: 8, active: 142, inactive: 56 }
    },
    {
      id: 3,
      title: 'Reporte de Ingresos - Febrero 2026',
      date: '2026-02-28',
      type: 'income',
      stats: { total: 4250, average: 101 }
    }
  ]);

  const [monthlyStats, setMonthlyStats] = useState({
    totalAppointments: 156,
    completedAppointments: 148,
    cancelledAppointments: 8,
    totalPatients: 142,
    newPatients: 12,
    totalIncome: 12500,
    averageRating: 4.8
  });

  return (
    <div className="reports">
      <div className="reports-header">
        <h2>Reportes y Estadísticas</h2>
        <div className="report-filters">
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
          <button className="btn-export">📥 Exportar</button>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-icon">📅</div>
          <div className="report-content">
            <p className="report-label">Total de Citas</p>
            <p className="report-value">{monthlyStats.totalAppointments}</p>
            <p className="report-detail">↑ 12% respecto al mes anterior</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">✓</div>
          <div className="report-content">
            <p className="report-label">Citas Completadas</p>
            <p className="report-value">{monthlyStats.completedAppointments}</p>
            <p className="report-detail">Tasa: {((monthlyStats.completedAppointments/monthlyStats.totalAppointments)*100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">👥</div>
          <div className="report-content">
            <p className="report-label">Nuevos Pacientes</p>
            <p className="report-value">{monthlyStats.newPatients}</p>
            <p className="report-detail">Total: {monthlyStats.totalPatients}</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">💰</div>
          <div className="report-content">
            <p className="report-label">Ingresos</p>
            <p className="report-value">S/ {monthlyStats.totalIncome}</p>
            <p className="report-detail">Promedio: S/ {monthlyStats.averageRating}</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">⭐</div>
          <div className="report-content">
            <p className="report-label">Calificación</p>
            <p className="report-value">{monthlyStats.averageRating}/5</p>
            <p className="report-detail">Basado en 48 reseñas</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">📊</div>
          <div className="report-content">
            <p className="report-label">Tasa de Retención</p>
            <p className="report-value">78%</p>
            <p className="report-detail">Pacientes que volvieron</p>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <h3>Reportes Generados</h3>
        <div className="reports-list">
          {reports.map(report => (
            <div key={report.id} className={`report-item report-${report.type}`}>
              <div className="report-item-content">
                <h4>{report.title}</h4>
                <p className="report-item-date">{new Date(report.date).toLocaleDateString('es-ES')}</p>
                <div className="report-item-stats">
                  {Object.entries(report.stats).map(([key, value]) => (
                    <span key={key} className="stat-tag">{key}: {value}</span>
                  ))}
                </div>
              </div>
              <div className="report-item-actions">
                <button className="btn-view">👁️ Ver</button>
                <button className="btn-download">⬇️ Descargar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports-section">
        <h3>Gráfica de Actividad</h3>
        <div className="activity-chart">
          <div className="chart-placeholder">
            <p>📊 Gráfica de tendencias</p>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-around', 
                height: '100px',
                alignItems: 'flex-end',
                gap: '10px'
              }}>
                <div style={{ width: '40px', height: '60%', background: '#667eea', borderRadius: '4px' }}></div>
                <div style={{ width: '40px', height: '75%', background: '#667eea', borderRadius: '4px' }}></div>
                <div style={{ width: '40px', height: '85%', background: '#764ba2', borderRadius: '4px' }}></div>
                <div style={{ width: '40px', height: '70%', background: '#667eea', borderRadius: '4px' }}></div>
                <div style={{ width: '40px', height: '90%', background: '#764ba2', borderRadius: '4px' }}></div>
              </div>
              <p style={{ marginTop: '15px', color: '#718096', fontSize: '12px' }}>Últimas 5 semanas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
