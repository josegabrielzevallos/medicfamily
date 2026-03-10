import React, { useState, useEffect, useRef } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import BadgeIcon from '@mui/icons-material/Badge';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { doctorAPI } from '../../api/client';
import './DoctorProfile.css';

const DoctorProfile = ({ doctorData, setDoctorData }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    bio: '',
    address: '',
    consultation_fee: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef(null);

  const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace('/api', '');

  // Sync formData when doctorData prop changes
  useEffect(() => {
    if (doctorData) {
      setFormData({
        name: doctorData.name || '',
        specialty: doctorData.specialty || '',
        phone: doctorData.phone || '',
        email: doctorData.email || '',
        bio: doctorData.bio || '',
        address: doctorData.address || '',
        consultation_fee: doctorData.consultation_fee || '',
      });
    }
  }, [doctorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!doctorData?.doctor_id) {
      setSaveError('No se encontró el ID del perfil del doctor.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const payload = {
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        consultation_fee: formData.consultation_fee || null,
      };
      const response = await doctorAPI.update(doctorData.doctor_id, payload);
      // Merge updated fields back into doctorData
      if (setDoctorData) {
        setDoctorData(prev => ({
          ...prev,
          phone: response.data.phone,
          address: response.data.address,
          bio: response.data.bio,
          consultation_fee: response.data.consultation_fee,
        }));
      }
      setSaveSuccess('Perfil actualizado correctamente.');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Solo se permiten archivos de imagen.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('La imagen no puede superar los 5 MB.');
      return;
    }
    setUploadingPhoto(true);
    setPhotoError('');
    try {
      const response = await doctorAPI.uploadPhoto(file);
      if (setDoctorData) {
        setDoctorData(prev => ({ ...prev, profile_image: response.data.profile_image }));
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setPhotoError('Error al subir la foto. Inténtalo de nuevo.');
    } finally {
      setUploadingPhoto(false);
      // Reset input so same file can be re-selected if needed
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError('');
    // Reset form to current doctorData
    if (doctorData) {
      setFormData({
        name: doctorData.name || '',
        specialty: doctorData.specialty || '',
        phone: doctorData.phone || '',
        email: doctorData.email || '',
        bio: doctorData.bio || '',
        address: doctorData.address || '',
        consultation_fee: doctorData.consultation_fee || '',
      });
    }
  };

  return (
    <div className="doctor-profile">
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div
            className={`profile-avatar ${uploadingPhoto ? 'uploading' : ''}`}
            onClick={() => !uploadingPhoto && photoInputRef.current?.click()}
            title="Haz clic para cambiar tu foto"
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            {doctorData?.profile_image ? (
              <img
                src={`${API_BASE}${doctorData.profile_image}`}
                alt="Foto de perfil"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <PersonIcon sx={{ fontSize: 56, color: '#667eea' }} />
            )}
            <div className="avatar-overlay">
              {uploadingPhoto
                ? <span style={{ fontSize: 12, color: '#fff' }}>Subiendo…</span>
                : <AddAPhotoIcon sx={{ fontSize: 22, color: '#fff' }} />}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </div>
          {photoError && <p style={{ color: '#e53e3e', fontSize: 12, margin: '4px 0 0' }}>{photoError}</p>}
          <div className="profile-name-section">
            <h2>{formData.name || 'Dr. Usuario'}</h2>
            <p className="profile-specialty">
              <MedicalServicesIcon fontSize="small" /> {formData.specialty || '—'}
            </p>
            {doctorData?.is_verified && (
              <p className="profile-verified">
                <BadgeIcon fontSize="small" /> Perfil verificado
              </p>
            )}
          </div>
          <button
            className={`btn-edit-profile ${isEditing ? 'editing' : ''}`}
            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
          >
            {isEditing ? <><CloseIcon fontSize="small" /> Cancelar</> : <><EditIcon fontSize="small" /> Editar</>}
          </button>
        </div>
      </div>

      {saveSuccess && <div className="alert alert-success">{saveSuccess}</div>}
      {saveError && <div className="alert alert-error">{saveError}</div>}

      <div className="profile-content">
        <div className="profile-section">
          <h3>Información Personal</h3>
          <div className="info-grid">
            <div className="form-group">
              <label><PersonIcon fontSize="small" /> Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                disabled
                className="form-input"
                title="El nombre se gestiona desde la configuración de cuenta"
              />
            </div>

            <div className="form-group">
              <label><MedicalServicesIcon fontSize="small" /> Especialidad</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                disabled
                className="form-input"
                title="Contacta al administrador para cambiar la especialidad"
              />
            </div>

            <div className="form-group">
              <label><EmailIcon fontSize="small" /> Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label><PhoneIcon fontSize="small" /> Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="(+51) 987 654 321"
              />
            </div>

            <div className="form-group">
              <label><LocationOnIcon fontSize="small" /> Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="Calle Principal 123"
              />
            </div>

            <div className="form-group">
              <label><MonetizationOnIcon fontSize="small" /> Tarifa de Consulta (S/.)</label>
              <input
                type="number"
                name="consultation_fee"
                value={formData.consultation_fee}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="0.00"
                min="0"
                step="0.01"
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
              placeholder="Cuéntanos sobre tu experiencia y especialidades..."
            />
          </div>

          {isEditing && (
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                <SaveIcon fontSize="small" /> {saving ? 'Guardando…' : 'Guardar Cambios'}
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                <CloseIcon fontSize="small" /> Cancelar
              </button>
            </div>
          )}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
