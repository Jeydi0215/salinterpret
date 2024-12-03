import React, { useState, useEffect, useRef } from 'react';
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

const CameraFeed = styled.canvas`
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

function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    };

    initCamera();

    const intervalId = setInterval(async () => {
      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const frame = canvas.toDataURL('image/jpeg'); // Capture frame as Base64
        try {
          const response = await fetch('https://flasky-d9sr.onrender.com/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: frame }), // Send Base64 image to backend
          });

          if (response.ok) {
            const data = await response.json();
            setTranslation(data.translation);
          } else {
            console.error('Translation failed:', response.statusText);
          }
        } catch (error) {
          console.error('Error translating frame:', error);
        }
      }
    }, 1000); // Send frame every second

    return () => clearInterval(intervalId);
  }, []);

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <video ref={videoRef} autoPlay muted style={{ display: 'none' }}></video>
        <CameraFeed ref={canvasRef} width={224} height={224}></CameraFeed>
      </CameraPlaceholder>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
