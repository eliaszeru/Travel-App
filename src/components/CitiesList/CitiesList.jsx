import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CitiesList.css';

const CitiesList = () => {
  const [loading, setLoading] = useState(false);

  const cities = [
    { name: 'Paris', country: 'France' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'New York', country: 'United States' },
    { name: 'Rome', country: 'Italy' },
    { name: 'London', country: 'United Kingdom' },
    { name: 'Barcelona', country: 'Spain' },
    { name: 'Amsterdam', country: 'Netherlands' },
    { name: 'Dubai', country: 'United Arab Emirates' }
  ];

  return (
    <div className="cities-list">
      <h2>Popular Cities ✈️</h2>
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="city-grid">
          {cities.map((city, index) => (
            <Link key={index} to={`/city/${city.name}`} className="city-card">
              <h3>{city.name}</h3>
              <p>{city.country}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitiesList;
