import React, { useState, useEffect } from 'react';
import { imageDb } from '../utils/firebase-config';
import { getDownloadURL, listAll, ref, getMetadata } from 'firebase/storage';
import styled from 'styled-components';
import UserNavbar from '../components/UserNavbar';

// Styled components
const PageContainer = styled.div`
  margin-top: 60px; 
  padding: 20px;
  background: black;
  color: #fff;
  font-family: Arial, sans-serif;
  text-align: center;
`;

const QuizContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const QuizImage = styled.img`
  width: 300px;
  height: 200px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const OptionsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const OptionButton = styled.button`
  background-color: #fff;
  color: #000;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ddd;
  }
`;

const App = () => {
  const [files, setFiles] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizOver, setQuizOver] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const listRef = ref(imageDb, 'courses');
        const res = await listAll(listRef);
        const fileUrls = await Promise.all(res.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          return { 
            id: item.name, 
            title: metadata.customMetadata?.title || item.name,
            tags: metadata.customMetadata?.tags || 'No tags available',
            thumbnailUrl: url
          };
        }));

        setFiles(fileUrls);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles(); 
  }, []);

  const handleOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < files.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setQuizOver(true);
    }
  };

  if (files.length === 0) {
    return <PageContainer>Loading quiz...</PageContainer>;
  }

  return (
    <>
      <UserNavbar />
      <PageContainer>
        {quizOver ? (
          <div>
            <h2>Quiz Over!</h2>
            <p>Your score: {score} / {files.length}</p>
          </div>
        ) : (
          <QuizContainer>
            <h2>Question {currentQuestion + 1} / {files.length}</h2>
            <QuizImage src={files[currentQuestion].thumbnailUrl} alt={files[currentQuestion].title} />
            <OptionsContainer>
              {files.map((file, index) => (
                <OptionButton
                  key={index}
                  onClick={() => handleOptionClick(file.id === files[currentQuestion].id)}
                >
                  {file.title}
                </OptionButton>
              ))}
            </OptionsContainer>
          </QuizContainer>
        )}
      </PageContainer>
    </>
  );
};

export default App;

