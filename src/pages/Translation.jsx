import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/UserNavbar';

const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  height: 100vh;
`;

const TranslationImage = styled.img`
  width: 80%;
  height: 50vh;
  margin-top: 15vh;
  object-fit: cover;
  background-color: black;
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

const ClearAllButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #ff4d4d;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #ff1a1a;
  }
`;

function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/UserNavbar';

const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  height: 100vh;
`;

const TranslationImage = styled.img`
  width: 80%;
  height: 50vh;
  margin-top: 15vh;
  object-fit: cover;
  background-color: black;
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

const ClearAllButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #ff4d4d;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #ff1a1a;
  }
`;

function ASLTranslationPage() {
  const [translation, setTranslation] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/translate', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const data = await response.json();
        setImage(`data:image/jpeg;base64,${data.img}`);
        if (data.translation !== '') {
          setTranslation((prevTranslation) => prevTranslation + data.translation);
        }
      } catch (error) {
        console.error('Error fetching translation:', error.message);
      }
    };

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleClearTranslation = () => {
    setTranslation((prevTranslation) => prevTranslation.slice(0, -1));
  };

  const handleClearAllTranslation = () => {
    setTranslation('');
  };

  return (
    <TranslationContainer>
      <Navbar />
      {image && <TranslationImage src={image} alt="Camera feed" />}
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      {translation && (
        <>
          <ClearButton onClick={handleClearTranslation}>Delete Last Letter</ClearButton>
          <ClearAllButton onClick={handleClearAllTranslation}>Delete All</ClearAllButton>
        </>
      )}
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera (handled by the backend).</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app for now only translates the alphabet.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const data = await response.json();
        setImage(`data:image/jpeg;base64,${data.img}`);
        if (data.translation !== '') {
          setTranslation((prevTranslation) => prevTranslation + data.translation);
        }
      } catch (error) {
        console.error('Error fetching translation:', error.message);
      }
    };

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleClearTranslation = () => {
    setTranslation((prevTranslation) => prevTranslation.slice(0, -1));
  };

  const handleClearAllTranslation = () => {
    setTranslation('');
  };

  return (
    <TranslationContainer>
      <Navbar />
      {image && <TranslationImage src={image} alt="Camera feed" />}
      <TranslationText>
        <h2>Translation:</h2>
        <p>{translation}</p>
      </TranslationText>
      {translation && (
        <>
          <ClearButton onClick={handleClearTranslation}>Delete Last Letter</ClearButton>
          <ClearAllButton onClick={handleClearAllTranslation}>Delete All</ClearAllButton>
        </>
      )}
      <Instructions>
        <h2>Instructions:</h2>
        <p>1. Place your hand in front of the camera (handled by the backend).</p>
        <p>2. Wait for the translation to appear.</p>
        <p>Note: This app for now only translates the alphabet.</p>
      </Instructions>
    </TranslationContainer>
  );
}

export default ASLTranslationPage;
