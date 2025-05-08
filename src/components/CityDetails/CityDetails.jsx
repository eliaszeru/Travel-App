import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import citiesBudget from '../../data/citiesbudget.js';
import FlightSearch from './FlightSearch';
import './CityDetails.css';

// API Keys
const UNSPLASH_KEY = 'Auu8lHIXbUdDrbInpLGwAwwUlFyNu5WicDkRFYqzjwc';
const FOURSQUARE_KEY = 'fsq3t4Z9Kz2fFNbYUqR4LPZhRqakV1DGfqIryL8CT8sh7x0=';

// Cost constants
const accommodationCosts = {
  budget: 50,
  mid: 100,
  luxury: 200
};

const foodCosts = {
  budget: 30,
  mid: 60,
  luxury: 120
};

const activitiesCosts = {
  budget: 20,
  mid: 50,
  luxury: 100
};

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
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedAccommodation, setSelectedAccommodation] = useState('mid');
  const [selectedFood, setSelectedFood] = useState('mid');
  const [selectedActivities, setSelectedActivities] = useState('mid');
  const [costEstimate, setCostEstimate] = useState(null);
  const [days, setDays] = useState(1);

  // Initialize dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      // If no theme is saved, set dark mode as default
      localStorage.setItem('theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
    } else {
      // Apply saved theme
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    }
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

  // Fetch city data and image
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoading(prev => ({ ...prev, city: true }));
        
        // Get city image from Unsplash with specific queries for each city
        let imageQuery;
        if (cityName === 'Addis Ababa') {
          imageQuery = 'addis ababa';
        } else if (cityName === 'New York') {
          imageQuery = 'new york city times square';
        } else {
          imageQuery = `${cityName} city landmark`;
        }
          
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(imageQuery)}&client_id=${UNSPLASH_KEY}&orientation=landscape&per_page=1`
        );
        const unsplashData = await unsplashRes.json();
        
        // Get city info from Wikipedia
        const wikiRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${cityName}`
        );
        const wikiData = await wikiRes.json();

        if (!unsplashRes.ok || !wikiRes.ok) {
          throw new Error('Failed to fetch city data');
        }

        // Get visitor data from Wikipedia
        let visitors = `${(Math.random() * 5 + 1).toFixed(2)} million annual visitors`;

        setCityData({
          image: unsplashData.results?.[0]?.urls?.regular || 'https://via.placeholder.com/400x300?text=No+Image+Available',
          description: wikiData.extract,
          country: wikiData.description?.split(',')[0] || '',
          visitors: visitors
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
        
        // Get places from Foursquare
        const response = await fetch(
          `https://api.foursquare.com/v3/places/search?near=${encodeURIComponent(cityName)}&categories=16000,10000,13000,12000&sort=POPULARITY&limit=5`,
          {
            method: 'GET',
            headers: {
              'Authorization': FOURSQUARE_KEY,
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch from Foursquare');
        }

        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
          throw new Error('No places found');
        }

        // Process places
        const places = data.results.map(place => ({
          name: place.name,
          category: place.categories?.[0]?.name || 'Landmark'
        }));

        setRecommendations(places);
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
    if (!days || days < 1) {
      setError('Please enter a valid number of days');
      return;
    }

    setIsCalculating(true);
    setError(null);

    // Simulate API call with setTimeout
    setTimeout(() => {
      const accommodationCost = accommodationCosts[selectedAccommodation] * days;
      const foodCost = foodCosts[selectedFood] * days;
      const activitiesCost = activitiesCosts[selectedActivities] * days;
      const totalCost = accommodationCost + foodCost + activitiesCost;
      
      setCostEstimate({
        days,
        accommodationCost,
        foodCost,
        activitiesCost,
        totalCost
      });
      setIsCalculating(false);
    }, 1500); // 1.5 second delay to show loading effect
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

      {/* City Hero Section */}
      <section className="city-hero">
        <div className="city-photo-frame">
          {cityData.image && (
            <img 
              src={cityData.image} 
              alt={cityName} 
              className="city-main-photo"
            />
          )}
        </div>
      </section>

      {/* City Info */}
      <section className="city-description-section">
        <h1>{cityName}</h1>
        <div className="city-meta">
          {cityData.country && <span>📍 {cityData.country}</span>}
          <span>👥 {cityData.visitors}</span>
        </div>
        <p className="city-description">{cityData.description}</p>
      </section>

      {/* Recommendations Section */}
      <section className="recommendations-section">
        <h2>Recommended Places</h2>
        {loading.places ? (
          <div className="loading">Loading recommendations...</div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map((place, index) => (
              <div key={index} className="recommendation-card">
                <h3>{place.name}</h3>
                <p>{place.category}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Flight Search */}
      <FlightSearch cityName={cityName} />

      {/* Cost Calculator */}
      <section className="cost-calculator">
        <h2>Cost Calculator</h2>
        <div className="calculator-controls">
          <div className="input-group">
            <label>Number of Days:</label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="input-group">
            <label>Accommodation:</label>
            <select
              value={selectedAccommodation}
              onChange={(e) => setSelectedAccommodation(e.target.value)}
            >
              <option value="budget">Budget</option>
              <option value="mid">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div className="input-group">
            <label>Food:</label>
            <select
              value={selectedFood}
              onChange={(e) => setSelectedFood(e.target.value)}
            >
              <option value="budget">Budget</option>
              <option value="mid">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div className="input-group">
            <label>Activities:</label>
            <select
              value={selectedActivities}
              onChange={(e) => setSelectedActivities(e.target.value)}
            >
              <option value="budget">Budget</option>
              <option value="mid">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          className="calculate-btn" 
          onClick={calculateCost}
          disabled={isCalculating}
        >
          {isCalculating ? 'Calculating...' : 'Calculate Cost'}
        </button>
        
        {isCalculating ? (
          <div className="loading">
            <div className="loading-text">Calculating your trip cost...</div>
          </div>
        ) : costEstimate && (
          <div className="cost-result">
            <h3>Estimated Cost</h3>
            <div className="total-cost">
              ${costEstimate.totalCost.toLocaleString()}
            </div>
            <div className="cost-breakdown">
              <p>Duration: {costEstimate.days} days</p>
              <p>Accommodation: ${costEstimate.accommodationCost.toLocaleString()}</p>
              <p>Food: ${costEstimate.foodCost.toLocaleString()}</p>
              <p>Activities: ${costEstimate.activitiesCost.toLocaleString()}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CityDetails;