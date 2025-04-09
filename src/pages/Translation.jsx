import React, { useEffect, useState } from "react";
import styled from "styled-components";

// Styled components
const Container = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const Frame = styled.img`
  width: 320px;
  height: auto;
  border: 4px solid #0d6efd;
  border-radius: 10px;
  margin-top: 1rem;
`;

const Translation = styled.h2`
  font-size: 2rem;
  color: #0d6efd;
  margin-top: 1.5rem;
`;

const Error = styled.p`
  color: red;
  margin-top: 1rem;
`;

function ASLViewer() {
  const [imgData, setImgData] = useState("");
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState(null);

  // 🔗 Replace with your ngrok URL
  const serverUrl = "http://127.0.0.1:5000";

  const fetchTranslation = async () => {
    try {
      const res = await fetch(`${serverUrl}/translate`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      // Server may return empty during delay
      if (data.translation || data.img) {
        setTranslation(data.translation || "");
        setImgData(data.img ? `data:image/jpeg;base64,${data.img}` : "");
      } else {
        setTranslation("Waiting...");
      }

      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError("Unable to fetch translation. Please check the server.");
    }
  };

  useEffect(() => {
    fetchTranslation(); // Initial fetch
    const interval = setInterval(fetchTranslation, 3000); // Every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <h1>ASL Real-Time Translator</h1>

      {imgData ? (
        <Frame src={imgData} alt="Camera Feed" />
      ) : (
        <p>No camera feed yet...</p>
      )}

      <Translation>
        {translation ? `Translation: ${translation}` : "Analyzing..."}
      </Translation>

      {error && <Error>{error}</Error>}
    </Container>
  );
}

export default ASLViewer;
