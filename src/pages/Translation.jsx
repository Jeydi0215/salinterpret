import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as tmImage from '@teachablemachine/image';
import Navbar from '../components/UserNavbar';

const TranslationContainer = styled.div
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  height: 100vh;
;

const CameraContainer = styled.div
  width: 80%;
  height: 50vh;
  margin-top: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: black;
;

const TranslationText = styled.div
  margin-top: 2rem;
  font-size: 1.5rem;
  color: black;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
;

const ClearButtonContainer = styled.div
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
;

const ClearButton = styled.button
  padding: 0.5rem 1rem;
  font-size: 1rem;
;

const ClearAllButton = styled.button
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #ff4d4d;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #ff1a1a;
  }
;

const Instructions = styled.div
  margin-top: 2rem;
  font-size: 1.2rem;
  text-align: center;
  color: black;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
;

function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const webcamContainerRef = useRef(null);
  const webcamRef = useRef(null);
  const [model, setModel] = useState(null);
  const [webcam, setWebcam] = useState(null);

  const MODEL_URL = "https://firebasestorage.googleapis.com/v0/b/salinterpret.appspot.com/o/models%2Fmodel.json?alt=media&token=7305db25-8908-4354-a1f7-5dabf8690f1b";
  const METADATA_URL = "https://firebasestorage.googleapis.com/v0/b/salinterpret.appspot.com/o/models%2Fmetadata.json?alt=media&token=7305db25-8908-4354-a1f7-5dabf8690f1b";

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading model...");
        const loadedModel = await tmImage.load(MODEL_URL, METADATA_URL);
        setModel(loadedModel);
        console.log("Model loaded successfully");

        // Initialize webcam
        const newWebcam = new tmImage.Webcam(450, 450, true);
        await newWebcam.setup();
        await newWebcam.play();
        setWebcam(newWebcam);
        window.requestAnimationFrame(loop);

        // Append webcam canvas
        if (webcamContainerRef.current) {
          webcamContainerRef.current.appendChild(newWebcam.canvas);
        }
      } catch (error) {
        console.error("Error loading model or webcam:", error);
      }
    };

    loadModel();

    return () => {
      if (webcam) {
        webcam.stop();
      }
    };
  }, []);

  const loop = () => {
    if (webcam) {
      webcam.update();
    }
    window.requestAnimationFrame(loop);
  };

  useEffect(() => {
    const predictionInterval = setInterval(async () => {
      if (model && webcam) {
        await predict();
      }
    }, 3000);

    return () => clearInterval(predictionInterval);
  }, [model, webcam]);

  const predict = async () => {
    if (model && webcam) {
      const predictions = await model.predict(webcam.canvas);
      const validPredictions = predictions.filter(prediction => prediction.probability > 0.3);

      if (validPredictions.length > 0) {
        const highestPrediction = validPredictions.reduce((prev, current) =>
          prev.probability > current.probability ? prev : current
        );

        if (highestPrediction) {
          setTranslation(prev => prev + highestPrediction.className);
        }
      }
    }
  };

  const handleClearTranslation = () => {
    setTranslation(prev => prev.slice(0, -1));
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
          <ClearButton onClick={handleClearTranslation}>Delete Last Letter</ClearButton>
          <ClearAllButton onClick={handleClearAllTranslation}>Delete All</ClearAllButton>
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
