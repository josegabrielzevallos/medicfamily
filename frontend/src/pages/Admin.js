import React, { useState, useEffect } from 'react';
import { specialtyAPI, doctorAPI, appointmentAPI } from '../api/client';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('specialties');
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'specialties') {
        const response = await specialtyAPI.getAll();
        setSpecialties(response.data);
      } else if (activeTab === 'doctors') {
        const response = await doctorAPI.getAll();
        setDoctors(response.data);
      } else if (activeTab === 'appointments') {
        const response = await appointmentAPI.getAll();
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialty = async (e) => {
    e.preventDefault();
    if (!newSpecialty.trim()) return;
    try {
      await specialtyAPI.create({ name: newSpecialty });
      setNewSpecialty('');
      fetchData();
    } catch (error) {
      console.error('Error adding specialty:', error);
    }
  };

  const handleVerifyDoctor = async (doctorId) => {
    try {
      await doctorAPI.verify(doctorId);
      fetchData();
    } catch (error) {
      console.error('Error verifying doctor:', error);
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    try {
      await doctorAPI.reject(doctorId);
      fetchData();
    } catch (error) {
      console.error('Error rejecting doctor:', error);
    }
  };

  return (
    <div className="admin">
      <div className="admin__header">
        <h1>Panel Administrativo</h1>
        <p>Gestiona especialidades, doctores y citas</p>
      </div>

      <div className="admin__container">
        <div className="admin__tabs">
          <button
            className={`admin__tab ${activeTab === 'specialties' ? 'active' : ''}`}
            onClick={() => setActiveTab('specialties')}
          >
            Especialidades
          </button>
          <button
            className={`admin__tab ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            Doctores
          </button>
          <button
            className={`admin__tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Citas
          </button>
        </div>

        <div className="admin__content">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : activeTab === 'specialties' ? (
            <div className="admin__section">
              <form className="specialty-form" onSubmit={handleAddSpecialty}>
                <input
                  type="text"
                  placeholder="Nueva especialidad..."
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  className="specialty-input"
                />
                <button type="submit" className="btn btn-primary">Agregar</button>
              </form>

              <div className="specialties-list">
                {specialties.map(specialty => (
                  <div key={specialty.id} className="specialty-item">
                    <span>{specialty.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'doctors' ? (
            <div className="admin__section">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Especialidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doctor => (
                    <tr key={doctor.id}>
                      <td>{doctor.user.first_name} {doctor.user.last_name}</td>
                      <td>{doctor.user.email}</td>
                      <td>{doctor.specialty?.name}</td>
                      <td>
                        <span className={`status ${doctor.is_verified ? 'verified' : 'pending'}`}>
                          {doctor.is_verified ? 'Verificado' : 'Pendiente'}
                        </span>
                      </td>
                      <td>
                        {!doctor.is_verified && (
                          <>
                            <button 
                              className="btn btn-small btn-success"
                              onClick={() => handleVerifyDoctor(doctor.id)}
                            >
                              Verificar
                            </button>
                            <button 
                              className="btn btn-small btn-danger"
                              onClick={() => handleRejectDoctor(doctor.id)}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin__section">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Doctor</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>{appointment.patient?.user?.first_name} {appointment.patient?.user?.last_name}</td>
                      <td>{appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}</td>
                      <td>{new Date(appointment.appointment_date).toLocaleDateString('es-ES')}</td>
                      <td>{appointment.type === 'presencial' ? '🏥' : '💻'}</td>
                      <td>
                        <span className={`status status-${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
