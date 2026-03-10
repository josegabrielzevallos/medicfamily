import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, googleLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      const userData = await login(formData.username, formData.password);
      if (userData.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const userData = await googleLogin({ credential: credentialResponse.credential, user_type: 'patient' });
      if (userData.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  return (
    <AuthForm
      mode="login"
      onSubmit={handleLogin}
      onGoogleSuccess={handleGoogleLogin}
      isLoading={isLoading}
    />
  );
};

export default Login;

