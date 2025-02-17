import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js for loading .h5 model
import * as handpose from '@tensorflow-models/handpose'; // Handpose model for webcam usage
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
  const webcamContainerRef = useRef(null); // Ref for the webcam container
  const webcamRef = useRef(null);

  const URL = "https://firebasestorage.googleapis.com/v0/b/salinterpret.appspot.com/o/salinterpret%2Fmodel.h5?alt=media&token=7305db25-8908-4354-a1f7-5dabf8690f1b";  
  let model, webcam, maxPredictions;

  // Load model and webcam setup
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Load the .h5 model directly from Firebase Storage
        model = await tf.loadLayersModel(URL);
        console.log('Model loaded successfully');
        
        // Set up webcam using @tensorflow-models/handpose
        webcam = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.createElement('video');
        videoElement.srcObject = webcam;
        videoElement.play();

        // Handpose model for detecting hand positions
        const handModel = await handpose.load();
        
        // Update video and predictions
        videoElement.onloadeddata = () => {
          setInterval(async () => {
            const predictions = await handModel.estimateHands(videoElement);
            if (predictions.length > 0) {
              // Handle hand pose predictions here, for now we're logging them
              console.log(predictions);
              await predict(predictions); // You can pass hand poses to the model
            }
          }, 100); // Checking every 100ms
        };

        if (webcamContainerRef.current) {
          webcamContainerRef.current.appendChild(videoElement); // Attach the video to the container
        }
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    loadModel();

    return () => {
      if (webcam) {
        webcam.getTracks().forEach(track => track.stop()); // Stop webcam when component unmounts
      }
    };
  }, []);

  const predict = async (predictions) => {
    if (model) {
      const tensorInput = tf.browser.fromPixels(predictions[0].boundingBox); // Example of using bounding box data
      const prediction = await model.predict(tensorInput);
      console.log('Prediction:', prediction);
      
      setTranslation((prev) => prev + prediction); // Update translation state with prediction
    }
  };

  const handleClearTranslation = () => {
    setTranslation((prev) => prev.slice(0, -1)); // Remove last letter
  };

  const handleClearAllTranslation = () => {
    setTranslation(''); // Clear all translation
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraContainer ref={webcamContainerRef}>
        {/* Webcam video will be appended here */}
      </CameraContainer>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      {translation && (
        <ClearButtonContainer>
          <ClearButton onClick={handleClearTranslation}>Delete Last Letter</ClearButton>
          <ClearAllButton onClick={handleClearAllTranslation}>Delete All</ClearAllButton>
        </ClearButtonContainer>
      )}
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera.</p>
        <p>2. Wait for the translation to appear every 5 seconds.</p>
        <p>Note this only translates alphabets for now!</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
