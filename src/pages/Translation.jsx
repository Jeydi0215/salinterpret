import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// === STYLED COMPONENTS ===
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
  font-size: 1.8rem;
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

// === MAIN COMPONENT ===
function ASLTranslator() {
  const videoRef = useRef(null);
  const canvas = document.createElement("canvas");
  const [translatedWord, setTranslatedWord] = useState("");

  const ngrokBase = "https://your-ngrok-id.ngrok-free.app"; // 🔁 replace with your real ngrok domain

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
          if (!video || video.readyState !== 4) return;

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
            }).catch((err) => {
              console.error("Error sending frame:", err);
            });
          }, "image/jpeg");
        }, 500);
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Poll translated word every second
  useEffect(() => {
    const poll = setInterval(() => {
      fetch(`${ngrokBase}/word`)
        .then((res) => res.json())
        .then((data) => setTranslatedWord(data.word || ""))
        .catch((err) => console.error("Word fetch failed:", err));
    }, 1000);

    return () => clearInterval(poll);
  }, []);

  // Delete button actions
  const deleteLetter = () => {
    fetch(`${ngrokBase}/delete-letter`, { method: "POST" });
  };

  const deleteAll = () => {
    fetch(`${ngrokBase}/delete-all`, { method: "POST" });
  };

  return (
    <Container>
      <Title>ASL Translator</Title>
      <SubTitle>Live webcam capture for ASL recognition (Python handles the translation)</SubTitle>

      <CameraContainer>
        <video ref={videoRef} autoPlay muted playsInline />
      </CameraContainer>

      <WordDisplay>
        Translation: {translatedWord || "Detecting..."}
      </WordDisplay>

      <ButtonGroup>
        <button className="delete-letter" onClick={deleteLetter}>Delete Letter</button>
        <button className="delete-all" onClick={deleteAll}>Delete All</button>
      </ButtonGroup>
    </Container>
  );
}

export default ASLTranslator;
