// TranslationPage.js
import React, { useState } from 'react';
import axios from 'axios';

const TranslationPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [translation, setTranslation] = useState('');
  const [translatedImage, setTranslatedImage] = useState('');

  // Handle file input change
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Submit the image to the Flask server
  const handleTranslate = async () => {
    if (!selectedFile) {
      alert("Please select an image file first.");
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:5000/translate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setTranslation(response.data.translation);
      setTranslatedImage(`data:image/jpeg;base64,${response.data.img}`);
    } catch (error) {
      console.error("Error translating image:", error);
      alert("There was an error translating the image.");
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>ASL Translation</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleTranslate} style={{ marginLeft: '10px' }}>Translate</button>

      {translation && (
        <div style={{ marginTop: '20px' }}>
          <h3>Translation:</h3>
          <p>{translation}</p>
        </div>
      )}

      {translatedImage && (
        <div style={{ marginTop: '20px' }}>
          <h3>Processed Image:</h3>
          <img src={translatedImage} alt="Translated ASL" style={{ maxWidth: '300px', maxHeight: '300px' }} />
        </div>
      )}
    </div>
  );
};

export default TranslationPage;
