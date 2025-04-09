import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const Translation = styled.h2`
  font-size: 2rem;
  color: #0d6efd;
`;

function LiveTextDisplay() {
  const [translation, setTranslation] = useState("");
  const serverUrl = "https://b347-143-44-145-81.ngrok-free.app";

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${serverUrl}/last_prediction`);
        const data = await res.json();
        setTranslation(data.translation || "");
      } catch (err) {
        console.error("Error fetching translation", err);
      }
    }, 2000); // Fetch every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <h1>Live ASL Translation</h1>
      <Translation>{translation || "Waiting for sign..."}</Translation>
    </Container>
  );
}

export default LiveTextDisplay;
