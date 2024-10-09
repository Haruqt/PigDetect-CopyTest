import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import Webcam from 'react-webcam';
import MapComponent from '../Map/Map'; // Import the Map component
import './Predict.css';

const Predict = () => {
  const [file, setFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedImageURL, setCroppedImageURL] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [cropper, setCropper] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [markerPosition, setMarkerPosition] = useState([12.8797, 121.7740]); // Default location for Philippines
  const webcamRef = useRef(null);

  // For Geolocation
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });

  // Handle file selection
  const onFileChange = (e) => {
    setFile(URL.createObjectURL(e.target.files[0]));
  };

  // Capture image from webcam
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFile(imageSrc);
  };

  // Crop the image
  const getCropData = () => {
    if (!cropper) {
      alert('Please select and crop an image first.');
      return;
    }
    cropper.getCroppedCanvas().toBlob((blob) => {
      const croppedFile = new File([blob], 'croppedImage.jpg', {
        type: 'image/jpeg',
      });
      setCroppedImage(croppedFile);
      setCroppedImageURL(URL.createObjectURL(croppedFile));
    }, 'image/jpeg');
  };

  // Submit the cropped image to the backend for prediction
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!croppedImage) {
      alert('Please crop the image first!');
      return;
    }

    const formData = new FormData();
    formData.append('image', croppedImage);

    try {
      console.log('Sending image for prediction...');
      const res = await axios.post('http://localhost:5000/api/predictions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Prediction response:', res.data);
      const detectedPrediction = res.data.prediction;

      setPrediction(detectedPrediction);

      const userData = {
        name: 'Roland Andrei Ventura', // Placeholder for the authenticated user's name
        disease: detectedPrediction,
        date: new Date().toISOString(),
        position: [location.latitude, location.longitude],
      };

      setUserData(userData);

      // Save prediction data to the server
      await axios.post('http://localhost:5000/api/users/save-record', {
        latitude: location.latitude,
        longitude: location.longitude,
        prediction: detectedPrediction,
        date: userData.date,
      });

      setError(null);
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to get prediction. Please try again.');
    }
  };

  // Handle manual location change
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation({ ...location, [name]: value });
  };

  // Get user's location automatically using Geolocation API
  const getLocationAutomatically = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMarkerPosition([position.coords.latitude, position.coords.longitude]);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError('Failed to get location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  // Set marker position based on manually entered location
  const setManualLocation = () => {
    if (location.latitude && location.longitude) {
      setMarkerPosition([parseFloat(location.latitude), parseFloat(location.longitude)]);
    } else {
      alert('Please enter valid latitude and longitude.');
    }
  };

  return (
    <div className="predict-container">
      <h2>Predict Pig Skin Disease</h2>
      <form onSubmit={onSubmit} className="predict-form">
        <input type="file" accept="image/*" onChange={onFileChange} />
        <button type="button" onClick={() => setUseCamera(!useCamera)} className="btn full-width">
          {useCamera ? 'Stop Camera' : 'Use Camera'}
        </button>
        {useCamera && (
          <div className="webcam-container full-width">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="full-width"
            />
            <button type="button" onClick={capture} className="btn full-width">
              Capture Photo
            </button>
          </div>
        )}
        {file && (
          <Cropper
            style={{ height: 400, width: '100%' }}
            aspectRatio={1}
            src={file}
            viewMode={1}
            guides={false}
            scalable={true}
            cropBoxResizable={true}
            onInitialized={(instance) => setCropper(instance)}
          />
        )}
        <button type="button" onClick={getCropData} className="btn full-width">
          Crop Image
        </button>
        <button type="submit" className="btn full-width">
          Predict
        </button>
      </form>

      {croppedImageURL && (
        <div className="cropped-image-container">
          <h3>Cropped Image</h3>
          <img src={croppedImageURL} alt="Cropped" />
        </div>
      )}

      {prediction && (
        <div className="prediction-result" style={{ fontSize: '1.5em', marginTop: '20px' }}>
          Prediction: <strong>{prediction || 'No prediction available'}</strong>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <div className="location-container">
        <button type="button" onClick={getLocationAutomatically} className="btn full-width">
          Get Location Automatically
        </button>

        <h4>Or enter manually:</h4>
        <div className="manual-location-inputs">
          <label>
            Latitude:
            <input
              type="text"
              name="latitude"
              value={location.latitude}
              onChange={handleLocationChange}
              className="input-box"
              placeholder="Enter latitude"
            />
          </label>
          <label>
            Longitude:
            <input
              type="text"
              name="longitude"
              value={location.longitude}
              onChange={handleLocationChange}
              className="input-box"
              placeholder="Enter longitude"
            />
          </label>
        </div>
        <button type="button" onClick={setManualLocation} className="btn full-width">
          Enter
        </button>
      </div>

      <MapComponent
        markers={
          userData
            ? [
                {
                  position: markerPosition,
                  name: userData.name,
                  disease: userData.disease,
                  date: userData.date,
                },
              ]
            : []
        }
      />
    </div>
  );
};

export default Predict;
