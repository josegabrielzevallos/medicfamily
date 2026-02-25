import React, { useState } from 'react';
import './DoctorRegisterForm.css';

const DoctorRegisterForm = ({ onFormChange, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    city: '',
    password: '',
    password2: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});

  const specialties = [
    'Alergólogo',
    'Cardiólogo',
    'Dermatólogo',
    'Ginecologo',
    'Oftalmólogo',
    'Odontólogo',
    'Pediatra',
    'Psicólogo',
    'Psiquiatra',
    'Traumatólogo',
    'Urólogo',
    'Internista',
  ];

  const peruCities = [
    'Abancay',
    'Arequipa',
    'Ayacucho',
    'Callao',
    'Cerro de Pasco',
    'Chachapoyas',
    'Chiclayo',
    'Chincha',
    'Chimbote',
    'Cusco',
    'Huamachuco',
    'Huancayo',
    'Huanta',
    'Hunuco',
    'Ica',
    'Ilave',
    'Ilo',
    'Jauja',
    'Juliaca',
    'Lima',
    'Lyucanamarca',
    'Moquegua',
    'Moyobamba',
    'Nazca',
    'Oroya',
    'Pisco',
    'Pucallpa',
    'Puno',
    'Puerto Maldonado',
    'Quillabamba',
    'Satipo',
    'Tambo',
    'Tacna',
    'Tarapoto',
    'Tingo Maria',
    'Trujillo',
    'Tumbes',
    'Ucayali',
    'Yauli',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updatedFormData);
    onFormChange(updatedFormData);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'Los apellidos son requeridos';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.specialty) newErrors.specialty = 'La especialidad es requerida';
    if (!formData.city) newErrors.city = 'La ciudad es requerida';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    if (formData.password !== formData.password2) newErrors.password2 = 'Las contraseñas no coinciden';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="doctor-register-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Información Personal</h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre(s) *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Tu nombre"
              className={`form-input ${errors.firstName ? 'error' : ''}`}
            />
            {errors.firstName && <span className="field-error">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Apellidos completos *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Ej.: Pérez García"
              className={`form-input ${errors.lastName ? 'error' : ''}`}
            />
            {errors.lastName && <span className="field-error">{errors.lastName}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Información Profesional</h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Especialidad *</label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className={`form-input form-select ${errors.specialty ? 'error' : ''}`}
            >
              <option value="">Selecciona tu especialidad</option>
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            {errors.specialty && <span className="field-error">{errors.specialty}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Ubicación de tu consulta *</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`form-input form-select ${errors.city ? 'error' : ''}`}
            >
              <option value="">Selecciona una ciudad</option>
              {peruCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Información de Contacto</h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Número de teléfono móvil *</label>
            <div className="phone-input-container">
              <select className="phone-code" defaultValue="+51">
                <option value="+51">+51</option>
              </select>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="987654321"
                className={`form-input ${errors.phone ? 'error' : ''}`}
              />
            </div>
            <p className="form-hint">Necesitamos el teléfono para configurar tu cuenta. No se mostrará en tu perfil.</p>
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            className={`form-input ${errors.email ? 'error' : ''}`}
          />
          <p className="form-hint">Necesitamos tu email para configurar tu cuenta. No se mostrará en tu perfil.</p>
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>Seguridad</h3>

        <div className="form-group">
          <label className="form-label">Contraseña *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña segura"
            className={`form-input ${errors.password ? 'error' : ''}`}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Confirmar Contraseña *</label>
          <input
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            placeholder="Repite tu contraseña"
            className={`form-input ${errors.password2 ? 'error' : ''}`}
          />
          {errors.password2 && <span className="field-error">{errors.password2}</span>}
        </div>
      </div>

      <div className="form-section">
        <div className="form-group checkbox">
          <input
            type="checkbox"
            name="acceptTerms"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className={errors.acceptTerms ? 'error' : ''}
          />
          <label htmlFor="acceptTerms" className="checkbox-label">
            Al registrarme, confirmo que estoy de acuerdo con nuestros <a href="#terms">términos y condiciones</a> y que entiendo nuestra <a href="#privacy">política de privacidad</a>.
          </label>
          {errors.acceptTerms && <span className="field-error">{errors.acceptTerms}</span>}
        </div>
      </div>

      <button 
        type="submit" 
        className="btn-submit"
        disabled={isLoading}
      >
        {isLoading ? 'Creando cuenta...' : 'Crear una cuenta de especialista'}
      </button>
    </form>
  );
};

export default DoctorRegisterForm;
