import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import MedicationIcon from '@mui/icons-material/Medication';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../context/AuthContext';
import CityAutocomplete from './CityAutocomplete';
import { peruCities } from '../utils/peruCities';
import { specialtyAPI } from '../api/client';
import './Navbar.css';

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [nbSpecialty, setNbSpecialty] = useState('');
  const [nbCity, setNbCity]           = useState('');
  const [nbName, setNbName]           = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const isDoctorsPage = location.pathname === '/doctors';
  const isAuthenticated = !!token;
  const isPatient = isAuthenticated && user?.role !== 'doctor';

  useEffect(() => {
    specialtyAPI.getAll()
      .then(r => {
        const d = r.data;
        setSpecialties(Array.isArray(d) ? d : (d.results ?? []));
      })
      .catch(() => {});
  }, []);

  const handleNavSearch = () => {
    const params = new URLSearchParams();
    if (nbSpecialty) params.set('specialty', nbSpecialty);
    if (nbCity)      params.set('city', nbCity);
    if (nbName)      params.set('search', nbName);
    navigate(`/doctors?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAll = () => {
    setIsDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon"><MedicalServicesIcon /></span>
          MedicFamily
        </Link>

        {/* Central search bar — only on /doctors */}
        {isDoctorsPage && (
          <div className="navbar-search">
            <select
              className="nb-search-select"
              value={nbSpecialty}
              onChange={e => setNbSpecialty(e.target.value)}
            >
              <option value="">Especialidad o nombre</option>
              {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="nb-search-sep" />
            <div className="nb-city-wrap">
              <CityAutocomplete
                cities={peruCities}
                value={nbCity}
                onChange={setNbCity}
                placeholder="Ciudad…"
              />
            </div>
            <div className="nb-search-sep" />
            <input
              className="nb-search-name"
              type="text"
              placeholder="Nombre del doctor…"
              value={nbName}
              onChange={e => setNbName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNavSearch()}
            />
            <button className="nb-search-btn" onClick={handleNavSearch} aria-label="Buscar">
              <SearchIcon fontSize="small" />
            </button>
          </div>
        )}

        {/* Auth Buttons — desktop only */}
        <div className="navbar-auth">
          {isPatient ? (
            <div className="navbar-account" ref={dropdownRef}>
              <button
                className="navbar-account-btn"
                onClick={() => setIsDropdownOpen(v => !v)}
              >
                <span className="navbar-account-avatar">
                  {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'P'}
                </span>
                <span className="navbar-account-label">Mi cuenta</span>
                <span className={`navbar-account-chevron ${isDropdownOpen ? 'open' : ''}`}><ChevronDown /></span>
              </button>

              {isDropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <span className="navbar-dropdown-name">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
                    </span>
                    <span className="navbar-dropdown-email">{user?.email}</span>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link to="/patient/profile" className="navbar-dropdown-item" onClick={closeAll}>
                    <AccountCircleIcon className="ndi-icon" /> Configuración de la cuenta
                  </Link>
                  <Link to="/patient/doctors" className="navbar-dropdown-item" onClick={closeAll}>
                    <LocalHospitalIcon className="ndi-icon" /> Mis médicos
                  </Link>
                  <Link to="/appointments" className="navbar-dropdown-item" onClick={closeAll}>
                    <CalendarMonthIcon className="ndi-icon" /> Mis citas
                  </Link>
                  <Link to="/patient/history" className="navbar-dropdown-item" onClick={closeAll}>
                    <HistoryIcon className="ndi-icon" /> Historial médico
                  </Link>
                  <Link to="/patient/prescriptions" className="navbar-dropdown-item" onClick={closeAll}>
                    <MedicationIcon className="ndi-icon" /> Mis recetas
                  </Link>
                  <div className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                    <LogoutIcon className="ndi-icon" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : isAuthenticated ? (
            <button className="btn btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" onClick={closeAll}>Iniciar Sesión</Link>
              <Link to="/register/type" className="btn btn-primary" onClick={closeAll}>Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
