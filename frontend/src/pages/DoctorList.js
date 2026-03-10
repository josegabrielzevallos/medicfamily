import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doctorAPI, specialtyAPI } from '../api/client';
import CityAutocomplete from '../components/CityAutocomplete';
import { peruCities } from '../utils/peruCities';
import './DoctorList.css';

const DoctorList = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filters, setFilters] = useState({
    specialty: '',
    search: '',
    city: searchParams.get('city') || '',
    specialtyName: searchParams.get('specialty') || '',
    type: searchParams.get('type') || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  // Cuando cargan las especialidades, si hay un nombre en la URL lo mapeamos al ID
  useEffect(() => {
    if (specialties.length > 0 && filters.specialtyName) {
      const match = specialties.find(
        s => s.name.toLowerCase().replace(/ /g, '_') === filters.specialtyName ||
             s.name.toLowerCase() === filters.specialtyName
      );
      if (match) {
        setFilters(f => ({ ...f, specialty: String(match.id), specialtyName: '' }));
      } else {
        fetchDoctors();
      }
    } else if (specialties.length > 0) {
      fetchDoctors();
    }
  }, [specialties]);

  useEffect(() => {
    if (specialties.length > 0) fetchDoctors();
  }, [filters.specialty, filters.search, filters.city, filters.type]);

  const fetchSpecialties = async () => {
    try {
      const response = await specialtyAPI.getAll();
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.specialty) params.specialty = filters.specialty;
      if (filters.city) params.city = filters.city;
      if (filters.type) params.appointment_type = filters.type;
      const response = await doctorAPI.getAll(params);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-list">
      <div className="doctor-list__header">
        <h1>Encuentra tu Doctor</h1>
        <p>Selecciona el especialista que necesitas</p>
      </div>

      <div className="doctor-list__container">
        {/* Filters */}
        <aside className="doctor-list__sidebar">
          <div className="filter-group">
            <label className="filter-label">Especialidad</label>
            <select
              value={filters.specialty}
              onChange={(e) => setFilters({...filters, specialty: e.target.value})}
              className="filter-select"
            >
              <option value="">Todas las especialidades</option>
              {specialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ciudad</label>
            <CityAutocomplete
              cities={peruCities}
              value={filters.city}
              onChange={(city) => setFilters({...filters, city})}
              placeholder="Ej. Lima, Cusco, Arequipa..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Buscar Doctor</label>
            <input
              type="text"
              placeholder="Nombre del doctor..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="filter-input"
            />
          </div>
        </aside>

        {/* Doctors Grid */}
        <main className="doctor-list__content">
          {loading ? (
            <div className="loading">Cargando doctores...</div>
          ) : doctors.length > 0 ? (
            <div className="doctors-grid">
              {doctors.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-card__image">
                    {doctor.profile_image ? (
                      <img src={doctor.profile_image} alt={doctor.user.first_name} />
                    ) : (
                      <div className="placeholder-avatar">👨‍⚕️</div>
                    )}
                  </div>
                  <div className="doctor-card__content">
                    <h3 className="doctor-card__name">
                      Dr. {doctor.user.first_name} {doctor.user.last_name}
                    </h3>
                    <p className="doctor-card__specialty">{doctor.specialty?.name}</p>
                    <p className="doctor-card__fee">Consulta: ${doctor.consultation_fee}</p>
                    <div className="doctor-card__rating">
                      ⭐ {doctor.average_rating.toFixed(1)} / 5
                    </div>
                    <p className="doctor-card__bio">{doctor.bio}</p>
                    <Link 
                      to={`/doctors/${doctor.id}`} 
                      className="doctor-card__btn"
                    >
                      Ver Perfil y Agendar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              No se encontraron doctores con esos filtros
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorList;
