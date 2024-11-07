import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Navbar from '../components/UserNavbar';

const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  height: 100vh;
`;

const CameraPlaceholder = styled.div`
  width: 80%;
  height: 50vh;
  margin-top: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
`;

const CameraFeed = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const TranslationText = styled.div`
  margin-top: 2rem;
  font-size: 1.5rem;
  color: black;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Instructions = styled.div`
  margin-top: 2rem;
  font-size: 1.2rem;
  text-align: center;
  color: black;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ClearButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
`;

function ASLTranslationPage() {
  const videoRef = useRef(null);
  const [cameraImage, setCameraImage] = useState('');
  const [translation, setTranslation] = useState('');
  const [prevFrame, setPrevFrame] = useState(null);
  const [motionDetected, setMotionDetected] = useState(false);

  const threshold = 5000; // Threshold for motion detection (can be adjusted)

  // Function to start the webcam stream and detect motion
  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
        });
    }

    // Continuously check for motion
    const intervalId = setInterval(() => {
      if (videoRef.current && videoRef.current.videoWidth) {
        const currentFrame = getCurrentFrame();
        if (currentFrame) {
          detectMotion(currentFrame);
        }
      }
    }, 100); // Check every 100ms for motion

    return () => clearInterval(intervalId);
  }, []);

  // Capture the current frame from the video feed
  const getCurrentFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  // Detect motion by comparing the current frame to the previous one
  const detectMotion = (currentFrame) => {
    if (!prevFrame) {
      setPrevFrame(currentFrame);
      return;
    }

    const currentFrameData = currentFrame.getContext('2d').getImageData(0, 0, currentFrame.width, currentFrame.height);
    const prevFrameData = prevFrame.getContext('2d').getImageData(0, 0, prevFrame.width, prevFrame.height);

    let totalDifference = 0;

    // Compare pixel by pixel
    for (let i = 0; i < currentFrameData.data.length; i += 4) {
      const rDiff = Math.abs(currentFrameData.data[i] - prevFrameData.data[i]);
      const gDiff = Math.abs(currentFrameData.data[i + 1] - prevFrameData.data[i + 1]);
      const bDiff = Math.abs(currentFrameData.data[i + 2] - prevFrameData.data[i + 2]);
      totalDifference += rDiff + gDiff + bDiff;
    }

    // If the difference exceeds the threshold, consider it motion
    if (totalDifference > threshold) {
      setMotionDetected(true);
      captureSnapshot(currentFrame);
    } else {
      setMotionDetected(false);
    }

    setPrevFrame(currentFrame);
  };

  // Capture a snapshot when motion is detected
  const captureSnapshot = (currentFrame) => {
    const snapshotUrl = currentFrame.toDataURL('image/png');
    setCameraImage(snapshotUrl);
    fetchTranslation(snapshotUrl);
  };

  // Fetch translation based on the captured image
  const fetchTranslation = async (image) => {
    try {
      const response = await fetch('https://flask-server-sptz.onrender/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch translation');
      }
      const data = await response.json();
      if (data.translation) {
        setTranslation((prevTranslation) => prevTranslation + data.translation);
      }
    } catch (error) {
      console.error('Error fetching translation:', error.message);
    }
  };

  const handleClearTranslation = () => {
    setTranslation('');
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <video ref={videoRef} autoPlay width="640" height="480" />
      </CameraPlaceholder>
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      {translation && <ClearButton onClick={handleClearTranslation}>Clear Translation</ClearButton>}
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera.</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app only translates the alphabet for now.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
