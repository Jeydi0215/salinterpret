import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Navbar from '../components/UserNavbar';

const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CameraPlaceholder = styled.div`
  width: 80%;
  height: 50vh;
  margin-top: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CameraFeed = styled.video`
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
`;

const TranslationText = styled.div`
  margin-top: 2rem;
  font-size: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Instructions = styled.div`
  margin-top: 2rem;
  font-size: 1.2rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

function Translation() {
  const [cameraStream, setCameraStream] = useState(null); // Holds the camera stream
  const videoRef = useRef(null); // Reference to the video element
  const [translation, setTranslation] = useState('');

  // Set up the camera when the component mounts
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Use the rear camera if available
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    };

    startCamera();

    // Cleanup the camera when the component unmounts
    return () => {
      if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch from the server');
        }

        const data = await response.json();
        setTranslation(data.translation); // Update translation text
      } catch (error) {
        console.error('Error fetching translation:', error.message);
      }
    };

    const intervalId = setInterval(fetchData, 2000); // Fetch translation data every 2 seconds

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, []);

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <CameraFeed
          ref={videoRef}
          autoPlay
          playsInline
          muted
          alt="Camera Feed"
        />
      </CameraPlaceholder>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your right hand in front of the camera.</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app for now only translates the alphabet.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default Translation;
