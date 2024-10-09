import React, { useEffect, useState } from 'react';
import './Notification.css';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from the server
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/users/notifications');  // Fetch from the backend API
        const data = await response.json();
        setNotifications(data);  // Update the notifications state with the response
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);  // Empty dependency array to run this effect once when the component loads

  return (
    <div className="notification-container">
      <h2>Notifications</h2>
      <div className="notification-list">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} className="notification-box">
              <h3>{notification.title} - {notification.name}</h3>
              <p>{notification.message}</p>
              <p>{notification.details}</p>
              <p>{notification.date}</p>
            </div>
          ))
        ) : (
          <div className="notification-box empty">
            <h3>No notifications yet</h3>
            <p>Once proximity or prediction triggers a notification, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
