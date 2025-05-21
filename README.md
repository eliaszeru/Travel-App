# Travel App

A modern travel application that helps users explore cities, find attractions, and plan their trips.



## Features

- City exploration with detailed information
- Flight search functionality
- Cost calculator for trip planning
- Favorite cities management
- Dark/Light mode support
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/eliaszeru/travel-app.git
cd travel-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
REACT_APP_OPENTRIP_API_KEY=your_opentrip_api_key
REACT_APP_UNSPLASH_KEY=your_unsplash_api_key
REACT_APP_FOURSQUARE_KEY=your_foursquare_api_key
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Project Structure

```
travel-app/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── CityDetails/
│   │   ├── CitiesList/
│   │   └── FlightSearch/
│   ├── data/
│   ├── assets/
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## Environment Variables

The following environment variables are required:

- `REACT_APP_OPENTRIP_API_KEY`: API key for OpenTripMap
- `REACT_APP_UNSPLASH_KEY`: API key for Unsplash
- `REACT_APP_FOURSQUARE_KEY`: API key for Foursquare

## Deployment

This project is deployed on Vercel. The deployment is automatically triggered when changes are pushed to the main branch.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Elias Zeru - [GitHub](https://github.com/eliaszeru)
