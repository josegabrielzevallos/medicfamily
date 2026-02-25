import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    whatsappNotifications: false,
    appointmentReminders: true,
    newPatientAlert: true,
    darkMode: false,
    language: 'es',
    currency: 'PEN',
    timeFormat: '24h'
  });

  const [profileSettings, setProfileSettings] = useState({
    publicProfile: true,
    showRatings: true,
    allowOnlineConsultations: true,
    acceptInsurance: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleProfileToggle = (key) => {
    setProfileSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="settings">
      <div className="settings-container">
        <div className="settings-section">
          <h3>🔔 Notificaciones</h3>
          
          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Notificaciones en la Plataforma</p>
              <p className="setting-description">Recibe alertas dentro de la aplicación</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Notificaciones por Email</p>
              <p className="setting-description">Recibe notificaciones en tu correo</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Notificaciones por WhatsApp</p>
              <p className="setting-description">Recibe messages por WhatsApp</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.whatsappNotifications}
                onChange={() => handleToggle('whatsappNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Recordatorios de Citas</p>
              <p className="setting-description">24 horas antes de cada cita</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.appointmentReminders}
                onChange={() => handleToggle('appointmentReminders')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Alerta de Nuevos Pacientes</p>
              <p className="setting-description">Notificar cuando se registre un nuevo paciente</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.newPatientAlert}
                onChange={() => handleToggle('newPatientAlert')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>🎨 Apariencia</h3>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Modo Oscuro</p>
              <p className="setting-description">Cambiar a tema oscuro</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Idioma</p>
              <p className="setting-description">Selecciona tu idioma preferido</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSelectChange('language', e.target.value)}
              className="setting-select"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Moneda</p>
              <p className="setting-description">Divisa para transacciones</p>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => handleSelectChange('currency', e.target.value)}
              className="setting-select"
            >
              <option value="PEN">Soles (PEN)</option>
              <option value="USD">Dólares (USD)</option>
              <option value="EUR">Euros (EUR)</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Formato de Hora</p>
              <p className="setting-description">Cómo mostrar la hora</p>
            </div>
            <select
              value={settings.timeFormat}
              onChange={(e) => handleSelectChange('timeFormat', e.target.value)}
              className="setting-select"
            >
              <option value="24h">24 horas</option>
              <option value="12h">12 horas (AM/PM)</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>👤 Perfil Público</h3>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Mostrar Perfil Público</p>
              <p className="setting-description">Permita que los pacientes vean tu perfil</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={profileSettings.publicProfile}
                onChange={() => handleProfileToggle('publicProfile')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Mostrar Calificaciones</p>
              <p className="setting-description">Mostrar tus calificaciones de pacientes</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={profileSettings.showRatings}
                onChange={() => handleProfileToggle('showRatings')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Permitir Consultas Online</p>
              <p className="setting-description">Ofrecer consultaciones virtuales</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={profileSettings.allowOnlineConsultations}
                onChange={() => handleProfileToggle('allowOnlineConsultations')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <p className="setting-title">Aceptar Seguros</p>
              <p className="setting-description">Permitir pagos con seguros médicos</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={profileSettings.acceptInsurance}
                onChange={() => handleProfileToggle('acceptInsurance')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>⚙️ Sistema</h3>

          <div className="settings-actions">
            <button className="btn-setting-action primary">🔄 Sincronizar Datos</button>
            <button className="btn-setting-action secondary">📥 Descargar Datos</button>
            <button className="btn-setting-action secondary">🗑️ Limpiar Caché</button>
          </div>

          <div className="settings-actions danger">
            <button className="btn-setting-action danger">⚠️ Cerrar Sesión en Todos los Dispositivos</button>
            <button className="btn-setting-action danger-delete">🗑️ Eliminar Cuenta</button>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-save-settings">💾 Guardar Cambios</button>
          <p className="settings-info">Los cambios se guardarán automáticamente</p>
        </div>
      </div>

      <div className="settings-info-box">
        <h4>❓ Ayuda y Soporte</h4>
        <ul className="help-links">
          <li><a href="#help">Centro de Ayuda</a></li>
          <li><a href="#faq">Preguntas Frecuentes</a></li>
          <li><a href="#contact">Contacto Soporte</a></li>
          <li><a href="#privacy">Política de Privacidad</a></li>
          <li><a href="#terms">Términos de Servicio</a></li>
        </ul>
        <p className="version-info">Versión: 1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;
