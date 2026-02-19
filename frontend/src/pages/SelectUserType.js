import React from 'react';
import { Link } from 'react-router-dom';
import './SelectUserType.css';

const SelectUserType = () => {
  const userTypes = [
    {
      id: 'patient',
      icon: '👩‍⚕️',
      title: 'Soy paciente',
      description: 'Comparte información básica con tu especialista antes de la visita'
    },
    {
      id: 'doctor',
      icon: '👨‍⚕️',
      title: 'Soy especialista',
      description: 'Consigue que tus pacientes te conozcan, confíen en ti y reserven contigo'
    },
    {
      id: 'clinic',
      icon: '🏥',
      title: 'Soy gerente de una clínica',
      description: 'Da mayor visibilidad a tu clínica con un perfil propio'
    }
  ];

  return (
    <div className="select-user-type">
      <div className="select-user-type__container">
        <div className="select-user-type__header">
          <h1>Crear una cuenta gratuita</h1>
        </div>

        <div className="user-types-grid">
          {userTypes.map(type => (
            <Link
              key={type.id}
              to={`/register?type=${type.id}`}
              className="user-type-card"
            >
              <div className="user-type-card__icon">{type.icon}</div>
              <h3 className="user-type-card__title">{type.title}</h3>
              <p className="user-type-card__description">{type.description}</p>
            </Link>
          ))}
        </div>

        <div className="select-user-type__footer">
          <p>¿Ya tienes una cuenta? <Link to="/login" className="login-link">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SelectUserType;
