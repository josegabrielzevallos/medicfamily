import React from 'react';
import './PatientPage.css';

const PatientDoctors = () => (
  <div className="patient-page">
    <div className="patient-page-header">
      <span className="patient-page-icon">🩺</span>
      <h1>Mis Doctores</h1>
      <p>Tus médicos frecuentes y los profesionales que te han atendido.</p>
    </div>
    <div className="patient-page-card coming-soon">
      <span>🚧</span>
      <h2>Próximamente</h2>
      <p>Esta sección estará disponible muy pronto.</p>
    </div>
  </div>
);

export default PatientDoctors;
