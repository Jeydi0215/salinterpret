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

  const handleLogIn = async () => {
    setLoading(true);
    try {
      const { email, password } = formValues;
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      console.log("User logged in with UID:", user.uid);
      await checkIfAdmin(user.uid);
    } catch (err) {
      console.log("Error during sign-in:", err);
      setLoading(false); // Ensure loading is stopped if an error occurs
    }
  };

  const checkIfAdmin = async (uid) => {
    try {
      // Update to match the correct collection
      const userDoc = doc(db, 'salinterpret', uid);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User document data:", userData);

        if (userData.roles && Array.isArray(userData.roles)) {
          console.log("User roles array:", userData.roles);
          if (userData.roles.includes("admin")) {
            console.log("User is admin, navigating to /Main");
            navigate("/Main"); // Redirect to admin main page
          } else {
            console.log("User is not admin, navigating to /UserMain");
            navigate("/UserMain"); // Redirect to user main page
          }
        } else {
          console.log("User roles field is not an array or is missing.");
          navigate("/UserMain"); // Default to user main page if roles field is invalid
        }
      } else {
        console.log("User document does not exist");
        navigate("/UserMain"); // Default to user main page if document is missing
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/UserMain"); // Default to user main page on error
    } finally {
      setLoading(false); // Stop loading once role is confirmed
    }
  };

  return (
    <Container>
      <BackgroundImage />
      <div className="content">
        <Header />
        <div className="form-container flex column a-center j-center">
          <div className="form flex column a-center j-center">
            <div className="title">
              <h3>Login</h3>
            </div>
            <div className="container flex column">
              <input 
                type="email" 
                placeholder="Email Address" 
                name="email" 
                value={formValues.email} 
                onChange={(e) => setFormValues({...formValues, [e.target.name]: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Password" 
                name="password" 
                value={formValues.password} 
                onChange={(e) => setFormValues({...formValues, [e.target.name]: e.target.value})}
              />
              <button onClick={handleLogIn} disabled={loading}>
                {loading ? "Loading..." : "Log in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  position: relative;

  .content {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    height: 100vh;
    width: 100vw;
    display: grid;
    grid-template-rows: 15vh 85vh;
    align-items: center;
  }

  .form-container {
    gap: 2rem;
    height: 85vh;
  }

  .form {
    padding: 2rem;
    background-color: #000000b0;
    width: 25vw;
    gap: 2rem;
    color: white;

    .container {
      gap: 2rem;

      input {
        padding: 0.5rem 1rem;
        width: 15rem;
      }

      button {
        padding: 0.5rem 1rem;
        background-color: #e50914;
        border: none;
        cursor: pointer;
        color: white;
        border-radius: 0.2rem;
        font-weight: bolder;
        font-size: 1.05rem;
      }
    }
  }

  @media (max-width: 768px) {
    .form {
      width: 50vw;

      .container {
        input {
          width: 100%;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .form {
      width: 75vw;
      
      .container {
        input {
          width: 100%;
        }

        button {
          width: 100%;
        }
      }
    }
  }
`;
