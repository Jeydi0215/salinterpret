import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/UserNavbar";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const TranslationContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const CameraPlaceholder = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
`;

const VideoFeed = styled.video`
  width: 100%;
  max-width: 640px;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const CanvasOverlay = styled.canvas`
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 100%;
  max-width: 640px;
  pointer-events: none;
`;

const PredictionDisplay = styled.div`
  text-align: center;
  margin-top: -1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 0 0 12px 12px;
  color: white;
  font-size: 1.4rem;
  font-weight: bold;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
  
  span.probability {
    color: ${props => {
      const probability = parseFloat(props.probability);
      if (probability >= 80) return '#4ade80'; // green
      if (probability >= 60) return '#fbbf24'; // yellow
      return '#f87171'; // red
    }};
    margin-left: 0.5rem;
  }
`;

const TranslationText = styled.div`
  text-align: center;
  margin-bottom: 1rem;

  h2 {
    color: #2b6cb0;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.6rem;
    color: white;
    font-weight: bold;
  }
`;

const Instructions = styled.div`
  background: #f7fafc;
  padding: 1rem 2rem;
  border-radius: 12px;

  h2 {
    color: #2c5282;
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
    align-items:center;
    text-align:center;
  }

  p {
    color: #4a5568;
    font-size: 1rem;
    margin: 0.25rem 0;
     align-items:center;
    text-align:center;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;

  button {
    padding: 0.75rem 1.5rem;
    margin: 0 0.5rem;
    font-weight: bold;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .delete-letter {
    background-color: #e53e3e;
  }

  .delete-all {
    background-color: #2b6cb0;
  }

  .switch-mode {
    background-color: #805ad5;
  }

  button:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

function ASLTranslator() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(document.createElement("canvas"));
  const [translation, setTranslation] = useState("");
  const [lastLetter, setLastLetter] = useState("");
  const [model, setModel] = useState(null);
  const [mode, setMode] = useState("words");
  const [currentPrediction, setCurrentPrediction] = useState({ letter: "", probability: 0 });

  const ngrokBase = "https://b5d9-175-176-11-57.ngrok-free.app"; // <-- your flask URL

  const getModelURLs = () => ({
    modelURL: "https://teachablemachine.withgoogle.com/models/AgwPr5b46/model.json",
    metadataURL: "https://teachablemachine.withgoogle.com/models/AgwPr5b46/metadata.json",
  });

  const loadModel = async () => {
    const { modelURL, metadataURL } = getModelURLs();
    const tmImage = await import("@teachablemachine/image");
    const loadedModel = await tmImage.load(modelURL, metadataURL);
    setModel(loadedModel);
  };

  useEffect(() => {
    let stream;
    let intervalId;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if (mode === "words") {
          await loadModel();

          const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
          });

          hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
          });

          hands.onResults((results) => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.multiHandLandmarks) {
              for (const landmarks of results.multiHandLandmarks) {
                const points = landmarks.map(pt => ({
                  x: pt.x * canvas.width,
                  y: pt.y * canvas.height,
                }));

                const minX = Math.min(...points.map(p => p.x));
                const maxX = Math.max(...points.map(p => p.x));
                const minY = Math.min(...points.map(p => p.y));
                const maxY = Math.max(...points.map(p => p.y));

                const boxWidth = maxX - minX;
                const boxHeight = maxY - minY;

                ctx.strokeStyle = "#1e90ff";
                ctx.lineWidth = 2;
                ctx.strokeRect(minX, minY, boxWidth, boxHeight);
              }
            }
          });

          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              await hands.send({ image: videoRef.current });
            },
            width: 640,
            height: 360,
          });

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch((e) => console.warn("play() interrupted:", e));
            camera.start();
          };

          intervalId = setInterval(async () => {
            if (!videoRef.current || !model) return;
            const prediction = await model.predict(videoRef.current);
            const bestGuess = prediction.reduce((max, p) => p.probability > max.probability ? p : max);

            // Update current prediction for display
            setCurrentPrediction({
              letter: bestGuess.className,
              probability: (bestGuess.probability * 100).toFixed(0)
            });

            if (bestGuess.probability > 0.8 && bestGuess.className !== lastLetter) {
              setTranslation((prev) => prev + bestGuess.className);
              setLastLetter(bestGuess.className);
            }
          }, 500); // More frequent updates for better UX
        } else {
          intervalId = setInterval(() => {
            const video = videoRef.current;
            const canvas = hiddenCanvasRef.current;

            if (!video || !canvas || video.readyState !== 4) return;

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
                  // Update current prediction with data from API
                  if (data.label) {
                    setCurrentPrediction({
                      letter: data.label,
                      probability: data.confidence ? (data.confidence * 100).toFixed(0) : "50"
                    });
                  }
                  
                  if (data.label && data.label !== lastLetter) {
                    setTranslation((prev) => prev + data.label);
                    setLastLetter(data.label);
                  }
                })
                .catch((err) => {
                  console.error("Error fetching letter:", err);
                });
            }, "image/jpeg");
          }, 500); // More frequent updates for better UX
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [mode, lastLetter]);

  const deleteLastLetter = () => {
    setTranslation((prev) => prev.slice(0, -1));
  };

  const clearWord = () => {
    setTranslation("");
    setLastLetter("");
  };

  const toggleMode = () => {
    setTranslation("");
    setLastLetter("");
    setMode((prev) => (prev === "words" ? "letters" : "words"));
  };

  return (
    <TranslationContainer>
      <Navbar />
      <CameraPlaceholder>
        <VideoFeed ref={videoRef} autoPlay playsInline muted />
        <CanvasOverlay ref={canvasRef} width={640} height={360} />
      </CameraPlaceholder>

      <PredictionDisplay probability={currentPrediction.probability}>
        Current: {currentPrediction.letter || "Waiting..."} 
        <span className="probability">
          ({currentPrediction.probability}%)
        </span>
      </PredictionDisplay>

      <TranslationText>
        <h2>Translation ({mode.toUpperCase()} Mode):</h2>
        <p>{translation || "Waiting for signs..."}</p>
      </TranslationText>

      <ButtonGroup>
        <button className="delete-letter" onClick={deleteLastLetter}>
          Delete Letter
        </button>
        <button className="delete-all" onClick={clearWord}>
          Delete All
        </button>
        <button className="switch-mode" onClick={toggleMode}>
          Switch to {mode === "words" ? "Letters" : "Words"}
        </button>
      </ButtonGroup>

      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera.</p>
        <p>2. Wait for the translation to appear. (2 seconds per Translation)</p>
        <p>Currently running in: <strong>{mode.toUpperCase()}</strong> mode.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslator;

// import React, { useEffect, useRef, useState } from "react";
// import styled from "styled-components";
// import Navbar from '../components/UserNavbar';
// import { Hands } from "@mediapipe/hands";
// import { Camera } from "@mediapipe/camera_utils";
// import * as drawingUtils from "@mediapipe/drawing_utils";

// const TranslationContainer = styled.div`
//   max-width: 900px;
//   margin: 2rem auto;
//   padding: 1rem;
//   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
// `;

// const CameraContainer = styled.div`
//   width: 640px;
//   height: 360px;
//   margin: 0 auto 1.5rem auto;
//   border-radius: 8px;
//   overflow: hidden;
//   background-color: #000;
//   box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
//   position: relative;
// `;

// const TranslationText = styled.div`
//   text-align: center;
//   margin-bottom: 1rem;

//   h2 {
//     color: #2b6cb0;
//     font-size: 1.8rem;
//     margin-bottom: 0.5rem;
//   }

//   p {
//     font-size: 1.6rem;
//     color: white;
//     font-weight: bold;
//   }
// `;

// const Status = styled.div`
//   text-align: center;
//   margin-top: 0.5rem;
//   font-size: 0.9rem;
//   color: ${props => props.active ? '#38a169' : '#718096'};
// `;

// const Instructions = styled.div`
//   background: #f7fafc;
//   padding: 1rem 2rem;
//   border-radius: 12px;
//   margin-top: 1rem;

//   h2 {
//     color: #2c5282;
//     font-size: 1.4rem;
//     margin-bottom: 0.5rem;
//   }

//   p {
//     color: #4a5568;
//     font-size: 1rem;
//     margin: 0.25rem 0;
//   }
// `;

// const ButtonGroup = styled.div`
//   display: flex;
//   justify-content: center;
//   margin: 1.5rem 0;

//   button {
//     padding: 0.75rem 1.5rem;
//     margin: 0 0.5rem;
//     font-weight: bold;
//     color: white;
//     border: none;
//     border-radius: 8px;
//     cursor: pointer;
//     transition: all 0.2s ease;
//   }

//   .delete-letter {
//     background-color: #e53e3e;
//   }

//   .delete-all {
//     background-color: #2b6cb0;
//   }

//   button:hover {
//     opacity: 0.9;
//     transform: scale(1.02);
//   }
// `;

// function ASLTranslator() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [translation, setTranslation] = useState("");
//   const [lastLetter, setLastLetter] = useState("");
//   const [model, setModel] = useState(null);

//   useEffect(() => {
//     const loadModel = async () => {
//       const modelURL = "https://teachablemachine.withgoogle.com/models/AgwPr5b46/model.json";
//       const metadataURL = "https://teachablemachine.withgoogle.com/models/AgwPr5b46/metadata.json";

//       const tmImage = await import("@teachablemachine/image");
//       const loadedModel = await tmImage.load(modelURL, metadataURL);
//       setModel(loadedModel);
//     };

//     const setupCamera = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;

//         const hands = new Hands({
//           locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
//         });

//         hands.setOptions({
//           maxNumHands: 2,
//           modelComplexity: 1,
//           minDetectionConfidence: 0.7,
//           minTrackingConfidence: 0.7,
//         });

//         hands.onResults((results) => {
//           const canvas = canvasRef.current;
//           const ctx = canvas.getContext("2d");
//           ctx.save();
//           ctx.clearRect(0, 0, canvas.width, canvas.height);

//           if (results.image) {
//             ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
//           }

//       if (results.multiHandLandmarks) {
//   for (const landmarks of results.multiHandLandmarks) {
//     // Convert normalized landmark positions to pixel values
//     const points = landmarks.map(pt => ({
//       x: pt.x * canvas.width,
//       y: pt.y * canvas.height,
//     }));

//     const minX = Math.min(...points.map(p => p.x));
//     const maxX = Math.max(...points.map(p => p.x));
//     const minY = Math.min(...points.map(p => p.y));
//     const maxY = Math.max(...points.map(p => p.y));

//     const boxWidth = maxX - minX;
//     const boxHeight = maxY - minY;

//     // Draw bounding box
//     ctx.strokeStyle = "#1e90ff";
//     ctx.lineWidth = 2;
//     ctx.strokeRect(minX, minY, boxWidth, boxHeight);
//   }
// }
//           ctx.restore();
//         });

//         const camera = new Camera(videoRef.current, {
//           onFrame: async () => {
//             await hands.send({ image: videoRef.current });
//           },
//           width: 640,
//           height: 360,
//         });

//         videoRef.current.onloadedmetadata = () => {
//           videoRef.current.play().catch((e) => console.warn("play() interrupted:", e));
//           camera.start();
//         };
//       }
//     };

//     loadModel();
//     setupCamera();
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(async () => {
//       if (!videoRef.current || !model) return;

//       const prediction = await model.predict(videoRef.current);
//       const bestGuess = prediction.reduce((max, p) => p.probability > max.probability ? p : max);

//       if (bestGuess.probability > 0.8 && bestGuess.className !== lastLetter) {
//         setTranslation(prev => prev + bestGuess.className);
//         setLastLetter(bestGuess.className);
//       }
//     }, 2000);

//     return () => clearInterval(interval);
//   }, [model, lastLetter]);

//   const deleteLastLetter = () => {
//     setTranslation(prev => prev.slice(0, -1));
//   };

//   const clearWord = () => {
//     setTranslation("");
//     setLastLetter("");
//   };

//   return (
//     <TranslationContainer>
//       <Navbar />
//       <CameraContainer>
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           style={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//             position: 'absolute'
//           }}
//         />
//         <canvas
//           ref={canvasRef}
//           width="640"
//           height="360"
//           style={{ position: "absolute", top: 0, left: 0 }}
//         />
//       </CameraContainer>

//       <TranslationText>
//         <h2>Translation:</h2>
//         <p>{translation || "Waiting for signs..."}</p>
//       </TranslationText>

//       <ButtonGroup>
//         <button className="delete-letter" onClick={deleteLastLetter}>Delete Letter</button>
//         <button className="delete-all" onClick={clearWord}>Delete All</button>
//       </ButtonGroup>

//       <Instructions>
//         <h2>Instructions:</h2>
//         <p>1. Place your hand(s) in front of the camera.</p>
//         <p>2. Wait for the translation to appear.</p>
//         <p>Note: This app currently translates alphabet letters only.</p>
//       </Instructions>
//     </TranslationContainer>
//   );
// }

// export default ASLTranslator;
