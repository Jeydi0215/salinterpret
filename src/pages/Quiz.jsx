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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ImageContainer = styled.div`
  margin-bottom: 20px;

  img {
    width: 80%;
    max-width: 500px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
`;

const AnswerButton = styled.button`
  padding: 15px 30px;
  margin: 10px;
  background-color: ${({ isCorrect, isSelected, highlightCorrect }) =>
    isSelected
      ? isCorrect
        ? 'green' // Correct answer selected
        : 'red' // Wrong answer selected
      : highlightCorrect
      ? 'orange' // Highlight correct answer after wrong choice
      : '#444'}; // Default background
  color: #fff;
  border: 2px solid #555;
  border-radius: 5px;
  cursor: ${({ isSelected }) => (isSelected ? 'not-allowed' : 'pointer')};
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: ${({ isSelected, highlightCorrect }) =>
      isSelected ? '#555' : highlightCorrect ? 'orange' : '#666'};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ProgressBarContainer = styled.div`
  width: 80%;
  max-width: 600px;
  margin: 20px auto;
  height: 20px;
  background: #333;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

const ProgressBar = styled.div`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: linear-gradient(90deg, #ff5722, #ff9800);
  transition: width 0.4s ease;
`;

const ScoreDisplay = styled.div`
  margin: 20px 0;
  font-size: 18px;
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const QuizButtonContainer = styled.div`
  display: flex;
  justify-content: center;
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

        // Filter images where title starts with an alphabet (A-Z)
        const filteredImages = fileUrls.filter((image) => /^[a-zA-Z]/.test(image.title));

        const shuffled = filteredImages.sort(() => 0.5 - Math.random()).slice(0, 7);
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

      const choices = [image.title, ...incorrectChoices].sort(() => 0.5 - Math.random());
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
        if (score >= 5) {
          setQuizCompleted(true);
        } else {
          alert('You need at least 5 points to move to the next course!');
          resetQuiz();
        }
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setHighlightCorrect(false);
    setQuizCompleted(false);
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
            <AnswerButton onClick={handleReturnToCourses}>
              Return to Courses
            </AnswerButton>
          </QuizButtonContainer>
        </>
      ) : (
        <>
          <h2>Question {currentIndex + 1}</h2>
          <ProgressBarContainer>
            <ProgressBar progress={((currentIndex + 1) / images.length) * 100} />
          </ProgressBarContainer>
          <ScoreDisplay>Score: {score}</ScoreDisplay>
          {images[currentIndex] && (
            <>
              <ImageContainer>
                <img src={images[currentIndex].thumbnailUrl} alt={`Question ${currentIndex + 1}`} />
              </ImageContainer>
              <div>
                {answerChoices[currentIndex]?.choices.map((choice, index) => (
                  <AnswerButton
                    key={index}
                    onClick={() => handleAnswer(choice)}
                    isSelected={selectedAnswer === choice}
                    isCorrect={choice === images[currentIndex]?.title}
                    highlightCorrect={highlightCorrect && choice === images[currentIndex]?.title}
                  >
                    {choice}
                  </AnswerButton>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </QuizContainer>
  );
};

export default QuizPage;
