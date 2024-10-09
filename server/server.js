const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http'); // Import http
const socketIo = require('socket.io'); // Import socket.io

// Load environment variables
dotenv.config();

const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with the client's URL
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/predictions', require('./routes/api/predictions'));
app.use('/api/blogs', require('./routes/api/blogs'));
app.use('/api/contact', require('./routes/api/contact'));

// New locations route (added for proximity notifications)
app.use('/api/locations', require('./routes/api/locations')); // This is the new route for location updates

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

// Handle Socket.IO for real-time proximity notifications
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for location updates from clients
  socket.on('locationUpdate', (data) => {
    // Broadcast to all connected clients (excluding sender)
    socket.broadcast.emit('locationUpdate', data);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
