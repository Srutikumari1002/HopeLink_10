const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organNeeded: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  urgencyLevel: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Searching Match'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Emergency', EmergencySchema);
