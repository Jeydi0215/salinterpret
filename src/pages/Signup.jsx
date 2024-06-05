import React, { useState } from 'react';
import styled from "styled-components";
import BackgroundImage from '../components/BackgroundImage';
import Header from '../components/Header';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '../utils/firebase-config';
import {  useNavigate } from 'react-router-dom';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email:"",
    password:"",
  })

  onAuthStateChanged(firebaseAuth,(currentUser)=>{
    if(currentUser) navigate("/Main");
  })
  const handleSignIn = async ()=>{
    try{
        const{email , password} = formValues;
        await createUserWithEmailAndPassword(firebaseAuth,email,password)
    }catch(err){
        console.log(err)
    }
  }


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
            <input type="email" placeholder="Email Address" name="email" value={formValues.email} onChange={(e)=>setFormValues({...formValues,[e.target.name]:e.target.value})}/>
            {showPassword && (
              <input type="password" placeholder="Password" name="password" value={formValues.password} onChange={(e)=>setFormValues({...formValues,[e.target.name]:e.target.value})}/>
            )}
            {!showPassword && <button onClick={() => setShowPassword(true)}>Get Started</button>}
          
          </div>
          <SignUpbutton onClick={handleSignIn}>SignUp</SignUpbutton>
        </div>
      </div>
    </Container>
  )
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


const SignUpbutton = styled.div `
          padding: 0.5rem 0.3rem;
          background-color:red;
          color:white;
          border:none;
          height:36px;
          width:74px;
          border-radius:18px;
          font-weight:bold;
          font-size:15px;
          cursor:pointer;
          margin-top: 1rem;
`
