// SalinterpretLandingPage.jsx
import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import logo from '../assets/logo.png';
import Hacker from '../assets/Dimalanta.jpg';
import Hipster from '../assets/Acar.jpg';
import Mentor from '../assets/Mentor.png';
import Member from '../assets/Mamangun.jpg';
import lopit from '../assets/lopit.png';

/* ---------- Tokens ---------- */
const C = {
  ink: '#14163A',
  cobalt: '#3A3AF5',
  signal: '#FFD23F',
  mist: '#ECEEFF',
  white: '#FFFFFF',
  slate: '#4A4D75',
  soft: '#B9BCE8',
};
const DISPLAY = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
const BODY = "'Atkinson Hyperlegible', 'Segoe UI', sans-serif";

/* ---------- Motion ---------- */
const rise = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: none; }
`;
const blink = keyframes`50% { opacity: 0; }`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: ${BODY};
    color: ${C.ink};
    background: ${C.mist};
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  img { display: block; max-width: 100%; }
  :focus-visible { outline: 3px solid ${C.cobalt}; outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
`;

/* ---------- Layout ---------- */
const Container = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
`;

const Section = styled.section`
  padding: 110px 0;
  scroll-margin-top: 80px;
  background: ${({ $dark }) => ($dark ? C.ink : C.mist)};
  color: ${({ $dark }) => ($dark ? C.white : C.ink)};
`;

const SectionTitle = styled.h2`
  font-family: ${DISPLAY};
  font-weight: 800;
  font-size: clamp(2rem, 4.5vw, 3.4rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  max-width: 14ch;
  margin-bottom: 56px;
`;

/* ---------- Nav ---------- */
const Nav = styled.nav`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: min(1100px, calc(100% - 32px));
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 10px 22px;
  border-radius: 999px;
  background: ${({ $scrolled }) => ($scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)')};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 2px solid ${C.ink};
  transition: background 0.3s ease;
`;

const Logo = styled.a`
  display: flex;
  align-items: center;
  img { height: 34px; width: auto; }
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 6px;
  list-style: none;
  @media (max-width: 760px) { display: none; }
  a {
    display: block;
    padding: 8px 16px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.95rem;
    color: ${C.ink};
    text-decoration: none;
    transition: background 0.2s ease;
    &:hover { background: ${C.signal}; }
  }
`;

const Button = styled.a`
  display: inline-block;
  padding: 12px 26px;
  border-radius: 999px;
  border: 2px solid ${C.ink};
  font-family: ${BODY};
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  background: ${({ $primary }) => ($primary ? C.ink : 'transparent')};
  color: ${({ $primary }) => ($primary ? C.signal : C.ink)};
  transition: transform 0.15s ease, background 0.15s ease;
  &:hover {
    transform: translateY(-2px);
    background: ${({ $primary }) => ($primary ? C.cobalt : C.signal)};
    color: ${({ $primary }) => ($primary ? C.white : C.ink)};
  }
`;

/* ---------- Hero ---------- */
const Hero = styled.header`
  padding: 150px 0 110px;
  scroll-margin-top: 0;
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 72px;
  align-items: center;
  @media (max-width: 920px) { grid-template-columns: 1fr; gap: 56px; }
`;

const HeroText = styled.div`
  > * { opacity: 0; animation: ${rise} 0.8s ease forwards; }
  > :nth-child(2) { animation-delay: 0.12s; }
  > :nth-child(3) { animation-delay: 0.24s; }
`;

const HeroTitle = styled.h1`
  font-family: ${DISPLAY};
  font-weight: 800;
  font-size: clamp(2.8rem, 7vw, 5.6rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
  margin-bottom: 28px;
`;

const CaptionLine = styled.span`
  background: ${C.ink};
  color: ${C.signal};
  padding: 0.02em 0.22em;
  border-radius: 0.15em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: ${C.slate};
  max-width: 46ch;
  margin-bottom: 36px;
`;

const CTA = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
`;

/* Live caption demo */
const Stage = styled.div`
  position: relative;
  aspect-ratio: 4 / 5;
  max-height: 580px;
  width: 100%;
  margin: 0 auto;
  border-radius: 32px;
  overflow: hidden;
  background: ${C.ink};
  border: 2px solid ${C.ink};
  box-shadow: 14px 14px 0 ${C.signal};
  animation: ${rise} 0.9s ease 0.3s both;
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LivePill = styled.div`
  position: absolute;
  top: 18px;
  left: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${C.ink};
  color: ${C.white};
  font-size: 0.85rem;
  font-weight: 700;
  &::before {
    content: '';
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #ff4d4d;
    animation: ${pulse} 1.4s ease-in-out infinite;
  }
`;

const CaptionBar = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  padding: 18px 20px;
  border-radius: 18px;
  background: rgba(20, 22, 58, 0.94);
`;

const CaptionText = styled.p`
  font-family: ${DISPLAY};
  font-weight: 800;
  font-size: clamp(1.2rem, 2.4vw, 1.6rem);
  line-height: 1.25;
  min-height: 2.5em;
  color: ${C.signal};
`;

const Caret = styled.span`
  display: inline-block;
  width: 3px;
  height: 1em;
  margin-left: 3px;
  vertical-align: -0.12em;
  background: ${C.signal};
  animation: ${blink} 1s steps(1) infinite;
`;

const Confidence = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${C.soft};
`;

const Meter = styled.div`
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
  div {
    height: 100%;
    border-radius: 999px;
    background: ${C.signal};
    transition: width 0.12s linear;
  }
`;

/* ---------- Team ---------- */
const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
  @media (min-width: 900px) {
    > :nth-child(even) { margin-top: 44px; }
  }
`;

const TeamImg = styled.img`
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 26px;
  border: 2px solid ${C.ink};
  margin-bottom: 18px;
`;

const TeamName = styled.h3`
  font-family: ${DISPLAY};
  font-weight: 800;
  font-size: 1.35rem;
  line-height: 1.2;
`;

const TeamRole = styled.p`
  color: ${C.cobalt};
  font-weight: 700;
  margin-bottom: 6px;
`;

const TeamBio = styled.p`
  color: ${C.slate};
  font-size: 0.98rem;
`;

/* ---------- Features ---------- */
const FeatureRow = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr 1.3fr;
  gap: 24px;
  align-items: baseline;
  padding: 28px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  &:last-child { border-bottom: 1px solid rgba(255, 255, 255, 0.18); }
  @media (max-width: 760px) {
    grid-template-columns: 48px 1fr;
    > p { grid-column: 2; }
  }
`;

const FeatureIcon = styled.span`
  font-size: 1.9rem;
  line-height: 1;
`;

const FeatureTitle = styled.h3`
  font-family: ${DISPLAY};
  font-weight: 800;
  font-size: clamp(1.3rem, 2.4vw, 1.8rem);
  line-height: 1.15;
`;

const FeatureDesc = styled.p`
  color: ${C.soft};
  max-width: 52ch;
`;

/* ---------- Contact ---------- */
const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
  @media (max-width: 860px) { grid-template-columns: 1fr; gap: 40px; }
`;

const EmailLink = styled.a`
  display: inline-block;
  font-family: ${DISPLAY};
  font-weight: 800;
  font-size: clamp(1.1rem, 2.6vw, 1.6rem);
  color: ${C.ink};
  text-decoration-thickness: 3px;
  text-decoration-color: ${C.signal};
  text-underline-offset: 6px;
  word-break: break-all;
  &:hover { text-decoration-color: ${C.cobalt}; }
`;

const Form = styled.form`
  background: ${C.white};
  border: 2px solid ${C.ink};
  border-radius: 28px;
  padding: 32px;
  box-shadow: 10px 10px 0 ${C.ink};
`;

const Field = styled.div`
  margin-bottom: 20px;
  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 700;
    font-size: 0.95rem;
  }
  input, textarea {
    width: 100%;
    padding: 12px 14px;
    border: 2px solid ${C.ink};
    border-radius: 12px;
    font: inherit;
    background: ${C.mist};
    color: ${C.ink};
    transition: background 0.15s ease;
    &:focus { outline: none; background: ${C.white}; box-shadow: 0 0 0 3px ${C.cobalt}; }
  }
  textarea { min-height: 140px; resize: vertical; }
`;

const Footer = styled.footer`
  background: ${C.ink};
  color: ${C.soft};
  padding: 32px 0;
  font-size: 0.92rem;
`;

/* ---------- Data ---------- */
const PHRASES = [
  { t: 'Hello, nice to meet you', c: 97 },
  { t: 'Where is the library?', c: 94 },
  { t: 'Thank you so much', c: 99 },
];

const TEAM = [
  { name: 'Justine Dimalanta', role: 'Hacker & Hustler', bio: 'Leading technical development and business strategy.', img: Hacker },
  { name: 'Lara Jane Acar', role: 'Hipster', bio: 'Designing an intuitive user experience.', img: Hipster },
  { name: 'Jerson Mamangun', role: 'Co-Hacker', bio: "Refining the app's performance and core functionality.", img: Member },
  { name: 'Chris Allen Pineda', role: 'Project Adviser', bio: 'Guiding our mission to make communication accessible.', img: Mentor },
];

const FEATURES = [
  { icon: '🈸', title: 'Real-time translation', desc: 'Instant ASL-to-text conversion powered by computer vision.' },
  { icon: '📱', title: 'Works on your phone', desc: 'Use it anywhere on mobile or tablet.' },
  { icon: '👥', title: 'Multi-user conversations', desc: 'Talk with more than one person in the same session.' },
  { icon: '📚', title: 'Learning resources', desc: 'Tutorials and guides to learn ASL basics.' },
  { icon: '🎥', title: 'Video tutorials', desc: 'Step-by-step videos to help you master ASL signs and usage.' },
  { icon: '📈', title: 'Confidence score', desc: 'See how sure the AI is about each sign, so you know how far to trust it.' },
];

/* ---------- Typed caption hook ---------- */
const useTypedCaption = () => {
  const [reduce] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [state, setState] = useState({ i: 0, n: 0 });

  useEffect(() => {
    if (reduce) return undefined;
    const { i, n } = state;
    const len = PHRASES[i].t.length;
    const id = setTimeout(
      () => setState(n < len ? { i, n: n + 1 } : { i: (i + 1) % PHRASES.length, n: 0 }),
      n < len ? 85 : 2000
    );
    return () => clearTimeout(id);
  }, [state, reduce]);

  return reduce ? { i: 0, n: PHRASES[0].t.length } : state;
};

/* ---------- Page ---------- */
const SalinterpretLandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const { i, n } = useTypedCaption();
  const phrase = PHRASES[i];
  const pct = Math.round((phrase.c * n) / phrase.t.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = f.get('subject') || `Message from ${f.get('name')}`;
    const body = `${f.get('message')}\n\n${f.get('name')} (${f.get('email')})`;
    window.location.href = `mailto:salinterpretasl@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <GlobalStyle />
      <Analytics />

      <Nav $scrolled={scrolled} aria-label="Main">
        <Logo href="#home" aria-label="Salinterpret home">
          <img src={logo} alt="Salinterpret" />
        </Logo>
        <NavLinks>
          <li><a href="#about">About</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#contact">Contact</a></li>
        </NavLinks>
        <Button $primary as={Link} to="/login">Try it now</Button>
      </Nav>

      <Hero id="home">
        <Container>
          <HeroGrid>
            <HeroText>
              <HeroTitle>
                Sign naturally.<br />
                <CaptionLine>Be read instantly.</CaptionLine>
              </HeroTitle>
              <HeroSubtitle>
                Salinterpret turns American Sign Language into text in real time, so signers and non-signers can talk without a barrier.
              </HeroSubtitle>
              <CTA>
                <Button $primary as={Link} to="/login">Try it now</Button>
                <Button href="#features">See features</Button>
              </CTA>
            </HeroText>

            <Stage role="img" aria-label="Demo: a signer is captioned live with a confidence score">
              <img src={lopit} alt="" />
              <LivePill>Live</LivePill>
              <CaptionBar>
                <CaptionText>
                  {phrase.t.slice(0, n)}
                  <Caret />
                </CaptionText>
                <Confidence>
                  <span>Confidence</span>
                  <Meter><div style={{ width: `${pct}%` }} /></Meter>
                  <span>{pct}%</span>
                </Confidence>
              </CaptionBar>
            </Stage>
          </HeroGrid>
        </Container>
      </Hero>

      <Section id="about">
        <Container>
          <SectionTitle>The people behind Salinterpret</SectionTitle>
          <TeamGrid>
            {TEAM.map((m) => (
              <div key={m.name}>
                <TeamImg src={m.img} alt={m.name} />
                <TeamName>{m.name}</TeamName>
                <TeamRole>{m.role}</TeamRole>
                <TeamBio>{m.bio}</TeamBio>
              </div>
            ))}
          </TeamGrid>
        </Container>
      </Section>

      <Section id="features" $dark>
        <Container>
          <SectionTitle>What it does</SectionTitle>
          {FEATURES.map((f) => (
            <FeatureRow key={f.title}>
              <FeatureIcon aria-hidden="true">{f.icon}</FeatureIcon>
              <FeatureTitle>{f.title}</FeatureTitle>
              <FeatureDesc>{f.desc}</FeatureDesc>
            </FeatureRow>
          ))}
        </Container>
      </Section>

      <Section id="contact">
        <Container>
          <ContactGrid>
            <div>
              <SectionTitle>Questions? Write to us.</SectionTitle>
              <EmailLink href="mailto:salinterpretasl@gmail.com">salinterpretasl@gmail.com</EmailLink>
            </div>
            <Form onSubmit={handleSubmit}>
              <Field>
                <label htmlFor="name">Your name</label>
                <input id="name" name="name" type="text" required autoComplete="name" />
              </Field>
              <Field>
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" required autoComplete="email" />
              </Field>
              <Field>
                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" type="text" />
              </Field>
              <Field>
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" required />
              </Field>
              <Button $primary as="button" type="submit">Send message</Button>
            </Form>
          </ContactGrid>
        </Container>
      </Section>

      <Footer>
        <Container>&copy; {new Date().getFullYear()} Salinterpret. All rights reserved.</Container>
      </Footer>
    </>
  );
};

export default SalinterpretLandingPage;
