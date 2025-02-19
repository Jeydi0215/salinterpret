import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import * as tf from "@tensorflow/tfjs";
import Navbar from "../components/UserNavbar";

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
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ClearButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: ${(props) => (props.clear ? "#ff4d4d" : "#007bff")};
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.clear ? "#ff1a1a" : "#0056b3")};
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
  const [translation, setTranslation] = useState("");
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const webcamContainerRef = useRef(null);
  const webcamRef = useRef(null);

  const MODEL_URL = "https://huggingface.co/Soleil0215/salinterpret/resolve/main/model.json";
  const WEIGHTS_URL = "https://huggingface.co/Soleil0215/salinterpret/resolve/main/model.weights.bin";

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("🔄 Setting backend to WebGL...");
        await tf.setBackend("webgl"); // Forces TensorFlow.js to use GPU

        console.log("🔄 Loading model...");
        const loadedModel = await tf.loadLayersModel(MODEL_URL);
        setModel(loadedModel);
        console.log("✅ Model loaded!");

        // Start webcam
        const video = document.createElement("video");
        video.width = 224; // Ensure this matches your model's input size
        video.height = 224;
        video.autoplay = true;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 224, height: 224 },
        });

        video.srcObject = stream;
        webcamRef.current = video;

        if (webcamContainerRef.current) {
          webcamContainerRef.current.innerHTML = "";
          webcamContainerRef.current.appendChild(video);
        }

        setLoading(false);
      } catch (error) {
        console.error("❌ Error loading model:", error);
      }
    };

    loadModel();

    return () => {
      if (webcamRef.current) {
        webcamRef.current.srcObject.getTracks().forEach((track) => track.stop());
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
  }, [model]);

  const predict = async () => {
    if (!model || !webcamRef.current) return;

    try {
      const video = webcamRef.current;
      const tensor = tf.browser
        .fromPixels(video)
        .resizeNearestNeighbor([224, 224])
        .expandDims()
        .toFloat()
        .div(tf.scalar(255)); // Normalize pixels to match training

      const predictions = await model.predict(tensor).data();
      console.log("🔍 Predictions:", predictions);

      const highestIndex = predictions.indexOf(Math.max(...predictions));
      setTranslation((prev) => prev + String.fromCharCode(65 + highestIndex));
    } catch (error) {
      console.error("❌ Error during prediction:", error);
    }
  };

  const handleClearTranslation = () => {
    setTranslation((prev) => prev.slice(0, -1));
  };

  const handleClearAllTranslation = () => {
    setTranslation("");
  };

  return (
    <TranslationContainer>
      <Navbar />
      {loading ? (
        <h2>Loading Model...</h2>
      ) : (
        <>
          <CameraContainer ref={webcamContainerRef} />
          <TranslationText>
            <h2>Translation:</h2>
            <p>{translation}</p>
          </TranslationText>
          {translation && (
            <ClearButtonContainer>
              <Button onClick={handleClearTranslation}>Delete Last Letter</Button>
              <Button clear onClick={handleClearAllTranslation}>
                Delete All
              </Button>
            </ClearButtonContainer>
          )}
          <Instructions>
            <h2>Instructions:</h2>
            <p>1. Place your hand in front of the camera.</p>
            <p>2. Wait for the translation to appear every 3 seconds.</p>
            <p>3. This currently supports alphabet recognition only.</p>
          </Instructions>
        </>
      )}
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
