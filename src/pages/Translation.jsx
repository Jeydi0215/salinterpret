import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3rem;
`;

const VideoStream = styled.img`
  width: 720px;
  height: auto;
  border: 4px solid #0d6efd;
  border-radius: 12px;
`;

const TranslationBox = styled.div`
  margin-top: 2rem;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 2rem;
  font-weight: bold;
  color: #0d6efd;
`;

const ErrorText = styled.div`
  margin-top: 1rem;
  color: red;
`;

function LiveASL() {
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState(null);

  const serverUrl = "https://b347-143-44-145-81.ngrok-free.app"; // change to your current ngrok URL

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        const res = await fetch(`${serverUrl}/last_prediction`);

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error("Unexpected response format (not JSON)");
        }

        const data = await res.json();
        setTranslation(data.translation || "No hand detected");
        setError(null); // Clear previous error
      } catch (err) {
        console.error("Error fetching translation:", err);
        setError("Cannot fetch translation. Is the server online?");
      }
    };

    const interval = setInterval(fetchTranslation, 2000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  return (
    <Container>
      <h1>Live ASL Translator</h1>
      <VideoStream src={`${serverUrl}/videofeed`} alt="ASL Video Stream" />
      <TranslationBox>{translation}</TranslationBox>
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
}

export default LiveASL;
