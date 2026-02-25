import React from 'react';
import './DoctorProfilePreview.css';

const DoctorProfilePreview = ({ formData }) => {
  const handleSearch = () => {
    // Placeholder para búsqueda
  };

  return (
    <div className="doctor-profile-preview">
      <div className="preview-header">
        <div className="preview-logo">⚕️</div>
        <input 
          type="text" 
          className="preview-search" 
          placeholder="Buscar doctor..."
          onClick={handleSearch}
        />
      </div>

      <div className="preview-card">
        <div className="preview-card__avatar">
          {formData.firstName ? (
            <div className="avatar-placeholder">
              {formData.firstName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="avatar-placeholder empty">👤</div>
          )}
        </div>

        <div className="preview-card__content">
          <div className="preview-name-section">
            <h2 className="preview-name">
              {formData.firstName && formData.lastName 
                ? `${formData.firstName} ${formData.lastName}` 
                : 'Tu nombre'}
            </h2>

            <p className="preview-specialty">
              {formData.specialty || 'Tu especialidad'} 
              {formData.city && ` · ${formData.city}`}
            </p>

            <div className="preview-rating">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="star">⭐</span>
              ))}
            </div>
          </div>

          <div className="preview-info-section">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <span className="info-text">
                {formData.city || 'Ciudad no especificada'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-icon">📞</span>
              <span className="info-text">
                {formData.phone || 'Teléfono no especificado'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-icon">📧</span>
              <span className="info-text">
                {formData.email || 'Email no especificado'}
              </span>
            </div>
          </div>

          <p className="preview-bio">
            {formData.specialty ? (
              `Especialista en ${formData.specialty}. Disponible para consultas en ${formData.city || 'tu ciudad'}.`
            ) : (
              'Completa tu información para ver cómo los pacientes te verán.'
            )}
          </p>

          <button className="preview-btn">Agendar Cita</button>
        </div>
      </div>

      <div className="preview-footer">
        <p className="preview-footer-text">
          Así es como tu perfil se verá en la plataforma
        </p>
      </div>
    </div>
  );
};

export default DoctorProfilePreview;
