const express = require("express");

const {
  saveProperty,
  removeSavedProperty,
  getSavedProperties,
  contactProperty,
  getContactedProperties,
  getUserListings,
  getOwnerLeads,
  updateLeadStatus,
} = require("../controllers/UserActivityController");

const router = express.Router();
const verifyFirebaseToken = require('../middlewares/Authorization');

router.use(verifyFirebaseToken);

router.post("/save", saveProperty);
router.post("/remove", removeSavedProperty);

router.get("/saved/:userId", getSavedProperties);

router.post("/contact", contactProperty);
router.get("/contacted/:userId", getContactedProperties);

router.get("/listed/:userId", getUserListings);
router.get('/leads/:userId', getOwnerLeads);
router.patch('/leads/:propertyId/:leadId', updateLeadStatus);

module.exports = router;
