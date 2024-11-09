import React, { useState } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import ASL from '../assets/logo.png';
import BackgroundImage from '../assets/lopit.png';
import KaliwaLogo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import Hacker from '../assets/Hacker.png';
import Hipster from '../assets/Hipster.png';
import Member from '../assets/Member.png';
import Mentor from '../assets/Mentor.png';
import { Analytics } from '@vercel/analytics/react';

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

const Navbar = ({ onSeeMoreClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleFreeTrialClick = () => {
    if (!isAgreed) {
      setIsPopupVisible(true);
    } else {
      navigate('/login');
    }
  };

  const handleAgreeAndClose = () => {
    setIsAgreed(true);
    setIsPopupVisible(false);
    navigate('/login');
  };

  return (
    <>
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
              <FreeTrialButton onClick={handleFreeTrialClick}>Start Now!</FreeTrialButton>
              
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

      <AboutSection />
      <PricingSection />
      <FeaturesSection />
      <ContactSection />

      {isPopupVisible && (
        <PopupOverlay>
          <PopupContainer>
            <h2>Terms and Conditions</h2>
            <p>
            Welcome to Salinterpret! By accessing or using Salinterpret, a web-based sign language translation app, you agree to be bound by these Terms and Conditions. Please read them carefully. If you do not agree with these Terms, please do not use Salinterpret. You confirm that you are at least 18 years old, or you have parental/guardian permission if younger. Account registration may be required for certain features, and you are responsible for keeping your account details secure and notifying us of any unauthorized use. You agree to provide accurate information when using the app, and you may not misuse Salinterpret, interfere with its functionality, or engage in unlawful activities.

Salinterpret values your privacy, and by using the app, you consent to the collection and use of your data as outlined in our Privacy Policy. All content, design, and code in Salinterpret are the intellectual property of Numbros, protected by copyright and trademark laws. Duplication, distribution, or use of our content without permission is prohibited. Salinterpret is provided “as is” without any warranties, express or implied. We do not guarantee error-free, secure, or uninterrupted operation and cannot ensure translation accuracy. Salinterpret will not be liable for damages arising from your use or inability to use the app.

These Terms may be updated from time to time, and your continued use of Salinterpret following changes signifies your acceptance. These Terms are governed by the laws, and any disputes will fall under the exclusive jurisdiction of the court. If you have questions, please contact us at salinterpretasl@gmail.com. Thank you for choosing Salinterpret!
            </p>
            <CheckboxContainer>
              <input type="checkbox" id="termsCheckbox" checked={isAgreed} onChange={() => setIsAgreed(!isAgreed)} />
              <label htmlFor="termsCheckbox">I agree to the Terms and Conditions</label>
            </CheckboxContainer>
            <PopupButton onClick={handleAgreeAndClose}>Agree and Continue</PopupButton>
            <CloseButton onClick={() => setIsPopupVisible(false)}>Close</CloseButton>
          </PopupContainer>
        </PopupOverlay>
      )}
    </>
  );
};

// Sections
const AboutSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Section id="about" ref={ref}>
      <h2>About Us</h2>
      <ImagesContainer>
        <ImageWrapper className={inView ? 'in-view' : ''}>
          <img src={Hacker} alt="Hacker" />
        </ImageWrapper>
        <ImageWrapper className={inView ? 'in-view' : ''}>
          <img src={Hipster} alt="Hipster" />
        </ImageWrapper>
        <ImageWrapper className={inView ? 'in-view' : ''}>
          <img src={Member} alt="Member" />
        </ImageWrapper>
        <ImageWrapper className={inView ? 'in-view' : ''}>
          <img src={Mentor} alt="Mentor" />
        </ImageWrapper>
      </ImagesContainer>
      <p><strong><i>Meet the Team Numbros: The Team Behind Salinterpret</i></strong></p>
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
    <h2>Pricing</h2>
    <p>
      
    Salinterpret is a free web app designed to bridge communication gaps. Our app offers essential features without any cost, ensuring that you have access to real-time translation and sign-to-word language features at no charge. You just need to have mobile data to access the app. Whether you're looking to communicate with the hearing-impaired or enhance your own understanding, Salinterpret is here to support you without any fees. Explore our features and experience the power 
    </p>
  </Section>
);

const FeaturesSection = () => (
  <Section id="features">
    <h2>Features</h2>
    <p>Salinterpret is a cutting-edge platform designed to revolutionize the way individuals learn sign language. Combining interactive courses, gamification, and comprehensive video tutorials with support for multiple languages, Salinterpret is the most engaging, accessible, and effective way to master sign language.</p>
  </Section>
);

const ContactSection = () => (
  <Section id="contact">
    <h2>Contact Us</h2>
    <p>Have questions or feedback? Reach out to us at salinterpretasl@gmail.com.</p>
  </Section>
);

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
  margin-right: 50px;

  @media (max-width: 768px) {
    margin-right: 0;
    margin-top:50%;
  }
`;

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  max-width: 300px;
  margin-top: 20px;

  @media (max-width: 768px) {
    flex-direction: row;
    gap:20px;
    align-items: center;
  }
`;
const FreeTrialButton = styled.button`
  background: #41bfde;
  color: black;
  border: none;
  padding: 30px 30px; 
  font-size: 18px;
  margin-right: 15px;
  border-radius: 5px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  width: 200px; 
  &:hover {
    background: #3a2ba0;
  }
`;

const SeeMoreButton = styled.button`
  background: #febd03;
  color: black;
  border: none;
  width:40%;
  font-size:20px;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s ease;

  &:hover {
    background: yellow;
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

const LogoWrapper = styled.div`
  margin-bottom: 20px;
`;

const KaliwaLogoImg = styled.img`
  width: 150px;
`;

const HeroTextContainer = styled.div`
  max-width: 500px;
  text-align: center;
`;

const Description = styled.h2`
  font-size: 28px;
  margin-bottom: 10px;
`;

const Text = styled.p`
  font-size: 16px;
  line-height: 1.5;
`;

const Section = styled.section`
  padding: 50px;
  scroll-snap-align: start;

  h2 {
    margin-bottom: 20px;
  }

  p {
    font-size: 18px;
    line-height: 1.6;
  }
`;

const ImagesContainer = styled.div`
  display: flex; 
  flex-wrap: nowrap; 
  gap: 10px;
  overflow-x: auto; 
  justify-content: center; 
  margin: 0 auto;
  max-width: 1200px; 

  @media (max-width: 768px) {
    display: grid; 
    grid-template-columns: repeat(2, 1fr); 
    gap: 10px;
    overflow-x: hidden;
    justify-content: center; 
  }
`;

const ImageWrapper = styled.div`
  opacity: 0;
  transition: opacity 1s ease-in;

  &.in-view {
    opacity: 1;
  }

  img {
    width: 150px; 
    width:100%;
    height: auto; 
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
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
  z-index: 1000;
`;

const PopupContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  color:black;
  width: 100%;
  text-align: center;

  h2 {
    margin-bottom: 20px;
  }

  p {
    font-size: 16px;
    line-height: 1.5;
  }
`;

const CloseButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  position: absolute;
  top: 10px;
  right: 10px;

  &:hover {
    background: #c62828;
  }
`;


const TermsPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  text-align: center;

  h2 {
    margin-bottom: 15px;
  }

  p {
    font-size: 16px;
    margin-bottom: 15px;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;

  input {
    margin-right: 10px;
  }

  label {
    font-size: 14px;
  }
`;


const SectionTitle = styled.h2`
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
`;

const SectionContent = styled.p`
  font-size: 16px;
  color: #666;
`;
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;

  input {
    margin-right: 10px;
  }

  label {
    cursor: pointer;
    text-decoration: underline;
    color: blue;
  }
`;
const PopupButton = styled.button`
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
`;
export default Navbar;
