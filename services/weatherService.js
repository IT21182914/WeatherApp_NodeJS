// weather/weatherService.js

const axios = require('axios');
const { openWeatherAPIKey } = require('../config/config'); // Use the updated config
const Weather = require('../models/Weather'); // Import the Weather model

const fetchWeatherDataByCoordinates = async (lat, lon, city) => {
  const apiKey = "02d6e8f83571a5600e97a53472e654ce";

  try {
    // Use Axios to make a request to OpenWeatherMap API
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&q=${city}&appid=${apiKey}`
    );
    
    // Extract and return the weather data from the API response
    const weatherData = response.data;

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Function to save weather data to the database
const saveWeatherData = async (location, temperature, humidity) => {
  try {
    // Create a new Weather document using the model
    const weatherData = new Weather({
      location,
      temperature,
      humidity,
      // Add more fields as needed
    });

    // Save the weather data to the database
    await weatherData.save();

    console.log('Weather data saved to the database.');
  } catch (error) {
    console.error('Error saving weather data:', error);
    throw error;
  }
};

module.exports = { fetchWeatherDataByCoordinates, saveWeatherData };
