import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import logo from '../assets/logo.png';
import { FaPowerOff, FaHome, FaBook, FaComment, FaSpellCheck } from 'react-icons/fa';
import { firebaseAuth } from '../utils/firebase-config';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ isScrolled }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const links = [
    { 
      name: 'Home', 
      link: '/UserMain',
      icon: <FaHome />
    },
    { 
      name: 'Courses', 
      link: '/Courses',
      icon: <FaBook />
    },
    { 
      name: 'Words', 
      link: '/Translation',
      icon: <FaComment />
    },
    { 
      name: 'Letters', 
      link: '/TranslationLetters',
      icon: <FaSpellCheck />
    }
  ];

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (!currentUser) navigate("/login");
  });

  const isLinkActive = (link) => {
    return location.pathname === link;
  };

  if (isMobile) {
    return (
      <>
        {/* Top Header for Mobile */}
        <MobileTopHeader>
          <div className="brand">
            <img src={logo} alt="logo" />
          </div>
          <button className="logout-btn" onClick={() => signOut(firebaseAuth)}>
            <FaPowerOff />
          </button>
        </MobileTopHeader>

        {/* Bottom Navigation for Mobile */}
        <MobileBottomNav>
          {links.map(({ name, link, icon }) => (
            <Link
              key={name}
              to={link}
              className={`nav-item ${isLinkActive(link) ? 'active' : ''}`}
            >
              <div className="icon">{icon}</div>
              <span className="label">{name}</span>
            </Link>
          ))}
        </MobileBottomNav>
      </>
    );
  }

  // Desktop Navigation (unchanged)
  return (
    <Container>
      <nav className={`flex ${isScrolled ? 'scrolled' : ''}`}>
        <div className="left flex a-center">
          <div className="brand flex a-center j-center">
            <img src={logo} alt="logo" />
          </div>
          <ul className="links flex">
            {links.map(({ name, link }) => (
              <li key={name}>
                <Link
                  to={link}
                  className={isLinkActive(link) ? 'active' : ''}
                >
                  {name === 'Words' ? 'TranslateWords' : name === 'Letters' ? 'TranslateLetters' : name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="right flex a-center">
          <button onClick={() => signOut(firebaseAuth)}>
            <FaPowerOff />
          </button>
        </div>
      </nav>
    </Container>
  );
}

const MobileTopHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(67, 191, 219, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 1000;

  .brand {
    img {
      height: 2.5rem;
    }
  }

  .logout-btn {
    background: rgba(243, 66, 66, 0.1);
    border: 1px solid rgba(243, 66, 66, 0.3);
    border-radius: 8px;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(243, 66, 66, 0.2);
      transform: scale(1.05);
    }

    svg {
      color: #f34242;
      font-size: 1.1rem;
    }
  }
`;

const MobileBottomNav = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4.5rem;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(67, 191, 219, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 0.5rem;
  z-index: 1000;

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 4rem;
    position: relative;

    .icon {
      font-size: 1.2rem;
      color: #a1a1aa;
      transition: all 0.3s ease;
      margin-bottom: 0.25rem;
    }

    .label {
      font-size: 0.7rem;
      color: #a1a1aa;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    &:hover:not(.active) {
      background: rgba(67, 191, 219, 0.1);
      transform: translateY(-2px);

      .icon, .label {
        color: #ffffff;
      }
    }

    &.active {
      background: linear-gradient(135deg, #43BFDB 0%, #0ea5e9 100%);
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(67, 191, 219, 0.4);

      .icon, .label {
        color: #ffffff;
      }

      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 3px;
        background: #ffffff;
        border-radius: 2px;
        animation: glow 2s infinite;
      }
    }

    @media screen and (max-width: 480px) {
      min-width: 3.5rem;
      padding: 0.4rem;

      .icon {
        font-size: 1.1rem;
        margin-bottom: 0.2rem;
      }

      .label {
        font-size: 0.65rem;
      }
    }
  }

  @keyframes glow {
    0%, 100% {
      opacity: 0.8;
      box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
    }
  }
`;

const Container = styled.div`
  .scrolled {
    background-color: black;
  }
  nav {
    position: sticky;
    top: 0;
    height: 6.5rem;
    width: 100%;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2;
    padding: 0 4rem;
    align-items: center;
    transition: 0.3s ease-in-out;

    .left {
      gap: 2rem;
      .brand {
        img {
          height: 4rem;
        }
      }
      .links {
        list-style-type: none;
        gap: 1rem;
        li {
          position: relative;
          z-index: 1;
          
          a {
            color: #a1a1aa;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            display: block;
            z-index: 2;
            
            &::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
              transition: left 0.5s ease;
              z-index: -1;
            }

            &:hover {
              color: #ffffff;
              background: rgba(67, 191, 219, 0.1);
              transform: translateY(-2px);
              box-shadow: 0 4px 15px rgba(67, 191, 219, 0.15);
              z-index: 3;
              
              &::before {
                left: 100%;
              }
            }

            &.active {
              color: #ffffff;
              background: linear-gradient(135deg, #43BFDB 0%, #0ea5e9 100%);
              box-shadow: 0 4px 15px rgba(67, 191, 219, 0.25);
              transform: translateY(-1px);
              z-index: 3;
              
              &::after {
                content: '';
                position: absolute;
                top: 50%;
                right: 12px;
                width: 6px;
                height: 6px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                transform: translateY(-50%);
                animation: pulse 2s infinite;
                z-index: 1;
              }
            }
          }
        }
      }
    }
    .right {
      gap: 1rem;
      button {
        background-color: transparent;
        border: none;
        cursor: pointer;
        &:focus {
          outline: none;
        }
        svg {
          color: #f34242;
          font-size: 1.2rem;
        }
      }
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.8;
      transform: translateY(-50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
  }

  @media screen and (max-width: 768px) {
    display: none; /* Hide desktop nav on mobile */
  }
`;
