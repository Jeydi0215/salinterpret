import React, { useState } from 'react';
import styled from 'styled-components';
import backgroundImg from '../assets/login.jpg';
import { useNavigate } from 'react-router-dom';
import A from '../assets/A.png';
import B from '../assets/B.png';
import L from '../assets/L.JPG';
import K from '../assets/K.png';
import R from '../assets/R.png';

// ScorePopup component
const ScorePopup = ({ score, totalQuestions }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/courses');
  };

  return (
    <PopupOverlay>
      <PopupContainer>
        <PopupContent>
          <h2>Quiz Completed!</h2>
          <p>Your score: {score} out of {totalQuestions}</p>
          <CloseButton onClick={handleClose}>Close</CloseButton>
        </PopupContent>
      </PopupContainer>
    </PopupOverlay>
  );
};

// QuizPage component
const QuizPage = () => {
  const quizTitle = "Quiz Time";
  const initialQuestions = [
    {
      questionImage: A,
      answerOptions: [
        { option: "A", visible: true },
        { option: "R", visible: true },
        { option: "T", visible: true },
        { option: "E", visible: true }
      ],
      correctAnswer: "A"
    },
    {
      questionImage: B,
      answerOptions: [
        { option: "E", visible: true },
        { option: "Z", visible: true },
        { option: "B", visible: true },
        { option: "Y", visible: true }
      ],
      correctAnswer: "B"
    },
    {
      questionImage: L,
      answerOptions: [
        { option: "Z", visible: true },
        { option: "O", visible: true },
        { option: "L", visible: true },
        { option: "R", visible: true }
      ],
      correctAnswer: "L"
    },
    {
      questionImage: K,
      answerOptions: [
        { option: "E", visible: true },
        { option: "C", visible: true },
        { option: "K", visible: true },
        { option: "A", visible: true }
      ],
      correctAnswer: "K"
    },
    {
      questionImage: R,
      answerOptions: [
        { option: "R", visible: true },
        { option: "M", visible: true },
        { option: "W", visible: true },
        { option: "Q", visible: true }
      ],
      correctAnswer: "R"
    }
  ];
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false); // State to track if quiz is completed
  const navigate = useNavigate();

  const handleAnswerSelect = (selectedAnswer) => {
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    
    // Move to the next question
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setQuizCompleted(true); // Set quizCompleted to true when all questions are answered
    }
  };

  return (
    <BackgroundContainer>
      <QuizContainer>
        <Header>{quizTitle}</Header>
        {currentQuestionIndex < questions.length && (
          <>
            <QuestionContainer>
              <QuestionImage src={questions[currentQuestionIndex].questionImage} alt="Question" />
            </QuestionContainer>
          </>
        )}
      </QuizContainer>
      <OptionsContainer>
        {currentQuestionIndex < questions.length && (
          <>
            {questions[currentQuestionIndex].answerOptions.map((option, index) => (
              <Option key={index} onClick={() => handleAnswerSelect(option.option)}>
                {option.option}
              </Option>
            ))}
          </>
        )}
      </OptionsContainer>
      {quizCompleted && ( // Render ScorePopup when quizCompleted is true
        <ScorePopup score={score} totalQuestions={questions.length} />
      )}
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled.div`
  background-image: url(${backgroundImg});
  background-size: cover; 
  min-height: 100vh; 
  display: flex;
  flex-direction: column;
`;

const QuizContainer = styled.div`
  flex: 1; 
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Header = styled.h1`
  text-align: center;
`;

const QuestionContainer = styled.div`
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

const QuestionImage = styled.img`
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 20px;
`;

const Option = styled.div`
  padding: 20px;
  background-color: #fff;
  color: #000;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 10px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopupContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const PopupContent = styled.div`
  text-align: center;
  color:black;
`;

const CloseButton = styled.button`
  background-color: #ff6347;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff473d;
  }
`;

export default QuizPage;
