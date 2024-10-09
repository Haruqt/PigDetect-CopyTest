import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import { loadUser } from './actions/authActions';
import setAuthToken from './utils/setAuthToken';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Dashboard/Profile';
import Records from './components/Dashboard/Records';
import Predict from './components/Predictions/Predict';
import About from './components/About/About';
import Blog from './components/Blog/Blog';
import Contact from './components/Contact/Contact';
import Dashboard from './components/Dashboard/Dashboard';
import BlogPostForm from './components/Blog/BlogPostForm';
import PrivateRoute from './components/routing/PrivateRoute';
import MapComponent from './components/Map/Map';
import Notifications from './components/Notifications/Notification'; // Import Notifications component
import './App.css';

// Pusher Beams import
import * as PusherPushNotifications from "@pusher/push-notifications-web"; 

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());

    // Initialize Pusher Beams client
    const beamsClient = new PusherPushNotifications.Client({
      instanceId: "YOUR_INSTANCE_ID", // Replace with your actual Pusher instance ID
    });

    beamsClient.start()
      .then(() => beamsClient.addDeviceInterest('pig-skin-disease-updates')) // Subscribe to an interest
      .then(() => console.log('Successfully subscribed to disease updates'))
      .catch(err => console.error('Error starting Beams client:', err));
  }, []);

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return (
    <Provider store={store}>
      <Router>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<PrivateRoute component={Profile} />} />
              <Route path="/records" element={<PrivateRoute component={Records} />} />
              <Route path="/predict" element={<PrivateRoute component={Predict} />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
              <Route path="/create-blog" element={<PrivateRoute component={BlogPostForm} />} />
              <Route path="/map" element={<PrivateRoute component={MapComponent} />} />
              <Route path="/notifications" element={<PrivateRoute component={Notifications} />} /> {/* Notifications route */}
              <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/about" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
};

export default App;
