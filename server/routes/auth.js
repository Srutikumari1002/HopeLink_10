const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    const secret = process.env.JWT_SECRET || 'hopelink_mern_super_secret_heart_token_key_2026';
    jwt.sign(payload, secret, { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({
        message: 'Registration successful!',
        token,
        user: payload
      });
    });
  } catch (err) {
    console.error('Error in registration:', err.message);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    const secret = process.env.JWT_SECRET || 'hopelink_mern_super_secret_heart_token_key_2026';
    jwt.sign(payload, secret, { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      res.json({
        message: 'Login successful!',
        token,
        user: payload
      });
    });
  } catch (err) {
    console.error('Error in login:', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user details
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err.message);
    res.status(500).json({ error: 'Failed to verify session.' });
  }
});

module.exports = router;
