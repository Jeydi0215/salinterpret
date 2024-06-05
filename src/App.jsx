import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './pages/Signup';
import Main from './pages/Main';
import Login from './pages/Login';
import Player from './pages/Player';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import Quiz from './pages/Quiz';
import Translation from './pages/Translation';
import Start from './pages/Start'

  

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Start />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Courses" element={<Courses />} /> 
        <Route path="/upload" element={<Upload />} /> 
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/Player" element={<Player />} /> 
        <Route path="/Translation" element={<Translation/>} /> 
        <Route path="/Quiz" element={<Quiz/>} /> 
        <Route path="/Main" element={<Main />} />
   
        
      </Routes>
    </BrowserRouter>
  );
}
