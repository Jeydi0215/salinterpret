import React, { useState } from 'react';
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

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (currentUser) navigate("/Main");
  });

  const handleSignIn = async () => {
    try {
      const { email, password } = formValues;
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // Assuming you have some logic to determine if the user should be an admin
      // For demonstration purposes, this example sets the admin status to false.
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        isAdmin: false // Set to true if you want this user to be an admin
      });

      // Check if the user is an admin and redirect accordingly
      checkIfAdmin(user.uid);
    } catch (err) {
      console.log(err);
    }
  };

  const checkIfAdmin = async (uid) => {
    try {
      const userDoc = doc(db, 'users', uid);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.isAdmin) {
          navigate("/Main"); // Redirect to admin main page
        } else {
          navigate("/UserMain");  // Redirect to user main page
        }
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  return (
    <Container showPassword={showPassword}>
      <BackgroundImage />
      <div className="content">
        <Header login />
        <div className="body flex column a-center j-center">
          <div className="text">
            <h1>Unlock the Language of Silence</h1>
            <h4>Start Now</h4>
            <h6>Enter your Email to start</h6>
          </div>
          <div className="form">
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={formValues.email}
              onChange={(e) => setFormValues({ ...formValues, [e.target.name]: e.target.value })}
            />
            {showPassword && (
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formValues.password}
                onChange={(e) => setFormValues({ ...formValues, [e.target.name]: e.target.value })}
              />
            )}
            {!showPassword && <button onClick={() => setShowPassword(true)}>Get Started</button>}
          </div>
          <SignUpbutton onClick={handleSignIn}>SignUp</SignUpbutton>
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

    .body {
      gap: 1rem;
      text-align: center; 
      width: 100%;

      .text {
        gap: 1rem;
        font-size: 2rem;
        width: 100%;
        margin-bottom: 1rem;

        h1 {
          padding: 0;
          text-align: center;
        }
      }

      .form {
        display: grid;
        grid-template-columns: ${({ showPassword }) => showPassword ? "1fr 1fr" : "2fr 1fr"};
        justify-content: center;
        gap: 0; 
        width: 90%; 
        margin: auto;

        input {
          color: black;
          border: none;
          padding: 1rem;
          font-size: 1rem;
          border: 1px solid black;
          width: 100%;

          &:focus {
            outline: none;
          }
        }

        button {
          padding: 0.8rem 1rem;
          background-color: #e50914;
          border: none;
          cursor: pointer;
          color: white;
          font-weight: bolder;
          font-size: 1rem;
          width: 100%;
          margin-top: 1rem;
        }
      }
    }
  }
`;

const SignUpbutton = styled.div`
  padding: 0.5rem 0.3rem;
  background-color: red;
  color: white;
  border: none;
  height: 36px;
  width: 74px;
  border-radius: 18px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  margin-top: 1rem;
`;
