import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/AdminNavbar';
import QuizButton from '../components/QuizButton';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import ThumbnailImage from '../assets/Thumbnail.jpg';
import A from '../assets/A.png';
import B from '../assets/B.png';
import C from '../assets/C.png';
import D from '../assets/D.png';
import E from '../assets/E.png';
import F from '../assets/F.png';
import G from '../assets/G.png';
import H from '../assets/H.png';
import I from '../assets/I.png';
import J from '../assets/J.gif';
import K from '../assets/K.png';
import L from '../assets/L.JPG';
import M from '../assets/M.png';
import N from '../assets/N.png';
import O from '../assets/O.png';
import P from '../assets/P.png';
import Q from '../assets/Q.png';
import R from '../assets/R.png';
import S from '../assets/S.png';
import T from '../assets/T.png';
import U from '../assets/U.png';
import V from '../assets/V.png';
import W from '../assets/W.png';
import X from '../assets/X.png';
import Y from '../assets/Y.png';
import Z from '../assets/Z.gif';

export default function Courses() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVideoMetadata, setSelectedVideoMetadata] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const storage = getStorage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videosRef = ref(storage, 'easy');
        const videosList = await listAll(videosRef);
        const videosData = await Promise.all(
          videosList.items.map(async (videoItem) => {
            const videoUrl = await getDownloadURL(videoItem);
            const videoMetadata = await getMetadata(videoItem);
            const thumbnailUrl = videoMetadata.thumbnailUrl; 
            return { url: videoUrl, thumbnailUrl, metadata: videoMetadata };
          })
        );
        setVideos(videosData);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [storage]);


  const handleImageClick = (letter, text) => {
    setSelectedLetter(letter);
    setSelectedText(text);
    setSelectedImage(letter); // Set selected image
  };


  const handleVideoClick = (videoUrl, metadata) => {
    setSelectedVideo(videoUrl);
    setSelectedVideoMetadata(metadata);
  };


  const handleClosePopup = () => {
    setSelectedVideo(null);
    setSelectedVideoMetadata(null);
    setSelectedImage(null);
  };

  return (
    <Container>
            <Navbar isScrolled={isScrolled} />
      <ContentWrapper>
        <h1 className='title'> Alphabet</h1>
        <ContentGrid>
          
          {images.map((image, index) => (
            <ImageContainer key={index} onClick={() => handleImageClick(image.letter, image.text)}>
              <img src={image.src} alt={`Image ${index}`} />
            </ImageContainer>
          ))}
        </ContentGrid>
        <h1 className='title'> Easy</h1>
        <VideoSection>
          
          {videos.map((video, index) => (
            <VideoContainer key={index} onClick={() => handleVideoClick(video.url, video.metadata)}>
              <Thumbnail src={ThumbnailImage} alt={`Thumbnail ${index}`} />
            </VideoContainer>
          ))}
        </VideoSection>
      </ContentWrapper>
  
      {(selectedVideo || selectedImage) && (
        <PopupOverlay onClick={handleClosePopup}>
          {selectedVideo && (
            <VideoPopup>
              <VideoPlayerWrapper>
                <VideoPlayer
                  src={selectedVideo}
                  controls
                  autoPlay
                />
              </VideoPlayerWrapper>
            </VideoPopup>
          )}
          {selectedImage && (
            <ImagePopup>
              <ImageDescription>
                <h2>{selectedLetter}</h2>
                <p>{selectedText}</p>
              </ImageDescription>
            </ImagePopup>
          )}
        </PopupOverlay>
      )}
      <QuizButton navigateTo="/quiz">Start Quiz!</QuizButton>
    </Container>
  );
}

const Container = styled.div`
  background-color: #1B1212;
  padding-top: 15%;
  height: 100%;
  overflow: auto; 
  display: flex;
  flex-direction: column;
  align-items: center;

  .title {
    color: white;
    margin-top: 20px;
  }
`;

const ContentWrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  width: 100%;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  padding: 20px;
  max-width: 90%;
  margin-left: 80px;

  @media (max-width: 768px) {
    margin-left: 17px;
    justify-items: center;
  }
`;

const ImageContainer = styled.div`
  cursor: pointer;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: auto;
    transition: transform 0.2s ease-in-out;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

const VideoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-left: 50px;
  padding: 20px;
  max-width: 90%;

  @media (max-width: 768px) {
    margin-left: 0;
    justify-items: center;
  }
`;

const VideoContainer = styled.div`
  cursor: pointer;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: auto;
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const VideoPopup = styled.div`
  max-width: 80%;
  max-height: 80%;
`;

const VideoPlayerWrapper = styled.div`
  max-width: 100%;
  max-height: 100%;
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
`;

const ImagePopup = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
`;

const ImageDescription = styled.div`
  color: black;
`;

const images = [
  { src: A, letter: 'A', text: "Place your hand forward with your palm facing you. Make a fist with your thumb pointing up and pressed against the side of your fist." },
  { src: B, letter: 'B', text: "Hold your fingers together open with your thumb pressed across your palm." },
  { src: C, letter: 'C', text: "Curl your fingers and thumb into a half-circle or “C”." },
  { src: D, letter: 'D', text: "Place your fingertips on your thumb and point your index finger up. It’s like making number 1 using your hands." },
  { src: E, letter: 'E', text: "Bend your four fingers toward your thumb. Place your fingers on the sides of your thumb." },
  { src: F, letter: 'F', text: "Press your index finger and thumb together by keeping the other 3 fingers straight up. It’s like an OK sign." },
  { src: G, letter: 'G', text: "Keep your thumb in parallel to your index finger. Fold the rest 3 fingers closed to form a fist. It’s like forming a pincer grip without touching." },
  { src: H, letter: 'H', text: "Hold your hand towards you. Open your index and middle fingers are pointing to your left. Close other two fingers and thumb to form a fist." },
  { src: I, letter: 'I', text: "Form a fist and raise your pinkie/little finger straight up." },
  { src: J, letter: 'J', text: "Begin by holding your hand in the position for the letter I, then move your hand downward, swoop to the left, and move forward, making J in the air." },
  { src: K, letter: 'K', text: "Raise your index and middle fingers straight up and spread apart in the shape of a V. Press your thumb into your palm so that its tip lies between your index and middle fingers." },
  { src: L, letter: 'L', text: "Make an L shape with your thumb and index finger. Fold the rest 3 fingers against your palm." },
  { src: M, letter: 'M', text: "Make a fist, Now place your thumb between your ring and little finger. Now wrap the thumb with other fingers." },
  { src: N, letter: 'N', text: "Bend your fingers like you are holding a ball. Now push the tip of the thumb between your middle and ring fingers." },
  { src: O, letter: 'O', text: "Join the tips of your fingers and the thumb together." },
  { src: P, letter: 'P', text: "Sign K and point downwards. (Point your index and middle finger down while thumbing in between. Fold the other two fingers towards palm)." },
  { src: Q, letter: 'Q', text: "Sign the letter “G” and point downward." },
  { src: R, letter: 'R', text: "Cross your index finger over your middle finger. Fold the thumb and other fingers to form a fist." },
  { src: S, letter: 'S', text: "Make a fist. Now place the thumb over the fingers." },
  { src: T, letter: 'T', text: "Form a fist while placing your thumb between the middle and index finger." },
  { src: U, letter: 'U', text: "Place your thumb, ring finger, and little finger against your palm. Join your middle and index finger and point straight up." },
  { src: V, letter: 'V', text: "Place your hand in the “U” position and spread your fingers apart to make a V. Like making a victory sign." },
  { src: W, letter: 'W', text: "Join your little finger and the thumb together. Now, spread the three fingers (index, middle, and ring) apart to make W." },
  { src: X, letter: 'X', text: "Make a fist and crook the index finger like a hook." },
  { src: Y, letter: 'Y', text: "Fold your index, middle, and ring fingers towards your palm. Keep your pinky finger and thumb open to form a Y." },
  { src: Z, letter: 'Z', text: "Make a fist. Open your index finger like pointing to someone. Now write the letter z in the air." }
];

