const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { predictDisease } = require('../../utils/predict');
const { v4: uuidv4 } = require('uuid');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route    POST api/predictions
// @desc     Make a prediction
// @access   Private
router.post('/', [auth, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Resize and save the image
    const imagePath = path.join(__dirname, '../../uploads', `${uuidv4()}.jpg`);
    console.log(`Saving image to: ${imagePath}`); 
    await sharp(req.file.buffer)
      .resize(224, 224)
      .toFile(imagePath);

    // Predict the disease
    const prediction = await predictDisease(imagePath);
    console.log(`Prediction result: ${prediction}`);

    // Save prediction to user record
    const user = await User.findById(req.user.id);
    user.records.push({
      imagePath,
      prediction,
      date: new Date()
    });
    await user.save();

    // Trigger a notification here if necessary
    // You can emit this event to notify users

    res.json({ prediction, imagePath });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error');
  }
});

// @route    PUT api/predictions/me/location
// @desc     Save user's location
// @access   Private
router.put('/me/location', auth, async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Add latitude and longitude to user's latest record
    const latestRecord = user.records[user.records.length - 1];
    latestRecord.latitude = latitude;
    latestRecord.longitude = longitude;

    await user.save();

    res.json({ msg: 'Location updated successfully', record: latestRecord });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
