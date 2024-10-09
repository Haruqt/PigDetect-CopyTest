// client/src/components/Common/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../actions/authActions';
import './Navbar.css';
import logo from '../../images/logo192.png';
import { io } from 'socket.io-client'; // Import socket.io-client

const Navbar = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState(0); // State to track notifications

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = io('http://localhost:5000'); // URL of the server running the Socket.IO server

    // Listen for 'notification' events from the server
    socket.on('notification', (data) => {
      setNotifications((prev) => prev + 1); // Update notification count
      console.log('Notification received:', data.message);
    });

    // Clean up on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const guestLinks = (
    <>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </>
  );

  const authLinks = (
    <>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/records">Records</Link>
      <Link to="/predict">Predict</Link>
      <Link to="/map">Map</Link>
      {auth.user && auth.user.role === 'admin' && <Link to="/create-blog">Create Blog</Link>}
      <Link to="/" onClick={handleLogout}>Logout</Link>
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/about">
          <img src={logo} alt="EpiDetect Logo" className="navbar-logo" />
          PigDetect
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/contact">Contact</Link>
        <div className="navbar-notification">
          <Link to="/notifications">
            Notifications
            {notifications > 0 && <span className="notification-badge">{notifications}</span>}
          </Link>
        </div>
        {auth.isAuthenticated ? authLinks : guestLinks}
      </div>
    </nav>
  );
};

export default Navbar;
