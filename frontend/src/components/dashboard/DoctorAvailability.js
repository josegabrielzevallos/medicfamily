import React, { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import { availabilityAPI } from '../../api/client';
import './DoctorAvailability.css';

// day_of_week: 0=Lunes, 1=Martes, ..., 6=Domingo
const DAY_KEYS = [0, 1, 2, 3, 4, 5, 6];
const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const defaultSchedule = () =>
  Object.fromEntries(DAY_KEYS.map(d => [d, {
    id: null, start_time: '09:00', end_time: '17:00', is_available: d < 5
  }]));

const DoctorAvailability = ({ doctorData }) => {
  const [schedule, setSchedule] = useState(defaultSchedule());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!doctorData?.doctor_id) return;
    setLoading(true);
    availabilityAPI.getAll({ doctor_id: doctorData.doctor_id })
      .then(response => {
        const records = response.data?.results || response.data || [];
        const base = defaultSchedule();
        records.forEach(rec => {
          const d = rec.day_of_week;
          base[d] = {
            id: rec.id,
            start_time: rec.start_time ? rec.start_time.substring(0, 5) : '09:00',
            end_time: rec.end_time ? rec.end_time.substring(0, 5) : '17:00',
            is_available: rec.is_available,
          };
        });
        setSchedule(base);
      })
      .catch(err => console.error('Error loading availability:', err))
      .finally(() => setLoading(false));
  }, [doctorData]);

  const handleTimeChange = (dayIdx, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayIdx]: { ...prev[dayIdx], [field]: value },
    }));
  };

  const handleToggle = (dayIdx) => {
    setSchedule(prev => ({
      ...prev,
      [dayIdx]: { ...prev[dayIdx], is_available: !prev[dayIdx].is_available },
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
    try {
      for (const d of DAY_KEYS) {
        const slot = schedule[d];
        const payload = {
          doctor_id: doctorData.doctor_id,
          day_of_week: d,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available,
        };
        if (slot.id) {
          const res = await availabilityAPI.update(slot.id, payload);
          setSchedule(prev => ({ ...prev, [d]: { ...prev[d], id: res.data.id } }));
        } else {
          const res = await availabilityAPI.create(payload);
          setSchedule(prev => ({ ...prev, [d]: { ...prev[d], id: res.data.id } }));
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

  const activeDays = DAY_KEYS.filter(d => schedule[d].is_available).length;

  return (
    <div className="doctor-availability">
      <div className="availability-container">
        <div className="availability-section">
          <h3>Horarios de Trabajo</h3>
          <p className="section-description">Configura tu disponibilidad semanal</p>

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
          <p>Estos horarios se mostrarán a los pacientes para que puedan agendar citas.</p>
        </div>

        <div className="info-box">
          <h4><SettingsIcon fontSize="small" /> Duración de Citas</h4>
          <div className="duration-settings">
            <label>Duración estándar:</label>
            <select className="duration-select">
              <option>15 minutos</option>
              <option selected>30 minutos</option>
              <option>45 minutos</option>
              <option>60 minutos</option>
            </select>
          </div>
        </div>

        <div className="info-box">
          <h4><BarChartIcon fontSize="small" /> Resumen</h4>
          <div className="summary-stats">
            <div className="summary-item">
              <span>Días activos:</span>
              <strong>{activeDays} días</strong>
            </div>
            <div className="summary-item">
              <span>Horario predeterminado:</span>
              <strong>09:00 – 17:00</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
