import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Navbar from '../components/UserNavbar';

// === Styled Layout ===
const TranslationContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const CameraPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
`;

const VideoFeed = styled.video`
  width: 100%;
  max-width: 640px;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
    color: #333;
    font-weight: bold;
  }
`;

const Instructions = styled.div`
  background: #f7fafc;
  padding: 1rem 2rem;
  border-radius: 12px;

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
  const canvasRef = useRef(document.createElement("canvas"));
  const [translation, setTranslation] = useState("");
  const [lastLetter, setLastLetter] = useState("");
  const ngrokBase = "https://8450-143-44-224-17.ngrok-free.app"; // replace with your ngrok URL

  useEffect(() => {
    let stream;
    let intervalId;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        intervalId = setInterval(() => {
          const video = videoRef.current;
          const canvas = canvasRef.current;

          if (!video || !canvas || video.readyState !== 4) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (!blob) return;
            const formData = new FormData();
            formData.append("file", blob, "frame.jpg");

            fetch(`${ngrokBase}/translate`, {
              method: "POST",
              body: formData,
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.label && data.label !== lastLetter) {
                  setTranslation((prev) => prev + data.label);
                  setLastLetter(data.label);
                }
              })
              .catch((err) => {
                console.error("Error fetching letter:", err);
              });
          }, "image/jpeg");
        }, 2000);
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [lastLetter]);

  const deleteLastLetter = () => {
    setTranslation((prev) => prev.slice(0, -1));
  };

  const clearWord = () => {
    setTranslation("");
    setLastLetter("");
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <VideoFeed ref={videoRef} autoPlay playsInline muted />
      </CameraPlaceholder>

      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation || "Waiting for signs..."}</p>
      </TranslationText>

      <ButtonGroup>
        <button className="delete-letter" onClick={deleteLastLetter}>
          Delete Letter
        </button>
        <button className="delete-all" onClick={clearWord}>
          Delete All
        </button>
      </ButtonGroup>

      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your right hand in front of the camera.</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app for now only translates the alphabet.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslator;
