import React, { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

const TranslationPage = () => {
  const [model, setModel] = useState(null);
  const [status, setStatus] = useState("Loading model...");

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Fetching model...");
        const loadedModel = await tf.loadLayersModel("/model.json");
        console.log("Model loaded successfully:", loadedModel.summary());
        setModel(loadedModel);
        setStatus("Model loaded successfully!");
      } catch (error) {
        console.error("Error loading model:", error);
        setStatus(`Error loading model: ${error.message}`);
      }
    };

    loadModel();
  }, []);

  const testPrediction = () => {
    if (!model) {
      console.error("Model is not loaded.");
      return;
    }

    // Create a dummy input matching the model's expected input shape (224x224x3)
    const inputTensor = tf.randomNormal([1, 224, 224, 3]);

    try {
      const prediction = model.predict(inputTensor);
      console.log("Prediction output:", prediction.arraySync());
      setStatus("Prediction successful! Check console.");
    } catch (error) {
      console.error("Error running prediction:", error);
      setStatus(`Prediction error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>ASL Translation Page</h2>
      <p>Status: {status}</p>
      <button onClick={testPrediction} disabled={!model}>
        Run Test Prediction
      </button>
    </div>
  );
};

export default TranslationPage;
