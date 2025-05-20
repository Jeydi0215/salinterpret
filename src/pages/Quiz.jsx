import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, listAll, ref, getMetadata } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styled from 'styled-components';
import { imageDb, firebaseFirestore } from '../utils/firebase-config';

// Styled components remain the same
const PageContainer = styled.div`
  margin: 0;
  padding: 40px 20px;
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

const QuizHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 12px;
    background: linear-gradient(90deg, #41bfde 0%, #4e7fff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
  }
  
  .quiz-progress {
    display: inline-block;
    padding: 6px 12px;
    background-color: rgba(65, 191, 222, 0.1);
    color: #41bfde;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    margin-top: 5px;
  }
`;

const QuizCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
  overflow-y: auto; /* Allow scrolling if content is too large */
  max-height: 90vh; /* Prevent card from being larger than viewport */
  
  h2 {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 5px;
    color: #e0e0e0;
  }
  
  .question-subtitle {
    color: #b3b3b3;
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    width: 95%;
    max-height: 85vh;
  }
`;

const ImageContainer = styled.div`
  margin-bottom: 30px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 350px; /* Fixed height */
  background-color: #111;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain; /* This preserves aspect ratio */
    border-radius: 12px;
    display: block;
  }
  
  @media (max-width: 768px) {
    height: 250px; /* Smaller fixed height for mobile */
  }
  
  @media (max-width: 480px) {
    height: 200px; /* Even smaller for very small screens */
  }
`;

const AnswerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const AnswerButton = styled.button`
  position: relative;
  padding: 16px 20px;
  background-color: ${props => {
    if (props.correct) return 'rgba(46, 213, 115, 0.2)';
    if (props.wrong) return 'rgba(255, 71, 87, 0.2)';
    if (props.isCorrectAnswer) return 'rgba(46, 213, 115, 0.15)';
    return 'rgba(255, 255, 255, 0.07)';
  }};
  color: ${props => {
    if (props.correct) return '#2ed573';
    if (props.wrong) return '#ff4757';
    if (props.isCorrectAnswer) return '#2ed573';
    return '#e0e0e0';
  }};
  border: 2px solid ${props => {
    if (props.correct) return 'rgba(46, 213, 115, 0.7)';
    if (props.wrong) return 'rgba(255, 71, 87, 0.7)';
    if (props.isCorrectAnswer) return 'rgba(46, 213, 115, 0.5)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 10px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  align-items: center;
  overflow: visible;
  
  &:hover {
    background-color: ${props => props.disabled ? 'inherit' : 'rgba(65, 191, 222, 0.1)'};
    border-color: ${props => props.disabled ? 'inherit' : 'rgba(65, 191, 222, 0.3)'};
    color: ${props => props.disabled ? 'inherit' : '#41bfde'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
  
  &:before {
    content: "";
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 12px;
    background-color: ${props => {
      if (props.correct) return 'rgba(46, 213, 115, 0.3)';
      if (props.wrong) return 'rgba(255, 71, 87, 0.3)';
      if (props.isCorrectAnswer) return 'rgba(46, 213, 115, 0.2)';
      return 'rgba(255, 255, 255, 0.1)';
    }};
    border: 2px solid ${props => {
      if (props.correct) return '#2ed573';
      if (props.wrong) return '#ff4757';
      if (props.isCorrectAnswer) return '#2ed573';
      return 'rgba(255, 255, 255, 0.3)';
    }};
  }
  
  &:after {
    content: ${props => {
      if (props.correct) return '"✓"';
      if (props.wrong) return '"✗"';
      if (props.isCorrectAnswer) return '"✓"';
      return '""';
    }};
    position: absolute;
    right: 20px;
    font-size: ${props => {
      if (props.correct || props.wrong || props.isCorrectAnswer) return '20px';
      return '0';
    }};
    font-weight: bold;
    color: ${props => {
      if (props.correct) return '#2ed573';
      if (props.wrong) return '#ff4757';
      if (props.isCorrectAnswer) return '#2ed573';
      return 'transparent';
    }};
  }
`;

const ResultCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 40px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  
  h2 {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 30px;
    background: linear-gradient(90deg, #41bfde 0%, #4e7fff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .score-container {
    margin: 30px 0;
  }
  
  .score {
    font-size: 54px;
    font-weight: 700;
    color: #41bfde;
    display: block;
    margin-bottom: 10px;
  }
  
  .score-text {
    font-size: 18px;
    color: #b3b3b3;
  }
  
  .message {
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 30px;
    color: #e0e0e0;
    padding: 0 20px;
  }
`;

const ActionButton = styled.button`
  padding: 16px 30px;
  margin: 10px;
  background: ${props => props.primary ? 
    'linear-gradient(90deg, #41bfde 0%, #4e7fff 100%)' : 
    'transparent'};
  color: ${props => props.primary ? '#fff' : '#e0e0e0'};
  border: ${props => props.primary ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  
  ${props => props.primary && `
    box-shadow: 0 6px 20px rgba(65, 191, 222, 0.3);
  `}
  
  &:hover {
    transform: translateY(-3px);
    ${props => props.primary ? 
      'box-shadow: 0 10px 25px rgba(65, 191, 222, 0.4);' : 
      'background-color: rgba(255, 255, 255, 0.1);'}
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 30px;
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 800px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin: 0 auto 40px;
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #41bfde 0%, #4e7fff 100%);
    width: ${props => props.progress || 0}%;
    transition: width 0.5s ease;
  }
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 20px;
  
  .legend-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    background-color: rgba(255, 255, 255, 0.05);
    padding: 8px 12px;
    border-radius: 6px;
  }
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 8px;
  }
  
  .correct-color {
    background-color: rgba(46, 213, 115, 0.4);
    border: 1px solid rgba(46, 213, 115, 0.7);
  }
  
  .wrong-color {
    background-color: rgba(255, 71, 87, 0.4);
    border: 1px solid rgba(255, 71, 87, 0.7);
  }
  
  span {
    color: #e0e0e0;
  }
`;

// Notification component for Firestore status
const Notification = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  background: ${props => props.success ? 'rgba(46, 213, 115, 0.9)' : 'rgba(255, 71, 87, 0.9)'};
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  opacity: 1;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  
  &.fade-out {
    opacity: 0;
  }
  
  .icon {
    margin-right: 10px;
    font-size: 20px;
  }
`;

// Main Quiz Component
const QuizPage = () => {
  // State
  const [state, setState] = useState({
    images: [],
    currentIndex: 0,
    score: 0,
    quizCompleted: false,
    answerChoices: [],
    quizStarted: false,
    selectedAnswer: null,
    showFeedback: false,
    answers: [], // Track user answers for Firestore
    notification: {
      show: false,
      message: '',
      success: true
    },
    quizId: `quiz-${Date.now()}`, // Generate a unique ID for this quiz attempt
    savingToFirestore: false
  });
  
  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const navigate = useNavigate();

  // Check for authenticated user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsUserLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Fetch images and setup quiz
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
        
        // Generate choices for questions
        const choices = generateChoices(shuffled);
        
        setState(prev => ({
          ...prev,
          images: shuffled,
          answerChoices: choices
        }));
      } catch (error) {
        console.error('Error fetching images:', error);
        showNotification('Failed to load quiz content', false);
      }
    };

    fetchImages();
  }, []);

  // Helper function to generate choices for questions
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

  // Notification helper
  const showNotification = (message, success = true) => {
    setState(prev => ({
      ...prev,
      notification: {
        show: true,
        message,
        success
      }
    }));

    // Hide notification after 3 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        notification: {
          ...prev.notification,
          show: false
        }
      }));
    }, 3000);
  };

  // Save quiz results to Firestore
  const saveQuizResults = async () => {
    try {
      setState(prev => ({ ...prev, savingToFirestore: true }));
      
      // Generate anonymous ID for users who aren't logged in
      const anonymousUserId = `anonymous-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare data for Firestore
      const quizData = {
        // Use authenticated user info if available, otherwise use anonymous
        userId: currentUser ? currentUser.uid : anonymousUserId,
        userName: currentUser ? currentUser.displayName || 'User' : 'Anonymous User',
        email: currentUser ? currentUser.email : 'anonymous@example.com',
        timestamp: serverTimestamp(),
        quizId: state.quizId,
        totalQuestions: state.images.length,
        score: state.score,
        percentage: Math.round((state.score / state.images.length) * 100),
        answers: state.answers.map(answer => ({
          questionId: answer.questionId,
          questionTitle: answer.questionTitle,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: answer.correctAnswer,
          isCorrect: answer.isCorrect
        }))
      };

      try {
        // Save to quizResults collection
        const docRef = await addDoc(collection(firebaseFirestore, 'quizResults'), quizData);
        console.log('Quiz results saved with ID:', docRef.id);
        showNotification('Quiz results saved successfully!', true);
        
        // If we have locally saved results, we can clear them now
        if (localStorage.getItem('unsavedQuizResults')) {
          localStorage.removeItem('unsavedQuizResults');
        }
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        
        if (firestoreError.code === 'permission-denied') {
          showNotification('Unable to save to Firestore - please update security rules', false);
          console.log('Quiz data that would be saved:', quizData);
        } else {
          showNotification('Failed to save quiz results: ' + firestoreError.message, false);
        }
      }
    } catch (error) {
      console.error('Error preparing quiz results:', error);
      showNotification('Failed to save quiz results', false);
    } finally {
      setState(prev => ({ ...prev, savingToFirestore: false }));
    }
  };

  // Event Handlers
  const handleAnswer = (selectedChoice) => {
    // Track this answer
    const currentImage = state.images[state.currentIndex];
    const correctAnswer = currentImage.title;
    const isCorrect = selectedChoice === correctAnswer;
    
    // Create an answer record
    const answerRecord = {
      questionId: currentImage.id,
      questionTitle: correctAnswer,
      selectedAnswer: selectedChoice,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect,
      timestamp: new Date().toISOString()
    };
    
    // Show immediate feedback
    setState(prev => ({
      ...prev,
      selectedAnswer: selectedChoice,
      showFeedback: true,
      answers: [...prev.answers, answerRecord]
    }));
    
    // Wait before proceeding
    setTimeout(() => {
      setState(prev => {
        const newScore = isCorrect ? prev.score + 1 : prev.score;
        const nextIndex = prev.currentIndex + 1;
        const completed = nextIndex >= prev.images.length;
        
        // If quiz is completed, save results to Firestore
        if (completed) {
          // We'll call saveQuizResults after state is updated
          setTimeout(() => saveQuizResults(), 0);
        }
        
        return {
          ...prev,
          score: newScore,
          currentIndex: completed ? prev.currentIndex : nextIndex,
          quizCompleted: completed,
          showFeedback: false,
          selectedAnswer: null
        };
      });
    }, 2000);
  };

  const handleStartQuiz = () => {
    setState(prev => ({
      ...prev,
      quizStarted: true
    }));
  };

  const handleReturnToCourses = () => {
    navigate('/courses');
  };

  const handleRetakeQuiz = () => {
    // Generate a new quiz ID for this attempt
    const newQuizId = `quiz-${Date.now()}`;
    
    setState(prev => ({
      ...prev,
      currentIndex: 0,
      score: 0,
      quizCompleted: false,
      answers: [],
      quizId: newQuizId
    }));
  };

  // Helper to get result message
  const getResultMessage = () => {
    const percentage = (state.score / state.images.length) * 100;
    
    if (percentage >= 90) {
      return "Outstanding! You have excellent knowledge of these courses.";
    } else if (percentage >= 70) {
      return "Great job! You have a solid understanding of the material.";
    } else if (percentage >= 50) {
      return "Good effort! You're on the right track with your learning.";
    } else {
      return "Keep practicing! Review the courses to improve your knowledge.";
    }
  };

  // Calculate progress percentage
  const progress = state.images.length > 0 
    ? ((state.currentIndex + 1) / state.images.length) * 100 
    : 0;

  // Render component based on state
  return (
    <PageContainer>
      {state.notification.show && (
        <Notification success={state.notification.success}>
          <span className="icon">{state.notification.success ? '✓' : '✗'}</span>
          {state.notification.message}
        </Notification>
      )}
      
      {!state.quizStarted ? (
        // Welcome screen
        <ResultCard>
          <h2>Course Quiz</h2>
          <p className="message">
            Test your knowledge of the courses you've studied. 
            This quiz contains {state.images.length} questions about the course materials.
            {isUserLoading ? (
              <span style={{ display: 'block', marginTop: '10px' }}>Checking login status...</span>
            ) : currentUser ? (
              <span style={{ display: 'block', marginTop: '10px', color: '#41bfde' }}>
                Logged in as: {currentUser.email}
              </span>
            ) : (
              <span style={{ display: 'block', marginTop: '10px', color: '#ff4757' }}>
                You're not logged in. Results will be saved anonymously.
              </span>
            )}
          </p>
          <ButtonContainer>
            <ActionButton primary onClick={handleStartQuiz}>
              Start Quiz
            </ActionButton>
            <ActionButton onClick={handleReturnToCourses}>
              Back to Courses
            </ActionButton>
          </ButtonContainer>
        </ResultCard>
      ) : state.quizCompleted ? (
        // Completion screen
        <ResultCard>
          <h2>Quiz Completed!</h2>
          <div className="score-container">
            <span className="score">{state.score}/{state.images.length}</span>
            <span className="score-text">Your Score</span>
          </div>
          <p className="message">{getResultMessage()}</p>
          {state.savingToFirestore && (
            <p style={{ color: '#41bfde' }}>Saving your results...</p>
          )}
          <ButtonContainer>
            <ActionButton primary onClick={handleRetakeQuiz}>
              Retake Quiz
            </ActionButton>
            <ActionButton onClick={handleReturnToCourses}>
              Back to Courses
            </ActionButton>
          </ButtonContainer>
        </ResultCard>
      ) : (
        // Quiz questions
        <>
          <QuizHeader>
            <h1>Course Quiz</h1>
            <span className="quiz-progress">Question {state.currentIndex + 1} of {state.images.length}</span>
          </QuizHeader>
          
          <ProgressBar progress={progress}>
            <div className="progress-fill"></div>
          </ProgressBar>
          
          {state.images[state.currentIndex] && (
            <QuizCard>
              <h2>Which course is shown in this image?</h2>
              <p className="question-subtitle">Select the correct title for this course</p>
              <ImageContainer>
                <img 
                  src={state.images[state.currentIndex].thumbnailUrl} 
                  alt={`Question ${state.currentIndex + 1}`} 
                />
              </ImageContainer>
              
              {state.showFeedback && (
                <Legend>
                  <div className="legend-item">
                    <div className="legend-color correct-color"></div>
                    <span>Correct Answer</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color wrong-color"></div>
                    <span>Wrong Answer</span>
                  </div>
                </Legend>
              )}
              
              <AnswerGrid>
                {state.answerChoices[state.currentIndex]?.choices.map((choice, index) => {
                  // Determine button properties
                  const isCorrectAnswer = choice === state.images[state.currentIndex].title;
                  const isSelected = choice === state.selectedAnswer;
                  
                  // Button props
                  const buttonProps = {
                    key: index,
                    onClick: () => !state.showFeedback && handleAnswer(choice),
                    disabled: state.showFeedback,
                    // Use boolean props instead of status string
                    correct: state.showFeedback && isSelected && isCorrectAnswer,
                    wrong: state.showFeedback && isSelected && !isCorrectAnswer,
                    isCorrectAnswer: state.showFeedback && isCorrectAnswer && !isSelected
                  };
                  
                  return (
                    <AnswerButton {...buttonProps}>
                      {choice}
                    </AnswerButton>
                  );
                })}
              </AnswerGrid>
            </QuizCard>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default QuizPage;
