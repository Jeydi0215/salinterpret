import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import BackgroundImage from '../components/BackgroundImage';
import Header from '../components/Header';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '../utils/firebase-config';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser) navigate("/Main");
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    if (!formValues.email) {
      setError("Email is required.");
      return false;
    }
    
    if (showPassword && !formValues.password) {
      setError("Password is required.");
      return false;
    }
    
    if (showPassword && formValues.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    
    return true;
  };

  const handleGetStarted = () => {
    if (formValues.email) {
      setError("");
      setShowPassword(true);
    } else {
      setError("Please enter your email.");
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const { email, password } = formValues;
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        roles: ["user"],
        createdAt: new Date().toISOString()
      });

      // Check user role and redirect
      await checkIfAdmin(user.uid);
    } catch (err) {
      console.log(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  const checkIfAdmin = async (uid) => {
    try {
      const userDoc = doc(db, 'users', uid);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.roles && userData.roles.includes("admin")) {
          navigate("/Main"); // Redirect to admin main page
        } else {
          navigate("/UserMain"); // Redirect to user main page
        }
      } else {
        navigate("/UserMain"); // Default to user main page
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/UserMain"); // Default to user main page on error
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!showPassword) {
        handleGetStarted();
      } else {
        handleSignUp();
      }
    }
  };

  return (
    <Container>
      <BackgroundImage />
      <div className="content">
        <Header login />
        <div className="body">
          <div className="hero-content">
            <h1>Unlock the Language of Silence</h1>
            <h2>Sign up to start learning today.</h2>
            
            <div className="signup-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-container">
                <div className="form-description">
                  Ready to start? Enter your email to create your account.
                </div>
                <div className="login-link">
                  <span onClick={() => navigate("/login")} className="back-to-login">
                    &nbsp;&nbsp;Already have an account? Sign in
                  </span>
                </div>
              </div>
              
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email address"
                  name="email"
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, [e.target.name]: e.target.value })}
                  onKeyPress={handleKeyPress}
                />
                
                {!showPassword ? (
                  <button 
                    className="get-started-btn" 
                    onClick={handleGetStarted}
                  >
                    Get Started <span className="arrow">›</span>
                  </button>
                ) : null}
              </div>
              
              {showPassword && (
                <>
                  <div className="password-container">
                    <input
                      type="password"
                      placeholder="Create a password"
                      name="password"
                      value={formValues.password}
                      onChange={(e) => setFormValues({ ...formValues, [e.target.name]: e.target.value })}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  
                  <button 
                    className="signup-button" 
                    onClick={handleSignUp}
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw;

  .content {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.75);
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
  }

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 5%;
  }

  .hero-content {
    text-align: center;
    max-width: 950px;
    margin: 0 auto;
    color: white;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 400;
    margin-bottom: 2rem;
  }

  .signup-form {
    margin-top: 1rem;
    width: 100%;
    max-width: 800px;
  }

  .form-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .form-description {
    font-size: 1.2rem;
    text-align: left;
  }

  .login-link {
    text-align: right;
    margin-left: 15px;
  }

  .back-to-login {
    color: #44bdd9;
    cursor: pointer;
    font-size: 1rem;
    text-decoration: none;
    white-space: nowrap;
  }

  .back-to-login:hover {
    text-decoration: underline;
  }

  .error-message {
    background-color: #e87c03;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    margin: 0 0 16px;
    padding: 10px 20px;
    text-align: left;
  }

  .input-group {
    display: flex;
    margin-bottom: 1rem;
  }

  input {
    background-color: rgba(22, 22, 22, 0.7);
    border: 1px solid #8c8c8c;
    border-radius: 4px;
    color: white;
    height: 60px;
    line-height: 60px;
    padding: 0 20px;
    font-size: 16px;
    flex: 1;
  }

  input:focus {
    outline: none;
    border-color: white;
  }

  .password-container {
    margin-bottom: 1rem;
    
    input {
      width: 100%;
    }
  }

  .get-started-btn {
    background-color: #44bdd9;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.5rem;
    font-weight: 500;
    min-height: 60px;
    padding: 0 2rem;
    cursor: pointer;
    margin-left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .arrow {
    font-size: 1.8rem;
    margin-left: 8px;
  }

  .signup-button {
    background-color: #44bdd9;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    margin: 24px 0 12px;
    padding: 16px;
    width: 100%;
    height: 60px;
  }

  .signup-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 950px) {
    h1 {
      font-size: 2rem;
    }
    
    h2 {
      font-size: 1.2rem;
    }
    
    .form-description {
      font-size: 1rem;
    }
  }

  @media (max-width: 740px) {
    .form-container {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .login-link {
      margin-top: 0.5rem;
      text-align: left;
    }
    
    .input-group {
      flex-direction: column;
    }
    
    .get-started-btn {
      margin-left: 0;
      margin-top: 1rem;
      width: 100%;
      font-size: 1.2rem;
    }
    
    input {
      width: 100%;
    }
  }

  @media (max-width: 500px) {
    h1 {
      font-size: 1.75rem;
    }
    
    .body {
      padding: 0 5%;
    }
  }
`;
