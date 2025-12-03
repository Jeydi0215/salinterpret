import React, { useState, useRef, useEffect } from 'react';

function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const [captureCount, setCaptureCount] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Your backend URL - UPDATE THIS
  const BACKEND_URL = 'https://flasky-d9sr.onrender.com/ai-translate';

  // Start camera
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error('Error accessing camera:', err);
    }
  };

  // Capture frame and translate using AI
  const captureAndTranslate = async () => {
    if (!videoRef.current || isProcessing) return;
    
    setIsProcessing(true);

    try {
      // Capture frame from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      
      // Send to backend
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setTranslation(data.translation || 'No sign detected');
      setCaptureCount(prev => prev + 1);
      setError('');
    } catch (err) {
      setError('Translation failed: ' + err.message);
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Real-time auto-capture - adjustable interval
  useEffect(() => {
    if (!stream) return;
    
    const interval = setInterval(() => {
      captureAndTranslate();
    }, 1500); // Capture every 1.5 seconds for real-time feel

    return () => clearInterval(interval);
  }, [stream, isProcessing]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#ffc0cb',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        marginBottom: '1.5rem', 
        color: '#333',
        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)'
      }}>
        ASL AI Translator
      </h1>
      
      {/* Camera Feed */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '640px',
        backgroundColor: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            transform: 'scaleX(-1)' // Mirror the video
          }}
        />
        
        {/* Status Indicator */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isProcessing ? '#f59e0b' : '#10b981',
            animation: isProcessing ? 'pulse 1s infinite' : 'none'
          }} />
          {isProcessing ? 'Analyzing...' : 'Ready'}
        </div>

        {/* Capture Count */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          Captures: {captureCount}
        </div>

        {/* Hand Guide Overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60%',
          height: '60%',
          border: '3px dashed rgba(255,255,255,0.5)',
          borderRadius: '12px',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Translation Result - LARGE and PROMINENT */}
      <div style={{
        marginTop: '2rem',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '640px',
        textAlign: 'center',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h2 style={{ 
          marginBottom: '1rem', 
          color: '#666',
          fontSize: '1.2rem',
          fontWeight: 'normal'
        }}>
          Translation:
        </h2>
        <p style={{
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: 'bold',
          color: '#2d3748',
          margin: 0,
          letterSpacing: '0.05em'
        }}>
          {translation || '👋'}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '640px',
          fontSize: '0.9rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Quick Instructions */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '640px'
      }}>
        <h3 style={{ 
          marginBottom: '1rem', 
          color: '#333',
          fontSize: '1.3rem'
        }}>
          📋 How to Use:
        </h3>
        <ol style={{ 
          textAlign: 'left', 
          lineHeight: '1.8', 
          color: '#555',
          paddingLeft: '1.5rem'
        }}>
          <li>Position your hand in the dashed box area</li>
          <li>Make clear ASL signs (letters or gestures)</li>
          <li>Hold each sign for 1-2 seconds</li>
          <li>Watch the translation update in real-time!</li>
        </ol>
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#e6f7ff',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#0066cc'
        }}>
          💡 <strong>Tip:</strong> The app captures and analyzes automatically every 1.5 seconds
        </div>
      </div>

      {/* Manual Capture Button */}
      <button
        onClick={captureAndTranslate}
        disabled={isProcessing}
        style={{
          marginTop: '1.5rem',
          padding: '14px 36px',
          fontSize: '1.1rem',
          fontWeight: '600',
          backgroundColor: isProcessing ? '#cbd5e0' : '#4299e1',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s',
          transform: isProcessing ? 'scale(0.98)' : 'scale(1)'
        }}
        onMouseEnter={e => {
          if (!isProcessing) e.target.style.backgroundColor = '#3182ce';
        }}
        onMouseLeave={e => {
          if (!isProcessing) e.target.style.backgroundColor = '#4299e1';
        }}
      >
        {isProcessing ? '⏳ Analyzing...' : '📸 Capture Now'}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default ASLTranslationPage;
