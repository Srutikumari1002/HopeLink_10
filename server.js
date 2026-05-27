const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet, dbAll } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'antigravity_super_secret_health_security_key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

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

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  try {
    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const result = await dbRun(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Generate token
    const token = jwt.sign({ id: result.lastID, name, email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id: result.lastID, name, email }
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Verify session
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify session.' });
  }
});


// ----------------------------------------------------
// HOSPITALS & FINDER ENDPOINTS
// ----------------------------------------------------

// Get hospitals (with optional distance calculation)
app.get('/api/hospitals', async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const hospitals = await dbAll('SELECT * FROM hospitals');
    
    // Parse available organs from JSON string
    const formattedHospitals = hospitals.map(h => ({
      ...h,
      available_organs: JSON.parse(h.available_organs)
    }));

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      if (!isNaN(userLat) && !isNaN(userLng)) {
        // Calculate distance for each hospital
        const sortedHospitals = formattedHospitals.map(h => {
          const distance = getDistanceInKM(userLat, userLng, h.latitude, h.longitude);
          return { ...h, distance: parseFloat(distance.toFixed(1)) };
        }).sort((a, b) => a.distance - b.distance); // Sort closest first

        return res.json(sortedHospitals);
      }
    }

    res.json(formattedHospitals);
  } catch (err) {
    console.error('Error fetching hospitals:', err);
    res.status(500).json({ error: 'Failed to retrieve hospitals.' });
  }
});


// ----------------------------------------------------
// ORGAN PLEDGE ENDPOINTS
// ----------------------------------------------------

// Submit / Update Pledge
app.post('/api/pledges', authenticateToken, async (req, res) => {
  const { organs, emergency_contact_name, emergency_contact_phone } = req.body;

  if (!organs || !Array.isArray(organs) || organs.length === 0 || !emergency_contact_name || !emergency_contact_phone) {
    return res.status(400).json({ error: 'Please provide all pledge details.' });
  }

  try {
    const organsStr = JSON.stringify(organs);
    
    // Check if pledge already exists
    const existingPledge = await dbGet('SELECT * FROM pledges WHERE user_id = ?', [req.user.id]);
    
    if (existingPledge) {
      await dbRun(
        'UPDATE pledges SET organs = ?, emergency_contact_name = ?, emergency_contact_phone = ? WHERE user_id = ?',
        [organsStr, emergency_contact_name, emergency_contact_phone, req.user.id]
      );
      return res.json({ message: 'Organ pledge updated successfully!' });
    } else {
      await dbRun(
        'INSERT INTO pledges (user_id, organs, emergency_contact_name, emergency_contact_phone) VALUES (?, ?, ?, ?)',
        [req.user.id, organsStr, emergency_contact_name, emergency_contact_phone]
      );
      return res.status(201).json({ message: 'Thank you! Your organ pledge has been registered.' });
    }
  } catch (err) {
    console.error('Error saving pledge:', err);
    res.status(500).json({ error: 'Failed to register your organ pledge.' });
  }
});

// Fetch active pledge
app.get('/api/pledges/my', authenticateToken, async (req, res) => {
  try {
    const pledge = await dbGet('SELECT * FROM pledges WHERE user_id = ?', [req.user.id]);
    if (!pledge) {
      return res.status(404).json({ message: 'No pledge registered for this user.' });
    }
    
    res.json({
      ...pledge,
      organs: JSON.parse(pledge.organs)
    });
  } catch (err) {
    console.error('Error fetching pledge:', err);
    res.status(500).json({ error: 'Failed to fetch your pledge data.' });
  }
});


// ----------------------------------------------------
// HOSPITAL APPOINTMENT ENDPOINTS
// ----------------------------------------------------

// Book Appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { hospital_id, doctor_name, appointment_date, appointment_time, reason } = req.body;

  if (!hospital_id || !doctor_name || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Please fill out all booking fields.' });
  }

  try {
    const hospital = await dbGet('SELECT * FROM hospitals WHERE id = ?', [hospital_id]);
    if (!hospital) {
      return res.status(404).json({ error: 'Selected hospital does not exist.' });
    }

    const result = await dbRun(
      `INSERT INTO appointments (user_id, hospital_id, doctor_name, appointment_date, appointment_time, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, hospital_id, doctor_name, appointment_date, appointment_time, reason || '']
    );

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointmentId: result.lastID,
      hospitalName: hospital.name
    });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: 'Failed to book the appointment.' });
  }
});

// Fetch My Appointments
app.get('/api/appointments/my', authenticateToken, async (req, res) => {
  try {
    const appointments = await dbAll(
      `SELECT a.*, h.name as hospital_name, h.address as hospital_address, h.phone as hospital_phone
       FROM appointments a
       JOIN hospitals h ON a.hospital_id = h.id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date ASC, a.appointment_time ASC`,
      [req.user.id]
    );
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});


// ----------------------------------------------------
// EMERGENCY REQUEST ENDPOINTS
// ----------------------------------------------------

// Create Emergency Alert
app.post('/api/emergencies', authenticateToken, async (req, res) => {
  const { organ_needed, blood_type, hospital_id, urgency_level } = req.body;

  if (!organ_needed || !blood_type || !hospital_id || !urgency_level) {
    return res.status(400).json({ error: 'Please provide all emergency request fields.' });
  }

  try {
    const hospital = await dbGet('SELECT * FROM hospitals WHERE id = ?', [hospital_id]);
    if (!hospital) {
      return res.status(404).json({ error: 'Selected hospital does not exist.' });
    }

    const result = await dbRun(
      `INSERT INTO emergency_requests (user_id, organ_needed, blood_type, hospital_id, urgency_level)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, organ_needed, blood_type, hospital_id, urgency_level]
    );

    res.status(201).json({
      message: 'CRITICAL ALERT BROADCASTED. Matchmaking search initiated.',
      requestId: result.lastID,
      dispatchHospital: hospital.name
    });
  } catch (err) {
    console.error('Error saving emergency request:', err);
    res.status(500).json({ error: 'Failed to dispatch emergency request.' });
  }
});


// Catch-all route to serve the frontend single-page application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Organ Donation & Care Server is running locally `);
  console.log(` Port:    http://localhost:${PORT}               `);
  console.log(` Mode:    Development / Production               `);
  console.log(`=================================================`);
});
