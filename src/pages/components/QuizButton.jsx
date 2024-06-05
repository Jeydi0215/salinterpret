import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const QuizButton = ({ navigateTo, children }) => {
  return (
    <Link to={navigateTo}>
      <Button>{children}</Button>
    </Link>
  );
};

const Button = styled.button`
  width: 200px;
  padding: 15px;
  font-size: 18px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5%;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 10px auto; 
  display: block;
  
  @media (min-width: 768px) {
  
    margin: 10px auto; 
    display: block; 
  }
`;

export default QuizButton;
