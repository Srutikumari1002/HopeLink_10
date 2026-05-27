const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  availableOrgans: {
    type: [String],
    required: true
  },
  rating: {
    type: Number,
    default: 4.5
  }
});

module.exports = mongoose.model('Hospital', HospitalSchema);
