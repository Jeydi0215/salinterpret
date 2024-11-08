import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';  // Import Axios
import Navbar from '../components/UserNavbar';

// Styled Components
const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  height: 100vh;
`;

const CameraPlaceholder = styled.div`
  width: 80%;
  height: 50vh;
  margin-top: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
`;

const CameraFeed = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const TranslationText = styled.div`
  margin-top: 2rem;
  font-size: 1.5rem;
  color: black;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Instructions = styled.div`
  margin-top: 2rem;
  font-size: 1.2rem;
  text-align: center;
  color: black;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CaptureButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
`;

const ClearButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
`;

function ASLTranslationPage() {
  const videoRef = useRef(null);
  const [translation, setTranslation] = useState('');

  // Function to start the webcam stream
  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
        });
    }
  }, []);

  // Capture a snapshot when the "Capture" button is clicked
  const captureSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a Blob for uploading as FormData
    canvas.toBlob((blob) => {
      fetchTranslation(blob);
    }, 'image/png');
  };

  // Fetch translation based on the captured image
  const fetchTranslation = async (imageBlob) => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob);

      // Use Axios to make the POST request
      const response = await axios.post('https://flasky-d9sr.onrender.com/translate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.translation) {
        setTranslation((prevTranslation) => prevTranslation + response.data.translation);
      }
    } catch (error) {
      console.error('Error fetching translation:', error.message);
    }
  };

  const handleClearTranslation = () => {
    setTranslation('');
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <video ref={videoRef} autoPlay width="640" height="480" />
      </CameraPlaceholder>
      <CaptureButton onClick={captureSnapshot}>Capture</CaptureButton>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      {translation && <ClearButton onClick={handleClearTranslation}>Clear Translation</ClearButton>}
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera.</p>
        <p>2. Click the "Capture" button to capture a snapshot.</p>
        <p>Note: This app only translates the alphabet for now.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
