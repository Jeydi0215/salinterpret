import React, { useState, useEffect } from 'react';
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

const CameraFeed = styled.img`
  max-width: 100%;
  max-height: 100%;
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
  const [cameraImage, setCameraImage] = useState('');
  const [translation, setTranslation] = useState('');

  // Directly set to your Render app URL
  const apiUrl = 'https://flasky-d9sr.onrender.com/translate';  

  // Function to fetch translation
  const fetchTranslation = async (image) => {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setCameraImage(data.img);
      setTranslation(data.translation);
    } catch (error) {
      console.error('Error fetching translation:', error.message);
    }
  };

  // Simulate capturing an image and fetching translation
  useEffect(() => {
    const simulateCamera = async () => {
      // Replace this with your actual camera capture logic
      const simulatedImage = new Blob(); // Use actual image blob

      // Fetch the translation for the captured image
      await fetchTranslation(simulatedImage);
    };

    // Set an interval to simulate fetching every second
    const intervalId = setInterval(simulateCamera, 1000);

    return () => clearInterval(intervalId);
  }, []); // No dependencies to ensure it runs once on mount

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        {cameraImage ? (
          <CameraFeed src={`data:image/jpeg;base64,${cameraImage}`} alt="Camera Feed" />
        ) : (
          <p>Loading camera...</p>
        )}
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
