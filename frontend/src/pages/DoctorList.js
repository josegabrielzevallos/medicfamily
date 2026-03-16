import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { doctorAPI, availabilityAPI } from '../api/client';
import { getCityCoords } from '../utils/peruCityCoords';
import './DoctorList.css';

// Fix Leaflet default marker icons in webpack/CRA
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const activeMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Fly the map to a new position when it changes
const MapFlyTo = ({ position, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom, { animate: true, duration: 1 });
  }, [position, zoom, map]);
  return null;
};

const StarRating = ({ rating }) => (
  <div className="dl-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={i <= Math.round(rating) ? 'dl-star dl-star--on' : 'dl-star dl-star--off'}>★</span>
    ))}
    <span className="dl-rating-val">{rating > 0 ? rating.toFixed(1) : 'Sin reseñas'}</span>
  </div>
);

const DoctorCard = ({ doctor, selected, onSelect }) => {
  const fullName = `${doctor.user.first_name} ${doctor.user.last_name}`.trim();
  const [slotTab, setSlotTab]       = useState('presencial');
  const [slots, setSlots]           = useState({ presencial: null, virtual: null });
  const [showAll, setShowAll]       = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async (type) => {
      try {
        const res = await availabilityAPI.getUpcomingSlots({
          doctor_id: doctor.id,
          appointment_type: type,
          days: 3,
        });
        if (!cancelled) setSlots(prev => ({ ...prev, [type]: res.data }));
      } catch {
        if (!cancelled) setSlots(prev => ({ ...prev, [type]: [] }));
      }
    };
    load('presencial');
    load('virtual');
    return () => { cancelled = true; };
  }, [doctor.id]);

  const days = slots[slotTab];
  const MAX_SLOTS = showAll ? 99 : 5;

  return (
    <div
      className={`dl-card${selected ? ' dl-card--selected' : ''}`}
      onMouseEnter={() => onSelect(doctor.id)}
      onMouseLeave={() => onSelect(null)}
    >
      <div className="dl-card-photo">
        {doctor.profile_image
          ? <img src={doctor.profile_image} alt={fullName} />
          : <div className="dl-card-avatar">{fullName[0]?.toUpperCase() || '?'}</div>}
      </div>

      <div className="dl-card-info">
        <div className="dl-card-name">
          Dr. {fullName}
          {doctor.is_verified && <VerifiedIcon className="dl-verified" />}
        </div>
        <div className="dl-card-specialty">{doctor.specialty?.name || 'Médico general'}</div>
        <StarRating rating={doctor.average_rating} />
        {doctor.bio && (
          <p className="dl-card-bio">
            {doctor.bio.length > 110 ? doctor.bio.substring(0, 110) + '…' : doctor.bio}
          </p>
        )}
        <div className="dl-card-address">
          <LocationOnIcon style={{ fontSize: 13, marginRight: 4, flexShrink: 0 }} />
          {doctor.address}
        </div>
      </div>

      {/* Slots panel */}
      <div className="dl-card-slots">
        {/* Tabs */}
        <div className="dl-slot-tabs">
          <button
            className={`dl-slot-tab${slotTab === 'presencial' ? ' active' : ''}`}
            onClick={() => { setSlotTab('presencial'); setShowAll(false); }}
          >
            <LocationOnIcon style={{ fontSize: 13 }} /> Dirección
          </button>
          <button
            className={`dl-slot-tab${slotTab === 'virtual' ? ' active' : ''}`}
            onClick={() => { setSlotTab('virtual'); setShowAll(false); }}
          >
            <VideocamIcon style={{ fontSize: 13 }} /> En línea
          </button>
        </div>

        {days === null ? (
          <p className="dl-slots-loading">…</p>
        ) : (
          <>
            <div className="dl-slot-days">
              {days.map(day => (
                <div key={day.date} className="dl-slot-day">
                  <div className="dl-slot-day-header">
                    <span className="dl-slot-day-label">{day.label}</span>
                    <span className="dl-slot-day-date">{day.date.slice(5).replace('-', ' ')}</span>
                  </div>
                  <div className="dl-slot-times">
                    {day.slots.length === 0
                      ? <span className="dl-slot-none">—</span>
                      : day.slots.slice(0, MAX_SLOTS).map(s => (
                          <Link
                            key={s}
                            to={`/doctors/${doctor.id}?date=${day.date}&time=${s}&type=${slotTab}`}
                            className="dl-slot-chip"
                          >{s}</Link>
                        ))
                    }
                  </div>
                </div>
              ))}
            </div>
            {days.some(d => d.slots.length > 5) && (
              <button className="dl-slots-more" onClick={() => setShowAll(v => !v)}>
                {showAll ? 'Ver menos' : 'Mostrar más horas'} <ExpandMoreIcon style={{ fontSize: 14, verticalAlign: 'middle', transform: showAll ? 'rotate(180deg)' : 'none' }} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const DoctorList = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Filters — type pill is local; rest come from URL params set by Navbar
  const [filters, setFilters] = useState({
    specialty: searchParams.get('specialty') || '',
    city:      searchParams.get('city')      || '',
    search:    searchParams.get('search')    || '',
    type:      '',
  });

  // Re-sync filters when URL params change (Navbar search navigates here)
  useEffect(() => {
    setFilters(f => ({
      ...f,
      specialty: searchParams.get('specialty') || '',
      city:      searchParams.get('city')      || '',
      search:    searchParams.get('search')    || '',
    }));
  }, [searchParams.toString()]);

  const loadDoctors = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      if (f.search)    params.search           = f.search;
      if (f.specialty) params.specialty        = f.specialty;
      if (f.city)      params.city             = f.city;
      if (f.type)      params.appointment_type = f.type;
      const res = await doctorAPI.getAll(params);
      const data = res.data;
      setDoctors(Array.isArray(data) ? data : (data.results ?? []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDoctors(filters); }, [filters, loadDoctors]);

  // Resolve coordinates for each doctor from their address
  const doctorsWithCoords = useMemo(
    () => doctors
      .map(d => ({ ...d, coords: getCityCoords(d.address) }))
      .filter(d => d.coords),
    [doctors]
  );

  const selectedDoctor = doctors.find(d => d.id === selectedId);
  const mapCenter = useMemo(() => {
    if (selectedDoctor?.address) {
      const c = getCityCoords(selectedDoctor.address);
      if (c) return c;
    }
    if (filters.city) {
      const c = getCityCoords(filters.city);
      if (c) return c;
    }
    return [-9.19, -75.01]; // Peru center
  }, [selectedId, filters.city, selectedDoctor]);

  const mapZoom = selectedId ? 13 : filters.city ? 11 : 5;

  const resultLabel = loading
    ? 'Buscando…'
    : `${doctors.length} doctor${doctors.length !== 1 ? 'es' : ''} encontrado${doctors.length !== 1 ? 's' : ''}`
      + (filters.city ? ` en ${filters.city}` : '');

  return (
    <div className="dl-page">

      {/* ── Filter pills ── */}
      <div className="dl-filterbar">
        <div className="dl-filterbar-inner">
          <div className="dl-pills">
            {[
              { label: 'Todos',      value: '',           icon: null },
              { label: 'Presencial', value: 'presencial', icon: <PersonIcon fontSize="small" /> },
              { label: 'Virtual',    value: 'virtual',    icon: <VideocamIcon fontSize="small" /> },
            ].map(opt => (
              <button
                key={opt.value}
                className={`dl-pill${filters.type === opt.value ? ' dl-pill--active' : ''}`}
                onClick={() => setFilters(f => ({ ...f, type: opt.value }))}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
          <span className="dl-result-count">{resultLabel}</span>
        </div>
      </div>

      {/* ── Body: list + map ── */}
      <div className="dl-body">

        {/* Doctor list */}
        <div className="dl-list-panel">
          {loading ? (
            <div className="dl-loading">Cargando doctores…</div>
          ) : doctors.length === 0 ? (
            <div className="dl-empty">No se encontraron doctores con esos filtros.</div>
          ) : (
            doctors.map(doc => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                selected={selectedId === doc.id}
                onSelect={setSelectedId}
              />
            ))
          )}
        </div>

        {/* Map */}
        <div className="dl-map-panel">
          <MapContainer center={mapCenter} zoom={mapZoom} className="dl-map" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFlyTo position={mapCenter} zoom={mapZoom} />
            {doctorsWithCoords.map(doc => (
              <Marker
                key={doc.id}
                position={doc.coords}
                icon={doc.id === selectedId ? activeMarkerIcon : markerIcon}
                eventHandlers={{ click: () => setSelectedId(doc.id) }}
              >
                <Popup>
                  <strong>Dr. {doc.user.first_name} {doc.user.last_name}</strong><br />
                  <span style={{ color: '#666', fontSize: 12 }}>{doc.specialty?.name}</span><br />
                  {doc.address}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {doctorsWithCoords.length === 0 && !loading && doctors.length > 0 && (
            <div className="dl-map-hint">
              Sin ubicación registrada para los doctores actuales.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DoctorList;
