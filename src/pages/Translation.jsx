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

const ErrorMessage = styled.p`
  color: red;
  margin-top: 1rem;
`;

function ASLTranslationPage() {
  const [cameraImage, setCameraImage] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading state
        const response = await fetch('https://flasky-d9sr.onrender.com/translate');
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setCameraImage(data.img);
        if (data.translation) {
          setTranslation(prevTranslation => prevTranslation + data.translation);
        }
        setErrorMessage(''); // Reset error message on success
      } catch (error) {
        console.error('Error fetching translation:', error.message);
        setErrorMessage('Error fetching translation. Please check your connection or try again later.');
        if (retryCount < 3) { // Allow up to 3 retries
          setRetryCount(prevCount => prevCount + 1);
        }
      } finally {
        setLoading(false); // Reset loading state
      }
    };

    const intervalId = setInterval(() => {
      if (retryCount < 3) {
        fetchData();
      }
    }, 1000);

    fetchData(); // Initial fetch

    return () => clearInterval(intervalId);
  }, [retryCount]);

  const handleClearTranslation = () => {
    setTranslation(prevTranslation => prevTranslation.slice(0, -1));
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        {loading ? (
          <p>Loading camera...</p>
        ) : cameraImage ? (
          <CameraFeed src={`data:image/jpeg;base64,${cameraImage}`} alt="Camera Feed" />
        ) : (
          <p>Error loading camera feed.</p>
        )}
      </CameraPlaceholder>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      {translation && (
        <ClearButton onClick={handleClearTranslation}>Delete Last Letter</ClearButton>
      )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
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
