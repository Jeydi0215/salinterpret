import React from 'react';
import background from "../assets/login.jpg";
import styled from "styled-components";

export default function BackgroundImage() {
   
  return (
    <Container>
      <BackgroundImg src={background} alt="Background" />
    </Container>
  )
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
`;

const BackgroundImg = styled.img`
  height: 100%;
  width: 100%;
  object-fit: cover; 
`;

