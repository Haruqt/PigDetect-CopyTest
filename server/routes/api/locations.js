const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

let userLocations = []; // Stores user locations
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

// Check proximity between users
function checkProximityAndNotify(newUser) {
  userLocations.forEach((user) => {
    const distance = haversineDistance(
      newUser.position[0],
      newUser.position[1],
      user.position[0],
      user.position[1]
    );
    // If distance is within 50 meters and it's not the same user
    if (distance <= 50 && newUser.id !== user.id) {
      const message = `${newUser.name} and ${user.name} are within 50 meters of each other!`;
      const details = `${newUser.name} was diagnosed with ${newUser.disease}. ${user.name} was diagnosed with ${user.disease}.`;
      const notification = {
        title: "Proximity Alert",
        message,
        details,
        date: new Date().toLocaleString(),
      };
      notifications.push(notification);
    }
  });
}

// @route    POST api/locations
// @desc     Save user location and check proximity
// @access   Public
router.post('/', (req, res) => {
  const { name, latitude, longitude, disease, time } = req.body;

  const newUser = {
    id: uuidv4(),
    name,
    position: [latitude, longitude],
    disease,
    time,
  };

  // Add the new user location
  userLocations.push(newUser);

  // Check for proximity and create notifications
  checkProximityAndNotify(newUser);

  res.status(200).json({ msg: 'Location saved successfully', newUser });
});

// @route    GET api/locations/notifications
// @desc     Fetch notifications
// @access   Public
router.get('/notifications', (req, res) => {
  res.status(200).json(notifications);
});

module.exports = router;
