// utils/generateToken.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

function generateToken(userId, email) {
  return jwt.sign({ userId, email }, jwtSecret, { expiresIn: '1h' });
}

module.exports = generateToken;
