import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { authAPI } from '../api/client';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setIsLoading(true);
    try {
      console.log("📝 Enviando credenciales...");
      const response = await authAPI.login(formData.username, formData.password);
      console.log("✅ Login exitoso");
      
      // Guardar tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Guardar información del usuario
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('user_id', response.data.user.id);
      localStorage.setItem('user_role', response.data.user.role);
      
      console.log(`📤 Redirigiendo a dashboard del ${response.data.user.role}...`);
      
      // Redirigir según el role
      if (response.data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("❌ Error en login:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} />;
};

export default Login;
