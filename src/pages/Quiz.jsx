import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, listAll, ref, getMetadata } from 'firebase/storage';
import styled from 'styled-components';
import { imageDb } from '../utils/firebase-config';

// Styled components
const QuizContainer = styled.div`
  margin-top: 60px;
  padding: 20px;
  background: black;
  color: #fff;
  font-family: Arial, sans-serif;
  text-align: center;
`;

const ImageContainer = styled.div`
  margin-bottom: 20px;

  img {
    width: 80%;
    max-width: 500px;
    border-radius: 8px;
  }
`;

const KahootButton = styled.button`
  width: 45%;
  padding: 15px;
  margin: 10px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: ${({ isSelected }) => (isSelected ? 'not-allowed' : 'pointer')};
  background-color: ${({ color }) => color};
  box-shadow: ${({ isSelected }) =>
    isSelected ? '0 0 10px rgba(0, 255, 0, 0.8)' : '0 4px 6px rgba(0, 0, 0, 0.2)'};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ isSelected, color }) =>
      isSelected ? color : 'rgba(255, 255, 255, 0.7)'};
  }
`;

const QuizButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const QuizPage = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answerChoices, setAnswerChoices] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [highlightCorrect, setHighlightCorrect] = useState(false);
  const navigate = useNavigate();

  const buttonColors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50']; // Red, Blue, Yellow, Green

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const listRef = ref(imageDb, 'courses');
        const res = await listAll(listRef);
        const fileUrls = await Promise.all(
          res.items.map(async (item) => {
            const url = await getDownloadURL(item);
            const metadata = await getMetadata(item);
            return {
              id: item.name,
              title: metadata.customMetadata?.title || item.name,
              tags: metadata.customMetadata?.tags || 'No tags available',
              thumbnailUrl: url,
            };
          })
        );

        // Shuffle and select 7 random images
        const shuffled = fileUrls.sort(() => 0.5 - Math.random()).slice(0, 7);
        setImages(shuffled);
        setAnswerChoices(generateChoices(shuffled));
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const generateChoices = (imageList) => {
    const titles = imageList.map((image) => image.title);

    return imageList.map((image) => {
      const incorrectChoices = titles
        .filter((title) => title !== image.title)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const choices = [image.title, ...incorrectChoices].sort(
        () => 0.5 - Math.random()
      );
      return { image, choices };
    });
  };

  const handleAnswer = (selectedAnswer) => {
    setSelectedAnswer(selectedAnswer);

    if (selectedAnswer === images[currentIndex]?.title) {
      setScore(score + 1);
    } else {
      setHighlightCorrect(true);
    }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < images.length) {
        setCurrentIndex(nextIndex);
        setSelectedAnswer(null);
        setHighlightCorrect(false);
      } else {
        setQuizCompleted(true);
      }
    }, 2000);
  };

  const handleReturnToCourses = () => {
    navigate('/courses');
  };

  return (
    <QuizContainer>
      {quizCompleted ? (
        <>
          <h2>Quiz Completed!</h2>
          <p>Your score: {score} out of {images.length}</p>
          <QuizButtonContainer>
            <KahootButton onClick={handleReturnToCourses} color="#333">
              Return to Courses
            </KahootButton>
          </QuizButtonContainer>
        </>
      ) : (
        <>
          <h2>Question {currentIndex + 1}</h2>
          {images[currentIndex] && (
            <>
              <ImageContainer>
                <img src={images[currentIndex].thumbnailUrl} alt={`Question ${currentIndex + 1}`} />
              </ImageContainer>
              <QuizButtonContainer>
                {answerChoices[currentIndex]?.choices.map((choice, index) => (
                  <KahootButton
                    key={index}
                    onClick={() => handleAnswer(choice)}
                    isSelected={selectedAnswer === choice}
                    color={buttonColors[index % buttonColors.length]}
                  >
                    {choice}
                  </KahootButton>
                ))}
              </QuizButtonContainer>
            </>
          )}
        </>
      )}
    </QuizContainer>
  );
};

export default QuizPage;
