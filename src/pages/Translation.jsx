import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
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

// ASL Translation Component
function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Could not access webcam. Please check your browser settings.');
      }
    };

    getVideo();

    const intervalId = setInterval(() => {
      captureFrame();
    }, 1000);

    return () => {
      if (videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      clearInterval(intervalId);
    };
  }, []);

  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const response = await fetch('https://flask-server-sptz.onrender.com//translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgData }),
      });
      const data = await response.json();
      setTranslation(data.translation || 'No sign detected');
    } catch (error) {
      console.error('Error translating image:', error);
    }
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%' }} />
      </CameraPlaceholder>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera.</p>
        <p>2. Watch for real-time ASL translation.</p>
        <p>Note: This app translates the alphabet in ASL.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
