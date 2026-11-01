const admin = require('firebase-admin');
const UserAuth = require('../models/Authmodel'); // Your User model
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
 // Path to Firebase service account key

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

const serializeUser = (user) => ({
  _id: user._id,
  userName: user.userName,
  phoneNumber: user.phoneNumber || '',
  userEmail: user.userEmail,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// User Registration (Signup)
const userSignUp = async (req, res) => {
  const userName = typeof req.body.userName === 'string' ? req.body.userName.trim() : '';
  const phoneNumber = typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber.trim() : '';
  const userEmail = typeof req.body.userEmail === 'string' ? req.body.userEmail.trim().toLowerCase() : '';
  const { firebaseUid, idToken } = req.body;

  if (userName.length < 2 || userName.length > 80) {
    return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
  }
  if (!/^\+?[1-9]\d{7,14}$/.test(phoneNumber.replace(/[\s()-]/g, ''))) {
    return res.status(400).json({ message: 'Enter a valid phone number.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail) || !firebaseUid || !idToken) {
    return res.status(400).json({ message: 'A valid email, Firebase UID and ID token are required.' });
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
    const normalizedEmail = decodedToken.email?.trim().toLowerCase();
    if (!normalizedEmail || normalizedEmail !== userEmail) {
      return res.status(401).json({ message: 'The verified Firebase email does not match the submitted email.' });
    }

    const firebaseAccount = await UserAuth.findOne({ firebaseUid: uid });
    if (firebaseAccount) {
      if (firebaseAccount.userEmail !== normalizedEmail) {
        return res.status(409).json({ message: 'This Firebase account is linked to a different Riseacre email.' });
      }
      return res.status(200).json({ message: 'Account already exists.', user: serializeUser(firebaseAccount), userId: firebaseAccount._id, token: idToken });
    }

    const existingUser = await UserAuth.findOne({ userEmail: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create and save the new user with the firebaseUid
    const newUser = new UserAuth({
      userName,
      phoneNumber,
      userEmail: normalizedEmail,
      firebaseUid,  // Save firebaseUid in the database
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully!',
      user: serializeUser(newUser),
      userId: newUser._id,
      token: idToken,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email or Firebase account already exists.' });
    if (error.name === 'ValidationError') return res.status(400).json({ message: 'Please check the account details and try again.' });
    res.status(500).json({ message: 'Could not create your account. Please try again.' });
  }
};

// Google Sign-In (Firebase Auth)
const googleSignIn = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Firebase ID token is required.' });

  try {
    // Verify Firebase ID Token
    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid, email, name } = decodedToken;

    // Check if user already exists in the database
    if (!uid || !email) return res.status(400).json({ message: 'Firebase account must include a UID and email.' });
    let existingUser = await UserAuth.findOne({ userEmail: email.toLowerCase() });

    if (existingUser && existingUser.firebaseUid !== uid) {
      return res.status(409).json({ message: 'This email is linked to a different Firebase account.' });
    }

    if (!existingUser) {
      // If the user doesn't exist, create a new user in the database (with firebaseUid)
      existingUser = new UserAuth({
        userEmail: email.toLowerCase(),
        userName: name || email.split('@')[0],  // Default to username as email prefix or Firebase display name
        firebaseUid: uid,  // Save firebaseUid
      });
      await existingUser.save();
    }

    res.status(200).json({
      message: 'Google login successful!',
      user: serializeUser(existingUser),
      userId: existingUser._id,
      token: idToken,  // Optionally send back the token
    });
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    if (error.message === 'Firebase token verification failed') return res.status(401).json({ message: 'Your sign-in session is invalid. Please sign in again.' });
    if (error.code === 11000) return res.status(409).json({ message: 'This email is already linked to another account.' });
    res.status(500).json({ message: 'Could not complete Google sign-in. Please try again.' });
  }
};

// Normal Email/Password Sign-In (Firebase Authentication)
const userSignIn = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Firebase ID token is required.' });

  try {
    // Verify Firebase ID Token
    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid, email, name } = decodedToken;
    if (!uid || !email) return res.status(401).json({ message: 'This sign-in method must provide a verified email address.' });

    // Check if user already exists in your database
    let existingUser = await UserAuth.findOne({ userEmail: email?.toLowerCase() });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (existingUser.firebaseUid !== uid) {
      return res.status(401).json({ message: 'Firebase account does not match this Riseacre account.' });
    }

    res.status(200).json({
      message: 'Sign-in successful!',
      user: serializeUser(existingUser),
      userId: existingUser._id,
      token: idToken,  // Optionally send back the token
    });
  } catch (error) {
    console.error('Error during email sign-in:', error);
    if (error.message === 'Firebase token verification failed') return res.status(401).json({ message: 'Your sign-in session is invalid. Please sign in again.' });
    res.status(500).json({ message: 'Could not complete sign-in. Please try again.' });
  }
};

// Populate User's Listings (GET User by ID)
const getUserById = async (req, res) => {
  try {
    if (req.params.id !== req.account._id.toString()) {
      return res.status(403).json({ responsefromserver: 'You can only view your own profile.' });
    }

    const user = await UserAuth.findById(req.account._id).populate('listings');

    if (!user) {
      return res.status(404).json({
        responsefromserver: "The user not found."
      });
    }

    res.status(200).json({
      responsefromserver: "The user found",
      user: serializeUser(user)
    });

  } catch (error) {
    console.error('Error during getUserById:', error);
    res.status(500).json({
      responsefromserver: "Internal server error.",
      Error: error.message
    });
  }
};

const updateUserProfile = async (req, res) => {
  const userName = typeof req.body.userName === 'string' ? req.body.userName.trim() : '';
  const phoneNumber = typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber.trim() : '';

  if (userName.length < 2 || userName.length > 80) {
    return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
  }
  if (phoneNumber && !/^\+?[0-9 ()-]{7,20}$/.test(phoneNumber)) {
    return res.status(400).json({ message: 'Enter a valid phone number.' });
  }

  try {
    req.account.userName = userName;
    req.account.phoneNumber = phoneNumber;
    await req.account.save();
    return res.status(200).json({ message: 'Profile updated.', user: serializeUser(req.account) });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Could not update your profile.' });
  }
};


module.exports = { userSignUp, userSignIn, googleSignIn, getUserById, updateUserProfile };



