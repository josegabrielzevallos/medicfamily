import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import MedicationIcon from '@mui/icons-material/Medication';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../api/client';
import './PatientAccount.css';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const navItems = [
  { label: 'Mis citas',          to: '/appointments',           icon: <CalendarMonthIcon fontSize="small" /> },
  { label: 'Mis médicos',        to: '/patient/doctors',        icon: <LocalHospitalIcon fontSize="small" /> },
  { label: 'Historial médico',   to: '/patient/history',        icon: <HistoryIcon fontSize="small" /> },
  { label: 'Mis recetas',        to: '/patient/prescriptions',  icon: <MedicationIcon fontSize="small" /> },
];

const PatientProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]     = useState(null);
  const [form, setForm]           = useState({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    patientAPI.getMyProfile()
      .then(res => {
        const p = res.data;
        setProfile(p);
        setForm({
          first_name:        p.user?.first_name || '',
          last_name:         p.user?.last_name  || '',
          username:          p.user?.username   || '',
          email:             p.user?.email      || '',
          phone:             p.phone            || '',
          date_of_birth:     p.date_of_birth    || '',
          blood_type:        p.blood_type       || '',
          allergies:         p.allergies        || '',
          medical_conditions:p.medical_conditions || '',
          emergency_contact: p.emergency_contact || '',
        });
      })
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      delete payload.email; // email not editable here
      await patientAPI.updateMyProfile(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        first_name:         profile.user?.first_name || '',
        last_name:          profile.user?.last_name  || '',
        username:           profile.user?.username   || '',
        email:              profile.user?.email      || '',
        phone:              profile.phone            || '',
        date_of_birth:      profile.date_of_birth    || '',
        blood_type:         profile.blood_type       || '',
        allergies:          profile.allergies        || '',
        medical_conditions: profile.medical_conditions || '',
        emergency_contact:  profile.emergency_contact || '',
      });
    }
  };

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : '';

  return (
    <div className="pac-page">
      {/* ── Top header ── */}
      <div className="pac-topbar">
        <div className="pac-topbar-inner">
          <div className="pac-topbar-brand">
            <MedicalServicesIcon className="pac-topbar-logo" />
            <div>
              <div className="pac-topbar-title">Mi cuenta</div>
              <div className="pac-topbar-email">{user?.email}</div>
            </div>
          </div>
          <button className="pac-topbar-close" onClick={() => navigate('/')}>
            <CloseIcon fontSize="small" /> Cerrar
          </button>
        </div>
      </div>

      <div className="pac-body">
        {/* ── Sidebar ── */}
        <aside className="pac-sidebar">
          <div className="pac-sidebar-section">
            <span className="pac-sidebar-label">Especialistas</span>
            {navItems.map(item => (
              <Link key={item.to} to={item.to} className="pac-sidebar-item">
                {item.icon}{item.label}
              </Link>
            ))}
          </div>
          <div className="pac-sidebar-divider" />
          <div className="pac-sidebar-section">
            <span className="pac-sidebar-label">Configuración de la cuenta</span>
            <Link to="/patient/profile" className="pac-sidebar-item pac-sidebar-item--active">
              <AccountCircleIcon fontSize="small" /> Configuración de la cuenta
            </Link>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="pac-main">
          {loading ? (
            <div className="pac-loading">Cargando perfil…</div>
          ) : (
            <form className="pac-form" onSubmit={handleSave}>
              <h2 className="pac-form-title">Configuración de la cuenta</h2>
              <p className="pac-form-hint">* Campo obligatorio</p>

              {error && <div className="pac-error-banner">{error}</div>}
              {saved && (
                <div className="pac-success-banner">
                  <CheckCircleIcon fontSize="small" /> Cambios guardados correctamente
                </div>
              )}

              {/* Nombre */}
              <div className="pac-field-row">
                <label className="pac-field-label">Nombre *</label>
                <div className="pac-field-inputs">
                  <input
                    className="pac-input"
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>
              <div className="pac-divider" />

              {/* Apellidos */}
              <div className="pac-field-row">
                <label className="pac-field-label">Apellidos *</label>
                <div className="pac-field-inputs">
                  <input
                    className="pac-input"
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Tus apellidos"
                    required
                  />
                </div>
              </div>
              <div className="pac-divider" />

              {/* Fecha de nacimiento */}
              <div className="pac-field-row">
                <label className="pac-field-label">Fecha de nacimiento</label>
                <div className="pac-field-inputs">
                  <input
                    className="pac-input"
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="pac-divider" />

              {/* Nombre de usuario */}
              <div className="pac-field-row">
                <label className="pac-field-label">Nombre de usuario</label>
                <div className="pac-field-inputs">
                  <input
                    className="pac-input"
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="nombre_usuario"
                  />
                </div>
              </div>
              <div className="pac-divider" />

              {/* Teléfono */}
              <div className="pac-field-row">
                <label className="pac-field-label">Número de teléfono</label>
                <div className="pac-field-inputs">
                  <input
                    className="pac-input"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Ej. +51 999 999 999"
                  />
                </div>
              </div>
              <div className="pac-divider" />

              {/* Email (read-only) */}
              <div className="pac-field-row">
                <label className="pac-field-label">Correo electrónico *</label>
                <div className="pac-field-inputs pac-field-email">
                  <span className="pac-email-value">{form.email}</span>
                  <span className="pac-email-verified">
                    <CheckCircleIcon style={{ fontSize: 14, color: '#1abc9c', verticalAlign: 'middle', marginRight: 4 }} />
                    Correo electrónico verificado
                  </span>
                </div>
              </div>
              <div className="pac-divider" />

              {/* Tipo de sangre */}
              <div className="pac-field-row">
                <label className="pac-field-label">Tipo de sangre</label>
                <div className="pac-field-inputs">
                  <select className="pac-input" name="blood_type" value={form.blood_type} onChange={handleChange}>
                    <option value="">-- Seleccionar --</option>
                    {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
              </div>
              <div className="pac-divider" />

              {/* Contacto de emergencia */}
              <div className="pac-field-row">
                <label className="pac-field-label">Contacto de emergencia</label>
                <div className="pac-field-inputs">
                  <input
                    className="pac-input"
                    type="text"
                    name="emergency_contact"
                    value={form.emergency_contact}
                    onChange={handleChange}
                    placeholder="Nombre y teléfono"
                  />
                </div>
              </div>
              <div className="pac-divider" />

              {/* Alergias */}
              <div className="pac-field-row pac-field-row--top">
                <label className="pac-field-label">Alergias</label>
                <div className="pac-field-inputs">
                  <textarea
                    className="pac-input pac-textarea"
                    name="allergies"
                    value={form.allergies}
                    onChange={handleChange}
                    placeholder="Describe tus alergias conocidas…"
                    rows={3}
                  />
                </div>
              </div>
              <div className="pac-divider" />

              {/* Condiciones médicas */}
              <div className="pac-field-row pac-field-row--top">
                <label className="pac-field-label">Condiciones médicas</label>
                <div className="pac-field-inputs">
                  <textarea
                    className="pac-input pac-textarea"
                    name="medical_conditions"
                    value={form.medical_conditions}
                    onChange={handleChange}
                    placeholder="Condiciones médicas relevantes…"
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pac-actions">
                <button type="submit" className="pac-btn-save" disabled={saving}>
                  <SaveIcon fontSize="small" />
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                <button type="button" className="pac-btn-cancel" onClick={handleCancel} disabled={saving}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;

