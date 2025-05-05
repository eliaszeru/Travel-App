import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CitiesList.css';

const CitiesList = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiKey = process.env.REACT_APP_OPENTRIP_API_KEY;

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=paris&apikey=${apiKey}`);
        const data = await response.json();
        console.log(data);

        setCities([
          { name: 'Paris', lat: data.lat, lon: data.lon },
          { name: 'Tokyo', lat: 35.682839, lon: 139.759455 },
          { name: 'New York', lat: 40.7128, lon: -74.0060 },
          { name: 'Rome', lat: 41.9028, lon: 12.4964 },
          { name: 'Mykonos', lat: 37.4467, lon: 25.3289 },
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitiesList;
