// SalinterpretLandingPage.jsx
import React, { useState, useEffect } from 'react';


import styled, { createGlobalStyle, keyframes } from 'styled-components';
import logo from '../assets/logo.png';
import Hacker from  '../assets/Hacker.png';
import Hipster from  '../assets/Hipster.png';
import Mentor from  '../assets/Mentor.png';
import Member from  '../assets/Member.png';
import { Link } from 'react-router-dom';
import lopit from '../assets/lopit.png';
import { Analytics } from '@vercel/analytics/react';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  body {
    color: #1e293b;
    line-height: 1.6;
    overflow-x: hidden;
    background: #f8fafc;
    scroll-behavior: smooth;
  }
`;
const ContactSection = styled.section`
  background: white;
  padding: 80px 0;
  background:#141414;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 50px;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  color:white;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
`;

const ContactIcon = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 1.2rem;
  color: #2563eb;
`;

const ContactForm = styled.form`
  background:  #1f1f1f;
  padding: 30px;
  border-radius: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color:white;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 1rem;
`;

const Footer = styled.footer`
  background: #1e293b;
  color: white;
  padding: 60px 0 20px;
  text-align: center;
`;

const FooterText = styled.p`
  font-size: 0.9rem;
  color: #94a3b8;
`;
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: ${({ scrolled }) => (scrolled ? '#ffffff' : '#000000')};
  transition: background 0.3s ease, box-shadow 0.3s ease;
  box-shadow: ${({ scrolled }) => (scrolled ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none')};
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px;
`;

const Logo = styled.a`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
  text-decoration: none;
  img {
    height: 40px;
    margin-right: 10px;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.li`
  margin-left: 30px;
  a {
    color: ${({ scrolled }) => (scrolled ? '#1e293b' : '#ffffff')};
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s ease;
    &:hover {
      color: #e50914;
    }
  }
`;

const Section = styled.section`
  padding: 80px 0;
  animation: ${fadeInUp} 1s ease forwards;
  background:#141414;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  color: #2563eb;
  opacity: 0;
  animation: ${fadeInUp} 1s ease forwards;
  animation-delay: 0.3s;
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: #f59e0b;
    border-radius: 2px;
  }
`;

const Hero = styled.div`
  position: relative;
  padding: 180px 0 100px;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    background-image: url(${lopit});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(4px);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    transform: scale(1.05); /* Optional: avoid edge cropping after blur */
  }
`;
const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  @media (min-width: 992px) {
    flex-direction: row;
  }
`;

const HeroText = styled.div`
  flex: 1;
  max-width: 600px;
  animation: ${fadeInUp} 1s ease forwards;
`;

const HeroTagline = styled.span`
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 15px;
  display: inline-block;
  background: white;
  padding: 5px 15px;
  border-radius: 50px;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 20px;
  color: white;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: white;
  margin-bottom: 30px;
`;

const CTA = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const Button = styled.a`
  padding: 12px 28px;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  background: ${props => props.primary ? '#2563eb' : '#f59e0b'};
  color: ${props => props.primary ? '#fff' : '#1e293b'};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  &:hover {
    transform: translateY(-2px);
  }
`;

const HeroImage = styled.div`
  flex: 1;
  max-width: 600px;
  animation: ${fadeInUp} 1s ease forwards;
  animation-delay: 0.3s;
  img {
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  height:80vh;
`;

const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
 
`;

const TeamCard = styled.div`
  background: 	#1f1f1f;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 1s ease forwards;
  &:hover {
    transform: translateY(-10px);
  }
`;

const TeamImg = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
`;

const TeamInfo = styled.div`
  padding: 20px;
`;

const TeamName = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 5px;
  color:#ffffff;
`;

const TeamRole = styled.p`
  color: #2563eb;
  font-weight: 500;
`;

const TeamBio = styled.p`
  color:#b3b3b3;
  font-size: 0.95rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled.div`
  background: #1f1f1f;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 1s ease forwards;
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #2563eb;
`;

const FeatureDesc = styled.p`
  color:#b3b3b3;
`;

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const SalinterpretLandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <GlobalStyle />

      <Nav scrolled={scrolled}>
        <NavContainer>
          <Logo onClick={() => scrollToSection('home')}>
            <img src={logo} alt="Logo" />
           
          </Logo>
          <NavLinks>
            <NavLink scrolled={scrolled}><a onClick={() => scrollToSection('home')}>Home</a></NavLink>
            <NavLink scrolled={scrolled}><a onClick={() => scrollToSection('about')}>About</a></NavLink>
            <NavLink scrolled={scrolled}><a onClick={() => scrollToSection('features')}>Features</a></NavLink>
            <NavLink scrolled={scrolled}><a onClick={() => scrollToSection('contact')}>Contact</a></NavLink>
          </NavLinks>
        </NavContainer>
      </Nav>
    <Analytics />
      <Hero id="home">
        <Container>
          <HeroContent>
            <HeroText>
              <HeroTagline>Breaking Communication Barriers</HeroTagline>
              <HeroTitle>Real-time ASL to Text Translation</HeroTitle>
              <HeroSubtitle>
                Connect effortlessly with our AI-powered sign language interpretation platform that bridges the gap between the ASL community and non-signers.
              </HeroSubtitle>
              <CTA>
              <Button primary onClick={() => window.location.href = '/login'}> Start Now</Button>
                <Button onClick={() => scrollToSection('features')}>Learn More</Button>
              </CTA>
            </HeroText>
            <HeroImage>
             
            </HeroImage>
          </HeroContent>
        </Container>
      </Hero>

      <Section id="about">
        <Container>
          <SectionTitle>About Us</SectionTitle>
          <AboutGrid>
            {[
              { name: 'Justine Dimalanta', role: 'Hacker & Hustler', bio: 'Leading technical development and business strategy.', img: Hacker },
              { name: 'Lara Jane Acar', role: 'Hipster', bio: 'Designing an intuitive user experience.', img:Hipster },
              { name: 'Jerson Mamangun', role: 'Co-Hacker', bio: 'Refining the app\'s performance and core functionality.', img: Member },
              { name: 'Chris Allen Pineda', role: 'Project Adviser', bio: 'Guiding our mission to make communication accessible.', img:Mentor }
            ].map((member, index) => (
              <TeamCard key={index}>
                <TeamImg src={member.img} alt={member.name} />
                <TeamInfo>
                  <TeamName>{member.name}</TeamName>
                  <TeamRole>{member.role}</TeamRole>
                  <TeamBio>{member.bio}</TeamBio>
                </TeamInfo>
              </TeamCard>
            ))}
          </AboutGrid>
        </Container>
      </Section>

      <Section id="features">
        <Container>
          <SectionTitle>Key Features</SectionTitle>
          <FeaturesGrid>
            {[
              { icon: '🈸', title: 'Real-time Translation', desc: 'Instant ASL to text conversion with computer vision.' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Use anywhere on mobile or tablet.' },
              { icon: '👥', title: 'Multi-user Support', desc: 'Conversations between multiple users.' },
              { icon: '📚', title: 'Learning Resources', desc: 'Tutorials and guides to learn ASL basics.' },
              { icon: ' 🎥 ', title: 'Video Tutorials', desc: ' Step-by-step video guides to help you master ASL signs and usage.' },
              { icon: '📈', title: 'Confidence Score', desc: ' See how confident the AI is with each sign prediction to better understand model reliability.' }
            ].map((feature, idx) => (
              <FeatureCard key={idx}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDesc>{feature.desc}</FeatureDesc>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </Container>
      </Section>
      <ContactSection id="contact">
  <Container>
    <SectionTitle>Get In Touch</SectionTitle>
    <ContactGrid>
      <ContactInfo>
        <ContactItem>
          <ContactIcon>📧</ContactIcon>
          <div>
            <h3>Email Us</h3>
            <p>salinterpretasl@gmail.com</p>
          </div>
        </ContactItem>
        <ContactItem>
          <ContactIcon>📞</ContactIcon>
          <div>
            <h3>Call Us</h3>
            <p>+1 (555) 123-4567</p>
          </div>
        </ContactItem>
        <ContactItem>
          <ContactIcon>📍</ContactIcon>
          <div>
            <h3>Visit Us</h3>
            <p>123 Tech Street, Innovation City</p>
          </div>
        </ContactItem>
      </ContactInfo>
      <ContactForm>
        <FormGroup>
          <Label htmlFor="name">Your Name</Label>
          <Input id="name" type="text" required />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" required />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" type="text" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="message">Message</Label>
          <TextArea id="message" required />
        </FormGroup>
        <Button primary type="submit">Send Message</Button>
      </ContactForm>
    </ContactGrid>
  </Container>
</ContactSection>

<Footer>
  <Container>
    <FooterText>&copy; 2023 Salinterpret. All rights reserved.</FooterText>
  </Container>
</Footer>
    </>
  );
};

export default SalinterpretLandingPage;
