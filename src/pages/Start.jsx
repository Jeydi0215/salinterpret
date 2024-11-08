import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import ASL from '../assets/logo.png';
import BackgroundImage from '../assets/lopit.png';
import KaliwaLogo from '../assets/logo.png';
import { FaBars } from 'react-icons/fa';

const Navbar = ({ onSeeMoreClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);  // Modal visibility state
  const [termsAccepted, setTermsAccepted] = useState(false);  // State to check if terms are accepted
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSignInClick = () => {
    setModalVisible(true); // Show the modal when 'Sign In' is clicked
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true); // User accepts the terms
    setModalVisible(false); // Close the modal
    navigate('/login'); // Navigate to login after accepting
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Close the modal without accepting
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
              <FreeTrialButton onClick={handleSignInClick}>Sign In</FreeTrialButton>
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

        {/* Terms and Conditions Modal */}
        {modalVisible && (
          <ModalOverlay>
            <ModalContainer>
              <h2>Terms and Conditions</h2>
              <p>By signing in, you agree to the following terms...</p>
              <CheckboxContainer>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                />
                <label>I accept the Terms and Conditions</label>
              </CheckboxContainer>
              <ButtonContainer>
                <ActionButton onClick={handleCloseModal}>Cancel</ActionButton>
                <ActionButton
                  onClick={handleAcceptTerms}
                  disabled={!termsAccepted} // Disable until terms are accepted
                >
                  Proceed to Sign In
                </ActionButton>
              </ButtonContainer>
            </ModalContainer>
          </ModalOverlay>
        )}
      </NavContainer>
    </>
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
  width:50%;
  height:70px;
  padding: 10px 20px;
  cursor: pointer;
  font-size:20px;
  border-radius: 5px;
  margin-right: 10px;
  transition: background 0.3s ease;

  &:hover {
    background: #3a2ba0;
  }

  @media (max-width: 768px) {
    margin: 10px 0;
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
  text-align: center;
  max-width: 500px;
`;

const Description = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Text = styled.p`
  font-size: 18px;
  line-height: 1.6;
`;

const ModalOverlay = styled.div`
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

const ModalContainer = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 500px;
  text-align: center;

  h2 {
    font-size: 24px;
  }

  p {
    font-size: 16px;
    margin: 20px 0;
  }
`;

const CheckboxContainer = styled.div`
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionButton = styled.button`
  background: #41bfde;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  margin: 10px;

  &:hover {
    background: #3a2ba0;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
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
  color: black;
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

const Popup = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <PopupOverlay>
      <PopupContainer>
        <CloseButton onClick={onClose}>Close</CloseButton>
        <h2>More Information</h2>
        <p>This is some more information shown in a popup!</p>
      </PopupContainer>
    </PopupOverlay>
  );
};

const App = () => {
  const [popupVisible, setPopupVisible] = useState(false);

  const handleSeeMoreClick = () => {
    setPopupVisible(true);
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
  };

  return (
    <>
      <Navbar onSeeMoreClick={handleSeeMoreClick} />
      <AboutSection />
      <PricingSection />
      <FeaturesSection />
      <ContactSection />
      <Popup show={popupVisible} onClose={handlePopupClose} />
    </>
  );
};

export default App;
