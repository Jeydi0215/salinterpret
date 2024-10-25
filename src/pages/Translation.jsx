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

const VideoFeed = styled.video`
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

function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const videoRef = useRef(null); // Reference for the video element
  const intervalRef = useRef(null); // Reference for the interval

  useEffect(() => {
    // Function to start the video stream
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Error accessing camera:', error.message);
      }
    };

    startVideo();

    // Function to send image for translation every second
    const fetchTranslation = async () => {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw the current frame from the video feed to the canvas
        context.drawImage(videoRef.current, 0, 0);
        const imgData = canvas.toDataURL('image/jpeg');

        // Send the captured image to the server for translation
        try {
          const response = await fetch('https://flasky-d9sr.onrender.com/translate', {
            method: 'POST',
            body: JSON.stringify({ image: imgData }),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setTranslation(data.translation); // Update the translation state
          } else {
            console.error('Error fetching translation:', response.statusText);
          }
        } catch (error) {
          console.error('Error sending image for translation:', error.message);
        }
      }
    };

    // Start fetching translations every second
    intervalRef.current = setInterval(fetchTranslation, 1000); // Adjust the interval as needed

    // Cleanup function to stop the video stream and clear interval on unmount
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <VideoFeed ref={videoRef} autoPlay />
      </CameraPlaceholder>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera.</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app translates your hand gestures in real-time.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
