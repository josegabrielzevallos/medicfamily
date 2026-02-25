import React, { useState, useRef, useEffect } from 'react';
import './CityAutocomplete.css';

function CityAutocomplete({ cities, value, onChange, placeholder = "Buscar ciudad..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const wrapperRef = useRef(null);

  // Filtrar ciudades cuando cambia el valor
  useEffect(() => {
    if (value && value.trim().length > 0) {
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setIsOpen(true);
    } else {
      setFilteredCities([]);
      setIsOpen(false);
    }
  }, [value, cities]);

  // Cerrar dropdown cuando hace click afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    onChange(city);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="city-autocomplete">
      <div className="city-input-wrapper">
        <span className="city-icon">📍</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && setIsOpen(true)}
          placeholder={placeholder}
          className="city-input"
          autoComplete="off"
        />
        {value && (
          <button
            className="city-clear-btn"
            onClick={() => onChange('')}
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && filteredCities.length > 0 && (
        <div className="city-dropdown">
          {filteredCities.map((city, idx) => (
            <div
              key={idx}
              className="city-option"
              onClick={() => handleSelect(city)}
            >
              <span>📍</span>
              <span>{city}</span>
            </div>
          ))}
        </div>
      )}

      {isOpen && value && filteredCities.length === 0 && (
        <div className="city-no-results">
          No hay ciudades que coincidan
        </div>
      )}
    </div>
  );
}

export default CityAutocomplete;
