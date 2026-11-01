const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const PostProperty = require('../models/Listingmodel');
const UserActivity = require('../models/UserActivity');
const Ratings = require('./Ratings');
const uploadDirectory = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads'));
const isValidDistance = (value) => value !== null && value !== undefined && !(typeof value === 'string' && value.trim() === '') && Number.isFinite(Number(value)) && Number(value) >= 0;

const publicListing = (property) => {
  const listing = property.toObject ? property.toObject() : { ...property };
  listing.locationConvenience = Ratings.calculateLocationConvenience(listing.connectivity);
  delete listing.listerPhoneNumber;
  delete listing.listerEmail;
  delete listing.listerName;
  return listing;
};

const removeUploadedFiles = async (filenames = []) => {
  await Promise.all(filenames.map(async (filename) => {
    if (!filename || path.basename(filename) !== filename) return;

    const filePath = path.resolve(uploadDirectory, filename);
    if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) return;

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') console.error('Could not remove uploaded image:', error.message);
    }
  }));
};

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(uploadDirectory, { recursive: true }).then(() => cb(null, uploadDirectory), cb);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

// Check file type to allow only image files (jpeg, jpg, png)
function checkFileType(file, cb) {
  const allowedTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes[extension] === file.mimetype) {
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

// Property Listing API - POST route
const listProperty = async (req, res) => {
  const {
    purpose, category, propertyType, constructionType, propertyName, locality,
    city, state, PINcode, latitude, longitude, nearbyLandmarks, carpetArea, buildupArea,
    amenities, connectivity, expectedPrice, monthlyRent, priceNegotiable, maintenanceCharges,
    bookingAmount, description, listerType, builderCompany, builderCertifications, listingType,
    listerName, listerPhoneNumber, listerEmail, allowPhoneContact, bhkConfiguration,
    floorNumber, totalFloors, noOfBedrooms, noOfBathrooms, noOfHalls, balcony, propertyAge,
  } = req.body;

  // Get photo paths from uploaded files
  const photoPaths = req.files ? req.files.map(file => file.filename) : [];
  let savedPropertyId;

  try {
    let parsedAmenities;
    let parsedConnectivity;
    try {
      parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
      parsedConnectivity = typeof connectivity === 'string' ? JSON.parse(connectivity) : connectivity;
    } catch {
      await removeUploadedFiles(photoPaths);
      return res.status(400).json({ responsefromserver: 'Amenities or connectivity is not valid JSON.' });
    }

    if (!Array.isArray(parsedAmenities) || !parsedConnectivity || typeof parsedConnectivity !== 'object') {
      await removeUploadedFiles(photoPaths);
      return res.status(400).json({ responsefromserver: 'Amenities and connectivity are required in valid formats.' });
    }

    const requiredDistances = ['metro', 'busStation', 'railwayStation'];
    if (requiredDistances.some((key) => !isValidDistance(parsedConnectivity[key]))) {
      await removeUploadedFiles(photoPaths);
      return res.status(400).json({ responsefromserver: 'Enter a valid non-negative distance for metro, bus station, and railway station.' });
    }
    const optionalDistances = ['airport', 'school', 'hospital'];
    if (optionalDistances.some((key) => parsedConnectivity[key] !== null && parsedConnectivity[key] !== undefined && parsedConnectivity[key] !== '' && !isValidDistance(parsedConnectivity[key]))) {
      await removeUploadedFiles(photoPaths);
      return res.status(400).json({ responsefromserver: 'Airport, school, and hospital distances must be valid non-negative numbers when provided.' });
    }

    const homeTypes = ['Flat/Apartment', 'Independent House/Villa', 'Farmhouse'];
    if (purpose === 'Sell' && !(Number(expectedPrice) > 0)) {
      await removeUploadedFiles(photoPaths);
      return res.status(400).json({ responsefromserver: 'A positive expected price is required for a sale listing.' });
    }
    if (purpose === 'Lease' && !(Number(monthlyRent) > 0)) {
      await removeUploadedFiles(photoPaths);
      return res.status(400).json({ responsefromserver: 'A positive monthly rent is required for a lease listing.' });
    }
    if (homeTypes.includes(propertyType) && (!bhkConfiguration || (Array.isArray(bhkConfiguration) && bhkConfiguration.length === 0))) {
      await removeUploadedFiles(photoPaths);
      return res.status(400).json({ responsefromserver: 'A home listing requires a BHK configuration.' });
    }
    if (homeTypes.includes(propertyType) && category !== 'Residential') {
      await removeUploadedFiles(photoPaths);
      return res.status(400).json({ responsefromserver: 'Select Residential for this property type.' });
    }
    if (['Office', 'Retail/Shop', 'Storage/Warehouse', 'Industry/Factory', 'Hospitality'].includes(propertyType) && category !== 'Commercial') {
      await removeUploadedFiles(photoPaths);
      return res.status(400).json({ responsefromserver: 'Select Commercial for this property type.' });
    }

    const locationConvenience = Ratings.calculateLocationConvenience(parsedConnectivity);
    const newProperty = new PostProperty({
      purpose, category, propertyType, constructionType, propertyName, locality,
      city, state, PINcode, latitude, longitude, nearbyLandmarks, carpetArea, buildupArea,
      amenities: parsedAmenities, connectivity: parsedConnectivity, expectedPrice, monthlyRent, priceNegotiable, maintenanceCharges,
      bookingAmount, description, listerType, builderCompany, builderCertifications, listingType,
      listerName, listerPhoneNumber, listerEmail, allowPhoneContact, userId: req.account._id, bhkConfiguration,
      floorNumber, totalFloors, noOfBedrooms, noOfBathrooms, noOfHalls, balcony, propertyAge,
      photos: photoPaths, // Use req.files instead of req.body.photos
      listingStatus: 'Active', availabilityConfirmedAt: new Date(),
      locationConvenience,
    });

    await newProperty.save();
    savedPropertyId = newProperty._id;

    res.status(200).json({
      responsefromserver: "Property listed successfully",
      ListedProperty: newProperty,
    });
  } catch (error) {
    console.error('Error while listing property:', error);
    if (savedPropertyId) {
      await Promise.allSettled([
        PostProperty.findByIdAndDelete(savedPropertyId),
      ]);
    }
    await removeUploadedFiles(photoPaths);
    res.status(error instanceof RangeError ? 400 : error.name === 'ValidationError' ? 400 : 500).json({
      responsefromserver: error instanceof RangeError || error.name === 'ValidationError' ? 'Listing data is invalid.' : 'Internal Server Error.',
    });
  }
};

// Other routes (unchanged)
const getAllProperties = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const query = { listingStatus: { $in: ['Active', null] } };
    const exactFilters = {
      purpose: ['Sell', 'Lease'],
      category: ['Residential', 'Commercial'],
      propertyType: ['Flat/Apartment', 'Independent House/Villa', 'Plot/Land', 'Farmhouse', 'Office', 'Retail/Shop', 'Storage/Warehouse', 'Industry/Factory', 'Hospitality', 'Others'],
      status: ['Ready to Move', 'Under Construction'],
      bhkType: ['Studio', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Penthouse'],
      listerType: ['Owner', 'Broker', 'Builder'],
    };

    for (const [param, allowedValues] of Object.entries(exactFilters)) {
      const value = String(req.query[param] || '');
      if (value && allowedValues.includes(value)) {
        const field = param === 'status' ? 'constructionType' : param === 'bhkType' ? 'bhkConfiguration' : param;
        query[field] = param === 'bhkType' ? { $in: [value] } : value;
      }
    }

    const minArea = req.query.minArea === undefined || req.query.minArea === '' ? NaN : Number(req.query.minArea);
    const maxArea = req.query.maxArea === undefined || req.query.maxArea === '' ? NaN : Number(req.query.maxArea);
    if (Number.isFinite(minArea) || Number.isFinite(maxArea)) {
      query.buildupArea = {};
      if (Number.isFinite(minArea)) query.buildupArea.$gte = Math.max(0, minArea);
      if (Number.isFinite(maxArea)) query.buildupArea.$lte = Math.max(0, maxArea);
    }

    const priceMin = req.query.priceMin === undefined || req.query.priceMin === '' ? NaN : Number(req.query.priceMin);
    const priceMax = req.query.priceMax === undefined || req.query.priceMax === '' ? NaN : Number(req.query.priceMax);
    if (Number.isFinite(priceMin) || Number.isFinite(priceMax)) {
      const priceField = query.purpose === 'Lease' ? 'monthlyRent' : 'expectedPrice';
      query[priceField] = {};
      if (Number.isFinite(priceMin)) query[priceField].$gte = Math.max(0, priceMin);
      if (Number.isFinite(priceMax)) query[priceField].$lte = Math.max(0, priceMax);
    }

    const stateAbbreviations = { ap: 'andhra pradesh', ar: 'arunachal pradesh', as: 'assam', br: 'bihar', cg: 'chhattisgarh', ch: 'chandigarh', dd: 'daman and diu', dl: 'delhi', dn: 'dadra and nagar haveli', ga: 'goa', gj: 'gujarat', hr: 'haryana', hp: 'himachal pradesh', jk: 'jammu and kashmir', jh: 'jharkhand', ka: 'karnataka', kl: 'kerala', la: 'ladakh', ld: 'lakshadweep', mh: 'maharashtra', ml: 'meghalaya', mn: 'manipur', mp: 'madhya pradesh', mz: 'mizoram', nl: 'nagaland', or: 'odisha', pb: 'punjab', py: 'puducherry', rj: 'rajasthan', sk: 'sikkim', tg: 'telangana', tn: 'tamil nadu', tr: 'tripura', up: 'uttar pradesh', ut: 'uttarakhand', wb: 'west bengal' };
    const searchTerms = String(req.query.search || '').slice(0, 160).split(/[\s,]+/).map((term) => term.trim().toLowerCase()).filter((term) => term && term !== 'india');
    if (searchTerms.length) {
      const escapedTerms = searchTerms.map((term) => stateAbbreviations[term] || term).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      query.$and = escapedTerms.map((term) => ({
        $or: ['nearbyLandmarks', 'locality', 'city', 'state'].map((field) => ({ [field]: { $regex: term, $options: 'i' } })),
      }));
    }

    const priceField = query.purpose === 'Lease' ? 'monthlyRent' : 'expectedPrice';
    const sortOptions = {
      newest: { createdAt: -1 },
      'price-asc': { [priceField]: 1, createdAt: -1 },
      'price-desc': { [priceField]: -1, createdAt: -1 },
      'area-desc': { buildupArea: -1, createdAt: -1 },
    };
    const requestedSort = String(req.query.sort || '');
    const priceSortWithoutPurpose = !query.purpose && ['price-asc', 'price-desc'].includes(requestedSort);
    const sort = priceSortWithoutPurpose ? sortOptions.newest : sortOptions[requestedSort] || sortOptions.newest;
    const [properties, totalProperties] = await Promise.all([
      PostProperty.find(query).sort(sort).skip((page - 1) * limit).limit(limit),
      PostProperty.countDocuments(query),
    ]);

    res.status(200).json({
      responsefromserver: properties.length ? 'Properties are found' : 'No properties match these filters.',
      properties: properties.map(publicListing),
      totalProperties,
      page,
      limit,
      totalPages: Math.ceil(totalProperties / limit),
    });
  } catch (error) {
    console.error('Error while fetching properties:', error);
    res.status(500).json({
      responsefromserver: "Internal Server Error.",
    });
  }
};

const updateAvailability = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ responsefromserver: 'Invalid property ID.' });
  }
  const allowedStatuses = ['Active', 'Unavailable', 'Sold', 'Rented'];
  const { status } = req.body;
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ responsefromserver: 'Choose a valid listing availability status.' });
  }

  try {
    const property = await PostProperty.findOne({ _id: req.params.id, userId: req.account._id });
    if (!property) return res.status(404).json({ responsefromserver: 'Property not found.' });
    if ((status === 'Sold' && property.purpose !== 'Sell') || (status === 'Rented' && property.purpose !== 'Lease')) {
      return res.status(400).json({ responsefromserver: 'Choose an availability status that matches this listing purpose.' });
    }
    property.listingStatus = status;
    property.availabilityConfirmedAt = new Date();
    await property.save();
    res.status(200).json({ responsefromserver: 'Listing availability updated.', property });
  } catch (error) {
    console.error('Could not update listing availability:', error.message);
    res.status(error.name === 'CastError' ? 400 : 500).json({ responsefromserver: 'Could not update listing availability.' });
  }
};

const updateCallPreference = async (req, res) => {
  const propertyId = req.params.id;
  const { allowPhoneContact } = req.body;
  if (!mongoose.isValidObjectId(propertyId)) {
    return res.status(400).json({ responsefromserver: 'Invalid property ID.' });
  }
  if (typeof allowPhoneContact !== 'boolean') {
    return res.status(400).json({ responsefromserver: 'Choose whether callers can contact you by phone.' });
  }

  try {
    const property = await PostProperty.findOneAndUpdate(
      { _id: propertyId, userId: req.account._id },
      { $set: { allowPhoneContact } },
      { new: true, runValidators: true }
    );
    if (!property) return res.status(404).json({ responsefromserver: 'Property not found.' });
    return res.status(200).json({ responsefromserver: 'Call preference updated.', property });
  } catch (error) {
    console.error('Could not update listing call preference:', error.message);
    return res.status(error.name === 'CastError' || error.name === 'ValidationError' ? 400 : 500)
      .json({ responsefromserver: 'Could not update the call preference.' });
  }
};

const getPropertyById = async (req, res) => {
  const propertyId = req.params.id;
  if (!mongoose.isValidObjectId(propertyId)) {
    return res.status(400).json({ responsefromserver: 'Invalid property ID.' });
  }

  try {
    const property = await PostProperty.findById(propertyId);
    if (!property) {
      return res.status(404).json({ responsefromserver: 'Property not found.' });
    }
    res.status(200).json({ responsefromserver: 'Property is found.', property: publicListing(property) });
  } catch (error) {
    console.error(error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ responsefromserver: error.name === 'CastError' ? 'Invalid property ID.' : 'Could not load this property.' });
  }
};

const updatePropertyById = async (req, res) => {
  const propertyId = req.params.id;
  if (!mongoose.isValidObjectId(propertyId)) {
    return res.status(400).json({ responsefromserver: 'Invalid property ID.' });
  }
  const updatedData = { ...req.body };
  delete updatedData.userId;
  delete updatedData.connectivityRating;
  delete updatedData.livabilityRating;
  delete updatedData.safetyRating;
    delete updatedData.locationConvenience;
  delete updatedData.listingStatus;
  delete updatedData.availabilityConfirmedAt;

  try {
    const currentProperty = await PostProperty.findOne({ _id: propertyId, userId: req.account._id })
      .select('purpose expectedPrice monthlyRent connectivity');
    if (!currentProperty) return res.status(404).json({ responsefromserver: 'Property not found.' });

    const effectivePurpose = updatedData.purpose ?? currentProperty.purpose;
    const effectiveExpectedPrice = Object.prototype.hasOwnProperty.call(updatedData, 'expectedPrice')
      ? updatedData.expectedPrice
      : currentProperty.expectedPrice;
    const effectiveMonthlyRent = Object.prototype.hasOwnProperty.call(updatedData, 'monthlyRent')
      ? updatedData.monthlyRent
      : currentProperty.monthlyRent;
    if (effectivePurpose === 'Sell' && !(Number(effectiveExpectedPrice) > 0)) {
      return res.status(400).json({ responsefromserver: 'A positive expected price is required for a sale listing.' });
    }
    if (effectivePurpose === 'Lease' && !(Number(effectiveMonthlyRent) > 0)) {
      return res.status(400).json({ responsefromserver: 'A positive monthly rent is required for a lease listing.' });
    }

    let updatedConnectivity = currentProperty.connectivity?.toObject?.() || currentProperty.connectivity || {};
    if (updatedData.connectivity) {
      if (typeof updatedData.connectivity === 'string') {
        try { updatedData.connectivity = JSON.parse(updatedData.connectivity); } catch {
          return res.status(400).json({ responsefromserver: 'Connectivity data is invalid.' });
        }
      }
      if (!updatedData.connectivity || typeof updatedData.connectivity !== 'object' || Array.isArray(updatedData.connectivity)) {
        return res.status(400).json({ responsefromserver: 'Connectivity data is invalid.' });
      }
      updatedConnectivity = { ...updatedConnectivity, ...updatedData.connectivity };
      updatedData.connectivity = updatedConnectivity;
    }
    const requiredDistances = ['metro', 'busStation', 'railwayStation'];
    if (requiredDistances.some((key) => !isValidDistance(updatedConnectivity[key]))) {
      return res.status(400).json({ responsefromserver: 'Enter valid non-negative distances for metro, bus station, and railway station.' });
    }
    if (['airport', 'school', 'hospital'].some((key) => updatedConnectivity[key] !== null && updatedConnectivity[key] !== undefined && updatedConnectivity[key] !== '' && !isValidDistance(updatedConnectivity[key]))) {
      return res.status(400).json({ responsefromserver: 'Airport, school, and hospital distances must be valid non-negative numbers when provided.' });
    }
    updatedData.locationConvenience = Ratings.calculateLocationConvenience(updatedConnectivity);

    const updatedProperty = await PostProperty.findOneAndUpdate(
      { _id: propertyId, userId: req.account._id },
      updatedData,
      { new: true, runValidators: true }
    );
    if (!updatedProperty) {
      return res.status(404).json({ responsefromserver: 'Property not found.' });
    }
    res.status(200).json({
      responsefromserver: 'Property updated successfully.',
      updatedProperty,
    });
  } catch (error) {
    console.error('Error while updating property:', error);
    const invalidData = error instanceof RangeError || error.name === 'ValidationError' || error.name === 'CastError';
    res.status(invalidData ? 400 : 500).json({
      responsefromserver: invalidData ? 'Listing data is invalid.' : 'Could not update this listing.',
    });
  }
};

const getPropertyContact = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ responsefromserver: 'Invalid property ID.' });
  }
  try {
    const activity = await UserActivity.findOne({ userId: req.account._id, 'contactedProperties.propertyId': req.params.id }).select('_id');
    if (!activity) return res.status(403).json({ responsefromserver: 'Record your contact request before viewing owner details.' });
    const property = await PostProperty.findById(req.params.id).select('listerPhoneNumber allowPhoneContact');
    if (!property) return res.status(404).json({ responsefromserver: 'Property not found.' });
    if (property.allowPhoneContact === false) return res.status(403).json({ responsefromserver: 'The owner has disabled phone calls for this listing.' });
    res.status(200).json({ phoneNumber: property.listerPhoneNumber });
  } catch (error) {
    res.status(400).json({ responsefromserver: 'Invalid property ID.' });
  }
};

const deletePropertyById = async (req, res) => {
  const propertyId = req.params.id;
  if (!mongoose.isValidObjectId(propertyId)) {
    return res.status(400).json({ responsefromserver: 'Invalid property ID.' });
  }

  try {
    const deletedProperty = await PostProperty.findOneAndDelete({ _id: propertyId, userId: req.account._id });
    if (!deletedProperty) {
      return res.status(404).json({ responsefromserver: 'Property not found.' });
    }

    await removeUploadedFiles(deletedProperty.photos);
    await UserActivity.updateMany({}, {
      $pull: {
        savedProperties: deletedProperty._id,
        contactedProperties: { propertyId: deletedProperty._id },
      },
    }).catch((activityError) => console.error('Could not clean deleted property activity:', activityError.message));

    res.status(200).json({
      responsefromserver: "Property and its uploaded photos were deleted successfully.",
    });
  } catch (error) {
    console.error('Error during property deletion:', error);
    res.status(500).json({
      responsefromserver: "Internal Server Error.",
    });
  }
};

// Export separately
module.exports = {
  postProperty: listProperty, // Handler
  upload, // Middleware
  getAllProperties,
  getPropertyById,
  getPropertyContact,
  updatePropertyById,
  updateAvailability,
  updateCallPreference,
  deletePropertyById,
};
