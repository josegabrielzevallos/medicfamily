import React from 'react';
import './PatientPage.css';

const PatientMedicalHistory = () => (
  <div className="patient-page">
    <div className="patient-page-header">
      <span className="patient-page-icon">🗂️</span>
      <h1>Historia Clínica</h1>
      <p>Consulta tu historial médico, diagnósticos y evoluciones registradas.</p>
    </div>
    <div className="patient-page-card coming-soon">
      <span>🚧</span>
      <h2>Próximamente</h2>
      <p>Esta sección estará disponible muy pronto.</p>
    </div>
  </div>
);

export default PatientMedicalHistory;
