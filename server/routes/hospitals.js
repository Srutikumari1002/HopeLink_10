const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');

// Haversine formula to calculate distance in KM between two coordinates
function getDistanceInKM(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// @route   GET api/hospitals
// @desc    Get all hospitals with optional proximity distance sorting
// @access  Public
router.get('/', async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const hospitals = await Hospital.find();

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      if (!isNaN(userLat) && !isNaN(userLng)) {
        const sortedHospitals = hospitals.map(h => {
          const distance = getDistanceInKM(userLat, userLng, h.latitude, h.longitude);
          // Convert mongoose document to plain object to attach dynamic distance
          const hospitalObj = h.toObject();
          return { ...hospitalObj, distance: parseFloat(distance.toFixed(1)) };
        }).sort((a, b) => a.distance - b.distance);

        return res.json(sortedHospitals);
      }
    }

    res.json(hospitals);
  } catch (err) {
    console.error('Error fetching hospitals:', err.message);
    res.status(500).json({ error: 'Failed to retrieve hospitals.' });
  }
});

module.exports = router;
