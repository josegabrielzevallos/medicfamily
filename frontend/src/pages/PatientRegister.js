import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './PatientRegister.css';

const HAS_GOOGLE = !!process.env.REACT_APP_GOOGLE_CLIENT_ID;

/* ─── SVG icons ─── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 814 1000">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.2-155.5-127.5c-43.3-81.9-64.9-199.3-64.9-259.7 0-223.4 147.1-341.8 292-341.8 74.7 0 136.9 48.5 183.9 48.5 44.9 0 119.7-51.9 204.3-51.9 32.6 0 134.2 3.2 204.3 103.2zm-257.6-102c-31.3-38.2-84.5-66.9-137.7-66.9-8.3 0-16.6.6-25 1.9 2.6 46.2 21.4 88.1 50.7 118.7 29.3 30.6 83.6 62.8 143.2 65.5 1.3-6.4 1.9-12.8 1.9-19.8 0-43.5-16.6-87-33.1-99.4z"/>
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.879l4.242 4.242M3 3l18 18" />
    </svg>
  );

/* ─── Sub-componente que usa el hook — solo se monta si HAS_GOOGLE ─── */
const GoogleSignupButton = ({ onSuccess, onError, disabled }) => {
  const googleSignup = useGoogleLogin({ onSuccess, onError });
  return (
    <button
      type="button"
      className="pr-social-btn"
      onClick={() => googleSignup()}
      disabled={disabled}
    >
      <GoogleIcon />
      Continuar con Google
    </button>
  );
};


const PatientRegister = () => {
  const navigate = useNavigate();
  const { register, googleLogin, isLoading } = useAuth();

  const [form, setForm]             = useState({ email: '', emailConfirm: '', password: '' });
  const [showPwd, setShowPwd]       = useState(false);
  const [marketing, setMarketing]   = useState(false);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const userData = await googleLogin({
        access_token: tokenResponse.access_token,
        user_type: 'patient',
      });
      if (userData.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Error al iniciar sesión con Google' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email)        errs.email        = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email no válido';
    if (!form.emailConfirm) errs.emailConfirm = 'Confirma tu email';
    else if (form.email !== form.emailConfirm)  errs.emailConfirm = 'Los emails no coinciden';
    if (!form.password)     errs.password     = 'La contraseña es requerida';
    else if (form.password.length < 8)          errs.password = 'Mínimo 8 caracteres';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});
    try {
      const newUser = await register({
        email:     form.email,
        password:  form.password,
        user_type: 'patient',
      });
      if (newUser.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      const data = err.response?.data;
      setErrors({ general: data?.detail || 'Error al crear la cuenta. Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  return (
    <div className="pr-page">
      <div className="pr-card">
        <h1 className="pr-title">Crear cuenta</h1>

        {errors.general && (
          <div className="pr-error-banner">{errors.general}</div>
        )}

        {/* ── Google — solo se monta el hook si hay client ID ── */}
        {HAS_GOOGLE ? (
          <GoogleSignupButton
            onSuccess={handleGoogleSuccess}
            onError={() => setErrors({ general: 'Error al conectar con Google' })}
            disabled={busy}
          />
        ) : (
          <button type="button" className="pr-social-btn" disabled>
            <GoogleIcon />
            Continuar con Google
          </button>
        )}

        {/* ── Apple (próximamente) ── */}
        <button type="button" className="pr-social-btn" disabled title="Próximamente">
          <AppleIcon />
          Continuar con Apple
        </button>

        {/* ── Divider ── */}
        <div className="pr-divider">o</div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="pr-field">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="¿Cuál es su dirección de email?"
              className={`pr-input${errors.email ? ' error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <span className="pr-field-error">{errors.email}</span>}
          </div>

          <div className="pr-field">
            <input
              type="email"
              name="emailConfirm"
              value={form.emailConfirm}
              onChange={handleChange}
              placeholder="Verifica tu email"
              className={`pr-input${errors.emailConfirm ? ' error' : ''}`}
              autoComplete="off"
            />
            {errors.emailConfirm && <span className="pr-field-error">{errors.emailConfirm}</span>}
          </div>

          <div className="pr-field">
            <input
              type={showPwd ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Contraseña"
              className={`pr-input${errors.password ? ' error' : ''}`}
              autoComplete="new-password"
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              className="pr-eye-btn"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
            >
              <EyeIcon open={showPwd} />
            </button>
            {errors.password && <span className="pr-field-error">{errors.password}</span>}
          </div>

          <label className="pr-checkbox-row">
            <input
              type="checkbox"
              checked={marketing}
              onChange={e => setMarketing(e.target.checked)}
            />
            <span className="pr-checkbox-label">
              Quiero recibir comunicaciones comerciales de MedicFamily (opcional).{' '}
              <a href="/terms" onClick={e => e.preventDefault()}>Saber más</a>
            </span>
          </label>

          <button type="submit" className="pr-submit-btn" disabled={busy}>
            {busy ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="pr-terms">
          Al registrarte, confirmas que estás de acuerdo con nuestros{' '}
          <a href="/terms" onClick={e => e.preventDefault()}>términos y condiciones</a> y
          que entiendes nuestra{' '}
          <a href="/privacy" onClick={e => e.preventDefault()}>política de privacidad</a>.
        </p>

        <p className="pr-footer-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default PatientRegister;
