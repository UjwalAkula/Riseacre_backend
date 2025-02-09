const express = require('express');
const multer = require('multer');
const path = require('path');
const postProperty = require('../models/Listingmodel');
const UserAuth = require('../models/Authmodel');
const PostProperty = require('../models/Listingmodel');
const Ratings=require('./Ratings');

const router = express.Router();

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Specifies the directory to store images
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  // Ensures unique file names
  }
});

// Check file type to allow only image files (jpeg, jpg, png)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;  // Allowed file types
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
  limits: { fileSize: 1024 * 1024 * 5, files: 5 },  // Limit to 5 files and max file size 5MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).array('photos', 5);  // Accepting up to 5 images

// Property Listing API - POST route
const listProperty = async (req, res) => {
  const { 
    purpose, category, propertyType, constructionType, photos, propertyName, locality, 
    city, state, PINcode, latitude, longitude, nearbyLandmarks, carpetArea, buildupArea, 
    amenities, connectivity, expectedPrice, monthlyRent, priceNegotiable, maintenanceCharges, 
    bookingAmount, description, listerType, builderCompany, builderCertifications, listingType, 
    listerName, listerPhoneNumber, listerEmail, userId, bhkConfiguration, 
    floorNumber, totalFloors, noOfBedrooms, noOfBathrooms, noOfHalls, balcony, propertyAge 
  } = req.body;

  const connectivityRating =Ratings.calculateConnectivity(connectivity);
  const livabilityRating = Ratings.calculateLivability(amenities);
  const safetyRating = Ratings.calculateSafety(amenities);


  try {
    // Create a new property document with the updated fields
    const newProperty = new postProperty({
      purpose, category, propertyType, constructionType, photos, propertyName, locality, 
      city, state, PINcode, latitude, longitude, nearbyLandmarks, carpetArea, buildupArea, 
      amenities, connectivity, expectedPrice, monthlyRent, priceNegotiable, maintenanceCharges, 
      bookingAmount, description, listerType, builderCompany, builderCertifications, listingType, 
      listerName, listerPhoneNumber, listerEmail, userId, bhkConfiguration, 
      floorNumber, totalFloors, noOfBedrooms, noOfBathrooms, noOfHalls, balcony, propertyAge,
      connectivityRating,livabilityRating,safetyRating
    });

    // Save the property to the database
    await newProperty.save();

    // Update the UserAuth model to link this listing to the user
    await UserAuth.findByIdAndUpdate(
      userId,
      { $push: { listings: newProperty._id } },
      { new: true }
    );

    // Respond with success
    res.status(200).json({
      
      responsefromserver: "Property listed successfully",
      ListedProperty: newProperty
    });
  } catch (error) {
    console.error('Error while listing property:', error);
    res.status(500).json({
      responsefromserver: "Internal Server Error.",
      Error: error.message
    });
  }
};

// Get all properties API
const getAllProperties = async (req, res) => {


  try {
    const properties = await postProperty.find();
    const totalProperties = await postProperty.countDocuments();

    if (!properties || properties.length === 0) {
      return res.status(400).json({ responsefromserver: "No properties found." });
    }

    res.status(200).json({
      responsefromserver: "Properties are found",
      properties,
      totalProperties
    });
  } catch (error) {
    console.error('Error while fetching properties:', error);
    res.status(500).json({
      responsefromserver: "Internal Server Error.",
      Error: error.message
    });
  }
};

// Get property by id
const getPropertyById=async(req,res)=>{
  const propertyId=req.params.id;

  try{
    const property=await PostProperty.findById(propertyId);

    if(!property){
      return res.status(400).json({responsefromserver:'Property not found.'});
    }

    res.status(200).json({responsefromserver:'property is found.',property});
  }catch(error){
    res.status(500).json({responsefromserver:'Internal Server Error',Error:error});
    console.error(error);
  }
};

//update property by id
const updatePropertyById = async (req, res) => {
  const propertyId = req.params.id;
  const updatedData = req.body;

  if (updatedData.connectivity) {
    const connectivityRating = Ratings.calculateConnectivity(updatedData.connectivity);
    updatedData = { ...updatedData, connectivityRating };
  }

  if (updatedData.amenities) {
    const livabilityRating = Ratings.calculateLivability(updatedData.amenities);
    const safetyRating = Ratings.calculateSafety(updatedData.amenities);
    updatedData = { ...updatedData, livabilityRating, safetyRating };
  }

  try {
    const updatedProperty = await postProperty.findByIdAndUpdate(propertyId, updatedData, { new: true });
    if (!updatedProperty) {
      return res.status(404).json({ responsefromserver: 'Property not found.' });
    }

    res.status(200).json({
      responsefromserver: 'Property updated successfully.',
      updatedProperty
    });
  } catch (error) {
    console.error('Error while updating property:', error);
    res.status(500).json({
      responsefromserver: 'Internal Server Error.',
      Error: error.message
    });
  }
};


// Delete Property by ID API
const deletePropertyById = async (req, res) => {
  const propertyId = req.params.id;

  try {
    // Delete the property from the database
    const deletedProperty = await postProperty.findByIdAndDelete(propertyId);

    if (!deletedProperty) {
      return res.status(400).json({ responsefromserver: "Property not found so cannot be deleted." });
    }

    // Get the userId from the deleted property
    const userId = deletedProperty.userId;

    // Remove the propertyId from the user's listings array
    const user = await UserAuth.findByIdAndUpdate(
      userId,
      { $pull: { listings: propertyId } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        responsefromserver: "User not found, cannot update listings."
      });
    }

    // Respond with success
    res.status(200).json({
      responsefromserver: "Property deleted successfully and user's listings updated."
    });
  } catch (error) {
    console.error('Error during property deletion:', error);
    res.status(500).json({
      responsefromserver: "Internal Server Error.",
      Error: error.message
    });
  }
};

// Export the router
module.exports = { postProperty: [upload, listProperty], getAllProperties,getPropertyById,updatePropertyById, deletePropertyById };


