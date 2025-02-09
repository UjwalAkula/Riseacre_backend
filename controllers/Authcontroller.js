const express = require('express');
const admin = require('firebase-admin');
const UserAuth = require('../models/Authmodel'); // Your User model
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = process.env.Firebase_service_account_key; // Path to Firebase service account key

const app = express();

// Only use express.json() middleware for POST/PUT requests
app.use(express.json());

// Initialize Firebase Admin SDK with your credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.log("Firebase is already initialized.");
}

// Verify Firebase ID Token (JWT)
const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw new Error('Firebase token verification failed');
  }
};

// User Registration (Signup)
const userSignUp = async (req, res) => {
  const { userName, phoneNumber, userEmail, firebaseUid, idToken } = req.body;

  // Validate that all required fields are provided
  if (!firebaseUid || !userEmail || !idToken) {
    return res.status(400).json({ message: 'Firebase UID, Email, and ID token are required' });
  }

  try {
    // Verify Firebase ID Token before continuing
    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid } = decodedToken;

    // Ensure that the Firebase UID in the request matches the decoded UID
    if (firebaseUid !== uid) {
      return res.status(401).json({ message: 'Firebase UID mismatch' });
    }

    // Check if the user already exists in the database
    const existingUser = await UserAuth.findOne({ userEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create and save the new user with the firebaseUid
    const newUser = new UserAuth({
      userName,
      phoneNumber,
      userEmail,
      firebaseUid,  // Save firebaseUid in the database
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Google Sign-In (Firebase Auth)
const googleSignIn = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify Firebase ID Token
    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid, email, name } = decodedToken;

    // Check if user already exists in the database
    let existingUser = await UserAuth.findOne({ userEmail: email });

    if (!existingUser) {
      // If the user doesn't exist, create a new user in the database (with firebaseUid)
      existingUser = new UserAuth({
        userEmail: email,
        userName: name || email.split('@')[0],  // Default to username as email prefix or Firebase display name
        firebaseUid: uid,  // Save firebaseUid
      });
      await existingUser.save();
    }

    res.status(200).json({
      message: 'Google login successful!',
      user: existingUser,
      token: idToken,  // Optionally send back the token
    });
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    res.status(500).json({ message: 'Error during Google sign-in', error: error.message });
  }
};

// Normal Email/Password Sign-In (Firebase Authentication)
const userSignIn = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify Firebase ID Token
    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid, email, name } = decodedToken;

    // Check if user already exists in your database
    let existingUser = await UserAuth.findOne({ userEmail: email });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Sign-in successful!',
      user: existingUser,
      token: idToken,  // Optionally send back the token
    });
  } catch (error) {
    console.error('Error during email sign-in:', error);
    res.status(500).json({ message: 'Error during sign-in', error: error.message });
  }
};

// Populate User's Listings (GET User by ID)
const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    console.log("Received request for user ID:", userId);  // Log the user ID being requested
    
    // Fetch the user from the database and populate listings
    const user = await UserAuth.findById(userId).populate('listings');

    if (!user) {
      return res.status(404).json({
        responsefromserver: "The user not found."
      });
    }

    res.status(200).json({
      responsefromserver: "The user found",
      user
    });

    console.log(user);
  } catch (error) {
    console.error('Error during getUserById:', error);
    res.status(500).json({
      responsefromserver: "Internal server error.",
      Error: error.message
    });
  }
};


module.exports = { userSignUp, userSignIn, googleSignIn, getUserById };



