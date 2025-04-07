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
  border-radius: 8px;
  overflow: hidden;
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
`;

const StatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.isConnected ? "#4caf50" : "#f44336"};
  margin-right: 0.5rem;
`;

const TranslationText = styled.div`
  margin-top: 2rem;
  font-size: 1.5rem;
  color: black;
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
`;

const ClearButton = styled(Button)`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  &:hover {
    background-color: #e9ecef;
  }
`;

const ClearAllButton = styled(Button)`
  background-color: #ff4d4d;
  color: white;
  border: none;
  &:hover {
    background-color: #ff1a1a;
  }
`;

const RetryButton = styled(Button)`
  background-color: #0d6efd;
  color: white;
  border: none;
  &:hover {
    background-color: #0b5ed7;
  }
  margin-top: 1rem;
`;

const ErrorMessage = styled.div`
  color: white;
  text-align: center;
  padding: 1rem;
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

// This should be updated with your current ngrok URL
const FLASK_API_URL = "https://a90c-175-176-10-241.ngrok-free.app";

function ASLTranslationPage() {
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const fetchTranslation = async () => {
    if (isLoading) return; // Prevent multiple concurrent requests
    
    setIsLoading(true);
    try {
      const response = await fetch(`${FLASK_API_URL}/translate`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Setting a timeout to avoid long waits when server is down
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) throw new Error('Translation failed');
      
      const data = await response.json();
      
      // Handle the image data from the response
      if (data.img) {
        setCurrentImage(`data:image/jpeg;base64,${data.img}`);
      }
      
      // Add new translation to the existing text if it's not empty
      if (data.translation && data.translation.trim() !== '') {
        setTranslation(prev => prev + data.translation + ' ');
      }
      
      setIsConnected(true);
    } catch (error) {
      console.error("❌ Error during translation:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial connection attempt
    fetchTranslation();
    
    // Set up regular polling at 3-second intervals
    const translationInterval = setInterval(fetchTranslation, 3000);
    
    return () => {
      clearInterval(translationInterval);
    };
  }, [connectionAttempts]);

  const handleClearTranslation = () => {
    const words = translation.trim().split(' ');
    if (words.length > 0) {
      words.pop(); // Remove the last word
      setTranslation(words.join(' ') + (words.length ? ' ' : ''));
    }
  };

  const handleClearAllTranslation = () => {
    setTranslation("");
  };

  const handleRetryConnection = () => {
    setConnectionAttempts(prev => prev + 1);
    fetchTranslation();
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraFeedContainer>
        {currentImage ? (
          <img 
            src={currentImage} 
            alt="ASL Camera Feed" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <ErrorMessage>
            <h3>Camera Feed Unavailable</h3>
            <p>Waiting for connection to the translation server...</p>
            <RetryButton onClick={handleRetryConnection}>
              Retry Connection
            </RetryButton>
          </ErrorMessage>
        )}
        <StatusIndicator>
          <StatusDot isConnected={isConnected} />
          {isConnected ? "Connected" : "Disconnected"}
        </StatusIndicator>
      </CameraFeedContainer>
      
      <TranslationText>
        <h2>Translation:</h2>
        <p>
          {!isConnected
            ? "Server connection error. Please retry when the server is available."
            : translation || (isLoading ? "Processing..." : "No translation yet")}
        </p>
      </TranslationText>
      
      {translation && (
        <ButtonContainer>
          <ClearButton onClick={handleClearTranslation}>
            Delete Last Word
          </ClearButton>
          <ClearAllButton onClick={handleClearAllTranslation}>
            Delete All
          </ClearAllButton>
        </ButtonContainer>
      )}
      
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. The system automatically processes signs every 3 seconds.</p>
        <p>3. Hold your hand in view of the camera until recognition occurs.</p>
        <p>4. The system needs 5 seconds between recognitions of new signs.</p>
        {!isConnected && (
          <p style={{ color: 'red' }}>
            <strong>Note:</strong> If your ngrok URL has changed, update the FLASK_API_URL in the code.
          </p>
        )}
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
