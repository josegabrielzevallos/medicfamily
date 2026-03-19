import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DoctorRegisterForm from '../components/DoctorRegisterForm';
import DoctorProfilePreview from '../components/DoctorProfilePreview';
import './DoctorRegister.css';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const { login: syncAuth } = useAuth();
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormChange = (updatedFormData) => {
    setFormData(updatedFormData);
  };

  const handleFormSubmit = async (formDataFromForm) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📋 Iniciando registro de doctor...');
      
      console.log('📤 Enviando datos:', {
        email: formDataFromForm.email,
        firstName: formDataFromForm.firstName,
        lastName: formDataFromForm.lastName,
        phone: formDataFromForm.phone,
        specialty: formDataFromForm.specialty,
        city: formDataFromForm.city,
        password: formDataFromForm.password,
        passwordConfirm: formDataFromForm.password2,
      });

      const response = await authAPI.registerDoctor({
        email: formDataFromForm.email,
        password: formDataFromForm.password,
        passwordConfirm: formDataFromForm.password2,
        firstName: formDataFromForm.firstName,
        lastName: formDataFromForm.lastName,
        phone: formDataFromForm.phone,
        specialty: formDataFromForm.specialty,
        city: formDataFromForm.city,
      });

      const { access, refresh, user: newUser } = response.data || {};

      if (!access || !newUser) {
        throw new Error('Error de configuración: el servidor no respondió correctamente. Inténtalo de nuevo.');
      }

      // Guardar los tokens y usuario en localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('user_id', newUser.id);
      localStorage.setItem('user_role', 'doctor');

      // Redirigir al perfil del doctor
      navigate('/doctor/dashboard');
    } catch (err) {
      const errorData = err.response?.data;

      if (typeof errorData === 'object' && errorData !== null) {
        // Si es un objeto con errores de campos específicos
        const errorMessage = Object.entries(errorData)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
          })
          .join('; ');
        setError(errorMessage);
      } else {
        setError(errorData?.detail || err.message || 'Error en el registro. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="doctor-register">
      <div className="doctor-register__container">
        <div className="doctor-register__header">
          <h1>Crea tu perfil profesional gratuito en MedicFamily</h1>
          <p>Más de 12 millones de pacientes visitan nuestra plataforma cada mes. Aparece en las búsquedas y atrae a los pacientes indicados, sin costo.</p>
        </div>

        {error && (
          <div className="doctor-register__error">
            {error}
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="doctor-register__content">
          <div className="form-column">
            <DoctorRegisterForm 
              onFormChange={handleFormChange}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
          </div>

          <div className="preview-column">
            <DoctorProfilePreview formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;
