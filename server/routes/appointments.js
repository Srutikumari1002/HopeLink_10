const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');

// @route   POST api/appointments
// @desc    Book a hospital appointment
// @access  Private
router.post('/', auth, async (req, res) => {
  const { hospital_id, doctor_name, appointment_date, appointment_time, reason } = req.body;

  if (!hospital_id || !doctor_name || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Please fill out all booking fields.' });
  }

  try {
    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      return res.status(404).json({ error: 'Selected hospital does not exist.' });
    }

    const appointment = new Appointment({
      user: req.user.id,
      hospital: hospital_id,
      doctorName: doctor_name,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      reason: reason || ''
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointmentId: appointment.id,
      hospitalName: hospital.name
    });
  } catch (err) {
    console.error('Error booking appointment:', err.message);
    res.status(500).json({ error: 'Failed to book the appointment.' });
  }
});

// @route   GET api/appointments/my
// @desc    Get user appointments list
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    // Populate hospital details
    const appointments = await Appointment.find({ user: req.user.id })
      .populate('hospital')
      .sort({ appointmentDate: 1, appointmentTime: 1 });
    
    // Map to the same format expected by client (hospital_name, hospital_address, hospital_phone)
    const formatted = appointments.map(a => {
      const apptObj = a.toObject();
      return {
        ...apptObj,
        hospital_name: a.hospital ? a.hospital.name : 'Unknown Hospital',
        hospital_address: a.hospital ? a.hospital.address : 'Unknown Address',
        hospital_phone: a.hospital ? a.hospital.phone : 'Unknown Phone',
        hospital_id: a.hospital ? a.hospital._id : null
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching appointments:', err.message);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});

module.exports = router;
