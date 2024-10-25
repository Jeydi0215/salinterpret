import React, { useState, useEffect, useRef } from 'react';
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
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const constraints = {
      video: {
        facingMode: 'user',
        width: 640,
        height: 480,
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((error) => {
        console.error('Error accessing webcam:', error);
      });

    const sendFrame = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgDataUrl = canvas.toDataURL('image/jpeg');
      const imgData = imgDataUrl.split(',')[1]; // Get base64 part

      fetch('https://flasky-d9sr.onrender.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imgData }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.translation) {
            setTranslation(data.translation);
          }
        })
        .catch((error) => {
          console.error('Error fetching translation:', error);
        });
    };

    const intervalId = setInterval(sendFrame, 1000); // Send frame every second

    return () => {
      clearInterval(intervalId);
      video.srcObject.getTracks().forEach((track) => track.stop()); // Stop video tracks on cleanup
    };
  }, []);

  const handleClearTranslation = () => {
    setTranslation('');
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <video ref={videoRef} width="640" height="480" autoPlay></video>
      </CameraPlaceholder>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      {translation && (
        <ClearButton onClick={handleClearTranslation}>Clear Translation</ClearButton>
      )}
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera.</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app translates the alphabet in ASL.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
