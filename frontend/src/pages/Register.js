import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/client';
import AuthForm from '../components/AuthForm';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState('patient');

  useEffect(() => {
    const type = searchParams.get('type');
    if (!type) {
      navigate('/register/type');
    } else {
      setUserType(type === 'clinic' ? 'patient' : type);
    }
  }, [searchParams, navigate]);

  const handleRegister = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Register user
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        user_type: userType
      });

      // Store tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_type', userType);

      // Redirect to home
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.detail || 'Error en la registración. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (userType === 'doctor') return 'Registrarse como Especialista';
    return 'Registrarse como Paciente';
  };

  return (
    <div className="register">
      <div className="register__container">
        <div className="register__card">
          <h1 className="register__title">{getTitle()}</h1>
          <p className="register__subtitle">Crea tu cuenta gratuita</p>
          
          {error && <div className="register__error">{error}</div>}
          
          <AuthForm 
            mode="register"
            onSubmit={handleRegister}
            isLoading={isLoading}
            userType={userType}
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
