import React, { useState } from 'react';
import './DoctorCalendar.css';

const DoctorCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 24)); // 24 de febrero
  const [appointments, setAppointments] = useState([
    { date: '2026-02-24', time: '10:00', patient: 'María González', type: 'Consulta General' },
    { date: '2026-02-24', time: '11:30', patient: 'Juan Pérez', type: 'Seguimiento' },
    { date: '2026-02-25', time: '14:00', patient: 'Ana Martínez', type: 'Consulta General' },
    { date: '2026-02-26', time: '09:00', patient: 'Carlos López', type: 'Examen' }
  ]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(apt => apt.date === dateStr);
      const isToday = i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day ${isToday ? 'today' : ''} ${dayAppointments.length > 0 ? 'has-appointments' : ''}`}
        >
          <span className="day-number">{i}</span>
          {dayAppointments.length > 0 && (
            <div className="day-appointments">
              {dayAppointments.map((apt, idx) => (
                <div key={idx} className="appointment-dot"></div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const todayAppointments = appointments.filter(
    apt => apt.date === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
  );

  return (
    <div className="doctor-calendar">
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={prevMonth} className="nav-button">◀</button>
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button onClick={nextMonth} className="nav-button">▶</button>
        </div>

        <div className="calendar-weekdays">
          <div className="weekday">Dom</div>
          <div className="weekday">Lun</div>
          <div className="weekday">Mar</div>
          <div className="weekday">Mié</div>
          <div className="weekday">Jue</div>
          <div className="weekday">Vie</div>
          <div className="weekday">Sab</div>
        </div>

        <div className="calendar-days">
          {renderCalendar()}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot today-dot"></span>
            <span>Hoy</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot appointment-dot"></span>
            <span>Con citas</span>
          </div>
        </div>
      </div>

      <div className="appointments-sidebar">
        <div className="sidebar-section">
          <h4>Citas de Hoy</h4>
          {todayAppointments.length > 0 ? (
            <div className="appointments-today">
              {todayAppointments.map((apt, idx) => (
                <div key={idx} className="appointment-card">
                  <div className="appointment-header">
                    <span className="appointment-time">{apt.time}</span>
                    <span className="appointment-badge">{apt.type}</span>
                  </div>
                  <div className="appointment-body">
                    <p className="appointment-patient-name">{apt.patient}</p>
                    <button className="btn-appointment-action">Iniciar Consulta</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-appointments">No hay citas programadas hoy</p>
          )}
        </div>

        <div className="sidebar-section">
          <h4>Próximas Citas</h4>
          <div className="upcoming-appointments">
            {appointments.slice(0, 5).map((apt, idx) => (
              <div key={idx} className="upcoming-item">
                <span className="upcoming-date">{apt.date.substring(5)}</span>
                <span className="upcoming-time">{apt.time}</span>
                <span className="upcoming-patient">{apt.patient}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-new-appointment">+ Nueva Cita</button>
      </div>
    </div>
  );
};

export default DoctorCalendar;
