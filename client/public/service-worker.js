/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

// Import the Pusher Beams script for notifications
importScripts('https://js.pusher.com/beams/service-worker.js');

// Add logic to handle push notifications
self.addEventListener('push', function (event) {
  const data = event.data.json();
  const options = {
    body: data.message,
    icon: '/logo512.png', // Replace with your own icon if needed
    badge: '/logo192.png', // Replace with your own badge if needed
  };

  // Wait until the notification is shown
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
