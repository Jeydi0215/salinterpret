import React, { useState, useEffect } from "react";
import styled from "styled-components";

const QuizContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f7f7f7;
  height: 100vh;
  font-family: Arial, sans-serif;
`;

const Timer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: purple;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Question = styled.h1`
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const MediaContainer = styled.div`
  width: 80%;
  max-width: 500px;
  height: 200px;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border-radius: 8px;

  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const AnswerOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 80%;
  max-width: 500px;
`;

const AnswerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${({ color }) => color || "#333"};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  &:hover {
    opacity: 0.9;
  }
`;

const QuizPage = () => {
  const [questions] = useState([
    {
      question: "When did the first cornea transplant take place?",
      media: null, // Add media URL if needed
      options: [
        { text: "1888", isCorrect: false, color: "red" },
        { text: "1905", isCorrect: true, color: "blue" },
        { text: "1912", isCorrect: false, color: "orange" },
        { text: "1942", isCorrect: false, color: "green" },
      ],
    },
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timer, setTimer] = useState(20);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    setTimeout(() => {
      setSelectedAnswer(null);
      setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
      setTimer(20);
    }, 2000);
  };

  const getButtonColor = (option) => {
    if (selectedAnswer) {
      if (option.isCorrect) return "green";
      if (option === selectedAnswer) return "red";
    }
    return option.color;
  };

  return (
    <QuizContainer>
      <Timer>{timer}</Timer>
      <Question>{currentQuestion.question}</Question>
      <MediaContainer>
        {currentQuestion.media ? (
          <img src={currentQuestion.media} alt="Question Media" />
        ) : (
          <p>Kahoot!</p>
        )}
      </MediaContainer>
      <AnswerOptions>
        {currentQuestion.options.map((option, index) => (
          <AnswerButton
            key={index}
            color={getButtonColor(option)}
            onClick={() => handleAnswerClick(option)}
            disabled={!!selectedAnswer}
          >
            {option.text}
          </AnswerButton>
        ))}
      </AnswerOptions>
    </QuizContainer>
  );
};

export default QuizPage;
