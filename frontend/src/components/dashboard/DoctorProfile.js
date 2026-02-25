import React, { useState } from 'react';
import './DoctorProfile.css';

const DoctorProfile = ({ doctorData }) => {
  const [formData, setFormData] = useState({
    name: doctorData?.name || 'Dr. Juan López',
    specialty: doctorData?.specialty || 'Médico General',
    licenseNumber: '12345678',
    phone: '(+51) 987 654 321',
    email: doctorData?.email || 'doctor@email.com',
    bio: 'Médico con 15 años de experiencia en medicina general.',
    education: 'Universidad Nacional de Medicina - 2010',
    city: 'Lima',
    address: 'Calle Principal 123, Piso 5'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [certifications, setCertifications] = useState([
    { id: 1, title: 'Certificación en Medicina General', year: 2010 },
    { id: 2, title: 'Especialidad en Cardiología', year: 2015 },
    { id: 3, title: 'Curso Avanzado de Urgencias', year: 2020 }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log('Perfil guardado:', formData);
  };

  return (
    <div className="doctor-profile">
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar">👨‍⚕️</div>
          <div className="profile-name-section">
            <h2>{formData.name}</h2>
            <p className="profile-specialty">{formData.specialty}</p>
            <p className="profile-id">Licencia: {formData.licenseNumber}</p>
          </div>
          <button
            className={`btn-edit-profile ${isEditing ? 'editing' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '✕' : '✎ Editar'}
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Información Personal</h3>
          <div className="info-grid">
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Especialidad</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Ciudad</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Biografía</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-textarea"
              rows="4"
            />
          </div>

          {isEditing && (
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave}>💾 Guardar Cambios</button>
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>✕ Cancelar</button>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h3>Educación y Certificaciones</h3>
          
          <div className="education-item">
            <h4>Formación Académica</h4>
            <p>{formData.education}</p>
          </div>

          <div className="certifications-list">
            <h4>Certificaciones Profesionales</h4>
            {certifications.map(cert => (
              <div key={cert.id} className="certification-item">
                <span className="cert-icon">🏅</span>
                <div className="cert-content">
                  <p className="cert-title">{cert.title}</p>
                  <p className="cert-year">{cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h3>Estadísticas</h3>
          <div className="stats-grid small-stats">
            <div className="stat-card small-stat">
              <p className="stat-value">142</p>
              <p className="stat-label">Pacientes</p>
            </div>
            <div className="stat-card small-stat">
              <p className="stat-value">450</p>
              <p className="stat-label">Citas Completadas</p>
            </div>
            <div className="stat-card small-stat">
              <p className="stat-value">4.8</p>
              <p className="stat-label">Calificación</p>
            </div>
            <div className="stat-card small-stat">
              <p className="stat-value">15</p>
              <p className="stat-label">Años Experiencia</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Seguridad</h3>
          <div className="security-items">
            <div className="security-item">
              <div className="security-info">
                <p className="security-title">Contraseña</p>
                <p className="security-description">Cambiar tu contraseña de acceso</p>
              </div>
              <button className="btn-secondary">Cambiar</button>
            </div>
            <div className="security-item">
              <div className="security-info">
                <p className="security-title">Verificación en Dos Pasos</p>
                <p className="security-description">Activar autenticación de dos factores</p>
              </div>
              <button className="btn-secondary">Activar</button>
            </div>
            <div className="security-item">
              <div className="security-info">
                <p className="security-title">Sesiones Activas</p>
                <p className="security-description">Gestionar dispositivos conectados</p>
              </div>
              <button className="btn-secondary">Administrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
