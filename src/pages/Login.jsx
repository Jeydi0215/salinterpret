import React, { useState } from 'react';
import styled from "styled-components";
import BackgroundImage from '../components/BackgroundImage';
import Header from '../components/Header';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../utils/firebase-config';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export default function Login() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogIn = async () => {
    if (!formValues.email || !formValues.password) {
      setError("Please enter both email and password.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const { email, password } = formValues;
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      console.log("User logged in with UID:", user.uid);
      await checkIfAdmin(user.uid);
    } catch (err) {
      console.log("Error during sign-in:", err);
      setError("Incorrect email or password. Please try again.");
      setLoading(false);
    }
  };

  const checkIfAdmin = async (uid) => {
    try {
      const userDoc = doc(db, 'salinterpret', uid);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        if (userData.roles && Array.isArray(userData.roles)) {
          if (userData.roles.includes("admin")) {
            navigate("/Main"); 
          } else {
            navigate("/UserMain"); 
          }
        } else {
          navigate("/UserMain"); 
        }
      } else {
        navigate("/UserMain"); 
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/UserMain"); 
    } finally {
      setLoading(false); 
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogIn();
    }
  };

  return (
    <Container>
      <BackgroundImage />
      <div className="content">
        <Header hideSignIn={true} />
        <div className="form-container">
          <div className="login-form">
            <h1>Sign In</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Email or phone number" 
                name="email" 
                value={formValues.email} 
                onChange={(e) => setFormValues({...formValues, [e.target.name]: e.target.value})}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Password" 
                name="password" 
                value={formValues.password} 
                onChange={(e) => setFormValues({...formValues, [e.target.name]: e.target.value})}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <button 
              className="signin-button" 
              onClick={handleLogIn} 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            
            <div className="form-footer">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="help-link">Need help?</a>
            </div>
            
            <div className="signup-now">
              <span>New here? </span>
              <a href="/signup" onClick={(e) => {e.preventDefault(); navigate('/signup');}}>Sign up now</a>
            </div>
            
            <div className="recaptcha-info">
             
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

  .form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .login-form {
    background-color: rgba(0, 0, 0, 0.75);
    border-radius: 4px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 600px;
    max-height: 700px;
    padding: 60px 68px 40px;
    margin-bottom: 90px;
    width: 450px;
    color: white;
  }

  h1 {
    color: white;
    font-size: 32px;
    font-weight: 500;
    margin-bottom: 28px;
  }

  .error-message {
    background-color: #e87c03;
    border-radius: 4px;
    font-size: 14px;
    margin: 0 0 16px;
    padding: 10px 20px;
  }

  .input-group {
    margin-bottom: 16px;
  }

  input {
    background-color: #333;
    border: none;
    border-radius: 4px;
    color: white;
    height: 50px;
    line-height: 50px;
    padding: 16px 20px 0;
    width: 100%;
    box-sizing: border-box;
    font-size: 16px;
  }

  input::placeholder {
    color: #8c8c8c;
  }

  input:focus {
    outline: none;
    background-color: #454545;
  }

  .signin-button {
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
  }

  .signin-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    margin-bottom: 60px;
    font-size: 13px;
    color: #b3b3b3;
  }

  .remember-me {
    display: flex;
    align-items: center;
  }

  .remember-me input {
    height: auto;
    width: auto;
    margin-right: 5px;
  }

  .help-link {
    color: #b3b3b3;
    text-decoration: none;
  }

  .help-link:hover {
    text-decoration: underline;
  }

  .signup-now {
    color: #737373;
    font-size: 16px;
    margin-top: 16px;
  }

  .signup-now a {
    color: white;
    text-decoration: none;
    margin-left: 5px;
  }

  .signup-now a:hover {
    text-decoration: underline;
  }

  .recaptcha-info {
    color: #8c8c8c;
    font-size: 13px;
    margin-top: 20px;
  }

  @media (max-width: 740px) {
    .login-form {
      padding: 40px 40px 30px;
      width: 85%;
      min-height: auto;
    }
  }

  @media (max-width: 500px) {
    .login-form {
      padding: 30px 20px 20px;
      width: 90%;
      margin-bottom: 40px;
    }

    h1 {
      font-size: 24px;
    }

    .form-footer {
      flex-direction: column;
      gap: 10px;
      margin-bottom: 30px;
    }
  }
`;
