import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚕️</span>
          MedicFamily
        </Link>

        {/* Hamburger Menu */}
        <button 
          className="hamburger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Inicio
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/doctors" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Encontrar Doctor
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/specialties" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Especialidades
            </Link>
          </li>
          <li className="navbar-item">
            <a href="#about" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Sobre Nosotros
            </a>
          </li>
        </ul>

        {/* Auth Buttons */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <Link 
                to="/appointments" 
                className="btn btn-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                Mis Citas
              </Link>
              <button 
                className="btn btn-logout"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn btn-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register/type" 
                className="btn btn-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
