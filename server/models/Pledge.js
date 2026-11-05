const mongoose = require('mongoose');

const PledgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  organs: {
    type: [String],
    required: true
  },
  emergencyContactName: {
    type: String,
    required: true,
    trim: true
  },
  emergencyContactPhone: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pledge', PledgeSchema);
