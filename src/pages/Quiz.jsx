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

const AnswerButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #555;
  }
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
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
            thumbnailUrl: url,
          };
        }));

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
    // Extract titles from images
    const titles = imageList.map(image => image.title);

    // Generate choices for each question
    return imageList.map(image => {
      // Get 3 random incorrect choices
      const incorrectChoices = titles.filter(title => title !== image.title)
                                     .sort(() => 0.5 - Math.random())
                                     .slice(0, 3);

      // Combine the correct choice with incorrect choices and shuffle
      const choices = [image.title, ...incorrectChoices].sort(() => 0.5 - Math.random());
      return { image, choices };
    });
  };

  const handleAnswer = (selectedAnswer) => {
    if (selectedAnswer === images[currentIndex]?.title) {
      setScore(score + 1);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < images.length) {
      setCurrentIndex(nextIndex);
    } else {
      setQuizCompleted(true);
    }
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
          {images[currentIndex] && (
            <>
              <ImageContainer>
                <img src={images[currentIndex].thumbnailUrl} alt={`Question ${currentIndex + 1}`} />
              </ImageContainer>
              <div>
                {answerChoices[currentIndex]?.choices.map((choice, index) => (
                  <AnswerButton key={index} onClick={() => handleAnswer(choice)}>
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
