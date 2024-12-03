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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your middleman server URL on Vercel
        const response = await fetch(https://middleman-psi-five.vercel.app//translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Optionally, you can send the camera feed image or any other data in the body
          // body: JSON.stringify({ image: cameraImage })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch from middleman server');
        }
        
        const data = await response.json();
        setCameraImage(data.img);  // Set the image from the Flask response (via the middleman)
        setTranslation(data.translation);  // Set the translation text from the Flask response
      } catch (error) {
        console.error('Error fetching translation:', error.message);
      }
    };

    const intervalId = setInterval(fetchData, 1000);  // Update every second

    return () => clearInterval(intervalId);  // Clean up the interval on component unmount
  }, []);

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
        <p>Note: This app for now only translates the alphabet.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
