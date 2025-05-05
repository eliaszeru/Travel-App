import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import citiesBudget from '../../data/citiesbudget.js';
import FlightSearch from './FlightSearch';
import './CityDetails.css';

const OPENTRIP_API_KEY = process.env.REACT_APP_OPENTRIP_API_KEY;
const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_KEY;
const FOURSQUARE_KEY = process.env.REACT_APP_FOURSQUARE_KEY;

const CityDetails = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [cityData, setCityData] = useState({
    image: '',
    description: '',
    country: '',
    visitors: ''
  });

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState({ city: true, places: true });
  const [costData, setCostData] = useState({
    days: 1,
    budgetLevel: 'mid',
    totalCost: null
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [costLoading, setCostLoading] = useState(false);

  // Check dark mode on mount and listen for changes
  useEffect(() => {
    const checkTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const isDark = savedTheme === 'dark' || (!savedTheme && document.documentElement.getAttribute('data-theme') === 'dark');
      setIsDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    // Check theme on mount
    checkTheme();

    // Listen for theme changes from other components
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Check if city is in favorites
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(cityName));
  }, [cityName]);

  // Toggle favorite status
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter(city => city !== cityName);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      favorites.push(cityName);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  // Fetch city data
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        // Get city image from Unsplash
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${cityName}&client_id=${UNSPLASH_KEY}&orientation=landscape`
        );
        const unsplashData = await unsplashRes.json();
        
        // Get city info from Wikipedia
        const wikiRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${cityName}`
        );
        const wikiData = await wikiRes.json();

        setCityData({
          image: unsplashData.results?.[0]?.urls?.regular || '',
          description: wikiData.extract?.split('. ').slice(0, 2).join('. ') + '.' || 'A fascinating destination',
          country: wikiData.description?.split(',')[0] || '',
          visitors: `${(Math.random() * 5 + 1).toFixed(2)} million annual visitors`
        });
      } catch (error) {
        console.error('Error loading city data:', error);
      } finally {
        setLoading(prev => ({ ...prev, city: false }));
      }
    };
    fetchCityData();
  }, [cityName]);

  // Fetch recommendations
  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(prev => ({ ...prev, places: true }));
        
        // Get city coordinates from OpenTripMap
        const geoRes = await fetch(
          `https://api.opentripmap.com/0.1/en/places/geoname?name=${cityName}&apikey=${OPENTRIP_API_KEY}`
        );
        const geoData = await geoRes.json();

        // Fetch places from Foursquare
        const foursquareRes = await fetch(
          `https://api.foursquare.com/v3/places/search?ll=${geoData.lat},${geoData.lon}&radius=10000&limit=50&sort=POPULARITY`,
          {
            headers: {
              'Authorization': FOURSQUARE_KEY,
              'Accept': 'application/json'
            }
          }
        );
        const foursquareData = await foursquareRes.json();

        if (!foursquareData.results || foursquareData.results.length === 0) {
          throw new Error('No places found');
        }

        // Process and filter places
        const validPlaces = foursquareData.results
          .filter(place => place.name && place.categories && place.categories.length > 0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5);

        setRecommendations(validPlaces.map(place => ({
          name: place.name,
          description: place.categories[0].name
        })));
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(prev => ({ ...prev, places: false }));
      }
    };
    fetchAttractions();
  }, [cityName]);

  // Cost calculation
  const calculateCost = () => {
    setCostLoading(true);
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const dailyCost = citiesBudget[cityName]?.[costData.budgetLevel] || 150;
      setCostData(prev => ({
        ...prev,
        totalCost: dailyCost * prev.days
      }));
      setCostLoading(false);
    }, 1500); // 1.5 second delay for loading animation
  };

  return (
    <div className="city-container">
      <div className="navigation-buttons">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span>←</span> Back to Home
        </button>
        <button 
          className="favorite-btn" 
          onClick={toggleFavorite}
          style={{ background: isFavorite ? '#e74c3c' : '#2ecc71' }}
        >
          <span>{isFavorite ? '★' : '☆'}</span> 
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      </div>

      <div className="city-hero">
        <div className="city-photo-frame">
          <img 
            src={cityData.image} 
            alt={cityName} 
            className="city-main-photo"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      </div>

      {/* City Description */}
      <div className="city-description-section">
        <h1>{cityName}</h1>
        <div className="city-meta">
          {cityData.country && <span>📍 {cityData.country}</span>}
          <span>👥 {cityData.visitors}</span>
        </div>
        <p className="city-description">{cityData.description}</p>
      </div>

      {/* Recommendations */}
      <section className="recommendations-section">
        <h2>Top 5 Must-Visit Places</h2>
        {loading.places ? (
          <p className="loading">Loading recommendations...</p>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map((place, index) => (
              <div key={index} className="recommendation-card">
                <h3>{place.name}</h3>
                <p className="place-description">{place.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Flight Search */}
      <FlightSearch cityName={cityName} />

      {/* Cost Calculator */}
      <section className="cost-calculator">
        <h2>Cost Estimation (CHF)</h2>
        <div className="calculator-controls">
          <div className="input-group">
            <label>Days:</label>
            <input
              type="number"
              min="1"
              value={costData.days}
              onChange={(e) => setCostData(prev => ({
                ...prev,
                days: Math.max(1, parseInt(e.target.value) || 1)
              }))}
            />
          </div>
          
          <div className="input-group">
            <label>Budget Level:</label>
            <select
              value={costData.budgetLevel}
              onChange={(e) => setCostData(prev => ({
                ...prev,
                budgetLevel: e.target.value
              }))}
            >
              <option value="low">Budget</option>
              <option value="mid">Mid-range</option>
              <option value="high">Luxury</option>
            </select>
          </div>
          
          <button 
            className="calculate-btn" 
            onClick={calculateCost}
            disabled={costLoading}
          >
            {costLoading ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
        
        {costLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Calculating your trip cost...</p>
          </div>
        ) : costData.totalCost && (
          <div className="cost-result">
            Estimated Total (without flight tickets): <span>CHF {costData.totalCost}</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default CityDetails;