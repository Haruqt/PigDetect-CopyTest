import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import customMarkerIcon from '../../images/marker-icon.png'; // Import your custom marker icon
import axios from 'axios';

const MapComponent = ({ markers = [] }) => {
  const [position, setPosition] = useState([16.827970, 121.655411]); // Default location
  const [radius, setRadius] = useState(50); // 50 meters radius
  const [zoomLevel, setZoomLevel] = useState(8); // Adjusted zoom level
  const [allMarkers, setAllMarkers] = useState([]);

  // Define custom marker icon using Leaflet's L.Icon
  const customMarker = new L.Icon({
    iconUrl: customMarkerIcon, // Your custom marker icon
    iconSize: [32, 32], // Adjust size as necessary
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Fetch all markers (predictions and positions) from the server
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/all-records');
        setAllMarkers(res.data);
      } catch (err) {
        console.error('Error fetching markers:', err);
      }
    };
    fetchMarkers();
  }, []);

  useEffect(() => {
    if (markers.length > 0 && markers[0].position) {
      setPosition(markers[0].position); // Update position if markers change
    }
  }, [markers]);

  // Validate latitude and longitude
  const validLatLng = (lat, lng) => {
    return lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer center={position} zoom={zoomLevel} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Display all markers */}
        {allMarkers.length > 0 &&
          allMarkers.map((marker, index) => {
            if (validLatLng(marker.latitude, marker.longitude)) {
              return (
                <Marker
                  key={index}
                  position={[marker.latitude, marker.longitude]} // Each marker's position
                  icon={customMarker} // Custom marker icon
                >
                  <Popup>
                    <strong>{marker.name}</strong> <br />
                    Detected Disease: {marker.prediction} <br />
                    Date: {new Date(marker.date).toLocaleString()}
                  </Popup>
                  <Circle center={[marker.latitude, marker.longitude]} radius={radius} />
                </Marker>
              );
            }
            return null; // Return null for invalid lat/lng to avoid crashes
          })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
