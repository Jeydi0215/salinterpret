import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/AdminNavbar';

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
  width: 100%;
  height: 100%;
  object-fit: cover;
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

function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const videoRef = useRef(null);

  // Determine the API URL based on the environment
  const apiUrl = process.env.NODE_ENV === 'production'
    ? 'https://<your-heroku-app>.herokuapp.com/translate'  // Replace with your Heroku app URL
    : 'http://127.0.0.1:5000/translate';

  // Fetch translation from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await response.json();
        setTranslation(data.translation);
      } catch (error) {
        console.error('Error fetching translation:', error.message);
      }
    };

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, [apiUrl]);

  useEffect(() => {
    // Access the camera feed
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Error accessing camera:', error.message);
      }
    };

    startCamera();
  }, []);

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <CameraFeed ref={videoRef} />
      </CameraPlaceholder>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your right hand in front of the camera.</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app currently only translates the alphabet.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
