import React from 'react';
import './styles.css';

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

export default App;
