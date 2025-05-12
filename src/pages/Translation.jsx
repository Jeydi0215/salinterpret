import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// === Styled Components ===
const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
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
  margin-bottom: 1rem;
  font-weight: 700;
`;

const SubTitle = styled.p`
  color: #4a5568;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const CameraContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;

  video {
    width: 100%;
    max-width: 640px;
    border-radius: 16px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const WordDisplay = styled.h2`
  margin-top: 1.5rem;
  color: #2b6cb0;
  font-size: 2.2rem;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  margin-top: 1.5rem;

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
  const canvas = document.createElement("canvas");
  const [currentWord, setCurrentWord] = useState("");
  const [lastLetter, setLastLetter] = useState("");
  const lastCaptureRef = useRef(Date.now());

  const ngrokBase = "https://8450-143-44-224-17.ngrok-free.app"; // Replace with your current ngrok

  useEffect(() => {
    let stream;
    let animationId;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const loop = () => {
          animationId = requestAnimationFrame(loop);

          const now = Date.now();
          const elapsed = now - lastCaptureRef.current;

          if (elapsed < 2000) return; // Wait 2 seconds between captures

          const video = videoRef.current;
          if (!video || video.readyState !== 4) return;

          lastCaptureRef.current = now;

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
                  setCurrentWord((prev) => prev + data.label);
                  setLastLetter(data.label);
                }
              })
              .catch((err) => {
                console.error("Error fetching letter:", err);
              });
          }, "image/jpeg");
        };

        loop(); // Start animation loop
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [lastLetter]);

  const deleteLastLetter = () => {
    setCurrentWord((prev) => prev.slice(0, -1));
  };

  const clearWord = () => {
    setCurrentWord("");
    setLastLetter("");
  };

  return (
    <Container>
      <Title>ASL Translator</Title>
      <SubTitle>Real-time webcam ASL recognition using Python + React</SubTitle>

      <CameraContainer>
        <video ref={videoRef} autoPlay muted playsInline />
      </CameraContainer>

      <WordDisplay>{currentWord || "Waiting for signs..."}</WordDisplay>

      <ButtonGroup>
        <button className="delete-letter" onClick={deleteLastLetter}>
          Delete Letter
        </button>
        <button className="delete-all" onClick={clearWord}>
          Delete All
        </button>
      </ButtonGroup>
    </Container>
  );
}

export default ASLTranslator;
