const admin = require('firebase-admin');
const UserAuth = require('../models/Authmodel');

// Verify Firebase ID Token (JWT) middleware
const verifyFirebaseToken = async (req, res, next) => {
  const idToken = req.header('Authorization')?.replace('Bearer ', '');  // Get token from Authorization header

  if (!idToken) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired Firebase token.' });
  }

  try {
    const account = await UserAuth.findOne({ firebaseUid: decodedToken.uid });
    if (!account) return res.status(403).json({ message: 'No Riseacre account is linked to this Firebase user.' });

    req.user = decodedToken;
    req.account = account;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = verifyFirebaseToken;
