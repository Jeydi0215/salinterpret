import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/UserNavbar";

const TranslationContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin-top: 7rem;

  @media screen and (max-width: 768px) {
    margin: 1rem auto;
    padding: 0.5rem;
    margin-top: 6rem;
  }

  @media screen and (max-width: 480px) {
    margin: 0.5rem auto;
    padding: 0.25rem;
    margin-top: 5.5rem;
  }
`;

const CameraPlaceholder = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16 / 9;
  margin: 0 auto 1.5rem auto;
  background: white;
  border-radius: 12px;

  @media screen and (max-width: 768px) {
    margin: 0 auto 1rem auto;
    border-radius: 8px;
  }

  @media screen and (max-width: 480px) {
    aspect-ratio: 4 / 3;
    margin: 0 auto 0.75rem auto;
    border-radius: 6px;
  }
`;

const VideoFeed = styled.video`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  display: block;
  object-fit: cover;

  @media screen and (max-width: 768px) {
    border-radius: 8px;
  }

  @media screen and (max-width: 480px) {
    border-radius: 6px;
  }
`;

const CanvasOverlay = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const InfoButton = styled.button`
  position: absolute;
  top: 15px;
  left: 15px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: rgba(43, 108, 176, 0.9);
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  backdrop-filter: blur(4px);

  &:hover {
    background-color: rgba(44, 82, 130, 0.95);
    transform: scale(1.05);
  }

  svg {
    color: white;
    font-size: 18px;
  }

  @media screen and (max-width: 768px) {
    top: 10px;
    left: 10px;
    width: 32px;
    height: 32px;

    svg {
      font-size: 16px;
    }
  }

  @media screen and (max-width: 480px) {
    top: 8px;
    left: 8px;
    width: 28px;
    height: 28px;

    svg {
      font-size: 14px;
    }
  }
`;

const PredictionDisplay = styled.div`
  text-align: center;
  margin-top: -1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 0 0 12px 12px;
  color: white;
  font-size: 1.4rem;
  font-weight: bold;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;

  span.probability {
    display: inline-block;
    color: ${(props) => {
      const p = parseFloat(props.probability);
      if (p >= 80) return '#4ade80';
      if (p >= 60) return '#fbbf24';
      return '#f87171';
    }};
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 0.5rem;
  }

  @media screen and (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0.6rem;
    margin-bottom: 0.75rem;
    border-radius: 0 0 8px 8px;

    span.probability {
      font-size: 1rem;
    }
  }

  @media screen and (max-width: 480px) {
    font-size: 1rem;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 0 0 6px 6px;

    span.probability {
      font-size: 0.9rem;
    }

    div {
      &:nth-child(2) {
        font-size: 1.3rem !important;
        margin: 0.25rem 0 !important;
      }
    }
  }
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
    word-break: break-word;
    min-height: 2rem;
  }

  @media screen and (max-width: 768px) {
    margin-bottom: 0.75rem;

    h2 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1.3rem;
    }
  }

  @media screen and (max-width: 480px) {
    margin-bottom: 0.5rem;

    h2 {
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }

    p {
      font-size: 1.1rem;
      min-height: 1.5rem;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 1.5rem 0;
  gap: 0.5rem;

  button {
    padding: 0.75rem 1.5rem;
    font-weight: bold;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.95rem;
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

  @media screen and (max-width: 768px) {
    margin: 1rem 0;

    button {
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
    }
  }

  @media screen and (max-width: 480px) {
    margin: 0.75rem 0;
    flex-direction: column;
    align-items: center;

    button {
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
      width: 200px;
      max-width: 80%;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;

  @media screen and (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;

  h2 {
    color: #2b6cb0;
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }

  p {
    color: #4a5568;
    font-size: 1rem;
    margin: 0.75rem 0;
    line-height: 1.5;
  }

  button {
    background-color: #2b6cb0;
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.2s ease;

    &:hover {
      background-color: #2c5282;
      transform: scale(1.02);
    }
  }

  @media screen and (max-width: 768px) {
    padding: 1.5rem;
    width: 95%;

    h2 {
      font-size: 1.4rem;
    }

    p {
      font-size: 0.95rem;
    }

    button {
      padding: 0.6rem 1.5rem;
      font-size: 0.95rem;
    }
  }

  @media screen and (max-width: 480px) {
    padding: 1rem;
    border-radius: 8px;

    h2 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }

    p {
      font-size: 0.9rem;
      margin: 0.5rem 0;
    }

    button {
      padding: 0.6rem 1.25rem;
      font-size: 0.9rem;
      width: 100%;
      max-width: 200px;
    }

    div {
      padding: 0.75rem !important;
      
      p {
        font-size: 0.85rem !important;
      }
    }
  }
`;

const StatusDisplay = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  
  ${props => {
    if (props.status === 'translating') {
      return `
        background-color: rgba(33, 150, 243, 0.1);
        border: 1px solid #2196f3;
        color: #2196f3;
      `;
    } else if (props.status === 'error') {
      return `
        background-color: rgba(244, 67, 54, 0.1);
        border: 1px solid #f44336;
        color: #f44336;
      `;
    } else {
      return `
        background-color: rgba(76, 175, 80, 0.1);
        border: 1px solid #4caf50;
        color: #4caf50;
      `;
    }
  }}g
`;

function ASLTranslator() {
  const videoRef = useRef(null);
  const hiddenCanvasRef = useRef(document.createElement("canvas"));
  const canvasRef = useRef(null);
  const lastTranslatedTimeRef = useRef(0);
  const lastApiCallTimeRef = useRef(0);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);

  const [translation, setTranslation] = useState("");
  const [lastWord, setLastWord] = useState("");
  const [currentPrediction, setCurrentPrediction] = useState({ letter: "", probability: 0 });
  const [showInstructions, setShowInstructions] = useState(true);
  const [status, setStatus] = useState('ready');

  const ngrokBase = "https://d33b-175-176-13-120.ngrok-free.app";
  const confidenceThreshold = 0.4;

  // Single function to handle API calls with proper throttling
  const makeApiCall = async () => {
    // Check if component is still mounted
    if (!isMountedRef.current) return;

    const now = Date.now();
    
    if (now - lastApiCallTimeRef.current < 2000) {
      return;
    }
    
    if (isProcessingRef.current) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = hiddenCanvasRef.current;
    
    if (!video || !canvas || video.readyState !== 4) {
      return;
    }
    
    isProcessingRef.current = true;
    lastApiCallTimeRef.current = now;
    
    // Check if still mounted before updating state
    if (isMountedRef.current) {
      setStatus('translating');
    }
    
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob || !isMountedRef.current) {
          isProcessingRef.current = false;
          return;
        }

        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");

        try {
          const response = await fetch(`${ngrokBase}/translate-words`, {
            method: "POST",
            body: formData,
          });

          if (!isMountedRef.current) {
            isProcessingRef.current = false;
            return;
          }

          if (response.ok) {
            const data = await response.json();
            
            // Update bounding boxes
            if (data.bbox && canvasRef.current && isMountedRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              const overlayCanvas = canvasRef.current;

              overlayCanvas.width = overlayCanvas.offsetWidth;
              overlayCanvas.height = overlayCanvas.offsetHeight;

              ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

              const videoW = video.videoWidth;
              const videoH = video.videoHeight;
              const scaleX = overlayCanvas.width / videoW;
              const scaleY = overlayCanvas.height / videoH;

              const bboxes = Array.isArray(data.bbox[0]) ? data.bbox : [data.bbox];
              bboxes.forEach(([x, y, w, h]) => {
                const sx = x * scaleX;
                const sy = y * scaleY;
                const sw = w * scaleX;
                const sh = h * scaleY;

                ctx.strokeStyle = "#00ffcc";
                ctx.lineWidth = 3;
                ctx.strokeRect(sx, sy, sw, sh);
              });
            }

            // Update current prediction
            const label = data.label;
            const confidence = data.confidence || 0;
            
            if (isMountedRef.current) {
              setCurrentPrediction({
                letter: label,
                probability: (confidence * 100).toFixed(0),
              });

              // Update translation if conditions are met
              if (
                confidence >= confidenceThreshold &&
                label !== lastWord &&
                now - lastTranslatedTimeRef.current >= 2000
              ) {
                setTranslation((prev) => prev + " " + label);
                setLastWord(label);
                lastTranslatedTimeRef.current = now;
              }
              
              setStatus('ready');
            }
          } else if (response.status === 429) {
            console.log('Rate limited - will retry in 2 seconds');
            if (isMountedRef.current) setStatus('error');
          } else {
            const errorData = await response.json();
            console.error('Translation error:', errorData);
            if (isMountedRef.current) setStatus('error');
          }
        } catch (err) {
          console.error("Error fetching translation:", err);
          if (isMountedRef.current) setStatus('error');
        } finally {
          isProcessingRef.current = false;
        }
      }, "image/jpeg", 0.8);
      
    } catch (err) {
      console.error("Canvas error:", err);
      isProcessingRef.current = false;
      if (isMountedRef.current) setStatus('error');
    }
  };

  useEffect(() => {
    let stream = null;
    let intervalId = null;
    isMountedRef.current = true;

    const startCamera = async () => {
      try {
        console.log("🎥 Starting camera...");
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Check if component is still mounted before setting video
        if (!isMountedRef.current) {
          console.log("⚠️ Component unmounted during camera start, stopping stream");
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("✅ Camera stream set to video element");
        }

        // Single interval for all API calls - every 2 seconds
        intervalId = setInterval(() => {
          // Check if component is still mounted
          if (!isMountedRef.current) {
            console.log("⚠️ Component unmounted, clearing interval");
            clearInterval(intervalId);
            return;
          }
          console.log("🔄 Making API call...");
          makeApiCall();
        }, 2000);

        console.log("✅ Camera and interval setup completed");

      } catch (err) {
        console.error("❌ Camera access error:", err);
        if (isMountedRef.current) setStatus('error');
      }
    };

    startCamera();

    // Cleanup function - this only runs when component unmounts or dependencies change
    return () => {
      console.log("🧹 Cleaning up Words Translation component...");
      
      // Mark as unmounted
      isMountedRef.current = false;
      
      // Clear interval
      if (intervalId) {
        clearInterval(intervalId);
        console.log("✅ Interval cleared");
      }
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log("✅ Camera track stopped");
        });
      }
      
      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        console.log("✅ Video source cleared");
      }
      
      // Reset processing flags
      isProcessingRef.current = false;
      
      console.log("✅ Words Translation cleanup completed");
    };
  }, []); // Empty dependency array - only runs once on mount

  const deleteLastLetter = () => {
    setTranslation((prev) => prev.trim().split(" ").slice(0, -1).join(" "));
  };

  const clearWord = () => {
    setTranslation("");
    setLastWord("");
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'translating':
        return '🔄 Translating...';
      case 'error':
        return '⚠️ Connection issue - retrying...';
      default:
        return '✅ Ready';
    }
  };

  return (
    <TranslationContainer>
      <Navbar />
      
      <CameraPlaceholder>
        <VideoFeed ref={videoRef} autoPlay playsInline muted />
        <CanvasOverlay ref={canvasRef} />
        <InfoButton onClick={() => setShowInstructions(true)}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </InfoButton>
      </CameraPlaceholder>

      <StatusDisplay status={status}>
        {getStatusMessage()}
      </StatusDisplay>

      <PredictionDisplay probability={currentPrediction.probability}>
        <div>Current Prediction:</div>
        <div style={{ fontSize: "1.6rem", margin: "0.5rem 0" }}>
          {currentPrediction.letter || "Waiting..."}
        </div>
        <div>Confidence: <span className="probability">{currentPrediction.probability}%</span></div>
      </PredictionDisplay>

      <TranslationText>
        <h2>Translation (WORDS Mode):</h2>
        <p>{translation.trim() || "Waiting for signs..."}</p>
      </TranslationText>

      <ButtonGroup>
        <button className="delete-letter" onClick={deleteLastLetter}>
          Delete Last Word
        </button>
        <button className="delete-all" onClick={clearWord}>
          Clear All
        </button>
      </ButtonGroup>

      {showInstructions && (
        <Modal>
          <ModalContent>
            <h2>Instructions</h2>
            <p>1. Place one or two hands in front of the camera.</p>
            <p>2. The system translates every 2 seconds if confident.</p>
            <p>3. Translation is accumulated below; current prediction shows latest word only.</p>
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef5e7', borderRadius: '8px', border: '1px solid #f6ad55' }}>
              <p style={{ color: '#c05621', fontWeight: 'bold', fontSize: '0.95rem', margin: '0' }}>
                📏 For best results, keep your device 10-15 inches away from your hands.
              </p>
            </div>
            <button onClick={() => setShowInstructions(false)}>
              Got it!
            </button>
          </ModalContent>
        </Modal>
      )}
    </TranslationContainer>
  );
}

export default ASLTranslator;
