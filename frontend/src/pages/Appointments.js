import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../api/client';
import './Appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const userType = localStorage.getItem('user_type') || 'patient';

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'upcoming') {
        response = await appointmentAPI.getUpcoming();
      } else {
        response = await appointmentAPI.getPast();
      }
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId) => {
    try {
      await appointmentAPI.confirm(appointmentId);
      fetchAppointments();
    } catch (error) {
      console.error('Error confirming appointment:', error);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('¿Estás seguro que deseas cancelar esta cita?')) {
      try {
        await appointmentAPI.cancel(appointmentId);
        fetchAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await appointmentAPI.complete(appointmentId);
      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  return (
    <div className="appointments">
      <div className="appointments__header">
        <h1>Mis Citas</h1>
        <p>Gestiona tus citas médicas</p>
      </div>

      <div className="appointments__container">
        <div className="appointments__tabs">
          <button
            className={`appointments__tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Próximas Citas
          </button>
          <button
            className={`appointments__tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Citas Pasadas
          </button>
        </div>

        <div className="appointments__content">
          {loading ? (
            <div className="loading">Cargando citas...</div>
          ) : appointments.length > 0 ? (
            <div className="appointments__list">
              {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-card__header">
                    <h3>
                      {userType === 'doctor' 
                        ? `${appointment.patient?.user?.first_name} ${appointment.patient?.user?.last_name}`
                        : `Dr. ${appointment.doctor?.user?.first_name} ${appointment.doctor?.user?.last_name}`
                      }
                    </h3>
                    <span className={`appointment-card__status status-${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="appointment-card__details">
                    {userType === 'patient' && appointment.doctor?.specialty && (
                      <p><strong>Especialidad:</strong> {appointment.doctor.specialty.name}</p>
                    )}
                    <p><strong>Fecha:</strong> {new Date(appointment.appointment_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    <p><strong>Tipo:</strong> {appointment.type === 'presencial' ? '🏥 Presencial' : '💻 Virtual'}</p>
                    
                    {appointment.type === 'virtual' && appointment.virtual_meeting_link && (
                      <p className="meeting-link">
                        <strong>Plataforma:</strong> {appointment.virtual_meeting_link.platform}
                        <a href={appointment.virtual_meeting_link.meeting_link} target="_blank" rel="noopener noreferrer" className="btn-link">
                          Acceder a reunión
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="appointment-card__actions">
                    {activeTab === 'upcoming' && appointment.status === 'pending' && userType === 'doctor' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleConfirm(appointment.id)}
                      >
                        Confirmar
                      </button>
                    )}
                    {activeTab === 'upcoming' && appointment.status !== 'cancelled' && userType === 'patient' && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleCancel(appointment.id)}
                      >
                        Cancelar
                      </button>
                    )}
                    {activeTab === 'upcoming' && appointment.status === 'confirmed' && userType === 'doctor' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleComplete(appointment.id)}
                      >
                        Marcar Completada
                      </button>
                    )}
                    {activeTab === 'past' && appointment.status === 'completed' && userType === 'patient' && (
                      <button className="btn btn-secondary">
                        Calificar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-appointments">
              <p>No hay citas {activeTab === 'upcoming' ? 'próximas' : 'pasadas'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
