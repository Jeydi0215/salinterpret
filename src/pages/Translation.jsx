import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Stream = styled.img`
  width: 720px;
  height: auto;
  border-radius: 12px;
  border: 4px solid #0d6efd;
  margin-top: 1rem;
`;

function LiveFeed() {
  const streamUrl = "https://your-ngrok-url.ngrok-free.app/video_feed";

  return (
    <Container>
      <h1>Real-Time ASL Translation</h1>
      <p>This is a live camera feed processed by Flask (via OpenCV).</p>
      <Stream src={streamUrl} alt="Live Camera Feed" />
    </Container>
  );
}

export default LiveFeed;
