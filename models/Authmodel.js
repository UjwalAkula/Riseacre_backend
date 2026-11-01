const mongoose = require('mongoose');

const userauthschema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseUid: {
    type: String,
    required: true,  // This makes firebaseUid a required field
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userauthschema.virtual('listings', {
  ref: 'PostProperty',
  localField: '_id',
  foreignField: 'userId',
});

const UserAuth = mongoose.model('UserAuth', userauthschema, 'myactivity');

module.exports = UserAuth;

