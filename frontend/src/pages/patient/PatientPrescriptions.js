import React from 'react';
import './PatientPage.css';

const PatientPrescriptions = () => (
  <div className="patient-page">
    <div className="patient-page-header">
      <span className="patient-page-icon">💊</span>
      <h1>Mis Recetas</h1>
      <p>Accede a todas tus recetas médicas emitidas en tus consultas.</p>
    </div>
    <div className="patient-page-card coming-soon">
      <span>🚧</span>
      <h2>Próximamente</h2>
      <p>Esta sección estará disponible muy pronto.</p>
    </div>
  </div>
);

export default PatientPrescriptions;
