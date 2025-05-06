import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";

// Modern styled components with improved aesthetics
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #2b6cb0;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const SubTitle = styled.p`
  color: #4a5568;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const VideoContainer = styled.div`
  position: relative;
  margin: 0 auto 2rem;
  width: 100%;
  max-width: 420px;
`;

const Video = styled.video`
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 4px solid #3182ce;
  transition: border-color 0.3s ease;
  
  &:hover {
    border-color: #4299e1;
  }
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: ${props => props.isConnected ? '#48bb78' : '#f56565'};
    border-radius: 50%;
    margin-right: 6px;
  }
`;

const TranslationSection = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TranslationLabel = styled.h3`
  color: #4a5568;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const TranslationWord = styled.div`
  font-size: 2.8rem;
  color: #2b6cb0;
  font-weight: 700;
  letter-spacing: 3px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: ${props => props.primary ? '#3182ce' : props.danger ? '#e53e3e' : props.success ? '#38a169' : '#718096'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background-color: ${props => props.primary ? '#2c5282' : props.danger ? '#c53030' : props.success ? '#2f855a' : '#4a5568'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    margin-right: 6px;
  }
`;

const StatusMessage = styled.div`
  color: ${props => props.isError ? '#e53e3e' : '#718096'};
  margin: 1rem 0;
  font-style: italic;
  font-size: 0.9rem;
  background-color: ${props => props.isError ? '#FED7D7' : 'transparent'};
  padding: ${props => props.isError ? '0.5rem 1rem' : '0'};
  border-radius: ${props => props.isError ? '8px' : '0'};
  display: ${props => props.show ? 'block' : 'none'};
`;

const LoadingDots = styled.span`
  &::after {
    content: '.';
    animation: dots 1.5s steps(5, end) infinite;
  }
  
  @keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60% { content: '...'; }
    80%, 100% { content: ''; }
  }
`;

// Icon components for buttons
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
    <line x1="18" y1="9" x2="12" y2="15"></line>
    <line x1="12" y1="9" x2="18" y2="15"></line>
  </svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const RetryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"></polyline>
    <polyline points="23 20 23 14 17 14"></polyline>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
  </svg>
);

function CameraTranslator() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [translation, setTranslation] = useState("Waiting...");
  const [word, setWord] = useState("");
  const [error, setError] = useState("");
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Update this URL to your current ngrok URL
  const serverUrl = "https://your-new-ngrok-url.ngrok-free.app"; 

  useEffect(() => {
    // Check server connection
    const checkServerConnection = async () => {
      try {
        const response = await fetch(`${serverUrl}/health`, { 
          method: 'GET',
          timeout: 5000 // 5 second timeout
        });
        
        if (response.ok) {
          setIsServerConnected(true);
          setError("");
        } else {
          setIsServerConnected(false);
          setError("Server is running but returned an error. Check backend logs.");
        }
      } catch (err) {
        setIsServerConnected(false);
        setError("Cannot connect to server. Check if ngrok and backend are running.");
        console.error("Server connection error:", err);
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access denied or not available.");
        console.error("Camera error:", err);
      }
    };

    startCamera();
    checkServerConnection();
    
    // Only start the capture interval if server is connected
    let interval;
    if (isServerConnected) {
      interval = setInterval(captureAndSend, 3000); // every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isServerConnected, serverUrl]);

  const captureAndSend = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isServerConnected) return;
    
    setIsCapturing(true);
    
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");
      
      try {
        const res = await fetch(`${serverUrl}/translate`, {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        
        const data = await res.json();
        if (data.translation) {
          setTranslation(data.translation);
          setWord((prev) => prev + data.translation);
        } else {
          setTranslation("No sign detected");
        }
        setError("");
      } catch (err) {
        console.error("Error sending frame:", err);
        setError("Server error. Check backend or ngrok connection.");
        setIsServerConnected(false);
      } finally {
        setIsCapturing(false);
      }
    }, "image/jpeg", 0.8);
  };

  const handleDeleteLast = () => {
    setWord((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setWord("");
  };

  const handleRetryConnection = async () => {
    setError("Trying to reconnect to server...");
    try {
      const response = await fetch(`${serverUrl}/health`);
      if (response.ok) {
        setIsServerConnected(true);
        setError("");
      } else {
        setError("Server is running but returned an error. Check backend logs.");
      }
    } catch (err) {
      setError("Still cannot connect to server. Make sure ngrok and backend are running.");
    }
  };

  return (
    <Container>
      <Title>ASL Translator</Title>
      <SubTitle>Translate American Sign Language in real-time using your camera</SubTitle>
      
      <VideoContainer>
        <Video ref={videoRef} autoPlay playsInline muted />
        <VideoOverlay isConnected={isServerConnected}>
          {isServerConnected ? 'Live' : 'Offline'}
        </VideoOverlay>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </VideoContainer>
      
      <TranslationSection>
        <TranslationLabel>
          {isCapturing ? (
            <span>Processing<LoadingDots /></span>
          ) : (
            <span>Translation Result</span>
          )}
        </TranslationLabel>
        <TranslationWord>
          {word || "Show a sign to begin"}
        </TranslationWord>
      </TranslationSection>
      
      <ButtonContainer>
        <Button primary onClick={handleDeleteLast}>
          <DeleteIcon /> Delete Last
        </Button>
        <Button danger onClick={handleClearAll}>
          <ClearIcon /> Clear All
        </Button>
        {!isServerConnected && (
          <Button success onClick={handleRetryConnection}>
            <RetryIcon /> Retry Connection
          </Button>
        )}
      </ButtonContainer>
      
      <StatusMessage show={!isServerConnected || error} isError={!!error}>
        {error || (isServerConnected ? "" : "Server disconnected. Click 'Retry Connection' to attempt reconnection.")}
      </StatusMessage>
    </Container>
  );
}

export default CameraTranslator;
