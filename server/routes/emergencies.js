const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');

// @route   POST api/emergencies
// @desc    Create emergency request alert
// @access  Private
router.post('/', auth, async (req, res) => {
  const { organ_needed, blood_type, hospital_id, urgency_level } = req.body;

  if (!organ_needed || !blood_type || !hospital_id || !urgency_level) {
    return res.status(400).json({ error: 'Please provide all emergency request fields.' });
  }

  try {
    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      return res.status(404).json({ error: 'Selected hospital does not exist.' });
    }

    const emergency = new Emergency({
      user: req.user.id,
      organNeeded: organ_needed,
      bloodType: blood_type,
      hospital: hospital_id,
      urgencyLevel: urgency_level
    });

    await emergency.save();

    res.status(201).json({
      message: 'CRITICAL ALERT BROADCASTED. Matchmaking search initiated.',
      requestId: emergency.id,
      dispatchHospital: hospital.name
    });
  } catch (err) {
    console.error('Error in emergency request dispatch:', err.message);
    res.status(500).json({ error: 'Failed to dispatch emergency request.' });
  }
});

module.exports = router;
