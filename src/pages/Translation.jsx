import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as tmImage from '@teachablemachine/image';
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

const WebcamCanvas = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
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

  const URL = "https://teachablemachine.withgoogle.com/models/EnbSd9wbS/";  
  let model, webcam, maxPredictions;

  // Load model and webcam setup
  useEffect(() => {
    const loadModel = async () => {
      try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log('Model loaded successfully');

        // Setup webcam
        const flip = true; // Flip the webcam
        webcam = new tmImage.Webcam(450, 450, flip);

        try {
          await webcam.setup(); // Request webcam access
          await webcam.play(); // Play the webcam stream
          window.requestAnimationFrame(loop); // Start looping
          console.log('Webcam setup successful');

          // Append webcam canvas to DOM
          if (webcam.canvas && webcamContainerRef.current) {
            webcamContainerRef.current.appendChild(webcam.canvas);
          }
        } catch (webcamError) {
          console.error('Webcam setup failed:', webcamError);
        }
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    loadModel();

    return () => {
      if (webcam) {
        webcam.stop(); // Stop webcam when component unmounts
      }
    };
  }, []);

  const loop = () => {
    if (webcam) {
      webcam.update(); // Update the webcam feed
    }
    window.requestAnimationFrame(loop); // Keep looping
  };

  useEffect(() => {
    // Set an interval to predict every 5 seconds
    const predictionInterval = setInterval(async () => {
      await predict();
    }, 5000); // Every 5 seconds

    return () => clearInterval(predictionInterval); // Clear interval on unmount
  }, []);

  const predict = async () => {
    if (model && webcam) {
      const predictions = await model.predict(webcam.canvas);
      console.log('Predictions:', predictions); // Log predictions for debugging

      // Filter out predictions with a low probability (e.g., below 0.3)
      const validPredictions = predictions.filter(prediction => prediction.probability > 0.3);

      if (validPredictions.length > 0) {
        // Sort predictions by probability (highest first)
        const highestPrediction = validPredictions.reduce((prev, current) =>
          prev.probability > current.probability ? prev : current
        );

        if (highestPrediction) {
          setTranslation((prev) => prev + highestPrediction.className); // Append to translation
        }
      }
      // If no valid predictions, do not update the translation (no change in state)
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
        {/* Webcam canvas will be appended here */}
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
