const express = require('express');
const path = require('path');
const ListingController = require('../controllers/ListingController');
const Gmaps = require('../controllers/GmapsAutoComplete');

const router = express.Router();

// Apply multer middleware before the handler
router.post('/post-property', ListingController.upload, ListingController.postProperty);
router.get('/get-all-properties', ListingController.getAllProperties);
router.get('/get-property/:id', ListingController.getPropertyById);
router.put('/update-property/:id', ListingController.updatePropertyById);
router.delete('/delete-property/:id', ListingController.deletePropertyById);
router.get('/get-auto-complete/:input', Gmaps.gmapsApi);

router.get('/uploads/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const extname = path.extname(imageName).toLowerCase();

  const validExtensions = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };

  if (validExtensions[extname]) {
    res.setHeader('Content-Type', validExtensions[extname]);
    res.sendFile(path.join(__dirname, '..', 'uploads', imageName), (err) => {
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