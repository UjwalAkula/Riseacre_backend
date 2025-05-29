const admin = require('firebase-admin');

// Verify Firebase ID Token (JWT) middleware
const verifyFirebaseToken = async (req, res, next) => {
  const idToken = req.header('Authorization')?.replace('Bearer ', '');  // Get token from Authorization header

  if (!idToken) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);  // Verify the token
    req.user = decodedToken;  // Attach the decoded token (user details) to the request object
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyFirebaseToken;
