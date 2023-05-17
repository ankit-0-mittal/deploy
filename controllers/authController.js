// controllers/authController.js
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { emailService, emailPass, emailUser } = require('../config');
const generateToken = require('../utils/generateToken');

async function generateOTP(req, res) {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check the time gap between requests
    const lastOtpRequestTime = user.otpExpiration;
    if (lastOtpRequestTime && lastOtpRequestTime.getTime() + 60000 > Date.now()) {
      return res.status(429).json({ error: 'Please wait for 1 minute before requesting a new OTP' });
    }

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 300000); // 5 minutes
    await user.save();

    // Send OTP to the user's email
    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: 'OTP for Login',
      text: `Your OTP: ${otp}`,
    });

    res.json({ message: 'OTP sent successfully' });
  } 
//   catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
  
}

async function login(req, res) {
  console.log(req.body);
  try {
    const { email, otp } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if the account is blocked
    if (user.blockedUntil && user.blockedUntil > Date.now()) {
      return res.status(403).json({ error: 'Account is blocked. Please try again later' });
    }

    // Check if OTP is valid
    if (user.otp !== otp || user.otpExpiration < Date.now()) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        // Block the account for 1 hour
        user.blockedUntil = new Date(Date.now() + 3600000); // 1 hour
      }

      await user.save();
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Reset login attempts
    user.loginAttempts = 0;
    await user.save();

    // Generate JWT token and send it back to the user
    const token = generateToken(user._id, user.email);
    res.json({ token });
  } 
  
//   catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Something went wrong' });
//   }

catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
  
}

module.exports = { generateOTP, login };
