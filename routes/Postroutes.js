const express = require('express');
const path=require('path');
const ListingController = require('../controllers/ListingController');
const Gmaps=require('../controllers/GmapsAutoComplete');

const router = express.Router();

router.post('/post-property', ListingController.postProperty);
router.get('/get-all-properties',ListingController.getAllProperties);
router.get('/get-property/:id',ListingController.getPropertyById);
router.put('/update-property/:id',ListingController.updatePropertyById);
router.delete('/delete-property/:id',ListingController.deletePropertyById);
router.get('/get-auto-complete/:input',Gmaps.gmapsApi);

router.get('/uploads/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const extname = path.extname(imageName).toLowerCase();

  // Allowed image types with respective MIME types
  const validExtensions = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
  };

  // Check if the extension is valid
  if (validExtensions[extname]) {
    // Set the content type based on the file extension
    res.setHeader('Content-Type', validExtensions[extname]);
    // Send the image file
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