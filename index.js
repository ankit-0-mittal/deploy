// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { port, mongoURI } = require('./config');
const { generateOTP, login } = require('./controllers/authController');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Define routes
app.post('/api/generate-otp', generateOTP);
app.post('/api/login', login);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
