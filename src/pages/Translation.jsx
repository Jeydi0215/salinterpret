import React from 'react';
import styled, { keyframes } from 'styled-components';

function App() {
  return (
    <div className="App">
      {/* Title Bar */}
      <div id="titleBar">
        <h1 id="stage">Train Gestures</h1>
        <h3 id="steps">
          Train about 30 samples of your Start Gesture and 30 for your idle, Stop Gesture.
        </h3>
        <button id="nextButton" className="animated flash delay-3s">
          Next
        </button>
        <button id="predictButton" className="animated flash slideInRight faster">
          Translate
        </button>
        <button id="backButton" className="animated slideInLeft faster">
          Back to Training
        </button>
        <button id="videoCallBtn" className="videoCallBtn animated slideInRight faster">
          Video Call
        </button>
      </div>

      {/* Status Bar */}
      <div id="status">
        <p id="status-text">Status: Not Ready</p>
      </div>

      {/* Translator Window */}
      <div id="translatorWindow">
        {/* Initial Training Holder */}
        <div id="initialTrainingHolder">
          <img
            src=""
            alt="checkmark"
            id="checkmark_startButton"
            className="checkMark"
          />
          <button id="startButton" className="trainButton">
            A
          </button>
          <button id="clear_startButton" className="clearButton">
            Clear
          </button>
          <h3 id="counter_startButton" className="counter"></h3>

          <button id="stopButton" className="trainButton">
            B
          </button>
          <button id="clear_stopButton" className="clearButton">
            Clear
          </button>
          <h3 id="counter_stopButton" className="counter"></h3>
          <img
            src=""
            alt="checkmark"
            id="checkmark_stopButton"
            className="checkMark"
          />
        </div>

        {/* Video Holder */}
        <div id="videoHolder" className="videoContainerTrain">
          <video
            id="video"
            className="videoTrain"
            src=""
            muted
            autoplay
            playsinline
          ></video>
          <iframe
            src="https://tokbox.com/embed/embed/ot-embed.js?embedId=f37957b6-0f91-4fc5-90ce-f818cc85b5bf&room=DEFAULT_ROOM&iframe=true"
            width="650"
            height="370"
            allow="microphone; camera"
            id="videoCall"
          ></iframe>
        </div>

        {/* Training Holder */}
        <div id="trainingHolder">
          <h5 id="add-gesture">Add Gesture</h5>
          <img
            src="Images/plus_sign.svg"
            alt="Plus Sign"
            id="plus_sign"
            className="plus_sign animated"
          />
          <form id="add-word" autocomplete="off">
            <input type="text" id="new-word" placeholder="New Gesture Title" />
            <input type="submit" id="submit-word" value="Add Word &#9658;" />
          </form>
          <button id="doneRetrain" className="doneRetrain">
            Done Retraining
          </button>

          <div id="trainingCommands"></div>
        </div>

        {/* Translation Holder */}
        <div id="translationHolder">
          <div id="translatedCard"></div>
          <h3 id="translationText">Start Signing!</h3>
        </div>
      </div>

      {/* Trained Cards Holder */}
      <div id="trainedCardsHolder"></div>
    </div>
  );
}


const typing = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

const blinkCaret = keyframes`
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: #4d4d4d;
  }
`;

// Styled components
export const WelcomeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: white;
  z-index: 10;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
`;

export const WelcomeScreen = styled.div`
  text-align: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: "Google Sans", "sans-serif";
`;

export const WelcomeScreenH1 = styled.h1`
  font-size: 50px;
  font-weight: 500;
  color: black;
  overflow: hidden;
  border-right: .06em solid #4d4d4d;
  white-space: nowrap;
  font-family: "Google Sans", "sans-serif";
  margin: 0px;
  animation: ${typing} 2s steps(30, end), ${blinkCaret} .5s step-end infinite;
`;

export const WelcomeScreenH3 = styled.h3`
  padding-top: 10px;
  margin: 0px;
  color: #4d4d4d;
  font-size: 30px;
  font-style: italic;
  font-weight: 500;
`;

export const Video = styled.video`
  transform: rotateY(180deg);
  background-color: black;
  transition: 1s;
`;

export const VideoHolder = styled.div`
  background-color: black;
  border: 8px solid black;
  display: inline-block;
  border-radius: 5px;
  vertical-align: middle;
  transition: 1s;
`;

export const VideoContainerTrain = styled.div`
  height: 320px;
  width: 550px;
  margin-top: 0px;
`;

export const VideoContainerPredict = styled.div`
  width: 650px;
  height: 370px;
  margin-top: -35px;
`;

export const VideoTrain = styled.video`
  height: 320px;
  width: 500px;
`;

export const VideoPredict = styled.video`
  height: 370px;
  width: 500px;
`;

export const Button = styled.button`
  text-align: center;
  font-family: "Google Sans", "sans-serif";
  background-color: #000000;
  color: white;
  font-size: 25px;
  padding: 8px 25px;
  font-weight: 200;
  cursor: pointer;
  text-decoration: none;
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  transition: .3s;

  &:active {
    box-shadow: none;
  }
`;

export const CheckmarkStartButton = styled.div`
  padding-bottom: 5px;
`;

export const CheckmarkStopButton = styled.div`
  display: block;
  margin: 0 auto;
  margin-top: 5px;
`;

export const ProceedButton = styled.div`
  top: 90%;
  transform: translate(-50%, 0%);
  left: 50%;
  position: fixed;
  display: none;
`;

export const StartButton = styled.div`
  display: block;
  margin: 0 auto;
`;

export const StopButton = styled.div`
  margin: 0 auto;
  margin-top: 50px;
  display: block;
`;

export const ClearButton = styled.button`
  padding: 4px 10px;
  font-size: 18px;
  color: black;
  background-color: #cc0000;
  margin: 0 auto;
`;

export const TrainBtn = styled.button`
  padding: 4px 10px;
  font-size: 18px;
  color: black;
  background-color: #47aa42;
  margin: 0 auto;
  margin-right: 20px;
`;

export const TrainButton = styled.div`
  margin-top: 25px;
  right: 2.5%;
  z-index: 3;
`;

export const NextButton = styled.div`
  top: 30%;
  right: 2.5%;
  z-index: 2;
  position: fixed;
`;

export const PredictButton = styled.div`
  top: 30%;
  right: 2.5%;
  z-index: 2;
  position: fixed;
  display: none;
`;

export const BackButton = styled.div`
  top: 30%;
  left: 2.5%;
  z-index: 2;
  position: fixed;
  display: none;
`;

export const VideoCallBtn = styled.div`
  top: 30%;
  right: 2.5%;
  z-index: 2;
  position: fixed;
  display: none;
  background: blue;
`;

export const Status = styled.div`
  width: 300px;
  height: 30px;
  background-color: black;
  position: absolute;
  z-index: 3;
  left: 0%;
  top: 0%;
  border-top: none;
  text-align: center;
  border-bottom-right-radius: 10px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);
  transition: .4s;
  display: none;
`;

export const StatusP = styled.p`
  color: white;
  font-weight: 500;
  margin-top: 6px;
`;

export const TranslatorWindow = styled.div`
  width: 100%;
  height: 350px;
  display: inline-block;
  z-index: 1;
  margin-top: 200px;
  left: 50%;
  text-align: center;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  color: black;
  vertical-align: middle;
`;

export const Counter = styled.div`
  font-weight: 100;
  font-size: 18px;
  color: black;
  display: inline-block;
  padding: 0px;
  margin: 0px;
`;

export const TitleBar = styled.div`
  text-align: center;
  position: fixed;
  top: 0%;
  left: 50%;
  width: 100%;
  transform: translate(-50%, 0%);
  font-family: "Google Sans", "sans-serif";
  background-color: white;
  z-index: 2;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
`;

export const TitleBarH1 = styled.h1`
  font-size: 50px;
  font-weight: 500;
  color: black;
  border-right: .06em solid #4d4d4d;
  white-space: nowrap;
  font-family: "Google Sans", "sans-serif";
  margin: 0px;
  display: inline-block;
  animation: ${typing} 2s steps(30, end), ${blinkCaret} .5s step-end infinite;
  margin-top: 20px;
`;

export const TitleBarH3 = styled.h3`
  padding-top: 20px;
  margin-top: 0px;
  margin-bottom: 20px;
  color: #4d4d4d;
  font-size: 22px;
  font-weight: 500;
`;

export const TrainedGestures = styled.div`
  float: left;
  width: 215px;
  height: 200px;
  margin: 17px;
  background-color: white;
  color: black;
  text-align: center;
  cursor: pointer;
  border-radius: 10px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  padding: 10px;
  transition: .4s;
`;

export const TrainedImage = styled.img`
  height: 130px;
  display: block;
  padding: 3px 0px;
  margin: 0 auto;
`;

export const PlusSign = styled.img`
  height: 80px;
  display: block;
  padding: 15px;
  margin: 0 auto;
`;

export const TrainedText = styled.p`
  font-size: 20px;
  font-weight: 400;
  font-family: "Google Sans", "sans-serif";
`;

export const LeftContainer = styled.div`
  height: 100%;
  width: 70%;
  float: left;
`;

export const RightContainer = styled.div`
  height: 100%;
  width: 30%;
  float: right;
`;

export const AddGestureButton = styled.button`
  width: 100%;
  padding: 10px 15px;
  background-color: #4CAF50;
  font-size: 18px;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
  margin-bottom: 20px;

  &:hover {
    background-color: #45a049;
  }
`;

export const AddImageButton = styled.button`
  width: 100%;
  padding: 10px 15px;
  background-color: #007BFF;
  font-size: 18px;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

export default App;
