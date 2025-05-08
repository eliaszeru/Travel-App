import React, { useEffect, useState } from 'react';
import { API_KEY } from '../../api';
import './Homepage.css';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaHeart, FaRegHeart } from 'react-icons/fa';

const HomePage = () => {
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const destinations = [
    "Paris", "New York", "Tokyo", "Rome", "Dubai", "London", "Barcelona", "Istanbul", "Singapore", "Bangkok",
    "Los Angeles", "Moscow", "Toronto", "Sydney", "Bali", "Cairo", "Athens", "Lisbon", "Prague", "Amsterdam",
    "Vienna", "Budapest", "Dublin", "Brussels", "Zurich", "Geneva", "Cape Town", "Addis Ababa", "Lagos", "Nairobi",
    "Rio de Janeiro", "Buenos Aires", "Santiago", "Mexico City", "Vancouver", "San Francisco", "Chicago", "Seoul",
    "Beijing", "Shanghai", "Mumbai", "Delhi", "Kuala Lumpur", "Hong Kong", "Macau", "Doha", "Abu Dhabi", "Maldives",
    "Santorini", "Mykonos", "Venice", "Florence", "Milan", "Edinburgh", "Nice", "Seville", "Cusco", "Marrakech",
    "Zanzibar", "Petra", "Reykjavik", "Oslo", "Stockholm", "Helsinki", "Tallinn", "Dubrovnik", "Split", "Phuket",
    "Krabi", "Hanoi", "Hoi An", "Siem Reap", "Luang Prabang", "Queenstown", "Auckland", "Perth", "Melbourne", "Brisbane",
    "Johannesburg", "Fes", "Agadir", "Cartagena", "Panama City", "San Juan", "Casablanca", "Amman", "Seattle"
  ];

  const fetchPlacePhoto = async (name) => {
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${name}&client_id=${API_KEY}`);
      const data = await response.json();
      if (data.results.length > 0) {
        return data.results[0].urls.small;
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
    return null;
  };

  const getRandomRating = () => {
    return (Math.random() * (5 - 3.5) + 3.5).toFixed(1); // random between 3.5 - 5
  };

  useEffect(() => {
    const loadPlaces = async () => {
      const allPlaces = await Promise.all(
        destinations.map(async (city) => {
          const img = await fetchPlacePhoto(city);
          const rating = getRandomRating();
          return { name: city, image: img, rating };
        })
      );
      setPlaces(allPlaces);
    };
    loadPlaces();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.body.classList.remove('dark-mode');
    } else {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleFavorite = (cityName) => {
    if (favorites.includes(cityName)) {
      setFavorites(favorites.filter((fav) => fav !== cityName));
    } else {
      setFavorites([...favorites, cityName]);
    }
  };

  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const placesPerPage = 9;
  const indexOfLastPlace = currentPage * placesPerPage;
  const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
  const currentPlaces = filteredPlaces.slice(indexOfFirstPlace, indexOfLastPlace);
  const totalPages = Math.ceil(filteredPlaces.length / placesPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <div className="home-page">
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search destinations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="dark-toggle" onClick={toggleDarkMode}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      <h1>Travel Explorer 🌍</h1>
      <div className="places-grid">
        {currentPlaces.length > 0 ? (
          currentPlaces.map((place, index) => (
            <div key={index} className="place-card">
              <Link to={`/city/${place.name}`}>
                {place.image && <img src={place.image} alt={place.name} />}
              </Link>
              <h3>{place.name}</h3>
              <div className="rating">⭐ {place.rating}</div>
              <button
                className="fav-button"
                onClick={() => toggleFavorite(place.name)}
              >
                {favorites.includes(place.name) ? <FaHeart color="red" /> : <FaRegHeart />}
              </button>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>Prev</button>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
      <footer className="footer">
        <p>Travel Explorer © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default HomePage;
