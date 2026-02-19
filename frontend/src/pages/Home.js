import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [appointmentType, setAppointmentType] = useState('presencial');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implementar búsqueda de doctores
    console.log('Buscando:', { appointmentType, specialty, location });
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
          <div className="hero-image">
            <div className="doctors-illustration">👨‍⚕️👩‍⚕️👨‍⚕️</div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            {/* Appointment Type Toggle */}
            <div className="appointment-type">
              <button
                type="button"
                className={`type-btn ${appointmentType === 'presencial' ? 'active' : ''}`}
                onClick={() => setAppointmentType('presencial')}
              >
                📍 Visita presencial
              </button>
              <button
                type="button"
                className={`type-btn ${appointmentType === 'virtual' ? 'active' : ''}`}
                onClick={() => setAppointmentType('virtual')}
              >
                💻 En línea
              </button>
            </div>

            {/* Search Inputs */}
            <div className="search-inputs">
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="search-input"
                required
              >
                <option value="">Especialidad, enfermedad o nombre</option>
                <option value="cardiologia">Cardiología</option>
                <option value="dermatologia">Dermatología</option>
                <option value="pediatria">Pediatría</option>
                <option value="psicologia">Psicología</option>
                <option value="odontologia">Odontología</option>
                <option value="oftalmologia">Oftalmología</option>
                <option value="medicina_general">Medicina General</option>
              </select>

              <input
                type="text"
                placeholder="Ej. Guadalajara"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="search-input"
                required
              />

              <button type="submit" className="search-btn">
                🔍 Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Encuentra tu especialista</h3>
            <p>Las opiniones reales de miles de pacientes te ayudarán a tomar siempre la mejor decisión.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Pide cita de forma fácil</h3>
            <p>Elige la hora que prefieras y pide cita sin necesidad de llamar. Es fácil, cómodo y muy rápido.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>Recordatorios por SMS</h3>
            <p>Te confirmamos la cita al instante y te enviamos un recordatorio a tu celular antes de la cita.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
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
