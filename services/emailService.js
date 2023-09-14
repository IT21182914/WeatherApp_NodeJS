// emailService.js
const nodemailer = require('nodemailer');

// Create a transporter with your email service settings
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'cricketslworld@gmail.com',
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send hourly weather reports
const sendHourlyWeatherReport = async (recipientEmail, weatherData) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: recipientEmail,
    subject: 'Hourly Weather Report',
    text: `Hourly weather report:\n${weatherData}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Hourly weather report sent to:', recipientEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendHourlyWeatherReport };
