const express = require('express');
const path = require('path');
const ListingController = require('../controllers/ListingController');
const Gmaps = require('../controllers/GmapsAutoComplete');
const verifyFirebaseToken = require('../middlewares/Authorization');
const uploadDirectory = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads'));

const router = express.Router();

// Apply multer middleware before the handler
router.post('/post-property', verifyFirebaseToken, ListingController.upload, ListingController.postProperty);
router.get('/get-all-properties', ListingController.getAllProperties);
router.get('/get-property/:id', ListingController.getPropertyById);
router.get('/get-property/:id/contact', verifyFirebaseToken, ListingController.getPropertyContact);
router.put('/update-property/:id', verifyFirebaseToken, ListingController.updatePropertyById);
router.patch('/update-property/:id/availability', verifyFirebaseToken, ListingController.updateAvailability);
router.patch('/update-property/:id/call-preference', verifyFirebaseToken, ListingController.updateCallPreference);
router.delete('/delete-property/:id', verifyFirebaseToken, ListingController.deletePropertyById);
router.get('/get-auto-complete/:input', Gmaps.gmapsApi);

router.get('/uploads/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  if (path.basename(imageName) !== imageName) return res.status(400).send('Invalid image name.');
  const extname = path.extname(imageName).toLowerCase();

  const validExtensions = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };

  if (validExtensions[extname]) {
    res.setHeader('Content-Type', validExtensions[extname]);
    res.sendFile(path.join(uploadDirectory, imageName), (err) => {
      if (err) {
        console.error('Error in sending file:', err);
        res.status(404).send('Image not found');
      }
    });
  } else {
    res.status(400).send('Invalid image format. Only .jpg, .jpeg, and .png are allowed');
  }
});

module.exports = router;
