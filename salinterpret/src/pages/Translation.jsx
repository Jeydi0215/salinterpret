import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/AdminNavbar';

const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color:white;
  height:100vh ;
`;

const CameraPlaceholder = styled.div`
  width: 80%;
  height: 50vh; 
  margin-top: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color:black;
`;  

const CameraFeed = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const TranslationText = styled.div`
  margin-top: 2rem;
  font-size: 1.5rem;
  color:black;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Instructions = styled.div`
  margin-top: 2rem;
  font-size: 1.2rem;
  text-align: center;
  color:black;

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
  const [translations, setTranslations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://flask-server-pi.vercel.app/');
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await response.json();
        setCameraImage(data.img);
        if (data.translations.length > 0) {
          // Append the new translations to the existing ones
          setTranslations(prevTranslations => [...prevTranslations, ...data.translations]);
        }
      } catch (error) {
        console.error('Error fetching translations:', error.message);
      }
    };

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleClearLastLetter = () => {
    setTranslations(prevTranslations => {
      const updatedTranslations = [...prevTranslations];
      updatedTranslations.pop(); // Remove the last translation
      return updatedTranslations;
    });
  };

  const handleClearTranslation = () => {
    setTranslations([]);
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
        <p>{translations.join(' ')}</p>
      </TranslationText>
      {translations.length > 0 && (
        <ClearButton onClick={handleClearLastLetter}>Delete Last Letter</ClearButton>
      )}
      {translations.length > 0 && (
        <ClearButton onClick={handleClearTranslation}>Delete Whole Translation</ClearButton>
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
