import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
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
  const [translation, setTranslation] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Access the user's webcam
    const getVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    };

    getVideo();

    const intervalId = setInterval(() => {
      if (videoRef.current) {
        captureImage();
      }
    }, 1000); // Capture image every second (adjust as needed)

    return () => {
      // Cleanup: Stop the video stream on component unmount
      if (videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      clearInterval(intervalId); // Clear interval on unmount
    };
  }, []);

  const captureImage = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Get image data as a base64 string
    const imageData = canvas.toDataURL('image/jpeg');
    await sendImage(imageData);
  };

  const sendImage = async (imageData) => {
    try {
      const response = await axios.post('https://flasky-d9sr.onrender.com/translate', {
        image: imageData.split(',')[1], // Send only the base64 part
      });
      setTranslation(response.data.translation);
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  const handleClearTranslation = () => {
    setTranslation('');
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} width={300} height={300} />
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
        <p>2. Watch for real-time ASL translation.</p>
        <p>Note: This app translates the alphabet in ASL.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
