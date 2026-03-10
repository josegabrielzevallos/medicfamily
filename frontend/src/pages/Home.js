import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ComputerIcon from '@mui/icons-material/Computer';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CityAutocomplete from '../components/CityAutocomplete';
import { peruCities } from '../utils/peruCities';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [appointmentType, setAppointmentType] = useState('presencial');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [showOnlineInfo, setShowOnlineInfo] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (specialty) params.set('specialty', specialty);
    if (appointmentType === 'presencial' && location) params.set('city', location);
    params.set('type', appointmentType);
    navigate(`/doctors?${params.toString()}`);
  };

  const handleTypeChange = (type) => {
    setAppointmentType(type);
    if (type === 'virtual') setLocation('');
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Encuentra tu especialista y pide cita</h1>
            <p>Miles de profesionales están aquí para ayudarte</p>
          </div>
        
        </div>

        {/* Search Section */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            {/* Appointment Type Toggle */}
            <div className="appointment-type-btn">
              <button
                type="button"
                className={`type-btn ${appointmentType === 'presencial' ? 'active' : ''}`}
                onClick={() => handleTypeChange('presencial')}
              >
                <LocationOnIcon sx={{ fontSize: 18 }} /> Visita presencial
              </button>
              <button
                type="button"
                className={`type-btn ${appointmentType === 'virtual' ? 'active' : ''}`}
                onClick={() => handleTypeChange('virtual')}
              >
                <ComputerIcon sx={{ fontSize: 18 }} /> En línea
              </button>
            </div>

            {/* Search Inputs */}
            <div className={`search-inputs${appointmentType === 'virtual' ? ' search-inputs--virtual' : ''}`}>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="search-input"
              >
                <option value="">Especialidad, enfermedad o nombre</option>
                <option value="cardiologia">Cardiología</option>
                <option value="dermatologia">Dermatología</option>
                <option value="pediatria">Pediatría</option>
                <option value="psicologia">Psicología</option>
                <option value="odontologia">Odontología</option>
                <option value="oftalmologia">Oftalmología</option>
                <option value="medicina_general">Medicina General</option>
                <option value="neurologia">Neurología</option>
                <option value="traumatologia">Traumatología</option>
                <option value="otorinolaringologia">Otorrinolaringología</option>
              </select>

              {appointmentType === 'presencial' && (
                <CityAutocomplete
                  cities={peruCities}
                  value={location}
                  onChange={(city) => setLocation(city)}
                  placeholder="Ej. Lima, Cusco, Arequipa..."
                />
              )}

              <button type="submit" className="search-btn">
                <SearchIcon sx={{ marginRight: 1 }} /> Buscar
              </button>
            </div>

            {appointmentType === 'virtual' && (
              <div className="online-info-row">
                <button
                  type="button"
                  className="online-info-link"
                  onClick={() => setShowOnlineInfo(true)}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 16, marginRight: 0.5 }} />
                  ¿En qué consiste la consulta en línea?
                </button>
              </div>
            )}
          </form>

          {showOnlineInfo && (
            <div className="online-info-overlay" onClick={() => setShowOnlineInfo(false)}>
              <div className="online-info-modal" onClick={(e) => e.stopPropagation()}>
                <button className="online-info-close" onClick={() => setShowOnlineInfo(false)}>
                  <CloseIcon sx={{ fontSize: 20 }} />
                </button>
                <h3>¿Qué es una consulta en línea?</h3>
                <hr className="online-info-divider" />
                <p>
                  La consulta en línea te permite interactuar con un especialista de forma remota.
                  Es como una visita normal, solo que sin necesidad de salir de casa.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><SearchIcon sx={{ fontSize: 60 }} /></div>
            <h3>Encuentra tu especialista</h3>
            <p>Las opiniones reales de miles de pacientes te ayudarán a tomar siempre la mejor decisión.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><CheckCircleIcon sx={{ fontSize: 60 }} /></div>
            <h3>Pide cita de forma fácil</h3>
            <p>Elige la hora que prefieras y pide cita sin necesidad de llamar. Es fácil, cómodo y muy rápido.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><AccessTimeIcon sx={{ fontSize: 60 }} /></div>
            <h3>Recordatorios por SMS</h3>
            <p>Te confirmamos la cita al instante y te enviamos un recordatorio a tu celular antes de la cita.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><AttachMoneyIcon sx={{ fontSize: 60 }} /></div>
            <h3>Sin costos añadidos</h3>
            <p>La reserva de cita es un servicio gratuito de MedicFamily.</p>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="specialties">
        <h2>Especialidades populares</h2>
        <div className="specialties-grid">
          <Link to="/doctors?specialty=ginecologia" className="specialty-link">Ginecología</Link>
          <Link to="/doctors?specialty=psicologia" className="specialty-link">Psicología</Link>
          <Link to="/doctors?specialty=dermatologia" className="specialty-link">Dermatología</Link>
          <Link to="/doctors?specialty=oftalmologia" className="specialty-link">Oftalmología</Link>
          <Link to="/doctors?specialty=urologia" className="specialty-link">Urología</Link>
          <Link to="/doctors?specialty=ortopedia" className="specialty-link">Ortopedia</Link>
          <Link to="/doctors?specialty=otorinolaringologia" className="specialty-link">Otorrinolaringología</Link>
          <Link to="/doctors?specialty=pediatria" className="specialty-link">Pediatría</Link>
          <Link to="/doctors?specialty=psiquiatria" className="specialty-link">Psiquiatría</Link>
          <Link to="/doctors?specialty=cirujano_general" className="specialty-link">Cirujano general</Link>
          <Link to="/doctors?specialty=internista" className="specialty-link">Internista</Link>
          <Link to="/doctors?specialty=traumatologo" className="specialty-link">Traumatólogo</Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Eres profesional de la salud?</h2>
          <p>Conecta con tus pacientes en línea y crece tu negocio</p>
          <Link to="/register/type" className="cta-btn">
            Registrate como profesional
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
