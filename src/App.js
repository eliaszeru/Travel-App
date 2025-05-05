// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/Homepage/HomePage';
import CitiesList from './components/CitiesList/CitiesList';
import CityDetails from './components/CityDetails/CityDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cities" element={<CitiesList />} />
        <Route path="/city/:cityName" element={<CityDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
