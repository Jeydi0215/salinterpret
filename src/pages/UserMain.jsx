import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import UserNavbar from '../components/UserNavbar';
import styled from 'styled-components';
import background from "../assets/login.jpg";
import MovieLogo from "../assets/homeTitle.webp";
import { FaPlay } from 'react-icons/fa';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const storage = getStorage();
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

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
    const fetchMediaItems = async () => {
      try {
        const mediaRef = ref(storage, 'easy');
        const mediaList = await listAll(mediaRef);
        const items = await Promise.all(mediaList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          const { title, tags } = metadata.customMetadata || {};

          // Since we are using the video itself as the thumbnail, no need for a separate thumbnail URL
          return { url, title, tags };
        }));
        setMediaItems(items);
      } catch (error) {
        console.error('Error fetching media items:', error);
      }
    };

    fetchMediaItems();
  }, [storage]);

  const playVideo = (url) => {
    setSelectedVideoUrl(url);
  };

  const closeVideo = () => {
    setSelectedVideoUrl(null);
  };

  const filteredMediaItems = mediaItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Container>
        <UserNavbar isScrolled={isScrolled} />
        <div className="hero">
          <img src={background} alt="background" className="background-image" />
          <div className="container">
            <div className="logo">
              <img src={MovieLogo} alt="Movie Logo" className="logo-img" />
            </div>
            <div className="buttons flex">
              <button className="flex j-center a-center" onClick={() => navigate('/Player')}>
                <FaPlay className="icon" />
                Play
              </button>
              <button className="more" onClick={() => setShowMoreInfo(true)}>
                <AiOutlineInfoCircle className="icon" />
                More Info
              </button>
            </div>
          </div>
        </div>
        <SearchContainer>
          <SearchBar
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
        <MoviesContainer>
          {filteredMediaItems.map((item, index) => (
            <CustomMediaItem
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => playVideo(item.url)}
            >
              <VideoThumbnail src={item.url} controls={false} />
            </CustomMediaItem>
          ))}
        </MoviesContainer>
        {selectedVideoUrl && (
          <VideoPlayerWrapper>
            <VideoPlayer
              src={selectedVideoUrl}
              controls
              autoPlay
            />
            <CloseButton onClick={closeVideo}>Close</CloseButton>
          </VideoPlayerWrapper>
        )}
        {showMoreInfo && (
          <PopupOverlay>
            <p>We're on a mission to connect hearing-impaired and non-hearing-impaired communities like never before. With Salinterpret, sign language transforms into words, making communication effortless and inclusive. Dive into our ASL courses, tutorials, and fun interactive games that make learning exciting and accessible for everyone.
        Join us in building a world where everyone can connect and understand each other, one sign at a time! ✋💬</p>
            <PopupContainer>
              <CloseButton onClick={() => setShowMoreInfo(false)}>Close</CloseButton>
              <h2>Salinterpret</h2>
              <p>A word play of Salin and Interpret. Salinterpret is a PWA used to create a bridge of communication between hearing-impaired and non-hearing-impaired 
              persons and create a more welcoming environment for them. Our app includes some features that can be a solution to the problem,
               it includes real-time translation, and we also included a sign-to-word language feature which will also help non-hearing-impaired communicate with hearing-impaired persons.</p>
            </PopupContainer>
          </PopupOverlay>
        )}
        <Footer>
          <p>&copy; Numbros</p>
        </Footer>
      </Container>
    </>
  );
};

const VideoThumbnail = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none; /* Disable video controls */
  background-color: black; /* Fallback color if video fails to load */
`;

const Container = styled.div`
  background-color: #1B1212;
  .hero {
    position: relative;
    .background-image {
      filter: brightness(60%);
      height: 85vh;
    }
    img {
      height: 100vh;
      width: 100vw;
    }
    .container {
      position: absolute;
      bottom: 5rem;
      .logo img {
        width: 100%;
        height: 100%;
        margin-left: 5rem;
      }
      .buttons {
        margin: 5rem;
        gap: 2rem;
        display: flex;
        align-items: center;
        button {
          font-size: 1.4rem;
          gap: 1rem;
          border-radius: 0.2rem;
          padding: 0.5rem 2rem;
          border: none;
          cursor: pointer;
          transition: 0.2s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          &:hover {
            opacity: 0.8;
          }
          &:nth-of-type(2) {
            background-color: rgba(109, 109, 110, 0.7);
            color: white;
          }
          .icon {
            margin-right: 0.5rem;
          }
        }
      }
    }
  }
  @media (max-width: 768px) {
    .hero .container {
      bottom: 3rem;
      .logo img {
        margin-left: 2rem;
      }
      .buttons {
        margin: 2rem;
        gap: 1rem;
        flex-direction: row;  
        justify-content: flex-start;  
        button {
          font-size: 1.2rem;
          padding: 0.5rem 1.5rem;
          width: auto; 
          justify-content: center;
          .icon {
            margin-right: 0.3rem;
          }
        }
      }
    }
  }
  @media (max-width: 480px) {
    .hero .container {
      bottom: 2rem;
      .logo img {
        margin-left: 0.5rem;
      }
      .buttons {
        flex-direction: column;
        gap: 1rem;
        button {
          width: 100%;
          text-align: center;
        }
      }
    }
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 600px;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
`;

const MoviesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
`;

const CustomMediaItem = styled.div`
  width: 300px;
  height: 170px;
  cursor: pointer;
  position: relative;
  background-color: #000;
  background: url('path/to/fallback-thumbnail.jpg') no-repeat center center;
  background-size: cover;
`;

const Actions = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Title = styled.h3`
  color: white;
  font-size: 1rem;
  margin: 0;
`;

const EditButton = styled.button`
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.3rem;
`;

const DeleteButton = styled.button`
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.3rem;
`;

const VideoPlayerWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const VideoPlayer = styled.video`
  max-width: 80%;
  max-height: 80%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #333;
  border: none;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContainer = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  max-width: 600px;
  width: 100%;
`;

const Footer = styled.footer`
  background-color: #111;
  color: #fff;
  text-align: center;
  padding: 1rem;
  position: fixed;
  bottom: 0;
  width: 100%;
`;

export default Main;
