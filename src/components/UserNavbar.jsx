import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import logo from '../assets/logo.png';
import { FaPowerOff, FaUserCircle } from 'react-icons/fa';
import { firebaseAuth } from '../utils/firebase-config';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ isScrolled }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    { name: 'Home', link: '/UserMain' },
    { name: 'Courses', link: '../Courses' },
    { name: 'Translate', link: '/Translation' },
  ];

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (!currentUser) navigate("/login");
  });

  return (
    <Container>
      <nav className={`flex ${isScrolled ? 'scrolled' : ''}`}>
        <div className="left flex a-center">
          <div className="brand flex a-center j-center">
            <img src={logo} alt="logo" />
          </div>
          {isMobile ? (
            <div className="dropdown">
              <div className="dropdown-btn" onClick={() => setIsOpen(!isOpen)}>
                <span>Menu</span>
              </div>
              {isOpen && (
                <ul className="dropdown-menu">
                  {links.map(({ name, link }) => (
                    <li key={name}>
                      <Link to={link}>{name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <ul className="links flex">
              {links.map(({ name, link }) => (
                <li key={name}>
                  <Link to={link}>{name}</Link>
                </li>
              ))}
            </ul>
          )}
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
    left:0;
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
        list-style-type: none; /* Remove bullets */
        gap: 2rem;
        li {
          a {
            color: gray;
            text-decoration: none;
          }
        }
      }
      .dropdown {
        position: relative;
        .dropdown-btn {
          cursor: pointer;
          span {
            color: gray;
          }
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: black; /* Change background color */
          border-radius: 5px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 10px;
          width: 150px;
          z-index: 3;
          li {
            a {
              color: gray;
              text-decoration: none;
              display: block;
              padding: 8px 0;
              &:hover {
                color: #007bff;
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
      .user-profile {
        color: white;
        font-size: 1.5rem;
        margin-right:7px;
      }
    }
  }

  @media screen and (max-width: 768px) {
    nav {
      padding: 0 2rem;
      .left {
        .brand {
          img {
            height: 3rem;
          }
        }
        .links {
          display: none;
        }
        .dropdown {
          display: block;
        }
      }
    }
  }
`;
