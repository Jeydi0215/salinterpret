import React, { useState, useRef, useEffect, useCallback } from 'react';

function ASLTranslationPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Create a debounced translation function to prevent rapid-fire requests
  const debouncedFetchTranslation = useCallback(
    debounce((imageBlob) => {
      fetchTranslation(imageBlob);
    }, 1000), // 1 second between translations
    []
  );

  // Continuous capture method
  const captureAndTranslate = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and fetch translation
    canvas.toBlob((blob) => {
      debouncedFetchTranslation(blob);
    }, 'image/png');
  }, [debouncedFetchTranslation]);

  // Start/stop translation
  const toggleTranslation = () => {
    setIsTranslating(prev => !prev);
  };

  // Effect for continuous capture when translating
  useEffect(() => {
    let intervalId;
    if (isTranslating) {
      // Capture and translate every second
      intervalId = setInterval(captureAndTranslate, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTranslating, captureAndTranslate]);

  // Webcam setup
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
  }, []);

  // Fetch translation method
  const fetchTranslation = async (imageBlob) => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob);
      const response = await fetch('https://flasky-d9sr.onrender.com/translate', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch translation');
      }
      
      const data = await response.json();
      if (data.translation) {
        setTranslation(prev => prev + data.translation);
      }
    } catch (error) {
      console.error('Error fetching translation:', error.message);
    }
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <video ref={videoRef} autoPlay width="640" height="480" />
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }} 
        />
      </CameraPlaceholder>
      
      {/* Replace Capture button with Toggle Translation */}
      <CaptureButton onClick={toggleTranslation}>
        {isTranslating ? 'Stop Translating' : 'Start Translating'}
      </CaptureButton>
      
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      
      {translation && (
        <ClearButton onClick={() => setTranslation('')}>
          Clear Translation
        </ClearButton>
      )}
      
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Click 'Start Translating' to begin continuous sign detection.</p>
        <p>2. Make clear ASL alphabet signs in front of the camera.</p>
        <p>Note: This app only translates the alphabet for now.</p>
      </Instructions>
    </TranslationContainer>
  );
}

// Debounce utility function
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default ASLTranslationPage;
