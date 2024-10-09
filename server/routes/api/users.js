const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

let notifications = []; // Stores notifications

// Haversine formula for calculating the distance between two coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371e3; // Radius of Earth in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return distance;
}

// @route    GET api/users/me
// @desc     Get current user's profile
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/users/me
// @desc     Update user profile
// @access   Private
router.put(
  '/me',
  [
    auth,
    upload.single('avatar'), // Handle file upload
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('contact', 'Please include a valid contact').optional().isString(),
      check('healthIssues', 'Health issues must be an array').optional().isString() // Changed to string
    ]
  ],
  async (req, res) => {
    console.log('Request Body:', req.body);  // Log request body
    console.log('Uploaded File:', req.file);  // Log uploaded file

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());  // Log validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, contact, healthIssues } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      user.name = name;
      user.email = email;
      if (contact) user.contact = contact;
      if (healthIssues) user.healthIssues = JSON.parse(healthIssues); // Parse JSON string to array
      if (avatar) user.avatar = avatar;

      await user.save();

      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    POST api/users/save-record
// @desc     Save prediction record (latitude, longitude, prediction, date) and check proximity
// @access   Private
router.post('/save-record', auth, async (req, res) => {
  const { latitude, longitude, prediction, date } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Create the new record to save
    const newRecord = {
      latitude,
      longitude,
      prediction,
      date: new Date(date),
    };

    // Add the new record to the user's records array
    user.records.push(newRecord);
    await user.save();

    // Check proximity to other users
    const users = await User.find();
    users.forEach((otherUser) => {
      otherUser.records.forEach((otherRecord) => {
        const distance = haversineDistance(
          latitude,
          longitude,
          otherRecord.latitude,
          otherRecord.longitude
        );
        // If distance is within 50 meters and it's not the same user
        if (distance <= 50 && user.id !== otherUser.id) {
          const notification = {
            id: uuidv4(),
            title: 'Proximity Alert',
            message: `${user.name} and ${otherUser.name} are within 50 meters of each other!`,
            details: `${user.name} has ${prediction}. ${otherUser.name} has ${otherRecord.prediction}.`,
            date: new Date().toLocaleString(),
          };
          notifications.push(notification);
        }
      });
    });

    res.json(user.records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/users/all-records
// @desc     Fetch all prediction records from all users
// @access   Public
router.get('/all-records', async (req, res) => {
  try {
    const users = await User.find();

    // Combine all records from all users
    const markers = users.flatMap((user) =>
      user.records.map((record) => ({
        name: user.name,
        latitude: record.latitude,
        longitude: record.longitude,
        prediction: record.prediction,
        date: record.date,
      }))
    );

    res.json(markers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/users/notifications
// @desc     Fetch notifications for all users
// @access   Public
router.get('/notifications', (req, res) => {
  res.status(200).json(notifications);
});

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        console.error('User already exists');
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET, // Use JWT_SECRET from environment variables
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    GET api/users/me/records
// @desc     Get all records of the current user
// @access   Private
router.get('/me/records', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('records');
    res.json(user.records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
