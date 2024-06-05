import React from "react";
import styled from "styled-components";
import { BsArrowLeft } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import video from "../assets/video.mp4";

export default function Player() {
  const navigate = useNavigate();

  return (
    <Container>
      <div className="player">
        <div className="back">
          <BsArrowLeft onClick={() => navigate(-1)} />
        </div>
        <video src={video} autoPlay loop controls muted />
      </div>
    </Container>
  );
}

const Container = styled.div`
  .player {
    position: relative;
    width: 100%;
    padding-top: 50%;
    overflow: hidden;
    .back {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 1;
      svg {
        font-size: 2rem;
        cursor: pointer;
      }
    }
    video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
     
    }
  }

  @media screen and (max-width: 768px) {
    .player {
      padding-top: 75%; 
      .back {
        top: 0.5rem;
        left: 0.5rem;
      }
    }
  }
`;
