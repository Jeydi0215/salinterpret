// SalinterpretLandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import logo from '../assets/logo.png';
import Hacker from '../assets/Dimalanta.jpg';
import Hipster from '../assets/Acar.jpg';
import Mentor from '../assets/Mentor.png';
import Member from '../assets/Mamangun.jpg';

/* ---------- Tokens ---------- */
const C = {
  sun: '#FFC933',
  navy: '#0B1B3F',
  sky: '#CFE8FF',
  pink: '#FF5C8A',
  white: '#FFFFFF',
  slate: '#3D4A6B',
};
const DISPLAY = "'Gabarito', 'Segoe UI', sans-serif";
const BODY = "'Figtree', 'Segoe UI', sans-serif";

const pop = keyframes`
  from { opacity: 0; transform: scale(0.85) rotate(-4deg); }
  to   { opacity: 1; transform: none; }
`;
const rise = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: none; }
`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;600&family=Gabarito:wght@500;800;900&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: ${BODY};
    color: ${C.navy};
    background: ${C.white};
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  img { display: block; max-width: 100%; }
  :focus-visible { outline: 3px solid ${C.navy}; outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
`;

/* ---------- Hand landmark model (21 points, like a vision model sees a hand) ---------- */
const rad = (d) => (d * Math.PI) / 180;
const WRIST = { x: 205, y: 420 };
const FINGERS = [
  { x: 150, y: 235, len: [72, 44, 34], spread: -8 }, // index
  { x: 190, y: 220, len: [80, 50, 36], spread: -2 }, // middle
  { x: 228, y: 228, len: [72, 46, 34], spread: 5 }, // ring
  { x: 262, y: 250, len: [56, 36, 28], spread: 14 }, // pinky
];
const JOINT_CURL = [78, 82, 60];

const fingerPoints = (f, curl) => {
  const pts = [{ x: f.x, y: f.y }];
  let { x, y } = pts[0];
  let theta = 0;
  const phi = rad(f.spread * (1 - 0.8 * curl));
  f.len.forEach((L, k) => {
    theta += rad(JOINT_CURL[k] * curl);
    const d = L * Math.cos(theta);
    x += Math.sin(phi) * d;
    y -= Math.cos(phi) * d;
    pts.push({ x, y });
  });
  return pts;
};

const thumbPoints = (curl) => {
  const pts = [{ x: 162, y: 352 }];
  let { x, y } = pts[0];
  const angs = [-48 + 70 * curl, -40 + 95 * curl, -32 + 100 * curl];
  [48, 40, 34].forEach((L, k) => {
    x += Math.sin(rad(angs[k])) * L;
    y -= Math.cos(rad(angs[k])) * L;
    pts.push({ x, y });
  });
  return pts;
};

// curls: [thumb, index, middle, ring, pinky], 0 = straight, 1 = fully curled
const SIGNS = [
  { label: '5', note: 'Open hand', conf: 98, curls: [0, 0, 0, 0, 0] },
  { label: 'A', note: 'Fist, thumb alongside', conf: 96, curls: [0.35, 0.95, 0.95, 0.95, 0.95] },
  { label: 'I love you', note: 'Thumb, index and pinky out', conf: 99, curls: [0, 0, 1, 1, 0] },
];

const poly = (pts) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

const HandSkeleton = ({ curls }) => {
  const thumb = thumbPoints(curls[0]);
  const fingers = FINGERS.map((f, i) => fingerPoints(f, curls[i + 1]));
  const palm = [WRIST, fingers[0][0], fingers[1][0], fingers[2][0], fingers[3][0]];
  const chains = [[WRIST, ...thumb], ...fingers];
  const joints = [WRIST, ...thumb, ...fingers.flat()];
  const tips = [thumb[3], ...fingers.map((f) => f[3])];
  return (
    <svg viewBox="0 0 400 460" role="img" aria-label="An animated hand changing between the signs 5, A and I love you">
      <polygon points={poly(palm)} fill="rgba(255,255,255,0.55)" stroke={C.navy} strokeWidth="5" strokeLinejoin="round" />
      {chains.map((pts, i) => (
        <polyline key={i} points={poly(pts)} fill="none" stroke={C.navy} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {joints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="6" fill={C.white} stroke={C.navy} strokeWidth="3" />
      ))}
      {tips.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="10" fill={C.pink} stroke={C.navy} strokeWidth="3" />
      ))}
    </svg>
  );
};

const useSigns = () => {
  const [reduce] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [idx, setIdx] = useState(0);
  const [curls, setCurls] = useState(SIGNS[0].curls);
  const curlsRef = useRef(SIGNS[0].curls);

  useEffect(() => {
    if (reduce) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % SIGNS.length), 2600);
    return () => clearInterval(t);
  }, [reduce]);

  useEffect(() => {
    if (reduce) return undefined;
    const from = curlsRef.current;
    const to = SIGNS[idx].curls;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 800);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const next = from.map((v, k) => v + (to[k] - v) * e);
      curlsRef.current = next;
      setCurls(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, reduce]);

  return reduce ? { sign: SIGNS[2], curls: SIGNS[2].curls } : { sign: SIGNS[idx], curls };
};

/* ---------- Layout ---------- */
const Container = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
`;

const Section = styled.section`
  padding: 110px 0;
  scroll-margin-top: 70px;
  background: ${({ $bg }) => $bg || C.white};
`;

const SectionTitle = styled.h2`
  font-family: ${DISPLAY};
  font-weight: 900;
  font-size: clamp(2.1rem, 5vw, 3.8rem);
  line-height: 1;
  letter-spacing: -0.03em;
  max-width: 13ch;
`;

const Lead = styled.p`
  font-size: 1.15rem;
  color: ${C.slate};
  max-width: 44ch;
  margin-top: 20px;
`;

/* ---------- Nav ---------- */
const Nav = styled.nav`
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 1000;
  background: rgba(255, 201, 51, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 2px solid ${C.navy};
`;

const NavInner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Logo = styled.a`
  display: flex;
  align-items: center;
  img { height: 36px; width: auto; }
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 28px;
  list-style: none;
  margin-left: auto;
  @media (max-width: 760px) { display: none; }
  a {
    font-weight: 600;
    color: ${C.navy};
    text-decoration: none;
    background: linear-gradient(${C.navy}, ${C.navy}) 0 100% / 0 2px no-repeat;
    transition: background-size 0.25s ease;
    &:hover { background-size: 100% 2px; }
  }
`;

const Button = styled.a`
  display: inline-block;
  padding: 13px 28px;
  border-radius: 999px;
  border: 3px solid ${C.navy};
  font-family: ${DISPLAY};
  font-size: 1.05rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  background: ${({ $primary }) => ($primary ? C.navy : 'transparent')};
  color: ${({ $primary }) => ($primary ? C.sun : C.navy)};
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
  &:hover {
    transform: translateY(-2px) rotate(-1deg);
    background: ${({ $primary }) => ($primary ? C.pink : C.navy)};
    color: ${({ $primary }) => ($primary ? C.navy : C.sun)};
  }
`;

/* ---------- Hero ---------- */
const Hero = styled.header`
  background: ${C.sun};
  padding: 130px 0 90px;
  overflow: hidden;
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 40px;
  align-items: center;
  @media (max-width: 920px) { grid-template-columns: 1fr; }
`;

const HeroText = styled.div`
  > * { opacity: 0; animation: ${rise} 0.8s ease forwards; }
  > :nth-child(2) { animation-delay: 0.12s; }
  > :nth-child(3) { animation-delay: 0.24s; }
`;

const HeroTitle = styled.h1`
  font-family: ${DISPLAY};
  font-weight: 900;
  font-size: clamp(2.7rem, 6.6vw, 5.6rem);
  line-height: 1;
  letter-spacing: -0.035em;
  margin-bottom: 26px;
`;

const HeroSub = styled.p`
  font-size: 1.25rem;
  max-width: 44ch;
  margin-bottom: 34px;
`;

const CTA = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
`;

const HandStage = styled.div`
  position: relative;
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  padding: 24px;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    border: 3px dashed ${C.navy};
  }
  svg { position: relative; width: 100%; height: auto; display: block; }
`;

const ReadingChip = styled.div`
  position: absolute;
  top: 2%;
  right: -2%;
  z-index: 2;
  background: ${C.navy};
  color: ${C.white};
  border-radius: 20px;
  padding: 12px 18px;
  font-size: 0.85rem;
  line-height: 1.25;
  max-width: 180px;
  animation: ${pop} 0.4s ease both;
  strong {
    display: block;
    font-family: ${DISPLAY};
    font-size: 1.7rem;
    font-weight: 900;
    color: ${C.sun};
  }
  span { color: ${C.sky}; }
`;

/* ---------- Five parts ---------- */
const PartsGrid = styled.div`
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 64px;
  @media (max-width: 860px) { grid-template-columns: 1fr; gap: 40px; }
`;

const PartsStick = styled.div`
  align-self: start;
  position: sticky;
  top: 110px;
  @media (max-width: 860px) { position: static; }
`;

const Part = styled.div`
  padding: 26px 0;
  border-top: 3px solid ${C.navy};
  @media (min-width: 861px) {
    &:nth-child(2) { margin-left: 6%; }
    &:nth-child(3) { margin-left: 12%; }
    &:nth-child(4) { margin-left: 6%; }
  }
  h3 {
    font-family: ${DISPLAY};
    font-weight: 800;
    font-size: clamp(1.6rem, 3vw, 2.3rem);
    line-height: 1.1;
    margin-bottom: 6px;
  }
  p { color: ${C.slate}; max-width: 46ch; }
`;

/* ---------- Features ---------- */
const Bento = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
  margin-top: 56px;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

const Tile = styled.div`
  grid-column: span ${({ $span }) => $span};
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  border: 3px solid ${C.navy};
  border-radius: 30px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  min-height: 200px;
  @media (max-width: 860px) { grid-column: auto; }
  h3 {
    font-family: ${DISPLAY};
    font-weight: 800;
    font-size: 1.6rem;
    line-height: 1.1;
    margin-bottom: 8px;
  }
  p { max-width: 40ch; opacity: 0.9; }
  .icon { font-size: 2.4rem; line-height: 1; }
`;

const Meter = styled.div`
  height: 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
  div { width: 96%; height: 100%; border-radius: 999px; background: ${C.sun}; }
`;

/* ---------- Team ---------- */
const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 36px;
  margin-top: 56px;
`;

const Arch = styled.img`
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 3px solid ${C.navy};
  border-radius: 999px 999px 28px 28px;
  background: ${({ $bg }) => $bg};
  margin-bottom: 18px;
`;

const Member_ = styled.div`
  h3 { font-family: ${DISPLAY}; font-weight: 800; font-size: 1.35rem; line-height: 1.2; }
  .role { font-weight: 600; color: ${C.pink}; filter: brightness(0.8); margin-bottom: 4px; }
  .bio { color: ${C.slate}; font-size: 0.98rem; }
`;

/* ---------- Contact ---------- */
const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  @media (max-width: 860px) { grid-template-columns: 1fr; gap: 40px; }
`;

const EmailLink = styled.a`
  display: inline-block;
  margin-top: 26px;
  font-family: ${DISPLAY};
  font-weight: 800;
  font-size: clamp(1.1rem, 2.6vw, 1.7rem);
  color: ${C.navy};
  text-decoration-thickness: 3px;
  text-underline-offset: 6px;
  word-break: break-all;
`;

const Field = styled.div`
  margin-bottom: 18px;
  label { display: block; margin-bottom: 6px; font-weight: 600; }
  input, textarea {
    width: 100%;
    padding: 13px 16px;
    border: 3px solid ${C.navy};
    border-radius: 16px;
    font: inherit;
    background: ${C.white};
    color: ${C.navy};
    &:focus { outline: none; box-shadow: 0 0 0 4px ${C.pink}; }
  }
  textarea { min-height: 140px; resize: vertical; }
`;

const Footer = styled.footer`
  background: ${C.navy};
  color: ${C.sky};
  padding: 30px 0;
  font-size: 0.92rem;
`;

/* ---------- Data ---------- */
const PARTS = [
  { name: 'Handshape', text: 'The shape your fingers make, like a fist, a flat hand or a pointing finger.' },
  { name: 'Location', text: 'Where the sign happens: near the chin, at the chest, or out in front of you.' },
  { name: 'Movement', text: 'How the hands travel. The same shape can mean different things with a different motion.' },
  { name: 'Palm orientation', text: 'Which way the palm faces: toward you, away, up or down.' },
  { name: 'Facial expression', text: 'Eyebrows, eyes and mouth add grammar and tone, such as marking a question.' },
];

const FEATURES = [
  { span: 3, bg: C.sun, fg: C.navy, icon: '🈸', title: 'Real-time translation', desc: 'Instant ASL-to-text conversion powered by computer vision.' },
  { span: 3, bg: C.white, fg: C.navy, icon: '📱', title: 'Works on your phone', desc: 'Use it anywhere on mobile or tablet.' },
  { span: 2, bg: C.white, fg: C.navy, icon: '👥', title: 'Multi-user conversations', desc: 'Talk with more than one person in the same session.' },
  { span: 2, bg: C.pink, fg: C.navy, icon: '📚', title: 'Learning resources', desc: 'Tutorials and guides to learn ASL basics.' },
  { span: 2, bg: C.white, fg: C.navy, icon: '🎥', title: 'Video tutorials', desc: 'Step-by-step videos to help you master ASL signs and usage.' },
  { span: 6, bg: C.navy, fg: C.white, icon: '📈', title: 'Confidence score', desc: 'See how sure the AI is about each sign, so you know how far to trust it.', meter: true },
];

const TEAM = [
  { name: 'Justine Dimalanta', role: 'Hacker & Hustler', bio: 'Leading technical development and business strategy.', img: Hacker, bg: C.sun },
  { name: 'Lara Jane Acar', role: 'Hipster', bio: 'Designing an intuitive user experience.', img: Hipster, bg: C.pink },
  { name: 'Jerson Mamangun', role: 'Co-Hacker', bio: "Refining the app's performance and core functionality.", img: Member, bg: C.sky },
  { name: 'Chris Allen Pineda', role: 'Project Adviser', bio: 'Guiding our mission to make communication accessible.', img: Mentor, bg: C.sun },
];

/* ---------- Page ---------- */
const SalinterpretLandingPage = () => {
  const { sign, curls } = useSigns();

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

      <Nav aria-label="Main">
        <NavInner>
          <Logo href="#home" aria-label="Salinterpret home">
            <img src={logo} alt="Salinterpret" />
          </Logo>
          <NavLinks>
            <li><a href="#how">How signs work</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">Team</a></li>
            <li><a href="#contact">Contact</a></li>
          </NavLinks>
          <Button $primary as={Link} to="/login">Start signing</Button>
        </NavInner>
      </Nav>

      <Hero id="home">
        <Container>
          <HeroGrid>
            <HeroText>
              <HeroTitle>Your hands already say it. Now everyone can read it.</HeroTitle>
              <HeroSub>
                Salinterpret turns American Sign Language into text in real time, so signers and non-signers can talk without a barrier.
              </HeroSub>
              <CTA>
                <Button $primary as={Link} to="/login">Start signing</Button>
                <Button href="#how">How it works</Button>
              </CTA>
            </HeroText>

            <HandStage>
              <HandSkeleton curls={curls} />
              <ReadingChip key={sign.label} aria-live="polite">
                <span>Reading</span>
                <strong>{sign.label}</strong>
                <span>{sign.note}, {sign.conf}% sure</span>
              </ReadingChip>
            </HandStage>
          </HeroGrid>
        </Container>
      </Hero>

      <Section id="how">
        <Container>
          <PartsGrid>
            <PartsStick>
              <SectionTitle>Every sign has five parts</SectionTitle>
              <Lead>Salinterpret follows your hands through the camera and turns what you sign into text.</Lead>
            </PartsStick>
            <div>
              {PARTS.map((p) => (
                <Part key={p.name}>
                  <h3>{p.name}</h3>
                  <p>{p.text}</p>
                </Part>
              ))}
            </div>
          </PartsGrid>
        </Container>
      </Section>

      <Section id="features" $bg={C.sky}>
        <Container>
          <SectionTitle>What you can do with it</SectionTitle>
          <Bento>
            {FEATURES.map((f) => (
              <Tile key={f.title} $span={f.span} $bg={f.bg} $fg={f.fg}>
                <span className="icon" aria-hidden="true">{f.icon}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  {f.meter && <Meter aria-hidden="true" style={{ marginTop: 18 }}><div /></Meter>}
                </div>
              </Tile>
            ))}
          </Bento>
        </Container>
      </Section>

      <Section id="about">
        <Container>
          <SectionTitle>The people behind Salinterpret</SectionTitle>
          <TeamGrid>
            {TEAM.map((m) => (
              <Member_ key={m.name}>
                <Arch src={m.img} alt={m.name} $bg={m.bg} />
                <h3>{m.name}</h3>
                <p className="role">{m.role}</p>
                <p className="bio">{m.bio}</p>
              </Member_>
            ))}
          </TeamGrid>
        </Container>
      </Section>

      <Section id="contact" $bg={C.sun}>
        <Container>
          <ContactGrid>
            <div>
              <SectionTitle>Questions? Write to us.</SectionTitle>
              <EmailLink href="mailto:salinterpretasl@gmail.com">salinterpretasl@gmail.com</EmailLink>
            </div>
            <form onSubmit={handleSubmit}>
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
            </form>
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
