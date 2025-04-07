import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Navbar from "../components/UserNavbar";

const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  height: 100vh;
`;

const CameraFeedContainer = styled.div`
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

const FLASK_API_URL = "https://4fdf-143-44-145-81.ngrok-free.app";

function ASLTranslationPage() {
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrediction = async () => {
    setIsLoading(true);
    try {
      // First get the image from the Flask server
      const imgResponse = await fetch(`${FLASK_API_URL}/video_feed`, {
        method: 'GET',
        headers: {
          'Accept': 'image/jpeg',
        },
      });
      
      if (!imgResponse.ok) throw new Error('Failed to get image');
      
      // Then get the prediction data
      const predictionResponse = await fetch(`${FLASK_API_URL}/predict`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!predictionResponse.ok) throw new Error('Failed to get prediction');
      
      const predictionData = await predictionResponse.json();
      if (predictionData.translation) {
        setTranslation((prev) => prev + predictionData.translation);
      }
    } catch (error) {
      console.error("❌ Error during prediction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const predictionInterval = setInterval(fetchPrediction, 3000);
    return () => clearInterval(predictionInterval);
  }, []);

  const handleClearTranslation = () => {
    setTranslation((prev) => prev.slice(0, -1));
  };

  const handleClearAllTranslation = () => {
    setTranslation("");
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraFeedContainer>
        <img 
          src={`${FLASK_API_URL}/video_feed`} 
          alt="ASL Camera Feed" 
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </CameraFeedContainer>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation || (isLoading ? "Processing..." : "No translation yet")}</p>
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
        <p>1. The system automatically processes camera feed every 3 seconds.</p>
        <p>2. The translation will appear below the camera feed.</p>
        <p>3. This currently supports alphabet recognition only.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
