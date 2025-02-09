const express = require('express');
const Usercontroller = require('../controllers/Usercontroller');
const Authcontroller = require('../controllers/Authcontroller');
const ListingController = require('../controllers/ListingController');

const router = express.Router();

// Define routes
router.post('/user-login', Usercontroller.UserLogin); 
router.post('/user-signup', Authcontroller.userSignUp); 
router.post('/user-signin', Authcontroller.userSignIn);
router.post('/google-signin', Authcontroller.googleSignIn); 
router.get('/get-user/:id', Authcontroller.getUserById);


// Export the router as the module
module.exports = router;
