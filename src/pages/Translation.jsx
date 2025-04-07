import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Navbar from "../components/UserNavbar";

// Change this to your Ngrok URL
const FLASK_API_URL = " https://ee47-143-44-145-81.ngrok-free.app"; // Replace with your Ngrok URL

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
  const [translation, setTranslation] = useState("");
  const webcamContainerRef = useRef(null);
  const webcamRef = useRef(null);

  useEffect(() => {
    const initWebcam = async () => {
      try {
        const video = document.createElement("video");
        video.width = 450;
        video.height = 450;
        video.autoplay = true;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 450, height: 450 },
        });

        video.srcObject = stream;
        webcamRef.current = video;

        if (webcamContainerRef.current) {
          webcamContainerRef.current.innerHTML = "";
          webcamContainerRef.current.appendChild(video);
        }
      } catch (error) {
        console.error("❌ Error accessing webcam:", error);
      }
    };

    initWebcam();

    return () => {
      if (webcamRef.current) {
        webcamRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const predictionInterval = setInterval(async () => {
      await predict();
    }, 3000);

    return () => clearInterval(predictionInterval);
  }, []);

  const predict = async () => {
    if (!webcamRef.current) return;

    try {
      // Sending image from webcam to Flask API for prediction
      const imageBlob = await captureImage(webcamRef.current);
      const formData = new FormData();
      formData.append("image", imageBlob);

      const response = await fetch(`https://ee47-143-44-145-81.ngrok-free.app/translate`, {
    method: "POST",
    body: formData,
  });

      const result = await response.json();
      if (result.translation) {
        setTranslation((prev) => prev + result.translation);
      }
    } catch (error) {
      console.error("❌ Error during prediction:", error);
    }
  };

  const captureImage = (videoElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = 450;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toBlob();
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
