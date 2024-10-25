import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/UserNavbar';

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

const ClearButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
`;

function ASLTranslationPage() {
  const [cameraImage, setCameraImage] = useState('');
  const [translation, setTranslation] = useState('');

  const handleImageCapture = async (imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);

    try {
      const response = await fetch('https://flasky-d9sr.onrender.com/translate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setCameraImage(data.img);
      if (data.translation !== '') {
        // Append the new translation to the existing one
        setTranslation(prevTranslation => prevTranslation + data.translation);
      }
    } catch (error) {
      console.error('Error fetching translation:', error.message);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Simulate capturing an image here
      // For example, use a video stream or canvas to get image data
      const simulatedImageData = new Blob(); // Replace with actual image data
      handleImageCapture(simulatedImageData);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleClearTranslation = () => {
    setTranslation(prevTranslation => prevTranslation.slice(0, -1));
  };

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
      {translation && (
        <ClearButton onClick={handleClearTranslation}>Delete Last Letter</ClearButton>
      )}
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera.</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app for now only translates the alphabet.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
