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

const ImageContainer = styled.div`
  width: 80%;
  height: 50vh;
  margin-top: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: #f0f0f0;
  border: 2px dashed #ccc;
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

const FLASK_API_URL = "https://4fdf-143-44-145-81.ngrok-free.app"; // Updated to the new URL

function ASLTranslationPage() {
  const [translation, setTranslation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrediction = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(FLASK_API_URL, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      if (data.translation) {
        setTranslation((prev) => prev + data.translation);
      }
      if (data.image_url) {
        setImageUrl(data.image_url);
      }
    } catch (error) {
      console.error("❌ Error during prediction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const predictionInterval = setInterval(fetchPrediction, 3000); // Fetch every 3 seconds
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
      <ImageContainer>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="ASL Prediction" 
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        ) : (
          <p>{isLoading ? "Loading..." : "No image available"}</p>
        )}
      </ImageContainer>
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
        <p>1. The system automatically fetches translations every 3 seconds.</p>
        <p>2. The latest image and translation will be displayed above.</p>
        <p>3. This currently supports alphabet recognition only.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
