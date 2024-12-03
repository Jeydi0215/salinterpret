import React, { useState } from 'react';
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('https://flasky-d9sr.onrender.com/translate', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setCameraImage(data.img); // If you process and return the image
        setTranslation(data.translation);
      } catch (error) {
        console.error('Error uploading image:', error.message);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        {cameraImage ? (
          <CameraFeed src={`data:image/jpeg;base64,${cameraImage}`} alt="Camera Feed" />
        ) : (
          <p>No camera feed available. Upload an image to start translation.</p>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </CameraPlaceholder>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation || 'No translation yet'}</p>
      </TranslationText>
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Upload an image of your hand making a sign.</p>
        <p>2. Wait for the translation to appear below.</p>
        <p>Note: This app currently translates the alphabet only.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
