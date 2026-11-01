const express = require('express');
const Authcontroller = require('../controllers/Authcontroller');
const ListingController = require('../controllers/ListingController');
const verifyFirebaseToken = require('../middlewares/Authorization');

const router = express.Router();

// Define routes
router.post('/user-signup', Authcontroller.userSignUp); 
router.post('/user-signin', Authcontroller.userSignIn);
router.post('/google-signin', Authcontroller.googleSignIn); 
router.get('/get-user/:id', verifyFirebaseToken, Authcontroller.getUserById);
router.patch('/profile', verifyFirebaseToken, Authcontroller.updateUserProfile);


// Export the router as the module
module.exports = router;
