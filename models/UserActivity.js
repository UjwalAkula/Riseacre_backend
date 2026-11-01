const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAuth",
    required: true,
  },

  savedProperties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostProperty",
    },
  ],

  contactedProperties: [
    {
      propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostProperty",
      },
      contactedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['New', 'Contacted', 'Visit planned', 'Closed'],
        default: 'New',
      },
      ownerEmailSentAt: {
        type: Date,
      },
      ownerEmailAttemptedAt: {
        type: Date,
      },
      ownerEmailStatus: {
        type: String,
        enum: ['sending', 'sent', 'failed'],
      },
    },
  ],
});

const UserActivity = mongoose.model("UserActivity", UserActivitySchema);

module.exports = UserActivity;
