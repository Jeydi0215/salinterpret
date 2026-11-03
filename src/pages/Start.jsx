// SalinterpretLandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import logo from '../assets/logo.png';
import lopit from '../assets/lopit.png';
import Hacker from '../assets/Dimalanta.jpg';
import Hipster from '../assets/Acar.jpg';
import Mentor from '../assets/Mentor.png';
import Member from '../assets/Mamangun.jpg';

/* ---------- Tokens ---------- */
const C = {
  black: '#000000',
  red: '#E50914',
  white: '#FFFFFF',
  gray: '#B3B3B3',
  dim: '#737373',
  line: '#222222',
  panel: '#2D2D2D',
  green: '#46D369',
  blue: '#4061E7',
};
const FONT = "'Figtree', 'Segoe UI', Helvetica, Arial, sans-serif";

const pop = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: none; }
`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;800;900&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: ${FONT};
    color: ${C.white};
    background: ${C.black};
    line-height: 1.5;
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
  { x: 150, y: 235, len: [72, 44, 34], spread: -8 },
  { x: 190, y: 220, len: [80, 50, 36], spread: -2 },
  { x: 228, y: 228, len: [72, 46, 34], spread: 5 },
  { x: 262, y: 250, len: [56, 36, 28], spread: 14 },
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
        <circle key={i} cx={p.x} cy={p.y} r="6" fill={C.black} stroke={C.white} strokeWidth="3" />
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

/* ---------- Hero ---------- */
const Hero = styled.header`
  position: relative;
  min-height: 720px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 140px 4% 150px;
  background:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.55) 45%, rgba(0, 0, 0, 0.9) 100%),
    url(${lopit}) center / cover no-repeat;
`;

const TopBar = styled.div`
  position: absolute;
  inset: 0 0 auto 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 4%;
  z-index: 3;
  img { height: 44px; width: auto; }
`;

const Button = styled.a`
  display: inline-block;
  padding: 8px 18px;
  border: 0;
  border-radius: 4px;
  background: ${C.red};
  color: ${C.white};
  font: 600 1rem ${FONT};
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover { background: #f6121d; }
`;

const HeroInner = styled.div`
  max-width: 820px;
  position: relative;
  z-index: 2;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.3rem, 6vw, 4rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 16px;
`;

const HeroSub = styled.p`
  font-size: clamp(1.1rem, 2.2vw, 1.5rem);
  margin-bottom: 20px;
`;

const Ask = styled.p`
  font-size: clamp(1rem, 1.6vw, 1.15rem);
`;

const BarForm = styled.form`
  display: flex;
  gap: 8px;
  max-width: 700px;
  margin: 18px auto 0;
  @media (max-width: 700px) { flex-direction: column; }
`;

const BarInput = styled.input`
  flex: 1;
  height: 56px;
  padding: 0 16px;
  border: 1px solid rgba(128, 128, 128, 0.7);
  border-radius: 4px;
  background: rgba(22, 22, 22, 0.7);
  color: ${C.white};
  font: 400 1rem ${FONT};
  &::placeholder { color: ${C.gray}; }
  &:focus { outline: none; border-color: ${C.white}; }
`;

const BarButton = styled.button`
  height: 56px;
  padding: 0 28px;
  border: 0;
  border-radius: 4px;
  background: ${C.red};
  color: ${C.white};
  font: 600 clamp(1.1rem, 2vw, 1.5rem) ${FONT};
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover { background: #f6121d; }
`;

const EmailBar = () => {
  const [email, setEmail] = useState('');
  const submit = (e) => {
    e.preventDefault();
    window.location.assign(`/login${email ? `?email=${encodeURIComponent(email)}` : ''}`);
  };
  return (
    <BarForm onSubmit={submit}>
      <BarInput
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        aria-label="Email address"
        autoComplete="email"
      />
      <BarButton type="submit">Get Started <span aria-hidden="true">›</span></BarButton>
    </BarForm>
  );
};

/* Netflix-style glowing curve under the hero */
const Curve = styled.div`
  position: relative;
  z-index: 2;
  height: 90px;
  margin-top: -90px;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  background: linear-gradient(90deg, transparent, ${C.red} 25%, ${C.blue} 75%, transparent);
  &::after {
    content: '';
    position: absolute;
    inset: 4px 0 0 0;
    border-radius: inherit;
    background: radial-gradient(50% 500% at 50% -420%, rgba(64, 97, 231, 0.4) 80%, rgba(0, 0, 0, 0.1) 100%), ${C.black};
  }
`;

/* ---------- Carousel rows ---------- */
const RowWrap = styled.section`
  position: relative;
  z-index: 3;
  padding: 28px 0 56px;
  scroll-margin-top: 20px;
`;

const RowTitle = styled.h2`
  font-size: clamp(1.2rem, 2.2vw, 1.6rem);
  font-weight: 700;
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
  background: rgba(0, 0, 0, 0.6);
  color: ${C.white};
  font-size: 2.6rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  &:focus-visible { opacity: 1; }
  @media (hover: none) { display: none; }
`;

const lift = `
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  &:hover { transform: scale(1.07); z-index: 3; box-shadow: 0 14px 30px rgba(0, 0, 0, 0.7); }
`;

const PartCard = styled.article`
  position: relative;
  width: 240px;
  min-height: 330px;
  padding: 24px 22px;
  border-radius: 6px;
  background: linear-gradient(160deg, #303030, #1a1a1a 55%, #0d0d0d);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  ${lift}
  &::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 4px; background: ${C.red}; }
  .icon { font-size: 3.4rem; line-height: 1; }
  h3 { font-size: 1.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 8px; }
  p { font-size: 0.95rem; color: ${C.gray}; }
`;

const TeamCard = styled.article`
  position: relative;
  width: 240px;
  aspect-ratio: 2 / 3;
  border-radius: 6px;
  overflow: hidden;
  background: #1a1a1a;
  ${lift}
  img { width: 100%; height: 100%; object-fit: cover; }
  .info {
    position: absolute;
    inset: auto 0 0 0;
    padding: 70px 18px 18px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 30%, transparent);
  }
  h3 { font-size: 1.25rem; font-weight: 800; line-height: 1.15; }
  .role { color: #ff4b55; font-weight: 600; font-size: 0.9rem; }
  .bio { font-size: 0.88rem; color: ${C.gray}; max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.3s ease, opacity 0.3s ease; }
  &:hover .bio { max-height: 90px; opacity: 1; margin-top: 6px; }
  @media (hover: none) { .bio { max-height: none; opacity: 1; margin-top: 6px; } }
`;

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

/* ---------- Feature sections ---------- */
const Feature = styled.section`
  border-top: 8px solid ${C.line};
  padding: 72px 4%;
  scroll-margin-top: 0;
  > div {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 48px;
    flex-direction: ${({ $flip }) => ($flip ? 'row-reverse' : 'row')};
  }
  @media (max-width: 900px) {
    > div { flex-direction: column; text-align: center; gap: 32px; }
  }
`;

const FeatText = styled.div`
  flex: 1;
  h2 { font-size: clamp(1.9rem, 4.4vw, 3.1rem); font-weight: 900; line-height: 1.1; margin-bottom: 16px; }
  p { font-size: clamp(1.1rem, 2vw, 1.5rem); }
`;

const FeatVisual = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Screen = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  padding: 40px 24px 24px;
  border: 2px solid #333;
  border-radius: 16px;
  background: radial-gradient(circle at 50% 45%, rgba(229, 9, 20, 0.3), #0a0a0a 65%);
  &::before {
    content: '';
    position: absolute;
    top: 14px;
    left: 18px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #444;
    box-shadow: 18px 0 #444, 36px 0 #444;
  }
  svg { display: block; width: 100%; max-height: 400px; height: auto; }
`;

const ReadingChip = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  padding: 10px 16px;
  border-left: 4px solid ${C.red};
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.07);
  font-size: 0.9rem;
  animation: ${pop} 0.35s ease both;
  strong { font-size: 1.6rem; font-weight: 900; line-height: 1; }
  span { color: ${C.gray}; }
  .match { margin-left: auto; color: ${C.green}; font-weight: 600; }
`;

const Phone = styled.div`
  position: relative;
  width: 250px;
  aspect-ratio: 9 / 18;
  padding: 34px 10px 12px;
  border: 8px solid #262626;
  border-radius: 38px;
  background: radial-gradient(circle at 50% 40%, rgba(229, 9, 20, 0.28), #0a0a0a 70%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 14px;
    border-radius: 8px;
    background: #262626;
  }
  svg { width: 100%; height: auto; display: block; }
  .cap { text-align: center; font-size: 0.85rem; }
  .cap strong { display: block; font-size: 1.4rem; font-weight: 900; }
  .match { color: ${C.green}; font-weight: 600; }
`;

const Chat = styled.div`
  width: 100%;
  max-width: 460px;
  padding: 20px;
  border: 2px solid #333;
  border-radius: 16px;
  background: #0d0d0d;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .who { font-size: 0.8rem; color: ${C.gray}; margin-bottom: 2px; }
  .bubble { padding: 12px 16px; border-radius: 16px; max-width: 85%; font-size: 1.05rem; }
  .them { align-self: flex-start; background: ${C.red}; border-bottom-left-radius: 4px; }
  .me { align-self: flex-end; background: ${C.panel}; border-bottom-right-radius: 4px; }
  .group { display: flex; flex-direction: column; }
  .group.me-side { align-items: flex-end; }
`;

const ConfCard = styled.div`
  width: 100%;
  max-width: 460px;
  padding: 18px;
  border: 2px solid #333;
  border-radius: 16px;
  background: #0d0d0d;
  .head { font-size: 0.85rem; color: ${C.gray}; margin-bottom: 8px; }
  .row { display: grid; grid-template-columns: 90px 1fr 48px; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid #222; }
  .row:first-of-type { border-top: 0; }
  .name { font-weight: 800; font-size: 1.1rem; }
  .bar { height: 8px; border-radius: 4px; background: #333; overflow: hidden; }
  .bar div { height: 100%; background: ${C.green}; }
  .pct { color: ${C.green}; font-weight: 600; text-align: right; }
`;

/* ---------- More reasons ---------- */
const ReasonsWrap = styled.section`
  border-top: 8px solid ${C.line};
  padding: 72px 4%;
  > h2 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; max-width: 1100px; margin: 0 auto 24px; }
`;

const ReasonGrid = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`;

const Reason = styled.article`
  min-height: 250px;
  padding: 22px;
  border-radius: 16px;
  background: linear-gradient(149deg, #192247 0%, #210e17 95%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  h3 { font-size: 1.4rem; font-weight: 800; line-height: 1.2; margin-bottom: 10px; }
  p { color: ${C.gray}; }
  .icon { align-self: flex-end; font-size: 3.4rem; line-height: 1; }
`;

/* ---------- FAQ ---------- */
const FaqWrap = styled.section`
  border-top: 8px solid ${C.line};
  padding: 72px 4% 80px;
  text-align: center;
  scroll-margin-top: 0;
  > h2 { font-size: clamp(1.9rem, 4.4vw, 3.1rem); font-weight: 900; margin-bottom: 28px; }
`;

const FaqList = styled.div`
  max-width: 820px;
  margin: 0 auto 48px;
  text-align: left;
`;

const FaqItem = styled.div`
  margin-bottom: 8px;
  background: ${C.panel};
  button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 22px 24px;
    border: 0;
    background: transparent;
    color: ${C.white};
    font: 400 clamp(1.1rem, 2.2vw, 1.5rem) ${FONT};
    text-align: left;
    cursor: pointer;
    transition: background 0.2s ease;
    &:hover { background: #414141; }
  }
  .plus { font-size: 2.2rem; line-height: 1; transition: transform 0.25s ease; transform: rotate(${({ $open }) => ($open ? '45deg' : '0')}); }
  .answer {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    padding: 22px 24px;
    border-top: 1px solid ${C.black};
    font-size: clamp(1rem, 2vw, 1.3rem);
  }
`;

/* ---------- Footer ---------- */
const Footer = styled.footer`
  border-top: 8px solid ${C.line};
  padding: 56px 4% 60px;
  color: ${C.dim};
  font-size: 0.92rem;
  > div { max-width: 1000px; margin: 0 auto; }
  .q a { color: ${C.dim}; }
  ul { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin: 24px 0; }
  a { color: ${C.dim}; }
  a:hover { text-decoration: underline; }
`;

/* ---------- Data ---------- */
const PARTS = [
  { icon: '✊', name: 'Handshape', text: 'The shape your fingers make, like a fist, a flat hand or a pointing finger.' },
  { icon: '📍', name: 'Location', text: 'Where the sign happens: near the chin, at the chest, or out in front of you.' },
  { icon: '🌊', name: 'Movement', text: 'How the hands travel. The same shape can mean different things with a different motion.' },
  { icon: '🔄', name: 'Palm orientation', text: 'Which way the palm faces: toward you, away, up or down.' },
  { icon: '🙂', name: 'Facial expression', text: 'Eyebrows, eyes and mouth add grammar and tone, such as marking a question.' },
];

const REASONS = [
  { icon: '📚', title: 'Learning resources', desc: 'Tutorials and guides to learn ASL basics.' },
  { icon: '🎥', title: 'Video tutorials', desc: 'Step-by-step videos to help you master ASL signs and usage.' },
  { icon: '🤝', title: 'Bridging the gap', desc: 'Connecting the ASL community with people who do not sign.' },
];

const TEAM = [
  { name: 'Justine Dimalanta', role: 'Hacker & Hustler', bio: 'Leading technical development and business strategy.', img: Hacker },
  { name: 'Lara Jane Acar', role: 'Hipster', bio: 'Designing an intuitive user experience.', img: Hipster },
  { name: 'Jerson Mamangun', role: 'Co-Hacker', bio: "Refining the app's performance and core functionality.", img: Member },
  { name: 'Chris Allen Pineda', role: 'Project Adviser', bio: 'Guiding our mission to make communication accessible.', img: Mentor },
];

const FAQ = [
  { q: 'What is Salinterpret?', a: 'Salinterpret is an AI-powered sign language interpretation platform. It turns American Sign Language into text in real time, so signers and non-signers can talk to each other.' },
  { q: 'How does it read signs?', a: 'It uses computer vision on your camera feed to recognize each sign, then shows the text along with a confidence score so you can see how sure the AI is.' },
  { q: 'Can I use it on my phone?', a: 'Yes. Salinterpret works on mobile and tablet as well as on a computer.' },
  { q: 'Can I learn ASL with it?', a: 'Yes. There are tutorials, guides and step-by-step video lessons for ASL basics.' },
  { q: 'Can more than one person join a conversation?', a: 'Yes. Salinterpret supports conversations between multiple users.' },
];

/* ---------- Page ---------- */
const SalinterpretLandingPage = () => {
  const { sign, curls } = useSigns();
  const [open, setOpen] = useState(0);

  const chip = (
    <ReadingChip key={sign.label} aria-live="polite">
      <span>Reading</span>
      <strong>{sign.label}</strong>
      <span className="match">{sign.conf}% match</span>
    </ReadingChip>
  );

  return (
    <>
      <GlobalStyle />
      <Analytics />

      <Hero id="home">
        <TopBar>
          <a href="#home" aria-label="Salinterpret home"><img src={logo} alt="Salinterpret" /></a>
          <Button as={Link} to="/login">Sign in</Button>
        </TopBar>
        <HeroInner>
          <HeroTitle>Your hands already say it. Now everyone can read it.</HeroTitle>
          <HeroSub>Real-time ASL to text, for signers and non-signers.</HeroSub>
          <Ask>Ready to start signing? Enter your email to get started.</Ask>
          <EmailBar />
        </HeroInner>
      </Hero>
      <Curve />

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

      <Feature id="features">
        <div>
          <FeatText>
            <h2>Signs become text as you sign</h2>
            <p>Instant ASL-to-text conversion powered by computer vision.</p>
          </FeatText>
          <FeatVisual>
            <Screen>
              <HandSkeleton curls={curls} />
              {chip}
            </Screen>
          </FeatVisual>
        </div>
      </Feature>

      <Feature $flip>
        <div>
          <FeatText>
            <h2>Use it on your phone or tablet</h2>
            <p>Salinterpret is mobile friendly, so you can use it anywhere.</p>
          </FeatText>
          <FeatVisual>
            <Phone>
              <HandSkeleton curls={curls} />
              <div className="cap">
                <span>Reading</span>
                <strong>{sign.label}</strong>
                <span className="match">{sign.conf}% match</span>
              </div>
            </Phone>
          </FeatVisual>
        </div>
      </Feature>

      <Feature>
        <div>
          <FeatText>
            <h2>Talk with more than one person</h2>
            <p>Conversations between multiple users, signing on one side and reading on the other.</p>
          </FeatText>
          <FeatVisual>
            <Chat>
              <div className="group">
                <span className="who">Signing</span>
                <div className="bubble them">Hello, nice to meet you</div>
              </div>
              <div className="group me-side">
                <span className="who">Typing</span>
                <div className="bubble me">Nice to meet you too!</div>
              </div>
              <div className="group">
                <span className="who">Signing</span>
                <div className="bubble them">Where is the library?</div>
              </div>
              <div className="group me-side">
                <span className="who">Typing</span>
                <div className="bubble me">Down the hall, on the left.</div>
              </div>
            </Chat>
          </FeatVisual>
        </div>
      </Feature>

      <Feature $flip>
        <div>
          <FeatText>
            <h2>See how sure it is</h2>
            <p>Every sign comes with a confidence score, so you know how far to trust the AI.</p>
          </FeatText>
          <FeatVisual>
            <ConfCard>
              <p className="head">Latest readings</p>
              {SIGNS.map((s) => (
                <div className="row" key={s.label}>
                  <span className="name">{s.label}</span>
                  <div className="bar" aria-hidden="true"><div style={{ width: `${s.conf}%` }} /></div>
                  <span className="pct">{s.conf}%</span>
                </div>
              ))}
            </ConfCard>
          </FeatVisual>
        </div>
      </Feature>

      <ReasonsWrap>
        <h2>More reasons to try it</h2>
        <ReasonGrid>
          {REASONS.map((r) => (
            <Reason key={r.title}>
              <div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
              <span className="icon" aria-hidden="true">{r.icon}</span>
            </Reason>
          ))}
        </ReasonGrid>
      </ReasonsWrap>

      <div style={{ borderTop: `8px solid ${C.line}`, paddingTop: 24 }} id="about">
        <Row title="Meet the team">
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
      </div>

      <FaqWrap id="faq">
        <h2>Frequently Asked Questions</h2>
        <FaqList>
          {FAQ.map((f, i) => (
            <FaqItem key={f.q} $open={open === i}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="plus" aria-hidden="true">+</span>
              </button>
              <div className="answer" role="region">{f.a}</div>
            </FaqItem>
          ))}
        </FaqList>
        <Ask>Ready to start signing? Enter your email to get started.</Ask>
        <EmailBar />
      </FaqWrap>

      <Footer id="contact">
        <div>
          <p className="q">Questions? Email us at <a href="mailto:salinterpretasl@gmail.com">salinterpretasl@gmail.com</a></p>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#how">How signs work</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">Team</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><Link to="/login">Sign in</Link></li>
          </ul>
          <p>&copy; {new Date().getFullYear()} Salinterpret. All rights reserved.</p>
        </div>
      </Footer>
    </>
  );
};

export default SalinterpretLandingPage;
