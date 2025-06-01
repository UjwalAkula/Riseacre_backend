const express = require('express');
const User = require('../models/Usermodel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const admin = require('firebase-admin'); // Firebase Admin SDK account key

const app = express();
app.use(express.json());

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);

// Initialize Firebase Admin SDK with your credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Verify Firebase ID Token (JWT)
const verifyFirebaseToken = async (idToken) => {
  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid or expired Firebase ID token');
  }
};

// JWT Token generation function for backend session
const generateJwtToken = (user) => {
  return jwt.sign(
    { uid: user._id, phoneNumber: user.phoneNumber }, // Payload
    process.env.secret_key, // Secret key (should be in environment variables)
    { expiresIn: '1h' } // Token expires in 1 hour
  );
};

const UserLogin = async (req, res) => {
  const { phoneNumber, otp, verificationId, idToken } = req.body;

  // Validate incoming data
  if (!phoneNumber || !otp || !verificationId || !idToken) {
    return res.status(400).json({ message: 'Phone number, OTP, verification ID, and Firebase ID token are required' });
  }

  try {
    // Verify the Firebase ID token received from the frontend
    const decodedToken = await verifyFirebaseToken(idToken);
    console.log("Firebase ID Token verified:", decodedToken);

    // In Firebase, OTP verification is done on the frontend, so we don't verify OTP here
    // Instead, we just ensure the Firebase ID token is valid and contains the phone number

    // Check if the phone number exists in the database
    let existingUser = await User.findOne({ phoneNumber: decodedToken.phone_number });

    if (!existingUser) {
      // If the user does not exist, create a new user
      const newUser = new User({
        phoneNumber: decodedToken.phone_number,
      });
      await newUser.save();
      existingUser = newUser; // Assign the newly created user
    }

    // Generate a JWT token for the backend session
    const token = generateJwtToken(existingUser);

    // Respond with the success message, user data, and the generated JWT token
    res.status(200).json({
      message: "Login successful.",
      user: existingUser,
      token: token, // JWT token for backend authentication
    });

  } catch (error) {
    console.error('Error during login process:', error);

    // Handle specific error cases
    if (error.message === 'Invalid or expired Firebase ID token') {
      return res.status(401).json({ message: 'Invalid or expired Firebase ID token.' });
    }

    // General error handling
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { UserLogin };


