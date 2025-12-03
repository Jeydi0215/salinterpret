import React, { useState, useRef, useEffect } from 'react';

function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
        video: { facingMode: 'user' } 
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
    setError('');

    try {
      // Capture frame from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      const base64Image = imageData.split(',')[1];

      // Call AI API (Claude)
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: 'What ASL (American Sign Language) letter or sign is being shown in this image? Respond with ONLY the letter or word being signed, nothing else. If no clear ASL sign is visible, respond with "No sign detected".'
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('AI API request failed');
      }

      const data = await response.json();
      const aiResponse = data.content[0].text.trim();
      
      setTranslation(aiResponse);
    } catch (err) {
      setError('Translation failed: ' + err.message);
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-capture every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      captureAndTranslate();
    }, 2000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#ffc0cb',
      padding: '2rem'
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>ASL AI Translator</h1>
      
      {/* Camera Feed */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '640px',
        backgroundColor: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
        {isProcessing && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            Analyzing...
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Translation Result */}
      <div style={{
        marginTop: '2rem',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '640px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>Translation:</h2>
        <p style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#4a5568',
          minHeight: '3rem'
        }}>
          {translation || 'Waiting for sign...'}
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
          maxWidth: '640px'
        }}>
          {error}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '640px'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Instructions:</h3>
        <ol style={{ textAlign: 'left', lineHeight: '1.8', color: '#555' }}>
          <li>Allow camera access when prompted</li>
          <li>Position your hand clearly in the camera view</li>
          <li>Make an ASL sign (letter or gesture)</li>
          <li>Wait for AI to analyze and translate (every 2 seconds)</li>
          <li>Try different signs!</li>
        </ol>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          <strong>Note:</strong> This uses AI vision to recognize ASL signs in real-time. 
          No pre-trained model needed!
        </p>
      </div>

      {/* Manual Capture Button */}
      <button
        onClick={captureAndTranslate}
        disabled={isProcessing}
        style={{
          marginTop: '1rem',
          padding: '12px 32px',
          fontSize: '1.1rem',
          backgroundColor: isProcessing ? '#ccc' : '#4299e1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {isProcessing ? 'Analyzing...' : 'Capture & Translate Now'}
      </button>
    </div>
  );
}

export default ASLTranslationPage;
