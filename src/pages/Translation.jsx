import React, { useRef, useEffect, useState } from 'react';

const CameraCapture = () => {
  const videoRef = useRef(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [prevFrame, setPrevFrame] = useState(null);
  const [motionDetected, setMotionDetected] = useState(false);

  const threshold = 5000; // The threshold for motion (change this based on sensitivity)

  // Start or stop the webcam stream
  useEffect(() => {
    if (isCameraEnabled) {
      // Access the user's webcam
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
        });
    } else {
      // Stop the video stream if the camera is disabled
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    // Monitor video frames for motion
    const intervalId = setInterval(() => {
      if (videoRef.current && videoRef.current.videoWidth) {
        const currentFrame = getCurrentFrame();
        if (currentFrame) {
          detectMotion(currentFrame);
        }
      }
    }, 100); // Check every 100ms

    return () => clearInterval(intervalId);
  }, [isCameraEnabled]);

  // Function to toggle the camera on/off
  const toggleCamera = () => {
    setIsCameraEnabled(!isCameraEnabled);
  };

  // Function to capture the current frame from the video feed
  const getCurrentFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  // Function to detect motion by comparing the current frame with the previous one
  const detectMotion = (currentFrame) => {
    if (!prevFrame) {
      setPrevFrame(currentFrame);
      return;
    }

    const currentFrameData = currentFrame.getContext('2d').getImageData(0, 0, currentFrame.width, currentFrame.height);
    const prevFrameData = prevFrame.getContext('2d').getImageData(0, 0, prevFrame.width, prevFrame.height);

    let totalDifference = 0;

    // Compare pixel by pixel to calculate the difference
    for (let i = 0; i < currentFrameData.data.length; i += 4) {
      const rDiff = Math.abs(currentFrameData.data[i] - prevFrameData.data[i]);
      const gDiff = Math.abs(currentFrameData.data[i + 1] - prevFrameData.data[i + 1]);
      const bDiff = Math.abs(currentFrameData.data[i + 2] - prevFrameData.data[i + 2]);
      totalDifference += rDiff + gDiff + bDiff;
    }

    if (totalDifference > threshold) {
      setMotionDetected(true);
      captureSnapshot(currentFrame);
    } else {
      setMotionDetected(false);
    }

    // Store the current frame for future comparison
    setPrevFrame(currentFrame);
  };

  // Function to capture a snapshot when motion is detected
  const captureSnapshot = (currentFrame) => {
    const snapshotUrl = currentFrame.toDataURL('image/png');
    setSnapshot(snapshotUrl);
  };

  return (
    <div>
      <button onClick={toggleCamera}>
        {isCameraEnabled ? "Stop Camera" : "Start Camera"}
      </button>

      {/* Video element to display the webcam feed */}
      <video ref={videoRef} autoPlay width="640" height="480" />

      {/* Display motion detection status */}
      {motionDetected && <p>Motion Detected!</p>}

      {/* Display the captured snapshot */}
      {snapshot && (
        <div>
          <h3>Captured Snapshot:</h3>
          <img src={snapshot} alt="Snapshot" width="640" />
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
