import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import largeImage from '../assets/start.jpg';
import Login from './Login';
import Signup from './Signup';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background-color: #000; 
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 70vh; 
  background-image: url(${largeImage});
  background-size: cover;
  background-position: center;
`;

const Content = styled.div`
  text-align: center;
  color: white;
  padding: 20px;
  width: 100%;
`;

const Header = styled.header`
  width: 100%;
  background-color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0 20px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ButtonLink = styled(Link)`
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  text-decoration: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #555;
  }
`;

const Section = styled.section`
  width: 100%;
  padding: 50px 20px;
  text-align: center;
`;

const Footer = styled.footer`
  width: 100%;
  background-color: #333;
  color: white;
  padding: 20px 0;
`;

const App = () => {
  const [activeLink, setActiveLink] = useState(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToRef = (ref) => {
    window.scrollTo({
      top: ref.current.offsetTop - 50, 
      behavior: 'smooth'
    });
  };

  return (
    <Container>
      <Header>
        <Nav>
          <NavLink onClick={() => scrollToRef(aboutRef)}>About Salinterpret</NavLink>
          <NavLink onClick={() => scrollToRef(servicesRef)}>About Us</NavLink>
          <NavLink onClick={() => scrollToRef(contactRef)}>Contact</NavLink>
        </Nav>
        <ButtonContainer>
          <ButtonLink to="/login">Login</ButtonLink>
          <ButtonLink to="/signup">Sign Up</ButtonLink>
        </ButtonContainer>
      </Header>
      <ImageContainer />
      <Content>
        <Section ref={aboutRef}>
          <h2 className='title'>About Salinterpret</h2>
          <p className='text'>Salinterpret emerges as an innovative project aimed at bridging the communication gap between the hearing impaired, the ASL community, and the broader non-hearing-impaired population. This project is fueled by the urgent need to overcome communication barriers that hinder full participation and inclusivity in various social settings</p>
        </Section>
        <Section ref={servicesRef}>
          <h2 className='title'>About the team</h2>
          <p className='text'>The team Numbros consists of three members, namely Justine Dimalanta, Lara Jane Acar, and Jerson Mamangun.</p>
        </Section>
        <Section ref={contactRef}>
          <h2 className='title'>Contact</h2>
          <p className='text'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae ex non libero interdum dapibus eget vitae elit.</p>
        </Section>
      </Content>
      <Footer>
        <p>&copy; Numbros 2024</p>
      </Footer>
    </Container>
  );
};

export default App;
