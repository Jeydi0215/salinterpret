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

const ConfigContainer = styled.div`
  width: 80%;
  margin-top: 15vh;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const ServerForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const FormButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background-color: #0b5ed7;
  }
`;

const CameraFeedContainer = styled.div`
  width: 80%;
  height: 50vh;
  margin-top: 1rem;
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

// Default URL that can be overridden
const DEFAULT_FLASK_API_URL = " https://24e4-143-44-145-81.ngrok-free.app";

function ASLTranslationPage() {
  // Get server URL from localStorage or use default
  const [serverUrl, setServerUrl] = useState(
    localStorage.getItem("aslServerUrl") || DEFAULT_FLASK_API_URL
  );
  
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isConfiguring, setIsConfiguring] = useState(!localStorage.getItem("aslServerUrl"));

  const fetchTranslation = async () => {
    if (isLoading || isConfiguring) return; // Don't fetch during config or loading
    
    setIsLoading(true);
    try {
      const response = await fetch(`${serverUrl}/translate`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Shorter timeout for better UX during connection issues
        signal: AbortSignal.timeout(3000)
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
    // Skip fetching if in configuration mode
    if (isConfiguring) return;
    
    // Initial fetch
    fetchTranslation();
    
    // Set up regular polling
    const translationInterval = setInterval(fetchTranslation, 3000);
    
    return () => {
      clearInterval(translationInterval);
    };
  }, [connectionAttempts, isConfiguring, serverUrl]);

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

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    
    // Save URL to localStorage
    localStorage.setItem("aslServerUrl", serverUrl);
    
    // Exit configuration mode
    setIsConfiguring(false);
    
    // Trigger a connection attempt
    setConnectionAttempts(prev => prev + 1);
  };

  const handleEditServerUrl = () => {
    setIsConfiguring(true);
  };

  return (
    <TranslationContainer>
      <Navbar />
      
      {isConfiguring ? (
        <ConfigContainer>
          <h2>ASL Translation Server Configuration</h2>
          <p>Enter the URL of your Flask backend server:</p>
          <ServerForm onSubmit={handleConfigSubmit}>
            <FormGroup>
              <label htmlFor="serverUrl">Server URL:</label>
              <Input 
                id="serverUrl"
                type="text" 
                value={serverUrl} 
                onChange={(e) => setServerUrl(e.target.value)} 
                placeholder="https://your-ngrok-url.ngrok-free.app"
              />
              <small>This should be your current ngrok URL or server address</small>
            </FormGroup>
            <FormButton type="submit">Connect</FormButton>
          </ServerForm>
        </ConfigContainer>
      ) : (
        <>
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
                <p>Cannot connect to server at: {serverUrl}</p>
                <RetryButton onClick={handleRetryConnection}>
                  Retry Connection
                </RetryButton>
                <RetryButton onClick={handleEditServerUrl}>
                  Edit Server URL
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
          
          <ButtonContainer>
            {translation && (
              <>
                <ClearButton onClick={handleClearTranslation}>
                  Delete Last Word
                </ClearButton>
                <ClearAllButton onClick={handleClearAllTranslation}>
                  Delete All
                </ClearAllButton>
              </>
            )}
            <Button onClick={handleEditServerUrl}>
              Change Server URL
            </Button>
          </ButtonContainer>
          
          <Instructions>
            <h2>Instructions:</h2>
            <p>1. The system automatically processes signs every 3 seconds.</p>
            <p>2. Show one of these signs: {'"What", "Where", "When", "Who", "Why", "How", "Hello", "Thank You", "I Love You", "Name"'}</p>
            <p>3. Hold your hand in view of the camera until recognition occurs.</p>
            <p>4. The system needs 5 seconds between recognitions of new signs.</p>
            <p>
              <strong>Server URL:</strong> {serverUrl} 
              <button 
                onClick={handleEditServerUrl}
                style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                Edit
              </button>
            </p>
          </Instructions>
        </>
      )}
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
