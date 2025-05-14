import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Navbar from '../components/UserNavbar';
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import * as drawingUtils from "@mediapipe/drawing_utils";

const TranslationContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const CameraContainer = styled.div`
  width: 640px;
  height: 360px;
  margin: 0 auto 1.5rem auto;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const TranslationText = styled.div`
  text-align: center;
  margin-bottom: 1rem;

  h2 {
    color: #2b6cb0;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.6rem;
    color: white;
    font-weight: bold;
  }
`;

const Status = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.active ? '#38a169' : '#718096'};
`;

const Instructions = styled.div`
  background: #f7fafc;
  padding: 1rem 2rem;
  border-radius: 12px;
  margin-top: 1rem;

  h2 {
    color: #2c5282;
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #4a5568;
    font-size: 1rem;
    margin: 0.25rem 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;

  button {
    padding: 0.75rem 1.5rem;
    margin: 0 0.5rem;
    font-weight: bold;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .delete-letter {
    background-color: #e53e3e;
  }

  .delete-all {
    background-color: #2b6cb0;
  }

  button:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

function ASLTranslator() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [translation, setTranslation] = useState("");
  const [lastLetter, setLastLetter] = useState("");
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const modelURL = "https://teachablemachine.withgoogle.com/models/AgwPr5b46/model.json";
      const metadataURL = "https://teachablemachine.withgoogle.com/models/AgwPr5b46/metadata.json";

      const tmImage = await import("@teachablemachine/image");
      const loadedModel = await tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
    };

    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        hands.onResults((results) => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.image) {
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          }

      if (results.multiHandLandmarks) {
  for (const landmarks of results.multiHandLandmarks) {
    // Convert normalized landmark positions to pixel values
    const points = landmarks.map(pt => ({
      x: pt.x * canvas.width,
      y: pt.y * canvas.height,
    }));

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;

    // Draw bounding box
    ctx.strokeStyle = "#1e90ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(minX, minY, boxWidth, boxHeight);
  }
}
          ctx.restore();
        });

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            await hands.send({ image: videoRef.current });
          },
          width: 640,
          height: 360,
        });

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((e) => console.warn("play() interrupted:", e));
          camera.start();
        };
      }
    };

    loadModel();
    setupCamera();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!videoRef.current || !model) return;

      const prediction = await model.predict(videoRef.current);
      const bestGuess = prediction.reduce((max, p) => p.probability > max.probability ? p : max);

      if (bestGuess.probability > 0.8 && bestGuess.className !== lastLetter) {
        setTranslation(prev => prev + bestGuess.className);
        setLastLetter(bestGuess.className);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [model, lastLetter]);

  const deleteLastLetter = () => {
    setTranslation(prev => prev.slice(0, -1));
  };

  const clearWord = () => {
    setTranslation("");
    setLastLetter("");
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraContainer>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute'
          }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="360"
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </CameraContainer>

      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation || "Waiting for signs..."}</p>
      </TranslationText>

      <ButtonGroup>
        <button className="delete-letter" onClick={deleteLastLetter}>Delete Letter</button>
        <button className="delete-all" onClick={clearWord}>Delete All</button>
      </ButtonGroup>

      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand(s) in front of the camera.</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app currently translates alphabet letters only.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslator;
