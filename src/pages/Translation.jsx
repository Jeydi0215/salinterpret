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

const Translation = styled.h2`
  margin-top: 1rem;
  font-size: 1.8rem;
  color: #0d6efd;
`;

const Error = styled.p`
  color: red;
  margin-top: 1rem;
`;

function CameraTranslator() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [translation, setTranslation] = useState("Waiting...");
  const [error, setError] = useState("");

  const serverUrl = " https://5205-143-44-145-81.ngrok-free.app"; 

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
        } else {
          setTranslation("No sign detected");
        }
      } catch (err) {
        console.error("Error sending frame:", err);
        setError("Server error. Check backend or ngrok.");
      }
    }, "image/jpeg");
  };

  return (
    <Container>
      <h1>ASL Translator via Phone Camera</h1>
      <Video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <Translation>{translation}</Translation>
      {error && <Error>{error}</Error>}
    </Container>
  );
}

export default CameraTranslator;
