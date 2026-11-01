const mongoose = require('mongoose');
const UserActivity = require("../models/UserActivity");
const Listing = require("../models/Listingmodel");
const { sendListingLeadEmail } = require('../services/emailService');

const getOrCreateActivity = async (userId) => {
  let activity = await UserActivity.findOne({ userId });

  if (!activity) {
    activity = await UserActivity.create({
      userId,
      savedProperties: [],
      contactedProperties: [],
    });
  }

  return activity;
};

exports.saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: 'A valid property is required.' });
    if (!(await Listing.exists({ _id: propertyId }))) return res.status(404).json({ message: 'Property not found.' });

    const activity = await getOrCreateActivity(req.account._id);

    if (!activity.savedProperties.some((savedId) => savedId.toString() === propertyId)) {
      activity.savedProperties.push(propertyId);
      await activity.save();
    }

    res.status(200).json({ message: "Property saved successfully" });
  } catch (error) {
    console.error('Could not save property:', error.message);
    res.status(500).json({ message: 'Could not save this property. Please try again.' });
  }
};

exports.removeSavedProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: 'A valid property is required.' });

    const activity = await getOrCreateActivity(req.account._id);

    activity.savedProperties = activity.savedProperties.filter(
      (id) => id.toString() !== propertyId
    );

    await activity.save();

    res.status(200).json({ message: "Removed from saved" });
  } catch (error) {
    console.error('Could not remove saved property:', error.message);
    res.status(500).json({ message: 'Could not update saved properties. Please try again.' });
  }
};

exports.getSavedProperties = async (req, res) => {
  try {
    const userId = req.account._id;
    if (req.params.userId !== userId.toString()) return res.status(403).json({ message: 'Access denied.' });

    const activity = await UserActivity.findOne({ userId })
      .populate({ path: 'savedProperties', select: '-listerPhoneNumber -listerEmail -listerName' });

    res.status(200).json(activity?.savedProperties || []);
  } catch (error) {
    console.error('Could not load saved properties:', error.message);
    res.status(500).json({ message: 'Could not load saved properties.' });
  }
};

exports.contactProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: 'A valid property is required.' });
    const property = await Listing.findById(propertyId).select('userId propertyName locality city purpose expectedPrice monthlyRent listerEmail allowPhoneContact');
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    if (property.userId.toString() === req.account._id.toString()) {
      return res.status(400).json({ message: 'You cannot send an enquiry to your own listing.' });
    }

    const activity = await getOrCreateActivity(req.account._id);

    let contactEntry = activity.contactedProperties.find((entry) => entry.propertyId?.toString() === propertyId);
    if (!contactEntry) {
      activity.contactedProperties.push({ propertyId });
      await activity.save();
      contactEntry = activity.contactedProperties[activity.contactedProperties.length - 1];
    }

    let emailSent = Boolean(contactEntry.ownerEmailSentAt);
    let emailMessage = '';
    if (!emailSent) {
      const dailyEmailLimit = 10;
      const attemptsToday = activity.contactedProperties.filter((entry) => (
        entry.ownerEmailAttemptedAt && Date.now() - new Date(entry.ownerEmailAttemptedAt).getTime() < 24 * 60 * 60 * 1000
      )).length;
      const missingEmailConfig = !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD;
      const unavailableReason = !property.listerEmail
        ? 'owner_email_missing'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(property.listerEmail.trim())
          ? 'owner_email_invalid'
        : missingEmailConfig
          ? 'not_configured'
          : attemptsToday >= dailyEmailLimit ? 'daily_limit' : '';

      if (unavailableReason === 'owner_email_missing') {
        emailMessage = 'This owner has not provided an email address. You can still call them.';
      } else if (unavailableReason === 'owner_email_invalid') {
        emailMessage = 'The owner’s email address looks invalid. You can still call them.';
      } else if (unavailableReason === 'not_configured') {
        emailMessage = 'Gmail email delivery is not configured yet. You can still call the owner.';
      } else if (unavailableReason === 'daily_limit') {
        emailMessage = 'You have reached today’s enquiry email limit. You can still call the owner.';
      } else {
        const attemptedAt = new Date();
        const claim = await UserActivity.updateOne(
          {
            _id: activity._id,
            contactedProperties: {
              $elemMatch: {
                _id: contactEntry._id,
                propertyId: property._id,
                ownerEmailAttemptedAt: { $exists: false },
              },
            },
          },
          {
            $set: {
              'contactedProperties.$.ownerEmailAttemptedAt': attemptedAt,
              'contactedProperties.$.ownerEmailStatus': 'sending',
            },
          }
        );

        if (claim.modifiedCount) {
          const emailResult = await sendListingLeadEmail({
            to: property.listerEmail,
            seekerName: req.account.userName,
            seekerEmail: req.account.userEmail,
            property,
            requesterId: req.account._id.toString(),
          });
          emailSent = emailResult.sent;
          const emailStatusUpdate = {
            'contactedProperties.$.ownerEmailStatus': emailSent ? 'sent' : 'failed',
          };
          if (emailSent) emailStatusUpdate['contactedProperties.$.ownerEmailSentAt'] = new Date();
          await UserActivity.updateOne(
            {
              _id: activity._id,
              contactedProperties: { $elemMatch: { _id: contactEntry._id, propertyId: property._id } },
            },
            { $set: emailStatusUpdate }
          );
          if (!emailSent) emailMessage = 'The email could not be delivered. Please call the owner instead.';
        } else {
          const latestActivity = await UserActivity.findById(activity._id).select('contactedProperties');
          const latestEntry = latestActivity?.contactedProperties.find((entry) => entry._id.toString() === contactEntry._id.toString());
          emailSent = Boolean(latestEntry?.ownerEmailSentAt);
          if (!emailSent) {
            emailMessage = latestEntry?.ownerEmailStatus === 'sending'
              ? 'Your enquiry email is already being sent. Please wait a moment.'
              : 'An email attempt was already made for this listing. Please call the owner if you have not received confirmation.';
          }
        }
      }
    }

    res.status(200).json({
      message: 'Contact request recorded.',
      emailSent,
      emailMessage,
      callAvailable: property.allowPhoneContact !== false,
    });
  } catch (error) {
    console.error('Could not record property contact:', error.message);
    res.status(500).json({ message: 'Could not record your contact request.' });
  }
};

exports.getContactedProperties = async (req, res) => {
  try {
    const userId = req.account._id;
    if (req.params.userId !== userId.toString()) return res.status(403).json({ message: 'Access denied.' });

    const activity = await UserActivity.findOne({ userId })
      .populate({ path: 'contactedProperties.propertyId', select: '-listerPhoneNumber -listerEmail -listerName' });

    res.status(200).json(activity?.contactedProperties || []);
  } catch (error) {
    console.error('Could not load contacted properties:', error.message);
    res.status(500).json({ message: 'Could not load contacted properties.' });
  }
};

exports.getUserListings = async (req, res) => {
  try {
    const userId = req.account._id;
    if (req.params.userId !== userId.toString()) return res.status(403).json({ message: 'Access denied.' });

    const listings = await Listing.find({ userId });

    res.status(200).json(listings);
  } catch (error) {
    console.error('Could not load user listings:', error.message);
    res.status(500).json({ message: 'Could not load your listings.' });
  }
};

exports.getOwnerLeads = async (req, res) => {
  try {
    const ownerId = req.account._id;
    if (req.params.userId !== ownerId.toString()) return res.status(403).json({ message: 'Access denied.' });

    const ownedListings = await Listing.find({ userId: ownerId }).select('_id');
    if (!ownedListings.length) return res.status(200).json([]);
    const ownedIds = new Set(ownedListings.map((listing) => listing._id.toString()));
    const activities = await UserActivity.find({ 'contactedProperties.propertyId': { $in: ownedListings.map((listing) => listing._id) } })
      .populate({ path: 'userId', select: 'userName userEmail' })
      .populate({ path: 'contactedProperties.propertyId', select: 'propertyName locality city userId' });

    const leads = activities.flatMap((activity) => activity.contactedProperties
      .filter((entry) => entry.propertyId && ownedIds.has(entry.propertyId._id.toString()))
      .map((entry) => ({
        _id: entry._id,
        propertyId: entry.propertyId,
        contactedAt: entry.contactedAt,
        status: entry.status || 'New',
        seeker: activity.userId ? { userName: activity.userId.userName, userEmail: activity.userId.userEmail } : null,
      })));

    leads.sort((a, b) => new Date(b.contactedAt) - new Date(a.contactedAt));
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Could not load listing enquiries.' });
  }
};

exports.updateLeadStatus = async (req, res) => {
  const allowedStatuses = ['New', 'Contacted', 'Visit planned', 'Closed'];
  const { status } = req.body;
  if (!allowedStatuses.includes(status)) return res.status(400).json({ message: 'Choose a valid enquiry status.' });

  try {
    const ownedProperty = await Listing.exists({ _id: req.params.propertyId, userId: req.account._id });
    if (!ownedProperty) return res.status(404).json({ message: 'Property not found.' });

    const result = await UserActivity.updateOne(
      { contactedProperties: { $elemMatch: { _id: req.params.leadId, propertyId: req.params.propertyId } } },
      { $set: { 'contactedProperties.$.status': status } }
    );
    if (!result.matchedCount) return res.status(404).json({ message: 'Enquiry not found.' });
    res.status(200).json({ message: 'Enquiry status updated.', status });
  } catch (error) {
    res.status(400).json({ message: 'Could not update enquiry status.' });
  }
};
