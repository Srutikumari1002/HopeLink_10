const express = require('express');
const router = express.Router();
const Pledge = require('../models/Pledge');
const auth = require('../middleware/auth');

// @route   POST api/pledges
// @desc    Create or update user organ donation pledge
// @access  Private
router.post('/', auth, async (req, res) => {
  const { organs, emergencyContactName, emergencyContactPhone } = req.body;

  if (!organs || !Array.isArray(organs) || organs.length === 0 || !emergencyContactName || !emergencyContactPhone) {
    return res.status(400).json({ error: 'Please provide all pledge details.' });
  }

  try {
    let pledge = await Pledge.findOne({ user: req.user.id });

    if (pledge) {
      // Update existing
      pledge.organs = organs;
      pledge.emergencyContactName = emergencyContactName;
      pledge.emergencyContactPhone = emergencyContactPhone;
      await pledge.save();
      return res.json({ message: 'Organ pledge updated successfully!', pledge });
    } else {
      // Create new
      pledge = new Pledge({
        user: req.user.id,
        organs,
        emergencyContactName,
        emergencyContactPhone
      });
      await pledge.save();
      return res.status(201).json({ message: 'Thank you! Your organ pledge has been registered.', pledge });
    }
  } catch (err) {
    console.error('Error saving pledge:', err.message);
    res.status(500).json({ error: 'Failed to register your organ pledge.' });
  }
});

// @route   GET api/pledges/my
// @desc    Get active user pledge
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const pledge = await Pledge.findOne({ user: req.user.id });
    if (!pledge) {
      return res.status(404).json({ message: 'No pledge registered for this user.' });
    }
    res.json(pledge);
  } catch (err) {
    console.error('Error fetching pledge:', err.message);
    res.status(500).json({ error: 'Failed to fetch your pledge data.' });
  }
});

module.exports = router;
