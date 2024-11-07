import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  height: 100vh;
`;

// Additional styles...

function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const videoRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        modelRef.current = await tf.loadLayersModel('/path-to-model/model.json');
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Could not access webcam. Please check your browser settings.');
      }
    };

    loadModel();
    getVideo();

    const intervalId = setInterval(() => {
      if (videoRef.current && modelRef.current) {
        processFrame();
      }
    }, 100); // Capture frame every 100ms

    return () => {
      if (videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      clearInterval(intervalId);
    };
  }, []);

  const processFrame = () => {
    // Grab a frame from the video
    const canvas = document.createElement('canvas');
    canvas.width = 224; // Resize as needed for model input
    canvas.height = 224;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Preprocess the frame (resize, normalize, etc.) for the model
    const tensor = tf.browser.fromPixels(canvas).expandDims(0).toFloat().div(tf.scalar(255));

    // Perform prediction
    const prediction = modelRef.current.predict(tensor);
    // Map prediction to actual ASL letter
    const translatedText = mapPredictionToASL(prediction);
    setTranslation(translatedText);
  };

  const mapPredictionToASL = (prediction) => {
    // Map prediction result to actual ASL character, e.g.:
    return 'A'; // Replace with actual mapping
  };

  return (
    <TranslationContainer>
      <video ref={videoRef} autoPlay style={{ width: '80%', height: '50vh', marginTop: '15vh' }} />
      <div>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </div>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
