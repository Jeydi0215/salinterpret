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

const LetterDisplay = styled.h2`
  margin-top: 1.5rem;
  color: #2b6cb0;
  font-size: 2.5rem;
  font-weight: 700;
`;

function ASLTranslator() {
  const videoRef = useRef(null);
  const canvas = document.createElement("canvas");
  const [latestLetter, setLatestLetter] = useState("");

  const ngrokBase = "https://26dd-143-44-224-17.ngrok-free.app"; // 🔁 Replace with your real ngrok URL

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
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.label) {
                  setLatestLetter(data.label);
                }
              })
              .catch((err) => {
                console.error("Error fetching letter:", err);
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

  return (
    <Container>
      <Title>ASL Translator</Title>
      <SubTitle>Live webcam capture for ASL recognition (Python handles the translation)</SubTitle>

      <CameraContainer>
        <video ref={videoRef} autoPlay muted playsInline />
      </CameraContainer>

      <LetterDisplay>
        {latestLetter ? `Detected: ${latestLetter}` : "Waiting for hand sign..."}
      </LetterDisplay>
    </Container>
  );
}

export default ASLTranslator;
