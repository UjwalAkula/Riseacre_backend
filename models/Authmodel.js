const mongoose = require('mongoose');

const userauthschema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseUid: {
    type: String,
    required: true,  // This makes firebaseUid a required field
  },
  listings:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostProperty'
  }]
}, { timestamps: true });

const UserAuth = mongoose.model('UserAuth', userauthschema, 'myactivity');

module.exports = UserAuth;

