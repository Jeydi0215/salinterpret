import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const Video = styled.video`
  width: 320px;
  border: 3px solid #0d6efd;
  border-radius: 12px;
`;

const TranslationWord = styled.h2`
  margin-top: 1.5rem;
  font-size: 2.5rem;
  color: #0d6efd;
  letter-spacing: 3px;
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #0b5ed7;
  }
`;

const Error = styled.p`
  color: red;
  margin-top: 1rem;
`;

function CameraTranslator() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [translation, setTranslation] = useState("Waiting...");
  const [word, setWord] = useState("");
  const [error, setError] = useState("");

  const serverUrl = "https://a91d-143-44-145-81.ngrok-free.app"; // 🔁 update to match your ngrok

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError("");
      } catch (err) {
        setError("Camera access denied or not available.");
        console.error(err);
      }
    };

    startCamera();
    const interval = setInterval(captureAndSend, 3000); // every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const captureAndSend = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

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

        const data = await res.json();
        if (data.translation) {
          setTranslation(data.translation);
          setWord((prev) => prev + data.translation);
        } else {
          setTranslation("No sign detected");
        }
      } catch (err) {
        console.error("Error sending frame:", err);
        setError("Server error. Check backend or ngrok.");
      }
    }, "image/jpeg");
  };

  const handleDeleteLast = () => {
    setWord((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setWord("");
  };

  return (
    <Container>
      <h1>ASL Translator via Phone Camera</h1>

      <Video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      <TranslationWord>{word || "No word yet"}</TranslationWord>

      <ButtonContainer>
        <Button onClick={handleDeleteLast}>Delete Last</Button>
        <Button onClick={handleClearAll}>Clear All</Button>
      </ButtonContainer>

      {error && <Error>{error}</Error>}
    </Container>
  );
}

export default CameraTranslator;
