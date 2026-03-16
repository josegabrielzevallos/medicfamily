import React, { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import { availabilityAPI } from '../../api/client';
import './DoctorAvailability.css';

// day_of_week: 0=Lunes, 1=Martes, ..., 6=Domingo
const DAY_KEYS = [0, 1, 2, 3, 4, 5, 6];
const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const defaultSchedule = () =>
  Object.fromEntries(DAY_KEYS.map(d => [d, {
    id: null, start_time: '09:00', end_time: '17:00', is_available: d < 5
  }]));

const TABS = [
  { key: 'presencial', label: 'Presencial', icon: <LocationOnIcon fontSize="small" /> },
  { key: 'virtual',    label: 'En línea',   icon: <VideocamIcon fontSize="small" /> },
];

const DoctorAvailability = ({ doctorData }) => {
  const [activeTab, setActiveTab] = useState('presencial');
  const [schedules, setSchedules] = useState({
    presencial: defaultSchedule(),
    virtual: defaultSchedule(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!doctorData?.doctor_id) return;
    setLoading(true);

    Promise.all([
      availabilityAPI.getAll({ doctor_id: doctorData.doctor_id, appointment_type: 'presencial' }),
      availabilityAPI.getAll({ doctor_id: doctorData.doctor_id, appointment_type: 'virtual' }),
    ])
      .then(([presRes, virtRes]) => {
        const build = (records) => {
          const base = defaultSchedule();
          const list = records.data?.results || records.data || [];
          list.forEach(rec => {
            const d = rec.day_of_week;
            base[d] = {
              id: rec.id,
              start_time: rec.start_time ? rec.start_time.substring(0, 5) : '09:00',
              end_time:   rec.end_time   ? rec.end_time.substring(0, 5)   : '17:00',
              is_available: rec.is_available,
            };
          });
          return base;
        };
        setSchedules({
          presencial: build(presRes),
          virtual:    build(virtRes),
        });
      })
      .catch(err => console.error('Error loading availability:', err))
      .finally(() => setLoading(false));
  }, [doctorData]);

  const handleTimeChange = (dayIdx, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [dayIdx]: { ...prev[activeTab][dayIdx], [field]: value },
      },
    }));
  };

  const handleToggle = (dayIdx) => {
    setSchedules(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [dayIdx]: { ...prev[activeTab][dayIdx], is_available: !prev[activeTab][dayIdx].is_available },
      },
    }));
  };

  const handleSave = async () => {
    if (!doctorData?.doctor_id) {
      setSaveError('No se encontró el ID del doctor.');
      return;
    }
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    const schedule = schedules[activeTab];
    try {
      for (const d of DAY_KEYS) {
        const slot = schedule[d];
        const payload = {
          doctor_id: doctorData.doctor_id,
          day_of_week: d,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available,
          appointment_type: activeTab,
        };
        if (slot.id) {
          const res = await availabilityAPI.update(slot.id, payload);
          setSchedules(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], [d]: { ...prev[activeTab][d], id: res.data.id } },
          }));
        } else {
          const res = await availabilityAPI.create(payload);
          setSchedules(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], [d]: { ...prev[activeTab][d], id: res.data.id } },
          }));
        }
      }
      setSaveMsg('Horario guardado correctamente.');
    } catch (err) {
      console.error('Error saving availability:', err);
      setSaveError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const schedule = schedules[activeTab];
  const activeDays = DAY_KEYS.filter(d => schedule[d].is_available).length;

  return (
    <div className="doctor-availability">
      <div className="availability-container">
        <div className="availability-section">
          <h3>Horarios de Atención</h3>
          <p className="section-description">
            Configura por separado tu disponibilidad presencial y en línea
          </p>

          {/* Type tabs */}
          <div className="avail-type-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`avail-type-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => { setActiveTab(tab.key); setSaveMsg(''); setSaveError(''); }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {saveMsg && <div className="alert alert-success">{saveMsg}</div>}
          {saveError && <div className="alert alert-error">{saveError}</div>}

          {loading ? (
            <p style={{ padding: '20px', color: '#718096' }}>Cargando horarios…</p>
          ) : (
            <div className="schedule-grid">
              {DAY_KEYS.map((d) => (
                <div key={d} className={`schedule-item ${schedule[d].is_available ? 'enabled' : 'disabled'}`}>
                  <div className="schedule-header">
                    <label className="schedule-day">{DAY_LABELS[d]}</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={schedule[d].is_available}
                        onChange={() => handleToggle(d)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {schedule[d].is_available && (
                    <div className="schedule-times">
                      <div className="time-input-group">
                        <label>Inicio</label>
                        <input
                          type="time"
                          value={schedule[d].start_time}
                          onChange={(e) => handleTimeChange(d, 'start_time', e.target.value)}
                        />
                      </div>
                      <div className="time-input-group">
                        <label>Fin</label>
                        <input
                          type="time"
                          value={schedule[d].end_time}
                          onChange={(e) => handleTimeChange(d, 'end_time', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {!schedule[d].is_available && (
                    <p className="not-available">No disponible</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="availability-actions">
          <button className="btn-save-schedule" onClick={handleSave} disabled={saving}>
            <SaveIcon fontSize="small" /> {saving ? 'Guardando…' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="availability-info">
        <div className="info-box">
          <h4><InfoIcon fontSize="small" /> Información</h4>
          <p>
            Configura tus horarios <strong>Presenciales</strong> y <strong>En línea</strong> por separado.
            Los pacientes verán los slots disponibles directamente en tu perfil.
          </p>
        </div>

        <div className="info-box">
          <h4><LocationOnIcon fontSize="small" /> Presencial</h4>
          <p>Consultas en tu consultorio. Los slots se calcularán a intervalos de 1 hora.</p>
          <strong style={{ color: '#16a085' }}>{DAY_KEYS.filter(d => schedules.presencial[d].is_available).length} días activos</strong>
        </div>

        <div className="info-box">
          <h4><VideocamIcon fontSize="small" /> En línea</h4>
          <p>Consultas virtuales. Puedes tener un horario diferente al presencial.</p>
          <strong style={{ color: '#16a085' }}>{DAY_KEYS.filter(d => schedules.virtual[d].is_available).length} días activos</strong>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
