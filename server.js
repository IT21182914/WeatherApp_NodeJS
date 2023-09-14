const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const dotenv = require('dotenv'); // Import dotenv
const axios = require('axios'); // Import axios for API requests
const Weather = require('./models/Weather'); // Import the Weather model
const cron = require('node-cron');
const { sendHourlyWeatherReport } = require('./services/emailService');
const User = require('./models/User');

dotenv.config(); // Load environment variables from .env

const app = express();

// Middleware
app.use(bodyParser.json());

// Use the defined routes
app.use('/users', userRoutes);
app.use('/weather', weatherRoutes);

const fetchLatestWeatherData = async () => {
  const apiKey = process.env.WEATHER_API;
  const defaultCoordinates = { lat: '40.7128', lon: '-74.0060' }; // Default coordinates for New York

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${defaultCoordinates.lat}&lon=${defaultCoordinates.lon}&appid=${apiKey}`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching latest weather data:', error);
    throw error;
  }
};

// Schedule the task to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const users = await User.find(); // Fetch all users
    const weatherData = await fetchLatestWeatherData(); // Fetch the latest weather data

    // Send hourly weather reports to all users
    for (const user of users) {
      sendHourlyWeatherReport(user.email, weatherData);
    }
  } catch (error) {
    console.error('Error sending hourly weather reports:', error);
  }
});

// Connect to MongoDB using the ATLAS_URI environment variable
mongoose
  .connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');

    // Update the /weather/by-coordinates route to store weather data
    app.get('/weather/by-coordinates', async (req, res) => {
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
        res.status(500).json({ error: 'Server error' });
      }
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log('Server is running');
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

// Export the app object
module.exports = app;
