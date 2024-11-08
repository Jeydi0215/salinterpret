import React, { useState } from 'react';
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
import { Analytics } from "@vercel/analytics/react";

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

const Navbar = ({ onSeeMoreClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Analytics />
    <NavContainer>
      <BackgroundBlur />
      <Nav>
        <Logo>
          <img src={ASL} alt="Logo" />
          Salinterpret
        </Logo>
        <NavMenu className={menuOpen ? 'open' : ''}>
          <NavItem onClick={() => scrollToSection('about')}>About</NavItem>
          <NavItem onClick={() => scrollToSection('pricing')}>Pricing</NavItem>
          <NavItem onClick={() => scrollToSection('features')}>Features</NavItem>
          <NavItem onClick={() => scrollToSection('contact')}>Contact</NavItem>
        </NavMenu>
        <NavActions>
          <MenuIcon onClick={handleMenuToggle} />
        </NavActions>
      </Nav>

      <HeroSection>
        <LeftSection>
          <Title>Welcome!</Title>
          <ButtonContainer>
            <FreeTrialButton onClick={() => navigate('/login')}>Sign In</FreeTrialButton>
            <SeeMoreButton onClick={onSeeMoreClick}>See More</SeeMoreButton>
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
      <p><strong><i>Meet the Team Numbros: The Team Behind Salinterpret </i></strong></p>
      <p>
        <ul>
          <li>Justine Dimalanta: Hacker & Hustler, leading technical development</li>
          <li>Lara Jane Acar: Hipster, designing an intuitive user experience.</li>
          <li>Jerson Mamangun: Co-Hacker, refining the app’s performance.</li>
          <li>Mr. Chris Allen Pineda: Project Adviser, guiding our mission.</li>
        </ul>
      </p>
    </Section>
  );
};

const PricingSection = () => (
  <Section id="pricing">
    <p style={{ fontSize: '28px' }}> <strong>Surprise!!! </strong></p>
    <p>
      Salinterpret is a free web app designed to bridge communication gaps. Our app offers essential features without any cost, ensuring that you have access to real-time translation and sign-to-word language features at no charge. You just need to have mobile data to access the app. Whether you're looking to communicate with the hearing-impaired or enhance your own understanding, Salinterpret is here to support you without any fees. Explore our features and experience the power of inclusive communication today!
    </p>
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

const Popup = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <PopupOverlay>
      <PopupContainer>
        <CloseButton onClick={onClose}>Close</CloseButton>
        <h2>Salinterpret</h2>
        <p>We're on a mission to connect hearing-impaired and non-hearing-impaired communities like never before. With Salinterpret, sign language transforms into words, making communication effortless and inclusive. Dive into our ASL courses, tutorials, and fun interactive games that make learning exciting and accessible for everyone.
        Join us in building a world where everyone can connect and understand each other, one sign at a time! ✋💬</p>
      </PopupContainer>
    </PopupOverlay>
  );
};

// Styles
const NavContainer = styled.div`
  position: relative;
  height: 100vh;
  overflow: auto;
  position: sticky;
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

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  &.open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 60px;
    right: 20px;
    background: white;
    color: black;
    padding: 10px;
    border-radius: 5px;
  }

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

  @media (max-width: 768px) {
    font-size: 14px;
    margin: 10px 0;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    .sign-in-button {
      display: none;
    }
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

const MobileNavMenu = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: absolute;
    top: 60px;
    right: 20px;
    background: white;
    color: black;
    padding: 10px;
    border-radius: 5px;
  }
`;

const HeroSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  padding: 0 100px;
  position: relative;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 0 20px;
    flex-direction: column;
    text-align: center;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  max-width: 500px;
`;

const Title = styled.h1`
  font-size: 60px;
  font-weight: 700;
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FreeTrialButton = styled.button`
  font-size: 20px;
  padding: 15px 40px;
  border-radius: 5px;
  background-color: yellow;
  color: black;
  cursor: pointer;
  margin-right: 20px;

  @media (max-width: 768px) {
    margin: 10px 0;
  }
`;

const SeeMoreButton = styled.button`
  font-size: 20px;
  padding: 15px 40px;
  border-radius: 5px;
  background-color: transparent;
  color: yellow;
  cursor: pointer;
`;

const RightSection = styled.div`
  flex: 1;
  max-width: 500px;
  text-align: center;
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const KaliwaLogoImg = styled.img`
  width: 150px;
`;

const HeroTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Description = styled.p`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
`;

const Text = styled.p`
  font-size: 18px;
  line-height: 1.5;
  color: #fff;
  max-width: 800px;
  margin-top: 20px;
`;

const Section = styled.section`
  padding: 80px 20px;
  text-align: center;
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopupContainer = styled.div`
  background: white;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  background: red;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
`;

const ImagesContainer = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const ImageWrapper = styled.div`
  width: 200px;
  margin: 20px;
  img {
    width: 100%;
    height: auto;
  }

  &.in-view {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  }
`;
