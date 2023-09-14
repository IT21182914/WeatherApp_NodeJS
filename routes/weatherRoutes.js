const express = require('express');
const router = express.Router();
const axios = require('axios');
const Weather = require('../models/Weather'); // Import the Weather model

// Route for retrieving weather data by coordinates
router.get('/by-coordinates', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const apiKey = process.env.WEATHER_API;

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    const weatherData = response.data;

    // Create a new document and save it to the database
    const newWeatherData = new Weather({
      location: `${lat}, ${lon}`,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      // Add more fields as needed based on your Weather schema
    });

    await newWeatherData.save();

    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Route for retrieving weather data for a given day
router.get('/by-date/:date', async (req, res) => {
  try {
    // Parse the requested date from the URL parameter
    const requestedDate = new Date(req.params.date);

    // Set the time range for the requested date (from midnight to midnight)
    requestedDate.setUTCHours(0, 0, 0, 0); // Set to the start of the requested date
    const nextDay = new Date(requestedDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1); // Set to the start of the next day

    // Find weather data records that fall within the requested date range
    const weatherData = await Weather.find({
      date: {
        $gte: requestedDate, // Greater than or equal to the requested date
        $lt: nextDay,        // Less than the start of the next day
      },
    });

    if (weatherData.length === 0) {
      return res.status(404).json({ error: 'Weather data not found for the specified date' });
    }

    res.status(200).json(weatherData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route for retrieving weather data with pagination, sorting, and filtering
router.get('/data', async (req, res) => {
  try {
    // Define pagination, sorting, and filtering parameters here
    // ...

    // Implement fetching weather data based on the above parameters
    // ...

    res.status(200).json({ message: 'Implement pagination, sorting, and filtering' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
