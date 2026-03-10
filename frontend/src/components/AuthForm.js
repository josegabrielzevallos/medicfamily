import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './AuthForm.css';

const HAS_GOOGLE = !!process.env.REACT_APP_GOOGLE_CLIENT_ID;

const AuthForm = ({ mode = 'login', onSubmit, isLoading = false, userType = null, onGoogleSuccess = null }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    firstName: '',
    lastName: '',
    userType: userType || 'patient', // patient or doctor
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Error en la solicitud' });
      }
    }
  };

  return (
    <div className="auth-form__container">
      <div className="auth-form__card">
        <form onSubmit={handleSubmit}>
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          {mode === 'register' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Tu nombre"
                    required
                  />
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Tu apellido"
                    required
                  />
                  {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="tu@email.com"
                  required
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Usuario *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="Nombre de usuario"
              required
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Contraseña segura"
              required
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Confirmar Contraseña *</label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                className="form-input"
                placeholder="Repite tu contraseña"
                required
              />
              {errors.password2 && <span className="field-error">{errors.password2}</span>}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        {onGoogleSuccess && HAS_GOOGLE && (
          <div className="google-login-section">
            <div className="google-divider">
              <span>o continúa con</span>
            </div>
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => console.error('Error al iniciar sesión con Google')}
                useOneTap
                locale="es"
                text={mode === 'login' ? 'signin_with' : 'signup_with'}
                shape="rectangular"
                theme="outline"
                size="large"
                width="320"
              />
            </div>
          </div>
        )}

        <div className="auth-footer">
          {mode === 'login' ? (
            <>
              <p>¿No tienes cuenta? <Link to="/register/type">Registrate aquí</Link></p>
            </>
          ) : (
            <>
              <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
