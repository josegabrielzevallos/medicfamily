import React, { useState } from 'react';
import './DoctorAvailability.css';

const DoctorAvailability = () => {
  const [availability, setAvailability] = useState({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '10:00', end: '14:00', enabled: false },
    sunday: { start: '00:00', end: '00:00', enabled: false }
  });

  const [specialDays, setSpecialDays] = useState([
    { date: '2026-03-10', reason: 'Feriado', status: 'no-disponible' },
    { date: '2026-03-15', reason: 'Congresos Médicos', status: 'limitado' }
  ]);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handleTimeChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleToggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  return (
    <div className="doctor-availability">
      <div className="availability-container">
        <div className="availability-section">
          <h3>Horarios de Trabajo</h3>
          <p className="section-description">Configura tu disponibilidad semanal</p>

          <div className="schedule-grid">
            {daysOfWeek.map((day, idx) => (
              <div key={day} className={`schedule-item ${availability[day].enabled ? 'enabled' : 'disabled'}`}>
                <div className="schedule-header">
                  <label className="schedule-day">{dayLabels[idx]}</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={availability[day].enabled}
                      onChange={() => handleToggleDay(day)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {availability[day].enabled && (
                  <div className="schedule-times">
                    <div className="time-input-group">
                      <label>Inicio</label>
                      <input
                        type="time"
                        value={availability[day].start}
                        onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                      />
                    </div>
                    <div className="time-input-group">
                      <label>Fin</label>
                      <input
                        type="time"
                        value={availability[day].end}
                        onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {!availability[day].enabled && (
                  <p className="not-available">No disponible</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="availability-section">
          <h3>Días Especiales</h3>
          <p className="section-description">Períodos sin disponibilidad</p>

          <div className="special-days-list">
            {specialDays.map((day, idx) => (
              <div key={idx} className={`special-day-item status-${day.status}`}>
                <div className="special-day-info">
                  <p className="special-date">{new Date(day.date).toLocaleDateString('es-ES')}</p>
                  <p className="special-reason">{day.reason}</p>
                </div>
                <span className={`special-status ${day.status}`}>{day.status === 'no-disponible' ? 'No Disponible' : 'Limitado'}</span>
              </div>
            ))}
          </div>

          <button className="btn-add-special-day">+ Agregar Día Especial</button>
        </div>

        <div className="availability-actions">
          <button className="btn-save-schedule">💾 Guardar Cambios</button>
          <button className="btn-set-break">⏰ Establecer Descanso</button>
          <button className="btn-reset-time">↻ Restablecer Horario</button>
        </div>
      </div>

      <div className="availability-info">
        <div className="info-box">
          <h4>💡 Información</h4>
          <p>Estos horarios se mostrarán a los pacientes para que puedan agendar citas.</p>
        </div>

        <div className="info-box">
          <h4>⚙️ Duración de Citas</h4>
          <div className="duration-settings">
            <label>Duración estándar:</label>
            <select className="duration-select">
              <option>15 minutos</option>
              <option>30 minutos</option>
              <option>45 minutos</option>
              <option>60 minutos</option>
            </select>
          </div>
        </div>

        <div className="info-box">
          <h4>📊 Resumen</h4>
          <div className="summary-stats">
            <div className="summary-item">
              <span>Horas disponibles/semana:</span>
              <strong>40 horas</strong>
            </div>
            <div className="summary-item">
              <span>Días de trabajo:</span>
              <strong>5 días</strong>
            </div>
            <div className="summary-item">
              <span>Próximo descanso:</span>
              <strong>10 Marzo 2026</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
