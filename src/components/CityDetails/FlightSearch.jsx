import React, { useState } from 'react';
import './FlightSearch.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faPlaneArrival } from '@fortawesome/free-solid-svg-icons';

const FlightSearch = ({ cityName }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    isRoundTrip: false
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAmadeusToken = async () => {
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'wisgaQjy1V3i5xJQudbArCf3wY1Le9Ik',
        client_secret: 'AwjSCyShN9P4tNm6'
      })
    });
    const data = await response.json();
    return data.access_token;
  };

  const getAirportCode = async (token, cityName) => {
    try {
      const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(cityName)}&subType=CITY,AIRPORT`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      console.log('Location search response:', data);

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.detail || 'Failed to search for location');
      }

      if (data.data && data.data.length > 0) {
        const airport = data.data.find(loc => loc.subType === 'AIRPORT');
        if (airport) {
          console.log('Found airport:', airport);
          return airport.iataCode;
        }

        const city = data.data.find(loc => loc.subType === 'CITY');
        if (city) {
          console.log('Found city:', city);
          const cityResponse = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(city.iataCode)}&subType=AIRPORT`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          const cityData = await cityResponse.json();
          console.log('City airports response:', cityData);

          if (cityData.data && cityData.data.length > 0) {
            const mainAirport = cityData.data[0];
            console.log('Found main airport for city:', mainAirport);
            return mainAirport.iataCode;
          }
        }
      }
      return null;
    } catch (err) {
      console.error('Error in getAirportCode:', err);
      throw err;
    }
  };

  const handleTripTypeSelect = (isRoundTrip) => {
    setSearchParams(prev => ({ 
      ...prev, 
      isRoundTrip,
      returnDate: isRoundTrip ? prev.returnDate : ''
    }));
    setShowForm(true);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getAmadeusToken();
      if (!token) {
        throw new Error('Failed to get access token');
      }

      const destinationCode = await getAirportCode(token, cityName);
      if (!destinationCode) {
        throw new Error(`No airport found for ${cityName}. Please try a different city.`);
      }

      let apiUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${searchParams.origin}&destinationLocationCode=${destinationCode}&departureDate=${searchParams.departureDate}&adults=${searchParams.passengers}&nonStop=false&max=10`;
      
      if (searchParams.isRoundTrip && searchParams.returnDate) {
        apiUrl += `&returnDate=${searchParams.returnDate}`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Flight search response:', data);

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.detail || 'Failed to search flights');
      }

      if (data.data && data.data.length > 0) {
        const randomFlights = data.data
          .sort(() => 0.5 - Math.random())
          .slice(0, 4)
          .map(offer => ({
            price: offer.price.total,
            direct: offer.itineraries[0].segments.length === 1,
            departureDate: offer.itineraries[0].segments[0].departure.at,
            arrivalDate: offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.at,
            returnDate: searchParams.isRoundTrip ? offer.itineraries[1]?.segments[0]?.departure.at : null,
            returnArrivalDate: searchParams.isRoundTrip ? offer.itineraries[1]?.segments[offer.itineraries[1].segments.length - 1]?.arrival.at : null,
            airline: offer.validatingAirlineCodes[0],
            stops: offer.itineraries[0].segments.length - 1,
            returnStops: searchParams.isRoundTrip ? offer.itineraries[1]?.segments.length - 1 : null,
            departureAirport: offer.itineraries[0].segments[0].departure.iataCode,
            arrivalAirport: offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode,
            duration: offer.itineraries[0].duration,
            returnDuration: searchParams.isRoundTrip ? offer.itineraries[1]?.duration : null,
            bookingUrl: `https://www.${offer.validatingAirlineCodes[0].toLowerCase()}.com`
          }));

        setFlights(randomFlights);
      } else {
        setError('No flights found for the selected dates. Please try different dates or origin city.');
      }
    } catch (err) {
      console.error('Flight search error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flight-search">
      <h2>Find Flights to {cityName}</h2>
      
      {!showForm ? (
        <div className="trip-type-selection">
          <h3>Select Your Trip Type</h3>
          <div className="trip-options">
            <button 
              className="trip-option-btn"
              onClick={() => handleTripTypeSelect(false)}
            >
              <span className="icon"><FontAwesomeIcon icon={faPlaneDeparture} /></span>
              <span className="text">One Way Flight</span>
            </button>
            <button 
              className="trip-option-btn"
              onClick={() => handleTripTypeSelect(true)}
            >
              <span className="icon"><FontAwesomeIcon icon={faPlaneArrival} /></span>
              <span className="text">Round Trip Flight</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="selected-trip-type">
            <span>{searchParams.isRoundTrip ? 'Round Trip Flight' : 'One Way Flight'}</span>
            <button 
              className="change-type-btn"
              onClick={() => setShowForm(false)}
            >
              Change Trip Type
            </button>
          </div>

          <form onSubmit={handleSearch} className="flight-form">
            <div className="form-group">
              <label>From (Airport Code)</label>
              <input
                type="text"
                value={searchParams.origin}
                onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value.toUpperCase() }))}
                placeholder="e.g., JFK, LGA, EWR"
                required
              />
              <small className="help-text">Enter a 3-letter airport code</small>
            </div>

            <div className="form-group">
              <label>Departure Date</label>
              <input
                type="date"
                value={searchParams.departureDate}
                onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {searchParams.isRoundTrip && (
              <div className="form-group">
                <label>Return Date</label>
                <input
                  type="date"
                  value={searchParams.returnDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                  min={searchParams.departureDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Passengers</label>
              <input
                type="number"
                min="1"
                max="9"
                value={searchParams.passengers}
                onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                required
              />
            </div>

            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </form>
        </>
      )}

      {error && <p className="error-message">{error}</p>}

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Searching for the best flights...</p>
        </div>
      )}

      {!loading && flights.length > 0 && (
        <div className="flight-results">
          <h3>Available Flights</h3>
          <div className="flights-grid">
            {flights.map((flight, index) => (
              <div key={index} className="flight-card">
                <div className="flight-price">
                  ${flight.price}
                </div>
                <div className="flight-details">
                  <p><strong>From:</strong> {flight.departureAirport}</p>
                  <p><strong>To:</strong> {flight.arrivalAirport}</p>
                  <p><strong>Departure:</strong> {new Date(flight.departureDate).toLocaleString()}</p>
                  <p><strong>Arrival:</strong> {new Date(flight.arrivalDate).toLocaleString()}</p>
                  {searchParams.isRoundTrip && flight.returnDate && (
                    <>
                      <p><strong>Return:</strong> {new Date(flight.returnDate).toLocaleString()}</p>
                      <p><strong>Return Arrival:</strong> {new Date(flight.returnArrivalDate).toLocaleString()}</p>
                    </>
                  )}
                  <p><strong>Duration:</strong> {flight.duration}</p>
                  {searchParams.isRoundTrip && flight.returnDuration && (
                    <p><strong>Return Duration:</strong> {flight.returnDuration}</p>
                  )}
                  <p><strong>Airline:</strong> {flight.airline}</p>
                  <p><strong>Type:</strong> {flight.direct ? 'Direct Flight' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}</p>
                  {searchParams.isRoundTrip && flight.returnStops !== null && (
                    <p><strong>Return Type:</strong> {flight.returnStops === 0 ? 'Direct Flight' : `${flight.returnStops} Stop${flight.returnStops > 1 ? 's' : ''}`}</p>
                  )}
                </div>
                <a 
                  href={flight.bookingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="book-btn"
                >
                  Book Now
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightSearch; 