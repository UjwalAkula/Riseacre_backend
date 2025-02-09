const mongoose = require('mongoose');

const listingschema = new mongoose.Schema({
  // Basic Information
  propertyName: {
    type: String,
    required: true,
  },
  propertyType: {
    type: String,
    required: true,
    enum: [
      'Flat/Apartment', 'Independent House/Villa', 'Plot/Land', 'Farmhouse',
      'Office', 'Retail/Shop', 'Storage/Warehouse', 'Industry/Factory',
      'Hospitality', 'Others'
    ],
  },
  purpose: {
    type: String,
    required: true,
    enum: ['Sell', 'Lease'],
  },
  category: {
    type: String,
    required: true,
    enum: ['Residential', 'Commercial'],
  },
  bhkConfiguration: {
    type: [String], // Array of BHK types (e.g., ["2BHK", "3BHK"])
    required: true,
    enum: ['Studio', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Penthouse'],
  },
  constructionType: {
    type: String,
    required: true,
    enum: ['Ready to Move', 'Under Construction'],
  },
  
  // Location Details
  locality: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  PINcode: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  nearbyLandmarks: {
    type: String,
  },

  // Size and Area Details
  carpetArea: {
    type: Number,
    required: true,
  },
  buildupArea: {
    type: Number,
  },
  floorNumber: {
    type: Number,  // Applicable for flats or apartments
  },
  totalFloors: {
    type: Number,  // Total number of floors in the building
  },

  // Price and Rent Details
  expectedPrice: {
    type: Number,
  },
  monthlyRent: {
    type: Number,
  },
  priceNegotiable: {
    type: Boolean,
  },
  maintenanceCharges: {
    type: Number,
  },
  bookingAmount: {
    type: Number,
  },

  // Connectivity Details
  connectivity: {
    type: {
      metro: { type: Number, required: true },
      airport: { type: Number, required: true },
      busStation: { type: Number, required: true },
      railwayStation: { type: Number, required: true },
    },
    required: true,
  },

  // Photos
  photos: {
    type: [String],
    validate: {
      validator: function (value) {
        return value.length <= 5;
      },
      message: 'You can upload up to 5 images only.',
    },
  },

  // Amenities and Features
  amenities: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
  },

  // Lister and Builder Information
  listerType: {
    type: String,
    required: true,
    enum: ['Owner', 'Broker', 'Constructor/Builder/Developer'],
  },
  builderCompany: {
    type: String,
  },
  builderCertifications: {
    type: String,
  },

  // Listing Type (Optional/Subscription)
  listingType: {
    type: String,
    enum: ['Normal', 'Premium', 'Featured', 'Highlighted'],
  },
  listerName: {
    type: String,
    required: true,
  },
  listerPhoneNumber: {
    type: Number,
    required: true,
  },
  listerEmail: {
    type: String,
  },

  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true,
  },

  // Additional Fields
  noOfBedrooms: {
    type: Number, // Number of bedrooms (e.g., 2, 3, etc.)
  },
  noOfBathrooms: {
    type: Number, // Number of bathrooms
  },
  noOfHalls: {
    type: Number, // Number of halls (useful for houses and villas)
  },
  balcony: {
    type: Boolean, // Whether the property has a balcony
  },
  propertyAge: {
    type: Number, // Age of the property in years
  },

  // Ratings
  connectivityRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  livabilityRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  safetyRating: {
    type: Number,
    min: 1,
    max: 5,
  }

}, { timestamps: true });

const PostProperty = mongoose.model('PostProperty', listingschema, 'PropertyListings');

module.exports = PostProperty;
