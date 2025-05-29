const express = require('express');
const multer = require('multer');
const path = require('path');
const PostProperty = require('../models/Listingmodel');
const UserAuth = require('../models/Authmodel');
const Ratings = require('./Ratings');
const admin = require('firebase-admin');
const firebase = require('../Firebase/riseacre-39da0-firebase-adminsdk-49jvk-f4157fe1b5.json');

const router = express.Router();

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Check file type to allow only image files (jpeg, jpg, png)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only JPEG, JPG, and PNG images are allowed!');
  }
}

// Multer middleware for uploading images
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5, files: 5 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).array('photos', 5);

// Firebase initialization (unchanged)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebase),
  });
}

const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return true;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return false;
  }
};

// Property Listing API - POST route
const listProperty = async (req, res) => {
  const {
    purpose, category, propertyType, constructionType, propertyName, locality,
    city, state, PINcode, latitude, longitude, nearbyLandmarks, carpetArea, buildupArea,
    amenities, connectivity, expectedPrice, monthlyRent, priceNegotiable, maintenanceCharges,
    bookingAmount, description, listerType, builderCompany, builderCertifications, listingType,
    listerName, listerPhoneNumber, listerEmail, userId, bhkConfiguration,
    floorNumber, totalFloors, noOfBedrooms, noOfBathrooms, noOfHalls, balcony, propertyAge,
  } = req.body;

  // Get photo paths from uploaded files
  const photoPaths = req.files ? req.files.map(file => file.filename) : [];

  const connectivityRating = Ratings.calculateConnectivity(connectivity);
  const livabilityRating = Ratings.calculateLivability(amenities);
  const safetyRating = Ratings.calculateSafety(amenities);

  try {
    const newProperty = new PostProperty({
      purpose, category, propertyType, constructionType, propertyName, locality,
      city, state, PINcode, latitude, longitude, nearbyLandmarks, carpetArea, buildupArea,
      amenities, connectivity, expectedPrice, monthlyRent, priceNegotiable, maintenanceCharges,
      bookingAmount, description, listerType, builderCompany, builderCertifications, listingType,
      listerName, listerPhoneNumber, listerEmail, userId, bhkConfiguration,
      floorNumber, totalFloors, noOfBedrooms, noOfBathrooms, noOfHalls, balcony, propertyAge,
      photos: photoPaths, // Use req.files instead of req.body.photos
      connectivityRating, livabilityRating, safetyRating,
    });

    await newProperty.save();

    await UserAuth.findByIdAndUpdate(
      userId,
      { $push: { listings: newProperty._id } },
      { new: true }
    );

    res.status(200).json({
      responsefromserver: "Property listed successfully",
      ListedProperty: newProperty,
    });
  } catch (error) {
    console.error('Error while listing property:', error);
    res.status(500).json({
      responsefromserver: "Internal Server Error.",
      Error: error.message,
    });
  }
};

// Other routes (unchanged)
const getAllProperties = async (req, res) => {
  try {
    const properties = await PostProperty.find();
    const totalProperties = await PostProperty.countDocuments();

    if (!properties || properties.length === 0) {
      return res.status(400).json({ responsefromserver: "No properties found." });
    }

    res.status(200).json({
      responsefromserver: "Properties are found",
      properties,
      totalProperties,
    });
  } catch (error) {
    console.error('Error while fetching properties:', error);
    res.status(500).json({
      responsefromserver: "Internal Server Error.",
      Error: error.message,
    });
  }
};

const getPropertyById = async (req, res) => {
  const propertyId = req.params.id;

  try {
    const property = await PostProperty.findById(propertyId);
    if (!property) {
      return res.status(400).json({ responsefromserver: 'Property not found.' });
    }
    res.status(200).json({ responsefromserver: 'Property is found.', property });
  } catch (error) {
    res.status(500).json({ responsefromserver: 'Internal Server Error', Error: error });
    console.error(error);
  }
};

const updatePropertyById = async (req, res) => {
  const propertyId = req.params.id;
  const updatedData = req.body;

  if (updatedData.connectivity) {
    const connectivityRating = Ratings.calculateConnectivity(updatedData.connectivity);
    updatedData.connectivityRating = connectivityRating;
  }

  if (updatedData.amenities) {
    const livabilityRating = Ratings.calculateLivability(updatedData.amenities);
    const safetyRating = Ratings.calculateSafety(updatedData.amenities);
    updatedData.livabilityRating = livabilityRating;
    updatedData.safetyRating = safetyRating;
  }

  try {
    const updatedProperty = await PostProperty.findByIdAndUpdate(propertyId, updatedData, { new: true });
    if (!updatedProperty) {
      return res.status(404).json({ responsefromserver: 'Property not found.' });
    }
    res.status(200).json({
      responsefromserver: 'Property updated successfully.',
      updatedProperty,
    });
  } catch (error) {
    console.error('Error while updating property:', error);
    res.status(500).json({
      responsefromserver: 'Internal Server Error.',
      Error: error.message,
    });
  }
};

const deletePropertyById = async (req, res) => {
  const propertyId = req.params.id;

  try {
    const deletedProperty = await PostProperty.findByIdAndDelete(propertyId);
    if (!deletedProperty) {
      return res.status(400).json({ responsefromserver: "Property not found so cannot be deleted." });
    }

    const userId = deletedProperty.userId;
    const user = await UserAuth.findByIdAndUpdate(
      userId,
      { $pull: { listings: propertyId } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ responsefromserver: "User not found, cannot update listings." });
    }

    res.status(200).json({
      responsefromserver: "Property deleted successfully and user's listings updated.",
    });
  } catch (error) {
    console.error('Error during property deletion:', error);
    res.status(500).json({
      responsefromserver: "Internal Server Error.",
      Error: error.message,
    });
  }
};

// Export separately
module.exports = {
  postProperty: listProperty, // Handler
  upload, // Middleware
  getAllProperties,
  getPropertyById,
  updatePropertyById,
  deletePropertyById,
};