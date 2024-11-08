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

  @media (max-width: 768px) {
    width: 90%;
    height: 40vh;
  }
`;

const CameraFeed = styled.video`
  max-width: 100%;
  max-height: 100%;
`;

const TranslationText = styled.div`
  margin-top: 2rem;
  font-size: 1.5rem;
  color: black;
  max-height: 200px;
  overflow-y: auto;
  width: 80%;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;

  @media (max-width: 768px) {
    font-size: 1.2rem;
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
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize webcam stream
  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
          setError("Could not access the webcam. Please check your camera permissions.");
        });
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      fetchTranslation(blob);
    }, 'image/png');
  };

  const fetchTranslation = async (imageBlob) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', imageBlob);

      const response = await fetch('https://flasky-d9sr.onrender.com/translate', {
        method: 'POST',
        body: formData,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch translation');
      }

      const data = await response.json();
      if (data.translation) {
        setTranslation((prev) => prev + data.translation);
      } else {
        setError('No translation found');
      }
    } catch (error) {
      console.error('Error fetching translation:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClearTranslation = () => setTranslation('');

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <CameraFeed ref={videoRef} autoPlay width="640" height="480" />
      </CameraPlaceholder>
      <CaptureButton onClick={captureSnapshot}>Capture</CaptureButton>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      {translation && <ClearButton onClick={handleClearTranslation}>Clear Translation</ClearButton>}
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
