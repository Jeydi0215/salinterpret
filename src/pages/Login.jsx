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
  bg: '#141414',
  card: '#1f1f1f',
  red: '#E50914',
  white: '#FFFFFF',
  text: '#E5E5E5',
  gray: '#B3B3B3',
  dim: '#737373',
  green: '#46D369',
};
const DISPLAY = "'Bebas Neue', Impact, 'Arial Narrow', sans-serif";
const BODY = "'Figtree', 'Segoe UI', sans-serif";

const pop = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: none; }
`;
const rise = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: none; }
`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Figtree:wght@400;600;700&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: ${BODY};
    color: ${C.text};
    background: ${C.bg};
    line-height: 1.55;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  img { display: block; max-width: 100%; }
  :focus-visible { outline: 3px solid ${C.white}; outline-offset: 3px; }
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
      <polygon points={poly(palm)} fill="rgba(255,255,255,0.06)" stroke={C.white} strokeWidth="4" strokeLinejoin="round" />
      {chains.map((pts, i) => (
        <polyline key={i} points={poly(pts)} fill="none" stroke={C.white} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {joints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="6" fill={C.bg} stroke={C.white} strokeWidth="3" />
      ))}
      {tips.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="10" fill={C.red} stroke={C.white} strokeWidth="3" />
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

/* ---------- Nav ---------- */
const Nav = styled.nav`
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 1000;
  background: ${({ $scrolled }) => ($scrolled ? C.bg : 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)')};
  transition: background 0.4s ease;
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 14px 4%;
`;

const Logo = styled.a`
  display: flex;
  align-items: center;
  img { height: 38px; width: auto; }
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 22px;
  list-style: none;
  margin-right: auto;
  @media (max-width: 900px) { display: none; }
  a {
    font-size: 0.92rem;
    color: ${C.text};
    text-decoration: none;
    transition: color 0.2s ease;
    &:hover { color: ${C.gray}; }
  }
`;

const Button = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  border-radius: 4px;
  border: 0;
  font-family: ${BODY};
  font-size: 1.1rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
  ${({ $variant }) =>
    $variant === 'red'
      ? `background: ${C.red}; color: ${C.white}; &:hover { background: #f6121d; }`
      : $variant === 'ghost'
      ? `background: rgba(109,109,110,0.7); color: ${C.white}; &:hover { background: rgba(109,109,110,0.45); }`
      : `background: ${C.white}; color: #000; &:hover { background: rgba(255,255,255,0.75); }`}
`;

const NavButton = styled(Button)`
  padding: 7px 18px;
  font-size: 0.95rem;
  margin-left: auto;
  @media (min-width: 901px) { margin-left: 0; }
`;

/* ---------- Hero ---------- */
const Hero = styled.header`
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  padding: 110px 4% 150px;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    inset: auto 0 0 0;
    height: 220px;
    background: linear-gradient(to bottom, transparent, ${C.bg});
    pointer-events: none;
  }
`;

const HeroGrid = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
  @media (max-width: 920px) { grid-template-columns: 1fr; }
`;

const HeroText = styled.div`
  max-width: 620px;
  > * { opacity: 0; animation: ${rise} 0.8s ease forwards; }
  > :nth-child(2) { animation-delay: 0.1s; }
  > :nth-child(3) { animation-delay: 0.2s; }
  > :nth-child(4) { animation-delay: 0.3s; }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  font-weight: 700;
  color: ${C.gray};
  .match { color: ${C.green}; }
  .badge {
    border: 1px solid ${C.gray};
    border-radius: 3px;
    padding: 0 7px;
    font-size: 0.8rem;
    line-height: 1.5;
  }
`;

const HeroTitle = styled.h1`
  font-family: ${DISPLAY};
  font-weight: 400;
  font-size: clamp(3.4rem, 8vw, 7rem);
  line-height: 0.95;
  letter-spacing: 0.01em;
  color: ${C.white};
  margin-bottom: 22px;
`;

const HeroSub = styled.p`
  font-size: clamp(1.05rem, 1.6vw, 1.3rem);
  color: ${C.white};
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  margin-bottom: 28px;
`;

const CTA = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const HandStage = styled.div`
  position: relative;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  &::before {
    content: '';
    position: absolute;
    inset: -20%;
    background: radial-gradient(circle, rgba(229, 9, 20, 0.38), transparent 62%);
  }
  svg { position: relative; width: 100%; height: auto; display: block; }
`;

const ReadingChip = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-left: 4px solid ${C.red};
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 0.85rem;
  line-height: 1.3;
  max-width: 190px;
  animation: ${pop} 0.35s ease both;
  strong {
    display: block;
    font-family: ${DISPLAY};
    font-weight: 400;
    font-size: 2rem;
    letter-spacing: 0.02em;
    color: ${C.white};
  }
  span { color: ${C.gray}; }
  .match { color: ${C.green}; font-weight: 700; }
`;

/* ---------- Rows ---------- */
const Rows = styled.main`
  position: relative;
  z-index: 2;
  margin-top: -70px;
`;

const RowWrap = styled.section`
  padding: 0 0 28px;
  scroll-margin-top: 70px;
`;

const RowTitle = styled.h2`
  font-size: clamp(1.15rem, 2vw, 1.5rem);
  font-weight: 700;
  color: ${C.text};
  padding: 0 4%;
`;

const RowViewport = styled.div`
  position: relative;
  &:hover > button { opacity: 1; }
`;

const Track = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  padding: 40px 4%;
  margin: -40px 0;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  > * { scroll-snap-align: start; flex: 0 0 auto; }
`;

const Arrow = styled.button`
  position: absolute;
  top: 0;
  bottom: 0;
  ${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}
  z-index: 5;
  width: 4%;
  min-width: 44px;
  border: 0;
  background: rgba(20, 20, 20, 0.6);
  color: ${C.white};
  font-size: 2.6rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease;
  &:hover, &:focus-visible { background: rgba(20, 20, 20, 0.85); opacity: 1; }
  @media (hover: none) { display: none; }
`;

const lift = `
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  &:hover { transform: scale(1.07); z-index: 3; box-shadow: 0 14px 30px rgba(0, 0, 0, 0.6); }
`;

const PartCard = styled.article`
  position: relative;
  width: 250px;
  min-height: 340px;
  padding: 24px 22px;
  border-radius: 6px;
  background: linear-gradient(160deg, #2f2f2f, ${C.card} 55%, #101010);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  ${lift}
  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 4px;
    background: ${C.red};
  }
  .icon { font-size: 3.4rem; line-height: 1; }
  h3 { font-family: ${DISPLAY}; font-weight: 400; font-size: 2rem; letter-spacing: 0.02em; color: ${C.white}; line-height: 1.05; margin-bottom: 8px; }
  p { font-size: 0.95rem; color: ${C.gray}; }
`;

const FeatureCard = styled.article`
  position: relative;
  width: 340px;
  min-height: 210px;
  padding: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #2b2b2b, ${C.card});
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;
  ${lift}
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 4px;
    width: 0;
    background: ${C.red};
    transition: width 0.3s ease;
  }
  &:hover::after { width: 100%; }
  .icon { font-size: 2.4rem; line-height: 1; }
  h3 { font-size: 1.25rem; font-weight: 700; color: ${C.white}; margin-bottom: 4px; }
  p { font-size: 0.95rem; color: ${C.gray}; }
`;

const Meter = styled.div`
  height: 6px;
  border-radius: 3px;
  background: #404040;
  margin-top: 14px;
  overflow: hidden;
  div { width: 96%; height: 100%; background: ${C.green}; }
`;

const TeamCard = styled.article`
  position: relative;
  width: 250px;
  aspect-ratio: 2 / 3;
  border-radius: 6px;
  overflow: hidden;
  background: ${C.card};
  ${lift}
  img { width: 100%; height: 100%; object-fit: cover; }
  .info {
    position: absolute;
    inset: auto 0 0 0;
    padding: 70px 18px 18px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 30%, transparent);
  }
  h3 { font-family: ${DISPLAY}; font-weight: 400; font-size: 1.7rem; letter-spacing: 0.02em; color: ${C.white}; line-height: 1.05; }
  .role { color: ${C.red}; filter: brightness(1.25); font-weight: 700; font-size: 0.9rem; }
  .bio { font-size: 0.88rem; color: ${C.gray}; max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.3s ease, opacity 0.3s ease; }
  &:hover .bio { max-height: 90px; opacity: 1; margin-top: 6px; }
  @media (hover: none) { .bio { max-height: none; opacity: 1; margin-top: 6px; } }
`;

/* ---------- Contact + footer ---------- */
const Contact = styled.section`
  padding: 70px 4% 90px;
  scroll-margin-top: 70px;
`;

const ContactGrid = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  @media (max-width: 860px) { grid-template-columns: 1fr; gap: 32px; }
`;

const ContactTitle = styled.h2`
  font-family: ${DISPLAY};
  font-weight: 400;
  font-size: clamp(2.8rem, 6vw, 5rem);
  line-height: 0.95;
  letter-spacing: 0.01em;
  color: ${C.white};
  margin-bottom: 18px;
`;

const EmailLink = styled.a`
  color: ${C.text};
  font-size: 1.15rem;
  font-weight: 600;
  word-break: break-all;
  &:hover { color: ${C.white}; }
`;

const Field = styled.div`
  margin-bottom: 16px;
  label { display: block; margin-bottom: 6px; font-size: 0.9rem; color: ${C.gray}; }
  input, textarea {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #333;
    border-radius: 4px;
    font: inherit;
    background: #333;
    color: ${C.white};
    &:focus { outline: none; border-color: ${C.white}; }
  }
  textarea { min-height: 130px; resize: vertical; }
`;

const Footer = styled.footer`
  padding: 30px 4% 50px;
  text-align: center;
  font-size: 0.88rem;
  color: ${C.dim};
`;

/* ---------- Data ---------- */
const PARTS = [
  { icon: '✊', name: 'Handshape', text: 'The shape your fingers make, like a fist, a flat hand or a pointing finger.' },
  { icon: '📍', name: 'Location', text: 'Where the sign happens: near the chin, at the chest, or out in front of you.' },
  { icon: '🌊', name: 'Movement', text: 'How the hands travel. The same shape can mean different things with a different motion.' },
  { icon: '🔄', name: 'Palm orientation', text: 'Which way the palm faces: toward you, away, up or down.' },
  { icon: '🙂', name: 'Facial expression', text: 'Eyebrows, eyes and mouth add grammar and tone, such as marking a question.' },
];

const FEATURES = [
  { icon: '🈸', title: 'Real-time translation', desc: 'Instant ASL-to-text conversion powered by computer vision.' },
  { icon: '📱', title: 'Works on your phone', desc: 'Use it anywhere on mobile or tablet.' },
  { icon: '👥', title: 'Multi-user conversations', desc: 'Talk with more than one person in the same session.' },
  { icon: '📚', title: 'Learning resources', desc: 'Tutorials and guides to learn ASL basics.' },
  { icon: '🎥', title: 'Video tutorials', desc: 'Step-by-step videos to help you master ASL signs and usage.' },
  { icon: '📈', title: 'Confidence score', desc: 'See how sure the AI is about each sign, so you know how far to trust it.', meter: true },
];

const TEAM = [
  { name: 'Justine Dimalanta', role: 'Hacker & Hustler', bio: 'Leading technical development and business strategy.', img: Hacker },
  { name: 'Lara Jane Acar', role: 'Hipster', bio: 'Designing an intuitive user experience.', img: Hipster },
  { name: 'Jerson Mamangun', role: 'Co-Hacker', bio: "Refining the app's performance and core functionality.", img: Member },
  { name: 'Chris Allen Pineda', role: 'Project Adviser', bio: 'Guiding our mission to make communication accessible.', img: Mentor },
];

/* ---------- Carousel row ---------- */
const Row = ({ id, title, children }) => {
  const ref = useRef(null);
  const scroll = (dir) =>
    ref.current && ref.current.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: 'smooth' });
  return (
    <RowWrap id={id}>
      <RowTitle>{title}</RowTitle>
      <RowViewport>
        <Arrow $side="left" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)}>‹</Arrow>
        <Track ref={ref}>{children}</Track>
        <Arrow $side="right" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)}>›</Arrow>
      </RowViewport>
    </RowWrap>
  );
};

/* ---------- Page ---------- */
const SalinterpretLandingPage = () => {
  const { sign, curls } = useSigns();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
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
        <NavInner>
          <Logo href="#home" aria-label="Salinterpret home">
            <img src={logo} alt="Salinterpret" />
          </Logo>
          <NavLinks>
            <li><a href="#home">Home</a></li>
            <li><a href="#how">How signs work</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">Team</a></li>
            <li><a href="#contact">Contact</a></li>
          </NavLinks>
          <NavButton $variant="red" as={Link} to="/login">Start signing</NavButton>
        </NavInner>
      </Nav>

      <Hero id="home">
        <HeroGrid>
          <HeroText>
            <Meta>
              <span className="match">{sign.conf}% match</span>
              <span className="badge">ASL</span>
              <span>Real-time translation</span>
            </Meta>
            <HeroTitle>Your hands already say it. Now everyone can read it.</HeroTitle>
            <HeroSub>
              Salinterpret turns American Sign Language into text in real time, so signers and non-signers can talk without a barrier.
            </HeroSub>
            <CTA>
              <Button as={Link} to="/login"><span aria-hidden="true">▶</span> Start signing</Button>
              <Button $variant="ghost" href="#how">How it works</Button>
            </CTA>
          </HeroText>

          <HandStage>
            <HandSkeleton curls={curls} />
            <ReadingChip key={sign.label} aria-live="polite">
              <span>Reading</span>
              <strong>{sign.label}</strong>
              <span className="match">{sign.conf}% match</span>
              <br />
              <span>{sign.note}</span>
            </ReadingChip>
          </HandStage>
        </HeroGrid>
      </Hero>

      <Rows>
        <Row id="how" title="Every sign has five parts">
          {PARTS.map((p) => (
            <PartCard key={p.name}>
              <span className="icon" aria-hidden="true">{p.icon}</span>
              <div>
                <h3>{p.name}</h3>
                <p>{p.text}</p>
              </div>
            </PartCard>
          ))}
        </Row>

        <Row id="features" title="What you can do with Salinterpret">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title}>
              <span className="icon" aria-hidden="true">{f.icon}</span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                {f.meter && <Meter aria-hidden="true"><div /></Meter>}
              </div>
            </FeatureCard>
          ))}
        </Row>

        <Row id="about" title="Meet the team">
          {TEAM.map((m) => (
            <TeamCard key={m.name}>
              <img src={m.img} alt={m.name} />
              <div className="info">
                <h3>{m.name}</h3>
                <p className="role">{m.role}</p>
                <p className="bio">{m.bio}</p>
              </div>
            </TeamCard>
          ))}
        </Row>
      </Rows>

      <Contact id="contact">
        <ContactGrid>
          <div>
            <ContactTitle>Questions? Write to us.</ContactTitle>
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
            <Button $variant="red" as="button" type="submit">Send message</Button>
          </form>
        </ContactGrid>
      </Contact>

      <Footer>&copy; {new Date().getFullYear()} Salinterpret. All rights reserved.</Footer>
    </>
  );
};

export default SalinterpretLandingPage;
