import React from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import ASL from '../assets/logo.png';
import BackgroundImage from '../assets/lopit.png';
import KaliwaLogo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import Hacker from '../assets/Hacker.png';
import Hispter from '../assets/Hipster.png';
import Member from '../assets/Member.png';
import Mentor from '../assets/Mentor.png';

// Smooth scroll function
const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

// Navbar Component
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <NavContainer>
      <BackgroundBlur />
      <Nav>
        <Logo>
          <img src={ASL} alt="Logo" />
          Salinterpret
        </Logo>
        <NavMenu>
          <NavItem onClick={() => scrollToSection('about')}>About</NavItem>
          <NavItem onClick={() => scrollToSection('pricing')}>Pricing</NavItem>
          <NavItem onClick={() => scrollToSection('features')}>Features</NavItem>
          <NavItem onClick={() => scrollToSection('contact')}>Contact</NavItem>
        </NavMenu>
        <NavActions>
          <SignInButton onClick={() => navigate('/login')}>Sign In</SignInButton>
          <MenuIcon />
        </NavActions>
      </Nav>

      <HeroSection>
        <LeftSection>
          <Title>Welcome!</Title>
          <ButtonContainer>
            <FreeTrialButton>Free Trial</FreeTrialButton>
            <SeeMoreButton>See More</SeeMoreButton>
          </ButtonContainer>
        </LeftSection>
        <RightSection>
          <LogoWrapper>
            <KaliwaLogoImg src={KaliwaLogo} alt="Kaliwa Logo" />
          </LogoWrapper>
          <HeroTextContainer>
            <Description>Salinterpret</Description>
            <Text>
              A web application that translates American Sign Language (ASL) into text in real-time. Using advanced computer vision technology, Salinterpret bridges the communication gap between the ASL community and non-signers, fostering inclusivity and understanding. Communicate easily and connect without barriers. 🌐✋🗨️
            </Text>
          </HeroTextContainer>
        </RightSection>
      </HeroSection>
    </NavContainer>
  );
};

// Sections
const Section = styled.section`
  height: 100vh;
  color: white;
  padding: 100px 50px;
  scroll-snap-align: start;
`;

const AboutSection = () => {
  const { ref: sectionRef, inView } = useInView({ triggerOnce: true });

  return (
    <Section id="about" ref={sectionRef}>
      <h2>About Us</h2>
      <ImagesContainer>
        <ImageWrapper className={inView ? 'in-view' : ''}>
          <img src={Hacker} alt="" />
        </ImageWrapper>
        <ImageWrapper className={inView ? 'in-view' : ''}>
        <img src={Hispter} alt="" />
        </ImageWrapper>
        <ImageWrapper className={inView ? 'in-view' : ''}>
        <img src={Member} alt="" />
        </ImageWrapper>
        <ImageWrapper className={inView ? 'in-view' : ''}>
        <img src={Mentor} alt="" />
        </ImageWrapper>
      </ImagesContainer>
      <p>Salinterpret is dedicated to bridging communication gaps...</p>
    </Section>
  );
};

const PricingSection = () => (
  <Section id="pricing">
    <h2>Pricing</h2>
    <p>Choose a pricing plan that suits your needs...</p>
  </Section>
);

const FeaturesSection = () => (
  <Section id="features">
    <h2>Features</h2>
    <p>Explore the features of Salinterpret...</p>
  </Section>
);

const ContactSection = () => (
  <Section id="contact">
    <h2>Contact Us</h2>
    <p>Have questions or feedback? Reach out to us...</p>
  </Section>
);

// Styles
const NavContainer = styled.div`
  position: relative;
  height: 100vh;
  overflow: auto;
  position:sticky;
  scroll-snap-type: y mandatory;
`;

const BackgroundBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url(${BackgroundImage}) no-repeat center center/cover;
  filter: blur(3px);
  z-index: -1;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  color: white;
  position: absolute;
  width: 100%;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  img {
    width: 40px;
    margin-right: 10px;
  }
`;

const NavMenu = styled.ul`
  display: flex;
  list-style: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.li`
  margin: 0 20px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    color: yellow;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
`;

const SignInButton = styled.button`
  background: #4b37d4;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  margin-right: 20px;
  transition: background 0.3s ease;

  &:hover {
    background: #3a2ba0;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuIcon = styled(FaBars)`
  display: none;
  cursor: pointer;
  font-size: 24px;

  @media (max-width: 768px) {
    display: block;
  }
`;

const HeroSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  padding: 0 100px;
  position: relative;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const HeroTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const LogoWrapper = styled.div`
  margin-bottom: 20px;
`;

const KaliwaLogoImg = styled.img`
  width: 200px;
`;

const Title = styled.h1`
  font-size: 64px;
  margin-bottom: 20px;
`;

const Description = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Text = styled.p`
  font-size: 18px;
  max-width: 600px;
  margin-bottom: 40px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const FreeTrialButton = styled.button`
  background: #00aaff;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s ease;

  &:hover {
    background: #008ecc;
  }
`;

const SeeMoreButton = styled.button`
  background: transparent;
  color: white;
  border: 2px solid white;
  padding: 15px 30px;
  font-size: 18px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ImagesContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  align-items: center; 
  justify-content: center; 
  flex-wrap: wrap; 
  width: 100%; 
`;

const ImageWrapper = styled.div`
  opacity: 0;
  transition: opacity 1s ease, transform 1s ease;
  transform: translateY(50px);
  

  &.in-view {
    opacity: 1;
    transform: translateY(0);
  }

  img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 55%;
  }
`;

const App = () => {
  return (
    <>
      <Navbar />
      <AboutSection />
      <PricingSection />
      <FeaturesSection />
      <ContactSection />
    </>
  );
};

export default App;
