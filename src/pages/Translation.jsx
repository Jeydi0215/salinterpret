import React, { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

const MODEL_URL = "https://firebasestorage.googleapis.com/your_model_url_here/model.json";

const Translation = () => {
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkModelIntegrity = async () => {
      try {
        console.log("🔍 Checking model integrity...");

        // Fetch model.json
        const modelResponse = await fetch(MODEL_URL);
        if (!modelResponse.ok) throw new Error(`Model JSON not found! Status: ${modelResponse.status}`);
        const modelJson = await modelResponse.json();
        console.log("✅ Model JSON loaded:", modelJson);

        // Check weight file paths
        const weightFiles = modelJson.weightsManifest.flatMap(group => group.paths);
        console.log("🔍 Checking weight files:", weightFiles);

        for (const file of weightFiles) {
          const weightUrl = MODEL_URL.replace("model.json", file);
          const weightResponse = await fetch(weightUrl);
          if (!weightResponse.ok) throw new Error(`Weight file missing: ${file}`);
          const buffer = await weightResponse.arrayBuffer();
          console.log(`✅ ${file} size:`, buffer.byteLength, "bytes");
          if (buffer.byteLength % 4 !== 0) throw new Error(`Corrupted weight file: ${file}`);
        }

        console.log("🚀 All model files are valid. Attempting to load model...");
        
        // Load TensorFlow.js model
        const loadedModel = await tf.loadLayersModel(MODEL_URL);
        console.log("✅ Model loaded successfully!");
        console.log(loadedModel.summary());
        setModel(loadedModel);
        
      } catch (err) {
        console.error("❌ Model loading error:", err);
        setError(err.message);
      }
    };

    checkModelIntegrity();
  }, []);

  return (
    <div>
      <h1>ASL Translation Page</h1>
      {error ? <p style={{ color: "red" }}>Error: {error}</p> : <p>Loading model...</p>}
    </div>
  );
};

export default Translation;
