import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Navbar from '../components/UserNavbar';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

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

const CaptureButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
`;

const ClearButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
`;

function ASLTranslationPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Memoized debounced fetch translation
  const debouncedFetchTranslation = useCallback(
    debounce((imageBlob) => {
      fetchTranslation(imageBlob);
    }, 1000),
    []
  );

  // Capture and translate method
  const captureAndTranslate = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Ensure video has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        debouncedFetchTranslation(blob);
      }
    }, 'image/png');
  }, [debouncedFetchTranslation]);

  // Toggle translation
  const toggleTranslation = () => {
    setIsTranslating(prev => !prev);
  };

  // Continuous capture effect
  useEffect(() => {
    let intervalId;
    if (isTranslating) {
      intervalId = setInterval(captureAndTranslate, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTranslating, captureAndTranslate]);

  // Webcam setup
  useEffect(() => {
    // Check if running in browser
    if (typeof window !== 'undefined' && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
        });
    }
  }, []);

  // Fetch translation method
  const fetchTranslation = async (imageBlob) => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'capture.png');
      
      const response = await fetch('https://flasky-d9sr.onrender.com/translate', {
        method: 'POST',
        body: formData,
        mode: 'cors', // Add CORS mode
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch translation');
      }
      
      const data = await response.json();
      if (data.translation) {
        setTranslation(prev => prev + data.translation);
      }
    } catch (error) {
      console.error('Error fetching translation:', error.message);
    }
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        {typeof window !== 'undefined' && (
          <>
            <video ref={videoRef} autoPlay playsInline width="640" height="480" />
            <canvas 
              ref={canvasRef} 
              style={{ display: 'none' }} 
            />
          </>
        )}
      </CameraPlaceholder>
      
      <CaptureButton onClick={toggleTranslation}>
        {isTranslating ? 'Stop Translating' : 'Start Translating'}
      </CaptureButton>
      
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      
      {translation && (
        <ClearButton onClick={() => setTranslation('')}>
          Clear Translation
        </ClearButton>
      )}
      
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Click 'Start Translating' to begin continuous sign detection.</p>
        <p>2. Make clear ASL alphabet signs in front of the camera.</p>
        <p>Note: This app only translates the alphabet for now.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
