const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route    GET api/users/notifications
// @desc     Get all notifications for the user
// @access   Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // For simplicity, we'll just send back the user's last record as a notification
    const lastRecord = user.records[user.records.length - 1];
    const notifications = [
      {
        title: 'Proximity Alert',
        name: user.name,
        message: `You and another user have been predicted with similar diseases!`,
        details: `Predicted disease: ${lastRecord.prediction}`,
        date: new Date(),
      },
    ];

    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
