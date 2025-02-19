import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as tf from '@tensorflow/tfjs';
import Navbar from '../components/UserNavbar';

const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  height: 100vh;
`;

const CameraContainer = styled.div`
  width: 80%;
  height: 50vh;
  margin-top: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
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

const ClearButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ClearButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
`;

const ClearAllButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #ff4d4d;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #ff1a1a;
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
  const webcamContainerRef = useRef(null);
  const webcamRef = useRef(null);
  const [model, setModel] = useState(null);
  const [webcam, setWebcam] = useState(null);

  const MODEL_URL = 'https://huggingface.co/Soleil0215/salinterpret/raw/main/model.json';

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('🔄 Loading model from:', MODEL_URL);
        const loadedModel = await tf.loadLayersModel(MODEL_URL);
        setModel(loadedModel);
        console.log('✅ Model loaded successfully!');

        // Initialize webcam
        const video = document.createElement('video');
        video.width = 450;
        video.height = 450;
        video.autoplay = true;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 450, height: 450 },
        });

        video.srcObject = stream;
        webcamRef.current = video;

        if (webcamContainerRef.current) {
          webcamContainerRef.current.innerHTML = '';
          webcamContainerRef.current.appendChild(video);
        }
      } catch (error) {
        console.error('❌ Error loading model:', error);
      }
    };

    loadModel();

    return () => {
      if (webcamRef.current) {
        webcamRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const predictionInterval = setInterval(async () => {
      if (model && webcamRef.current) {
        await predict();
      }
    }, 3000);

    return () => clearInterval(predictionInterval);
  }, [model, webcam]);

  const predict = async () => {
    if (!model || !webcamRef.current) return;

    try {
      const video = webcamRef.current;
      const tensor = tf.browser.fromPixels(video)
        .resizeNearestNeighbor([224, 224]) // Adjust size as per your model
        .expandDims()
        .toFloat()
        .div(tf.scalar(255));

      const predictions = await model.predict(tensor).data();
      console.log('🔍 Predictions:', predictions);

      const highestIndex = predictions.indexOf(Math.max(...predictions));
      setTranslation((prev) => prev + String.fromCharCode(65 + highestIndex));
    } catch (error) {
      console.error('❌ Error during prediction:', error);
    }
  };

  const handleClearTranslation = () => {
    setTranslation((prev) => prev.slice(0, -1));
  };

  const handleClearAllTranslation = () => {
    setTranslation('');
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraContainer ref={webcamContainerRef} />
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      {translation && (
        <ClearButtonContainer>
          <ClearButton onClick={handleClearTranslation}>
            Delete Last Letter
          </ClearButton>
          <ClearAllButton onClick={handleClearAllTranslation}>
            Delete All
          </ClearAllButton>
        </ClearButtonContainer>
      )}
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera.</p>
        <p>2. Wait for the translation to appear every 3 seconds.</p>
        <p>3. This currently supports alphabet recognition only.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
