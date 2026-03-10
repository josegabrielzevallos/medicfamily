import React from 'react';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import './SelectUserType.css';

const SelectUserType = () => {
  const userTypes = [
    {
      id: 'patient',
      icon: PersonIcon,
      title: 'Soy paciente',
      description: 'Comparte información básica con tu especialista antes de la visita'
    },
    {
      id: 'doctor',
      icon: MedicalServicesIcon,
      title: 'Soy especialista',
      description: 'Consigue que tus pacientes te conozcan, confíen en ti y reserven contigo'
    },
    {
      id: 'clinic',
      icon: LocalHospitalIcon,
      title: 'Soy gerente de una clínica',
      description: 'Da mayor visibilidad a tu clínica con un perfil propio'
    }
  ];

  const getLink = (typeId) => {
    if (typeId === 'doctor') {
      return '/register/doctor';
    }
    if (typeId === 'patient') {
      return '/register/patient';
    }
    return `/register?type=${typeId}`;
  };

  return (
    <div className="select-user-type">
      <div className="select-user-type__container">
        <div className="select-user-type__header">
          <h1>Crear una cuenta gratuita</h1>
        </div>

        <div className="user-types-grid">
          {userTypes.map(type => {
            const IconComponent = type.icon;
            return (
              <Link
                key={type.id}
                to={getLink(type.id)}
                className="user-type-card"
              >
                <div className="user-type-card__icon"><IconComponent sx={{ fontSize: 80 }} /></div>
                <h3 className="user-type-card__title">{type.title}</h3>
                <p className="user-type-card__description">{type.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="select-user-type__footer">
          <p>¿Ya tienes una cuenta? <Link to="/login" className="login-link">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SelectUserType;
